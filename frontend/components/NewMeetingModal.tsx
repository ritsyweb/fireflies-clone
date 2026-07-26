"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";

export default function NewMeetingModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [participants, setParticipants] = useState("");
  const [transcript, setTranscript] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast("Title is required", "error");
      return;
    }
    setSubmitting(true);
    try {
      await api.createMeeting({
        title: title.trim(),
        date: new Date().toISOString(),
        participants: participants
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean),
        raw_transcript: transcript.trim() || undefined,
      });
      toast("Meeting created");
      setTitle("");
      setParticipants("");
      setTranscript("");
      onCreated();
      onClose();
    } catch (err) {
      toast("Failed to create meeting", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 bg-navy-950/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
        <div className="px-6 py-4 border-b border-black/5 flex items-center justify-between">
          <h2 className="font-semibold text-navy-950">New meeting</h2>
          <button onClick={onClose} className="text-navy-950/40 hover:text-navy-950 text-lg leading-none">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-navy-950/60 mb-1 block">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Weekly Sync"
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-navy-950/60 mb-1 block">
              Participants (comma-separated)
            </label>
            <input
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
              placeholder="e.g. Ritika Sharma, Dev Patel"
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-navy-950/60 mb-1 block">
              Paste transcript (optional — format: "Speaker: text" per line)
            </label>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={6}
              placeholder={"Ritika: Let's get started.\nDev: Sounds good."}
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-accent font-mono text-xs"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg text-navy-950/60 hover:bg-black/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm rounded-lg bg-accent text-white font-medium hover:bg-accent-dark disabled:opacity-50"
            >
              {submitting ? "Creating…" : "Create meeting"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
