"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api, MeetingDetail, formatDate } from "@/lib/api";
import AudioPlayer from "@/components/AudioPlayer";
import TranscriptPanel from "@/components/TranscriptPanel";
import SidePanel from "@/components/SidePanel";
import { useToast } from "@/components/Toast";

export default function MeetingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const toast = useToast();

  const [meeting, setMeeting] = useState<MeetingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [seekTo, setSeekTo] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");

  async function load() {
    try {
      const data = await api.getMeeting(id);
      setMeeting(data);
      setTitleDraft(data.title);
    } catch {
      toast("Couldn't load this meeting", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function handleSeek(t: number) {
    setSeekTo(t);
    setCurrentTime(t);
  }

  async function saveTitle() {
    if (!meeting || !titleDraft.trim()) return;
    try {
      await api.updateMeeting(meeting.id, { title: titleDraft.trim() });
      setEditingTitle(false);
      load();
      toast("Meeting updated");
    } catch {
      toast("Failed to update meeting", "error");
    }
  }

  async function handleDelete() {
    if (!meeting || !confirm("Delete this meeting? This can't be undone.")) return;
    try {
      await api.deleteMeeting(meeting.id);
      toast("Meeting deleted");
      router.push("/");
    } catch {
      toast("Failed to delete meeting", "error");
    }
  }

  if (loading) {
    return <div className="p-8 text-sm text-navy-950/40">Loading meeting…</div>;
  }
  if (!meeting) {
    return <div className="p-8 text-sm text-navy-950/40">Meeting not found.</div>;
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="px-8 pt-6 pb-4 border-b border-black/5 bg-white">
        <Link href="/" className="text-xs text-navy-950/40 hover:text-accent">
          ← Back to meetings
        </Link>
        <div className="flex items-center justify-between mt-2">
          <div className="flex-1 min-w-0">
            {editingTitle ? (
              <input
                autoFocus
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={(e) => e.key === "Enter" && saveTitle()}
                className="text-xl font-semibold border-b-2 border-accent outline-none bg-transparent"
              />
            ) : (
              <h1
                onClick={() => setEditingTitle(true)}
                className="text-xl font-semibold text-navy-950 cursor-text hover:opacity-70"
                title="Click to edit"
              >
                {meeting.title}
              </h1>
            )}
            <p className="text-xs text-navy-950/40 mt-1">
              {formatDate(meeting.date)} · {meeting.participants.map((p) => p.name).join(", ")}
            </p>
          </div>
          <button
            onClick={handleDelete}
            className="text-xs text-navy-950/40 hover:text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50"
          >
            Delete meeting
          </button>
        </div>
      </div>

      <div className="px-8 py-4">
        <AudioPlayer
          audioUrl={meeting.audio_url}
          duration={meeting.duration_sec}
          currentTime={currentTime}
          onTimeChange={setCurrentTime}
          seekTo={seekTo}
        />
      </div>

      <div className="flex-1 min-h-0 px-8 pb-6 grid grid-cols-[1fr_360px] gap-4">
        <TranscriptPanel segments={meeting.segments} currentTime={currentTime} onSeek={handleSeek} />
        <SidePanel meeting={meeting} onRefresh={load} />
      </div>
    </div>
  );
}
