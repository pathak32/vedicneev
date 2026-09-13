import { ProductEditForm } from "@/components/admin/ProductEditForm";

export const dynamic = "force-dynamic";

export default function AdminNewProductPage() {
  return (
    <div className="mx-auto max-w-2xl pb-16">
      <h1 className="text-2xl font-bold text-foreground">New Digital Package</h1>
      <div className="mt-6">
        <ProductEditForm mode="create" />
      </div>
    </div>
  );
}
