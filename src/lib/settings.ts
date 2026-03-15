import { readFileSync, writeFileSync } from "fs";
import { SETTINGS_PATH } from "./constants";

export interface HandySettings {
  custom_words: string[];
  selected_model: string;
  [key: string]: unknown;
}

interface SettingsStore {
  settings: HandySettings;
}

export function readSettings(filePath: string = SETTINGS_PATH): HandySettings {
  const raw = readFileSync(filePath, "utf-8");
  const store = JSON.parse(raw) as SettingsStore;
  return store.settings;
}

export function writeSettings(
  update: Partial<HandySettings>,
  filePath: string = SETTINGS_PATH
): void {
  const raw = readFileSync(filePath, "utf-8");
  const store = JSON.parse(raw) as SettingsStore;
  store.settings = { ...store.settings, ...update };
  // tauri-plugin-store writes compact JSON; we match that format to avoid noisy diffs
  writeFileSync(filePath, JSON.stringify(store), "utf-8");
}
