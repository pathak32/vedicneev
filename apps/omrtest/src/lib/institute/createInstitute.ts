import { randomInt } from "crypto";
import { prisma, type Institute } from "@vedicneev/db";

const EXAM_CATEGORIES = new Set(["JNVST", "AISSEE", "RMS"]);
const WELCOME_CREDIT_GRANT = 10;

export interface CreateInstituteInput {
  userId: string;
  instituteName: string;
  examCategory: string;
  branchCity: string;
  adminName: string;
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

  const existing = await prisma.instituteAdmin.findUnique({ where: { userId: input.userId } });
  if (existing) return { ok: false, status: 409, error: "This account is already linked to an institute." };

  const baseSlug = slugify(instituteName);

  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = candidateSlug(baseSlug);
    try {
      const institute = await prisma.$transaction(async (tx) => {
        const created = await tx.institute.create({
          data: { name: instituteName, slug, tier: "STARTER", primaryExamCategory: examCategory },
        });

        const branch = await tx.instituteBranch.create({
          data: { instituteId: created.id, name: branchCity, city: branchCity },
        });

        await tx.instituteAdmin.create({
          data: { userId: input.userId, instituteId: created.id, branchId: branch.id, role: "OWNER" },
        });

        await tx.user.update({ where: { id: input.userId }, data: { name: adminName } });

        // Pilot welcome grant — this institute has no InstituteSubscription
        // row yet (only created once it checks out a plan via /billing, see
        // apps/omrtest/src/lib/payments/instituteBillingService.ts), so the
        // credit-cap check in app/api/tests/[id]/upload and .../answer-key
        // finds none and skips the cap entirely; this row exists so the
        // dashboard has a real, non-zero balance to show from day one.
        await tx.instituteCreditLedger.create({
          data: { instituteId: created.id, delta: WELCOME_CREDIT_GRANT, reason: "MONTHLY_GRANT" },
        });

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
