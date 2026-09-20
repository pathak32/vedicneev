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

        // Pilot welcome grant — Phase 4's Razorpay-backed InstituteSubscription
        // doesn't exist yet, so createTestBatch's own credit cap is skipped
        // entirely for this institute (see its comment); this row exists so
        // the dashboard has a real, non-zero balance to show from day one.
        await tx.instituteCreditLedger.create({
          data: { instituteId: created.id, delta: WELCOME_CREDIT_GRANT, reason: "MONTHLY_GRANT" },
        });

        return created;
      });

      return { ok: true, institute };
    } catch (error) {
      const isSlugCollision =
        error instanceof Object &&
        "code" in error &&
        (error as { code?: string }).code === "P2002" &&
        JSON.stringify((error as { meta?: unknown }).meta ?? "").includes("slug");
      if (isSlugCollision && attempt < 4) continue;
      throw error;
    }
  }

  throw new Error("Could not generate a unique institute slug.");
}
