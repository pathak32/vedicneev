"use client";

import { useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger, cn } from "@vedicneev/ui";
import {
  checkMediaAccess,
  filterMediaItems,
  type AccessResult,
  type MediaItem,
  type MediaType,
  type PaidPlanId,
} from "@vedicneev/engine";

import { AudioPodPlayer } from "@/components/media/AudioPodPlayer";
import { ConceptClinicPlayer } from "@/components/media/ConceptClinicPlayer";
import { MediaCard } from "@/components/media/MediaCard";
import { SpeedShortsPlayer } from "@/components/media/SpeedShortsPlayer";
import { PaywallModal, type LockedFeature } from "@/components/pricing/PaywallModal";
import { useActiveStudent } from "@/lib/auth/ActiveStudentContext";
import { selectActiveParent, useAuthStore } from "@/lib/auth/useAuthStore";
import { mediaCatalog } from "@/lib/media/mock-data";
import {
  selectFreeShortsPreviewed,
  selectParentSubscription,
  useSubscriptionStore,
} from "@/lib/payments/useSubscriptionStore";

type TypeFilter = "ALL" | MediaType;

const TYPE_TABS: { value: TypeFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "SHORT_VIDEO", label: "Vedic Speed Shorts" },
  { value: "AUDIO_POD", label: "Audio Pods" },
  { value: "CONCEPT_CLINIC", label: "Concept Clinics" },
];

const SECTION_FILTERS: { key: string; label: string; topics: string[] }[] = [
  { key: "mental_ability", label: "Mental Ability", topics: ["number_series", "pattern_completion", "classification"] },
  { key: "arithmetic", label: "Arithmetic", topics: ["speed_calculation"] },
  { key: "language", label: "Language", topics: ["vocabulary", "grammar"] },
];

/** Anonymous visitors (no student profile yet) still get only the one free preview, tracked under this shared key. */
const ANONYMOUS_PREVIEW_KEY = "anonymous";

export default function LearnPage() {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");
  const [sectionFilter, setSectionFilter] = useState<string | "ALL">("ALL");
  const { activeStudent } = useActiveStudent();
  const parent = useAuthStore(selectActiveParent);
  const previewKey = activeStudent?.id ?? ANONYMOUS_PREVIEW_KEY;
  const subscription = useSubscriptionStore((s) => selectParentSubscription(s, parent?.id ?? null));
  const freeShortsPreviewed = useSubscriptionStore((s) => selectFreeShortsPreviewed(s, previewKey));
  const incrementFreeShortsPreview = useSubscriptionStore((s) => s.incrementFreeShortsPreview);
  const language = activeStudent?.languagePreference ?? "en";

  const [shortsPlayer, setShortsPlayer] = useState<{ items: MediaItem[]; index: number } | null>(null);
  const [audioItem, setAudioItem] = useState<MediaItem | null>(null);
  const [clinicItem, setClinicItem] = useState<MediaItem | null>(null);
  const [paywall, setPaywall] = useState<{ feature: LockedFeature; suggestedPlans: PaidPlanId[] } | null>(null);

  function getAccess(item: MediaItem): AccessResult {
    return checkMediaAccess(subscription, item.mediaType, freeShortsPreviewed);
  }

  function consumePreview(item: MediaItem) {
    const access = getAccess(item);
    if (access.reason === "FREE_TIER_AVAILABLE") {
      incrementFreeShortsPreview(previewKey);
    }
  }

  function handleUnlockRequested(access: AccessResult) {
    setPaywall({ feature: "SPEED_HACK_CLINIC", suggestedPlans: access.suggestedPlans });
  }

  const filtered = useMemo(() => {
    let items = typeFilter === "ALL" ? mediaCatalog : filterMediaItems(mediaCatalog, { mediaType: typeFilter });
    if (sectionFilter !== "ALL") {
      const topics = SECTION_FILTERS.find((s) => s.key === sectionFilter)?.topics ?? [];
      items = items.filter((item) => item.topicId && topics.includes(item.topicId));
    }
    return items;
  }, [typeFilter, sectionFilter]);

  function handleCardClick(item: MediaItem) {
    if (item.mediaType === "SHORT_VIDEO") {
      const shorts = filterMediaItems(mediaCatalog, { mediaType: "SHORT_VIDEO" });
      const index = shorts.findIndex((s) => s.id === item.id);
      setShortsPlayer({ items: shorts, index: index >= 0 ? index : 0 });
    } else if (item.mediaType === "AUDIO_POD") {
      setAudioItem(item);
    } else {
      setClinicItem(item);
    }
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-4 pb-32 md:p-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Media Learning Hub</h1>
        <p className="text-sm text-muted-foreground">
          Bite-sized speed-math shorts, bilingual audio summaries, and deep-dive concept clinics.
        </p>
      </div>

      <Tabs value={typeFilter} onValueChange={(v) => setTypeFilter(v as TypeFilter)}>
        <TabsList className="flex-wrap">
          {TYPE_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSectionFilter("ALL")}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            sectionFilter === "ALL"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background text-muted-foreground hover:border-primary/50"
          )}
        >
          All Topics
        </button>
        {SECTION_FILTERS.map((section) => (
          <button
            key={section.key}
            type="button"
            onClick={() => setSectionFilter(section.key)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              sectionFilter === section.key
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:border-primary/50"
            )}
          >
            {section.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">No media matches these filters.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {filtered.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              language={language}
              locked={!getAccess(item).allowed}
              onClick={() => handleCardClick(item)}
            />
          ))}
        </div>
      )}

      {shortsPlayer ? (
        <SpeedShortsPlayer
          items={shortsPlayer.items}
          initialIndex={shortsPlayer.index}
          language={language}
          onClose={() => setShortsPlayer(null)}
          getAccess={getAccess}
          onConsumePreview={consumePreview}
          onUnlockRequested={handleUnlockRequested}
        />
      ) : null}

      {audioItem ? (
        <AudioPodPlayer
          item={audioItem}
          language={language}
          onClose={() => setAudioItem(null)}
          access={getAccess(audioItem)}
          onConsumePreview={() => consumePreview(audioItem)}
          onUnlockRequested={() => handleUnlockRequested(getAccess(audioItem))}
        />
      ) : null}

      {clinicItem ? (
        <ConceptClinicPlayer
          item={clinicItem}
          language={language}
          open={!!clinicItem}
          onOpenChange={(open) => !open && setClinicItem(null)}
          access={getAccess(clinicItem)}
          onUnlockRequested={() => handleUnlockRequested(getAccess(clinicItem))}
        />
      ) : null}

      {paywall ? (
        <PaywallModal
          open={!!paywall}
          onOpenChange={(open) => !open && setPaywall(null)}
          feature={paywall.feature}
          suggestedPlans={paywall.suggestedPlans}
          onUnlocked={() => setPaywall(null)}
        />
      ) : null}
    </div>
  );
}
