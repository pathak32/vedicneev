import { getInstituteSession } from "@/lib/institute/session";

export default async function DashboardPage() {
  const session = await getInstituteSession();
  // Guaranteed non-null: app/(protected)/layout.tsx already redirected
  // away otherwise before this component ever rendered.
  const institute = session!.institute;

  return (
    <main>
      <h1>{institute.name}</h1>
      <p>Batches, credit balance, and Mistake Vault trends land here.</p>
    </main>
  );
}
