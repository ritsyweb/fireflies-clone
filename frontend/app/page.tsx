"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { api, MeetingListItem, formatDate, formatDuration } from "@/lib/api";
import NewMeetingModal from "@/components/NewMeetingModal";
import { useToast } from "@/components/Toast";

export default function LibraryPage() {
  const [meetings, setMeetings] = useState<MeetingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("recent");
  const [modalOpen, setModalOpen] = useState(false);
  const toast = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.listMeetings({ q: query || undefined, sort });
      setMeetings(data);
    } catch {
      toast("Couldn't load meetings — is the backend running?", "error");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, sort]);

  useEffect(() => {
    const t = setTimeout(load, 250); // debounce search
    return () => clearTimeout(t);
  }, [load]);

  async function handleDelete(id: number) {
    if (!confirm("Delete this meeting? This can't be undone.")) return;
    try {
      await api.deleteMeeting(id);
      toast("Meeting deleted");
      load();
    } catch {
      toast("Failed to delete meeting", "error");
    }
  }

  return (
    <div className="px-8 py-7 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-navy-950">Meetings</h1>
          <p className="text-sm text-navy-950/50 mt-0.5">
            {meetings.length} meeting{meetings.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-dark transition-colors"
        >
          + New meeting
        </button>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-950/30 text-sm">⌕</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search meetings by title…"
            className="w-full pl-8 pr-3 py-2 rounded-lg border border-black/10 bg-white text-sm outline-none focus:border-accent"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-3 py-2 rounded-lg border border-black/10 bg-white text-sm outline-none focus:border-accent"
        >
          <option value="recent">Most recent</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-black/5 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-navy-950/40">Loading meetings…</div>
        ) : meetings.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-navy-950/60 text-sm">No meetings found.</p>
            <p className="text-navy-950/40 text-xs mt-1">Try a different search, or create a new meeting.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/5 text-navy-950/40 text-xs uppercase tracking-wide">
                <th className="text-left font-medium px-5 py-3">Title</th>
                <th className="text-left font-medium px-5 py-3">Date</th>
                <th className="text-left font-medium px-5 py-3">Duration</th>
                <th className="text-left font-medium px-5 py-3">Participants</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {meetings.map((m) => (
                <tr key={m.id} className="border-b border-black/5 last:border-0 hover:bg-navy-950/[0.02] group">
                  <td className="px-5 py-3.5">
                    <Link href={`/meetings/${m.id}`} className="font-medium text-navy-950 hover:text-accent">
                      {m.title}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-navy-950/60">{formatDate(m.date)}</td>
                  <td className="px-5 py-3.5 text-navy-950/60">{formatDuration(m.duration_sec)}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex -space-x-2">
                      {m.participants.slice(0, 4).map((p) => (
                        <div
                          key={p.id}
                          title={p.name}
                          className="w-6 h-6 rounded-full bg-accent-light text-white text-[10px] font-semibold flex items-center justify-center border-2 border-white"
                        >
                          {p.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="opacity-0 group-hover:opacity-100 text-navy-950/30 hover:text-red-500 text-xs transition-opacity"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <NewMeetingModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={load} />
    </div>
  );
}
