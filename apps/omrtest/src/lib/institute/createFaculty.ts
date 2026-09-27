import { Prisma, prisma, type InstituteAdmin } from "@vedicneev/db";
import { INDIAN_MOBILE_PATTERN } from "@vedicneev/auth";

export interface FacultyAssignmentInput {
  subject: string;
  classLevel: string;
}

export interface CreateFacultyInput {
  instituteId: string;
  branchId: string;
  name: string;
  phone: string;
  assignments: FacultyAssignmentInput[];
}

export type CreateFacultyResult = { ok: true; admin: InstituteAdmin } | { ok: false; status: number; error: string };

/**
 * Creates a FACULTY InstituteAdmin the director assigns, not one that
 * signs itself up — passwordHash stays null so the faculty's first sign-in
 * must go through WhatsApp OTP (bridgeToSupabaseSession, same as any other
 * phone-first login here); /settings' existing SetPasswordForm is what
 * lets them set a password afterward, no separate flow needed.
 */
export async function createFaculty(input: CreateFacultyInput): Promise<CreateFacultyResult> {
  const name = input.name.trim();
  const phone = input.phone.trim();

  if (!name) return { ok: false, status: 400, error: "Faculty name is required." };
  if (!INDIAN_MOBILE_PATTERN.test(phone)) {
    return { ok: false, status: 400, error: "Enter a valid 10-digit mobile number." };
  }

  const branch = await prisma.instituteBranch.findUnique({ where: { id: input.branchId } });
  if (!branch || branch.instituteId !== input.instituteId) {
    return { ok: false, status: 400, error: "Choose a valid branch." };
  }

  const assignments = input.assignments
    .map((a) => ({ subject: a.subject.trim(), classLevel: a.classLevel.trim() }))
    .filter((a) => a.subject && a.classLevel);
  if (assignments.length === 0) {
    return { ok: false, status: 400, error: "Add at least one subject + class assignment." };
  }

  const existingAdmin = await prisma.instituteAdmin.findFirst({ where: { user: { phone } } });
  if (existingAdmin) {
    return { ok: false, status: 409, error: "This mobile number is already registered as an admin or faculty." };
  }

  try {
    const admin = await prisma.$transaction(async (tx) => {
      const user = await tx.user.upsert({
        where: { phone },
        update: { name },
        create: { phone, name },
      });

      return tx.instituteAdmin.create({
        data: {
          userId: user.id,
          instituteId: input.instituteId,
          branchId: input.branchId,
          role: "FACULTY",
          assignments: { createMany: { data: assignments } },
        },
      });
    });

    return { ok: true, admin };
  } catch (error) {
    // Same race the upfront existingAdmin check can't fully close (a
    // concurrent add for the same phone) — InstituteAdmin.userId's unique
    // constraint is the real backstop, same pattern as createInstitute.ts.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, status: 409, error: "This mobile number is already registered as an admin or faculty." };
    }
    throw error;
  }
}
