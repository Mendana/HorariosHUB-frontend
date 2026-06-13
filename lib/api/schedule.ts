import { Subject } from "../types/schedule";
import { apiFetch } from "./apiFetch";

interface BackendSession {
  id: string;
  subject: string;
  subject_type: string;
  classroom?: string;
  group: string;
  start_time: string;
  end_time: string;
}

function mapSessions(sessions: BackendSession[]): Subject[] {
  return sessions.map((s) => {
    const startDate = new Date(s.start_time);
    const endDate = new Date(s.end_time);
    return {
      id: s.id,
      name: s.subject,
      type: s.subject_type,
      classroom: s.classroom ?? "",
      date: {
        year: startDate.getUTCFullYear(),
        month: startDate.getUTCMonth() + 1,
        day: startDate.getUTCDate(),
      },
      startTime: `${String(startDate.getUTCHours()).padStart(2, "0")}:${String(startDate.getUTCMinutes()).padStart(2, "0")}`,
      endTime: `${String(endDate.getUTCHours()).padStart(2, "0")}:${String(endDate.getUTCMinutes()).padStart(2, "0")}`,
    };
  });
}

export async function fetchSchedule(
  identifier: string,
  start?: string,
): Promise<{ subjects: Subject[] }> {
  const query = start ? `?start=${encodeURIComponent(start)}` : "";
  const data = await apiFetch<{ sessions?: BackendSession[] }>(
    `/schedule/${encodeURIComponent(identifier)}${query}`,
  );
  return { subjects: mapSessions(data.sessions ?? []) };
}

// Fetches all sessions for a full calendar month.
// month format: "YYYY-MM" (e.g. "2026-06")
export async function fetchScheduleForMonth(
  identifier: string,
  month: string,
): Promise<{ subjects: Subject[] }> {
  const data = await apiFetch<{ sessions?: BackendSession[] }>(
    `/schedule/${encodeURIComponent(identifier)}?month=${encodeURIComponent(month)}`,
  );
  return { subjects: mapSessions(data.sessions ?? []) };
}

export function copySchedule(from: string): Promise<void> {
  return apiFetch(`/schedule/copy?user=${encodeURIComponent(from)}`, {
    method: "POST",
  });
}

