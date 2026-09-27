import { prisma, type InstituteBranch } from "@vedicneev/db";

export interface CreateBranchInput {
  instituteId: string;
  name: string;
  city?: string;
}

export type CreateBranchResult = { ok: true; branch: InstituteBranch } | { ok: false; status: number; error: string };

export async function createBranch(input: CreateBranchInput): Promise<CreateBranchResult> {
  const name = input.name.trim();
  const city = input.city?.trim() || null;

  if (!name) return { ok: false, status: 400, error: "Branch name is required." };

  const branch = await prisma.instituteBranch.create({
    data: { instituteId: input.instituteId, name, city },
  });

  return { ok: true, branch };
}
