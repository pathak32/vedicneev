"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@vedicneev/ui";
import { getBootcampProgress, BOOTCAMP_TOTAL_DAYS } from "@vedicneev/engine";
import { BookOpen, CalendarClock, Download, FileText, Package, PlayCircle, ScanLine } from "lucide-react";

import { useActiveStudent } from "@/lib/auth/ActiveStudentContext";
import { selectActiveParent, useAuthStore } from "@/lib/auth/useAuthStore";
import { resolveLiveMockSlug } from "@/lib/store/resolveLiveMockSlug";
import type { StoreProductType } from "@/lib/store/types";

// Renders entirely from a client-side fetch keyed by the signed-in
// parent's phone — force dynamic so the build never prerenders a
// signed-out shell, matching every other dashboard page's convention.
export const dynamic = "force-dynamic";

interface LibraryPurchase {
  id: string;
  status: "PENDING" | "PAID" | "FAILED";
  bootcampStartedAt: string | null;
  product: {
    id: string;
    title: string;
    productType: StoreProductType;
    fileUrl: string | null;
  };
}

const PRODUCT_ICON: Record<StoreProductType, typeof Package> = {
  MOCK_SERIES: FileText,
  QUESTION_BOOKLET: BookOpen,
  OMR_KIT: ScanLine,
  LIVE_BOOTCAMP: CalendarClock,
  MEGA_BUNDLE: Package,
};

export default function DashboardLibraryPage() {
  const { hasHydrated, isAuthenticated, activeStudent } = useActiveStudent();
  const parent = useAuthStore(selectActiveParent);
  const [purchases, setPurchases] = useState<LibraryPurchase[] | null>(null);
  const [startingBootcampId, setStartingBootcampId] = useState<string | null>(null);

  async function refresh() {
    if (!parent) return;
    const res = await fetch("/api/library", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: parent.phone }),
    });
    const data = await res.json();
    setPurchases(data.purchases ?? []);
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parent?.phone]);

  async function handleStartBootcamp(purchaseId: string) {
    if (!parent) return;
    setStartingBootcampId(purchaseId);
    try {
      await fetch("/api/library/bootcamp-start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purchaseId, phone: parent.phone }),
      });
      await refresh();
    } finally {
      setStartingBootcampId(null);
    }
  }

  if (!hasHydrated) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
        <h1 className="text-xl font-bold text-foreground">My Library</h1>
        <p className="text-sm text-muted-foreground">Sign in to see products you&apos;ve purchased.</p>
      </div>
    );
  }

  const liveMockSlug = activeStudent ? resolveLiveMockSlug(activeStudent.targetExam, activeStudent.targetClass) : null;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-foreground">My Library</h1>
        <Button asChild variant="outline" size="sm">
          <Link href="/store">Browse the store</Link>
        </Button>
      </div>

      {purchases === null ? (
        <p className="text-sm text-muted-foreground">Loading your library…</p>
      ) : purchases.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Nothing purchased yet.{" "}
          <Link href="/store" className="text-primary underline">
            Visit the store
          </Link>{" "}
          to unlock mock series, PDFs, and the daily sprint.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {purchases.map((purchase) => {
            const Icon = PRODUCT_ICON[purchase.product.productType];

            if (purchase.status === "PENDING") {
              return (
                <div key={purchase.id} className="flex items-center gap-3 rounded-2xl border border-dashed border-border bg-card p-4">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-semibold text-foreground">{purchase.product.title}</p>
                    <p className="text-xs text-muted-foreground">Confirming your payment…</p>
                  </div>
                </div>
              );
            }

            if (purchase.product.productType === "LIVE_BOOTCAMP") {
              const progress = purchase.bootcampStartedAt
                ? getBootcampProgress(new Date(purchase.bootcampStartedAt).getTime())
                : null;

              return (
                <div key={purchase.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-amber-600" />
                    <p className="font-semibold text-foreground">{purchase.product.title}</p>
                  </div>
                  {!progress ? (
                    <Button
                      className="mt-3"
                      size="sm"
                      onClick={() => handleStartBootcamp(purchase.id)}
                      disabled={startingBootcampId === purchase.id}
                    >
                      Start my 30-Day Sprint
                    </Button>
                  ) : (
                    <>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Day {progress.unlockedThroughDay} of {BOOTCAMP_TOTAL_DAYS} unlocked
                      </p>
                      {liveMockSlug ? (
                        <Button asChild className="mt-3" size="sm">
                          <Link href={`/exam/live/${liveMockSlug}`}>
                            <PlayCircle className="h-4 w-4" />
                            Start Today&apos;s Mock
                          </Link>
                        </Button>
                      ) : (
                        <p className="mt-3 text-xs text-muted-foreground">
                          Set your target exam in Onboarding to unlock today&apos;s mock.
                        </p>
                      )}
                    </>
                  )}
                </div>
              );
            }

            return (
              <div key={purchase.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-amber-600" />
                  <p className="font-semibold text-foreground">{purchase.product.title}</p>
                </div>
                <div className="flex gap-2">
                  {(purchase.product.productType === "MOCK_SERIES" || purchase.product.productType === "MEGA_BUNDLE") &&
                  liveMockSlug ? (
                    <Button asChild size="sm">
                      <Link href={`/exam/live/${liveMockSlug}`}>
                        <PlayCircle className="h-4 w-4" />
                        Start Mock
                      </Link>
                    </Button>
                  ) : null}
                  {purchase.product.fileUrl ? (
                    <Button asChild size="sm" variant="outline">
                      <Link href={purchase.product.fileUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4" />
                        Download
                      </Link>
                    </Button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
