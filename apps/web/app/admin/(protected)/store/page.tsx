import Link from "next/link";
import { Badge, Button, Card, CardContent } from "@vedicneev/ui";
import { PenSquare } from "lucide-react";

import { localize } from "@/lib/exam/localize";
import type { Multilingual } from "@/lib/exam/types";
import { getAllProductsForAdmin } from "@/lib/store/adminQueries";

export const dynamic = "force-dynamic";

const PRODUCT_TYPE_LABEL: Record<string, string> = {
  MOCK_SERIES: "Mock Series",
  QUESTION_BOOKLET: "Question Booklet",
  OMR_KIT: "OMR Kit",
  LIVE_BOOTCAMP: "Live Bootcamp",
  MEGA_BUNDLE: "Mega Bundle",
};

export default async function AdminStorePage() {
  const products = await getAllProductsForAdmin();
  const byType = new Map<string, typeof products>();
  for (const product of products) {
    const bucket = byType.get(product.productType) ?? [];
    bucket.push(product);
    byType.set(product.productType, bucket);
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Digital Knowledge Hub</h1>
          <p className="text-sm text-muted-foreground">
            {products.length} package{products.length === 1 ? "" : "s"} — changes here reflect immediately on /store.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/store/new">
            <PenSquare className="h-4 w-4" />
            New Package
          </Link>
        </Button>
      </div>

      {products.length === 0 ? (
        <p className="text-sm text-muted-foreground">No packages yet — create the first one.</p>
      ) : (
        Array.from(byType.entries()).map(([productType, groupItems]) => (
          <section key={productType} className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {PRODUCT_TYPE_LABEL[productType] ?? productType} ({groupItems.length})
            </h2>
            <div className="flex flex-col gap-2">
              {groupItems.map((product) => (
                <Card key={product.id}>
                  <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">{localize(product.title as Multilingual, "en")}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                        <Badge variant={product.isActive ? "secondary" : "outline"}>{product.isActive ? "Active" : "Inactive"}</Badge>
                        <span>
                          ₹{product.sellingPrice.toLocaleString("en-IN")}{" "}
                          <span className="line-through">₹{product.displayPrice.toLocaleString("en-IN")}</span>
                        </span>
                        {product.targetExam ? <Badge variant="outline">{product.targetExam}</Badge> : null}
                        {product.targetClass ? <Badge variant="outline">{product.targetClass === "CLASS_6" ? "Class 6" : "Class 9"}</Badge> : null}
                      </div>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/store/${product.id}/edit`}>Edit</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
