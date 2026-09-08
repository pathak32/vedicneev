"use client";

import React, { useState, useRef } from "react";
import { Play, Pause, Mic2 } from "lucide-react";
import { Card, CardContent } from "@vedicneev/ui";

export function PodcastAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const current = audioRef.current.currentTime;
    const total = audioRef.current.duration;
    setProgress((current / total) * 100);
  };

  return (
    <Card className="border-2 border-amber-200 bg-amber-50/40 shadow-md rounded-2xl overflow-hidden my-6">
      <CardContent className="p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-sm">
              <Mic2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-gray-950">
                The Great Debate: 50 Mock Tests vs. Precise Mistake Analysis
              </h4>
              <p className="text-xs text-gray-600 font-medium">
                VedicNeev Institutional Podcast · Listen to the expert breakdown
              </p>
            </div>
          </div>
          <button
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center transition-all shadow-md hover:scale-105"
            aria-label={isPlaying ? "Pause podcast" : "Play podcast"}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>
        </div>

        {/* Custom Progress Bar */}
        <div className="w-full bg-amber-200/60 h-2 rounded-full overflow-hidden">
          <div
            className="bg-amber-600 h-full transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>

        <audio
          ref={audioRef}
          src="/audio/great-debate-mock-tests-vs-mistake-analysis.m4a"
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
        />
      </CardContent>
    </Card>
  );
}
