import { SiteHeader } from "@/components/marketing/SiteHeader";
import { LandingHero } from "@/components/marketing/LandingHero";
import { ExamTracksHub } from "@/components/marketing/ExamTracksHub";
import { PodcastAudioPlayer } from "@/components/marketing/PodcastAudioPlayer";
import { SiteFooter } from "@/components/marketing/SiteFooter";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-amber-500 selection:text-white">
      <SiteHeader />
      
      <main className="flex-1 flex flex-col items-center">
        {/* Core Hero Gateway */}
        <LandingHero />

        {/* Podcast / Expert Debate Section */}
        <div className="w-full max-w-4xl px-4 my-8">
          <PodcastAudioPlayer />
        </div>

        {/* Targeted Exam Tracks & Boards Hub */}
        <ExamTracksHub />
      </main>

      <SiteFooter />
    </div>
  );
}
