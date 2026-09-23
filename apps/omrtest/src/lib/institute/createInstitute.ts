import { randomInt } from "crypto";
import { prisma, type Institute } from "@vedicneev/db";

import { hashSecret, validateSecretShape } from "@/lib/auth/password";

const EXAM_CATEGORIES = new Set(["JNVST", "AISSEE", "RMS"]);

export interface CreateInstituteInput {
  userId: string;
  instituteName: string;
  examCategory: string;
  branchCity: string;
  adminName: string;
  /** Optional — a PIN/password set at signup, or left unset to rely on WhatsApp OTP only (settable later from /settings). */
  password?: string;
}

export type CreateInstituteResult = { ok: true; institute: Institute } | { ok: false; status: number; error: string };

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Base slug plus a random 4-digit suffix — collisions are refused-and-retried, not prevented up front. */
function candidateSlug(base: string): string {
  return `${base || "institute"}-${String(randomInt(0, 10000)).padStart(4, "0")}`;
}

/**
 * One-time onboarding write: turns an authenticated-but-unboarded Supabase
 * user into an InstituteAdmin. Refuses outright if this user already has an
 * InstituteAdmin row — this is a create, not an upsert, since a person
 * administers exactly one institute today (see InstituteAdmin's own
 * comment).
 */
export async function createInstitute(input: CreateInstituteInput): Promise<CreateInstituteResult> {
  const instituteName = input.instituteName.trim();
  const examCategory = input.examCategory.trim().toUpperCase();
  const branchCity = input.branchCity.trim();
  const adminName = input.adminName.trim();

  if (!instituteName) return { ok: false, status: 400, error: "Institute Name is required." };
  if (!EXAM_CATEGORIES.has(examCategory)) return { ok: false, status: 400, error: "Choose a valid exam category." };
  if (!branchCity) return { ok: false, status: 400, error: "Branch/City is required." };
  if (!adminName) return { ok: false, status: 400, error: "Admin Name is required." };

  const password = input.password?.trim() || null;
  if (password) {
    const shapeError = validateSecretShape(password);
    if (shapeError) return { ok: false, status: 400, error: shapeError };
  }

  const existing = await prisma.instituteAdmin.findUnique({ where: { userId: input.userId } });
  if (existing) return { ok: false, status: 409, error: "This account is already linked to an institute." };

  const baseSlug = slugify(instituteName);
  const passwordHash = password ? await hashSecret(password) : null;

  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = candidateSlug(baseSlug);
    try {
      const institute = await prisma.$transaction(async (tx) => {
        // status defaults to PENDING_APPROVAL (see InstituteStatus) — no
        // welcome credit grant happens here anymore; that now happens
        // exactly once, atomically with the status flip to ACTIVE, when a
        // VedicNeev super admin approves this institute (see
        // apps/web/app/api/admin/institutes/[id]/approve/route.ts).
        const created = await tx.institute.create({
          data: { name: instituteName, slug, tier: "STARTER", primaryExamCategory: examCategory },
        });

        const branch = await tx.instituteBranch.create({
          data: { instituteId: created.id, name: branchCity, city: branchCity },
        });

        await tx.instituteAdmin.create({
          data: { userId: input.userId, instituteId: created.id, branchId: branch.id, role: "OWNER", passwordHash },
        });

        await tx.user.update({ where: { id: input.userId }, data: { name: adminName } });

        return created;
      });

      return { ok: true, institute };
    } catch (error) {
      const isP2002 = error instanceof Object && "code" in error && (error as { code?: string }).code === "P2002";
      const meta = isP2002 ? JSON.stringify((error as { meta?: unknown }).meta ?? "") : "";

      if (isP2002 && meta.includes("slug") && attempt < 4) continue;

      // A concurrent double-submit for the same userId (a double-click, or
      // a client retrying a slow request that actually succeeded) can race
      // past the findUnique check above — both requests read "no existing
      // admin" before either commits. InstituteAdmin.userId's unique
      // constraint is the real backstop in that case, and the whole
      // $transaction rolls back cleanly when it fires (no partial
      // institute/branch/credit row is left behind either way) — so this
      // is a clean "already onboarded" 409, the same result the upfront
      // check already returns for the non-racing case, not a genuine
      // server error.
      if (isP2002 && meta.includes("user_id")) {
        return { ok: false, status: 409, error: "This account is already linked to an institute." };
      }

      throw error;
    }
  }

  throw new Error("Could not generate a unique institute slug.");
}
