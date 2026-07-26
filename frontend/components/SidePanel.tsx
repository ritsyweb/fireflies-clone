"use client";
import { useState } from "react";
import { MeetingDetail, api } from "@/lib/api";
import { useToast } from "@/components/Toast";

type Tab = "summary" | "actions" | "topics";

export default function SidePanel({
  meeting,
  onRefresh,
}: {
  meeting: MeetingDetail;
  onRefresh: () => void;
}) {
  const [tab, setTab] = useState<Tab>("summary");
  const [newItem, setNewItem] = useState("");
  const toast = useToast();

  async function toggleItem(itemId: number, current: boolean) {
    try {
      await api.updateActionItem(meeting.id, itemId, { is_completed: !current });
      onRefresh();
    } catch {
      toast("Failed to update action item", "error");
    }
  }

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newItem.trim()) return;
    try {
      await api.createActionItem(meeting.id, { text: newItem.trim() });
      setNewItem("");
      onRefresh();
      toast("Action item added");
    } catch {
      toast("Failed to add action item", "error");
    }
  }

  async function removeItem(itemId: number) {
    try {
      await api.deleteActionItem(meeting.id, itemId);
      onRefresh();
    } catch {
      toast("Failed to delete action item", "error");
    }
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: "summary", label: "Summary" },
    { id: "actions", label: `Action Items (${meeting.action_items.length})` },
    { id: "topics", label: "Topics" },
  ];

  return (
    <div className="bg-white rounded-xl border border-black/5 flex flex-col h-full">
      <div className="flex border-b border-black/5 px-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-3 text-xs font-medium border-b-2 transition-colors ${
              tab === t.id
                ? "border-accent text-accent"
                : "border-transparent text-navy-950/40 hover:text-navy-950/70"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {tab === "summary" && (
          <div>
            <p className="text-sm text-navy-950/80 leading-relaxed">
              {meeting.summary?.overview_text || "No summary generated yet."}
            </p>
          </div>
        )}

        {tab === "actions" && (
          <div className="space-y-1">
            {meeting.action_items.map((item) => (
              <div
                key={item.id}
                className="group flex items-start gap-2.5 px-2 py-2 rounded-lg hover:bg-navy-950/[0.03]"
              >
                <input
                  type="checkbox"
                  checked={item.is_completed}
                  onChange={() => toggleItem(item.id, item.is_completed)}
                  className="mt-0.5 accent-accent"
                />
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm ${
                      item.is_completed ? "line-through text-navy-950/30" : "text-navy-950/80"
                    }`}
                  >
                    {item.text}
                  </p>
                  {item.assignee && (
                    <span className="text-[11px] text-navy-950/40">{item.assignee}</span>
                  )}
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="opacity-0 group-hover:opacity-100 text-navy-950/30 hover:text-red-500 text-xs shrink-0"
                >
                  ✕
                </button>
              </div>
            ))}
            {meeting.action_items.length === 0 && (
              <p className="text-sm text-navy-950/40 py-4 text-center">No action items yet.</p>
            )}
            <form onSubmit={addItem} className="flex gap-2 pt-2 mt-2 border-t border-black/5">
              <input
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="Add an action item…"
                className="flex-1 text-sm px-2.5 py-1.5 rounded-lg border border-black/10 outline-none focus:border-accent"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-medium hover:bg-accent-dark"
              >
                Add
              </button>
            </form>
          </div>
        )}

        {tab === "topics" && (
          <div className="flex flex-wrap gap-2">
            {meeting.topics.map((t) => (
              <span
                key={t.id}
                className="px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-medium"
              >
                {t.label}
              </span>
            ))}
            {meeting.topics.length === 0 && (
              <p className="text-sm text-navy-950/40 py-4 text-center w-full">No topics extracted.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
