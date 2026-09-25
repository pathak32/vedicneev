import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { getAuthenticatedAdmin } from "@/lib/admin/user";

export const metadata: Metadata = {
  title: { default: "GymOps", template: "%s | GymOps" },
  robots: { index: false, follow: false },
};

export default async function GymOpsLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) redirect("/admin/login?next=/gym-ops/dashboard");
  return <>{children}</>;
}
