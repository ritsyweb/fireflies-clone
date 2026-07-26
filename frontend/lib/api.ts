const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type Participant = { id: number; name: string };

export type MeetingListItem = {
  id: number;
  title: string;
  date: string;
  duration_sec: number;
  participants: Participant[];
};

export type TranscriptSegment = {
  id: number;
  speaker: string;
  start_time: number;
  end_time: number;
  text: string;
};

export type ActionItem = {
  id: number;
  text: string;
  assignee: string | null;
  is_completed: boolean;
};

export type Topic = { id: number; label: string };

export type MeetingDetail = MeetingListItem & {
  audio_url: string | null;
  segments: TranscriptSegment[];
  summary: { overview_text: string } | null;
  action_items: ActionItem[];
  topics: Topic[];
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

export const api = {
  listMeetings: (params?: { q?: string; participant?: string; sort?: string }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return request<MeetingListItem[]>(`/meetings${qs ? `?${qs}` : ""}`);
  },
  getMeeting: (id: number) => request<MeetingDetail>(`/meetings/${id}`),
  createMeeting: (data: { title: string; date: string; participants: string[]; raw_transcript?: string }) =>
    request<MeetingDetail>(`/meetings`, { method: "POST", body: JSON.stringify(data) }),
  updateMeeting: (id: number, data: Partial<{ title: string; date: string; participants: string[] }>) =>
    request<MeetingDetail>(`/meetings/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteMeeting: (id: number) => request<{ ok: boolean }>(`/meetings/${id}`, { method: "DELETE" }),
  searchTranscript: (id: number, q: string) =>
    request<TranscriptSegment[]>(`/meetings/${id}/transcript/search?q=${encodeURIComponent(q)}`),
  createActionItem: (id: number, data: { text: string; assignee?: string }) =>
    request<ActionItem>(`/meetings/${id}/action-items`, { method: "POST", body: JSON.stringify(data) }),
  updateActionItem: (id: number, itemId: number, data: Partial<{ text: string; assignee: string; is_completed: boolean }>) =>
    request<ActionItem>(`/meetings/${id}/action-items/${itemId}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteActionItem: (id: number, itemId: number) =>
    request<{ ok: boolean }>(`/meetings/${id}/action-items/${itemId}`, { method: "DELETE" }),
};

export function formatDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
