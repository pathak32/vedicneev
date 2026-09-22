import { randomInt } from "crypto";
import { prisma, type CoachingLead } from "@vedicneev/db";

import { TRIAL_CREDIT_GRANT, normalizeLeadPhone } from "./leadOutreach";

export interface ProvisionTrialCreditsResult {
  instituteId: string;
  granted: boolean;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function candidateSlug(base: string): string {
  return `${base || "institute"}-${String(randomInt(0, 10000)).padStart(4, "0")}`;
}

/**
 * The "backend hook" the Approve & Send action triggers once a lead's
 * outreach WhatsApp message actually dispatches. Mirrors apps/omrtest's own
 * createInstitute() welcome-grant transaction (Institute + InstituteBranch +
 * InstituteAdmin + a 10-credit InstituteCreditLedger row), except it has no
 * authenticated Supabase session to key off — the director hasn't signed up
 * yet — so it finds-or-creates the User by phone number instead.
 *
 * Idempotent two ways: the caller only invokes this once per lead (guarded
 * by CoachingLead.trialCreditsGrantedAt), and independently, a phone that
 * already has an InstituteAdmin (e.g. the director signed up on their own
 * between outreach and this call) is topped up in place rather than given a
 * second Institute — granted stays true either way so the caller can record
 * trialCreditsGrantedAt, but no duplicate Institute is ever created.
 */
export async function provisionTrialCreditsForLead(
  lead: Pick<CoachingLead, "instituteName" | "city" | "phoneNumber">
): Promise<ProvisionTrialCreditsResult> {
  const phone = normalizeLeadPhone(lead.phoneNumber);
  const instituteName = lead.instituteName.trim();
  const branchCity = lead.city.trim() || "Unknown";

  const user = await prisma.user.upsert({
    where: { phone },
    update: {},
    create: { phone },
  });

  const existingAdmin = await prisma.instituteAdmin.findUnique({
    where: { userId: user.id },
  });

  if (existingAdmin) {
    await prisma.instituteCreditLedger.create({
      data: { instituteId: existingAdmin.instituteId, delta: TRIAL_CREDIT_GRANT, reason: "MANUAL_ADJUSTMENT" },
    });
    return { instituteId: existingAdmin.instituteId, granted: true };
  }

  const baseSlug = slugify(instituteName);

  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = candidateSlug(baseSlug);
    try {
      const institute = await prisma.$transaction(async (tx) => {
        const created = await tx.institute.create({
          data: {
            name: instituteName,
            slug,
            tier: "STARTER",
            primaryExamCategory: "JNVST / Sainik / RMS",
          },
        });

        const branch = await tx.instituteBranch.create({
          data: { instituteId: created.id, name: branchCity, city: branchCity },
        });

        await tx.instituteAdmin.create({
          data: { userId: user.id, instituteId: created.id, branchId: branch.id, role: "OWNER" },
        });

        await tx.instituteCreditLedger.create({
          data: { instituteId: created.id, delta: TRIAL_CREDIT_GRANT, reason: "MANUAL_ADJUSTMENT" },
        });

        return created;
      });

      return { instituteId: institute.id, granted: true };
    } catch (error) {
      const isP2002 = error instanceof Object && "code" in error && (error as { code?: string }).code === "P2002";
      const meta = isP2002 ? JSON.stringify((error as { meta?: unknown }).meta ?? "") : "";

      if (isP2002 && meta.includes("slug") && attempt < 4) continue;

      // Same benign race as createInstitute(): another call provisioned this
      // exact phone between our findUnique check and this transaction's
      // insert. Top up the institute that won instead of erroring out.
      if (isP2002 && meta.includes("user_id")) {
        const admin = await prisma.instituteAdmin.findUnique({ where: { userId: user.id } });
        if (admin) {
          await prisma.instituteCreditLedger.create({
            data: { instituteId: admin.instituteId, delta: TRIAL_CREDIT_GRANT, reason: "MANUAL_ADJUSTMENT" },
          });
          return { instituteId: admin.instituteId, granted: true };
        }
      }

      throw error;
    }
  }

  throw new Error("Could not generate a unique institute slug for trial provisioning.");
}
