import Database from "better-sqlite3";
import { existsSync, unlinkSync } from "fs";
import { join } from "path";
import { DB_PATH, RECORDINGS_DIR } from "./constants";

export interface HistoryEntry {
  id: number; file_name: string; timestamp: number; saved: boolean;
  title: string; transcription_text: string;
  post_processed_text: string | null; post_process_prompt: string | null;
}

const SELECT_COLS = `id, file_name, timestamp, saved, title,
  transcription_text, post_processed_text, post_process_prompt`;

function mapRow(row: Record<string, unknown>): HistoryEntry {
  return {
    id: row.id as number,
    file_name: row.file_name as string,
    timestamp: row.timestamp as number,
    saved: Boolean(row.saved),
    title: row.title as string,
    transcription_text: row.transcription_text as string,
    post_processed_text: (row.post_processed_text as string | null) ?? null,
    post_process_prompt: (row.post_process_prompt as string | null) ?? null,
  };
}

export function getHistory(dbPath = DB_PATH): HistoryEntry[] {
  const db = new Database(dbPath, { readonly: true });
  try {
    return (db.prepare(`SELECT ${SELECT_COLS} FROM transcription_history ORDER BY timestamp DESC`).all() as Record<string, unknown>[]).map(mapRow);
  } finally { db.close(); }
}

export function getLatestEntry(dbPath = DB_PATH): HistoryEntry | null {
  const db = new Database(dbPath, { readonly: true });
  try {
    const row = db.prepare(`SELECT ${SELECT_COLS} FROM transcription_history ORDER BY timestamp DESC LIMIT 1`).get() as Record<string, unknown> | undefined;
    return row ? mapRow(row) : null;
  } finally { db.close(); }
}

export function toggleSaved(id: number, dbPath = DB_PATH): void {
  const db = new Database(dbPath);
  try {
    const row = db.prepare("SELECT saved FROM transcription_history WHERE id = ?").get(id) as { saved: number } | undefined;
    if (!row) return;
    db.prepare("UPDATE transcription_history SET saved = ? WHERE id = ?").run(row.saved ? 0 : 1, id);
  } finally { db.close(); }
}

export function deleteEntry(id: number, dbPath = DB_PATH, recordingsDir = RECORDINGS_DIR): void {
  const db = new Database(dbPath);
  try {
    const row = db.prepare("SELECT file_name FROM transcription_history WHERE id = ?").get(id) as { file_name: string } | undefined;
    if (row) {
      const wav = join(recordingsDir, row.file_name);
      if (existsSync(wav)) unlinkSync(wav);
    }
    db.prepare("DELETE FROM transcription_history WHERE id = ?").run(id);
  } finally { db.close(); }
}

export function displayText(entry: HistoryEntry): string {
  return entry.post_processed_text ?? entry.transcription_text;
}
