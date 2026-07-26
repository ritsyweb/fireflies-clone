"use client";
import { useEffect, useRef } from "react";
import { formatDuration } from "@/lib/api";

export default function AudioPlayer({
  audioUrl,
  duration,
  currentTime,
  onTimeChange,
  seekTo,
}: {
  audioUrl: string | null;
  duration: number;
  currentTime: number;
  onTimeChange: (t: number) => void;
  seekTo: number | null;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);

  // When a transcript line is clicked, jump the (real or mock) player to that time
  useEffect(() => {
    if (seekTo === null) return;
    if (audioRef.current && audioUrl) {
      audioRef.current.currentTime = seekTo;
    } else {
      // no real audio file — just move the mock playhead
      onTimeChange(seekTo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seekTo]);

  const pct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div className="bg-navy-950 rounded-xl px-5 py-4">
      {audioUrl ? (
        <audio
          ref={audioRef}
          src={audioUrl}
          controls
          className="w-full"
          onTimeUpdate={(e) => onTimeChange((e.target as HTMLAudioElement).currentTime)}
        />
      ) : (
        <div className="flex items-center gap-4">
          <button
            onClick={() => onTimeChange(currentTime)}
            className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-white text-sm shrink-0"
            title="No audio file attached — mock playhead only"
          >
            ▶
          </button>
          <div className="flex-1">
            <div
              className="h-1.5 rounded-full bg-white/10 relative cursor-pointer"
              onClick={(e) => {
                const rect = (e.target as HTMLElement).getBoundingClientRect();
                const ratio = (e.clientX - rect.left) / rect.width;
                onTimeChange(Math.max(0, Math.min(duration, ratio * duration)));
              }}
            >
              <div
                className="h-1.5 rounded-full bg-accent absolute left-0 top-0"
                style={{ width: `${pct}%` }}
              />
              <div
                className="w-3 h-3 rounded-full bg-white absolute top-1/2 -translate-y-1/2 -ml-1.5 shadow"
                style={{ left: `${pct}%` }}
              />
            </div>
          </div>
          <span className="text-white/50 text-xs font-mono w-20 text-right shrink-0">
            {formatDuration(Math.floor(currentTime))} / {formatDuration(duration)}
          </span>
        </div>
      )}
      {!audioUrl && (
        <p className="text-white/30 text-[11px] mt-2">
          No audio file attached — this is a mock seek bar synced to the transcript below.
        </p>
      )}
    </div>
  );
}
