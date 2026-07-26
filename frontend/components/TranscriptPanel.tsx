"use client";
import { useMemo, useState } from "react";
import { TranscriptSegment, formatDuration } from "@/lib/api";

function highlight(text: string, query: string) {
  if (!query.trim()) return text;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-accent-light/40 text-navy-950 rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export default function TranscriptPanel({
  segments,
  currentTime,
  onSeek,
}: {
  segments: TranscriptSegment[];
  currentTime: number;
  onSeek: (t: number) => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return segments;
    return segments.filter((s) => s.text.toLowerCase().includes(query.toLowerCase()));
  }, [segments, query]);

  return (
    <div className="bg-white rounded-xl border border-black/5 flex flex-col h-full">
      <div className="px-4 py-3 border-b border-black/5">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-950/30 text-sm">⌕</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search this transcript…"
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-black/10 text-sm outline-none focus:border-accent"
          />
        </div>
        {query && (
          <p className="text-[11px] text-navy-950/40 mt-1.5">
            {filtered.length} match{filtered.length !== 1 ? "es" : ""}
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        {filtered.map((seg) => {
          const isActive = currentTime >= seg.start_time && currentTime < seg.end_time;
          return (
            <button
              key={seg.id}
              onClick={() => onSeek(seg.start_time)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                isActive ? "bg-accent/10" : "hover:bg-navy-950/[0.03]"
              }`}
            >
              <div className="flex items-baseline gap-2">
                <span className={`text-xs font-semibold ${isActive ? "text-accent" : "text-navy-950/70"}`}>
                  {seg.speaker}
                </span>
                <span className="text-[11px] text-navy-950/30 font-mono">
                  {formatDuration(Math.floor(seg.start_time))}
                </span>
              </div>
              <p className="text-sm text-navy-950/80 mt-0.5 leading-snug">
                {highlight(seg.text, query)}
              </p>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-center text-sm text-navy-950/40 py-8">No matches found.</p>
        )}
      </div>
    </div>
  );
}
