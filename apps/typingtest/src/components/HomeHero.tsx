"use client";

import { useT } from "@/lib/i18n/useT";

export function HomeHero() {
  const t = useT();
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-3xl font-bold text-foreground">{t("homeTitle")}</h1>
      <p className="max-w-2xl text-muted-foreground">{t("homeSubtitle")}</p>
    </div>
  );
}
