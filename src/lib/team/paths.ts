import fs from "node:fs/promises";
import path from "node:path";

function resolveDataRoot(): string {
  const explicit = process.env.PROJECT_DATA_ROOT?.trim();
  if (explicit) {
    return path.isAbsolute(explicit) ? explicit : path.join(process.cwd(), explicit);
  }
  return path.join(process.cwd(), "data");
}

export function teamDir(): string {
  return path.join(resolveDataRoot(), "team");
}

export function teamUsersFile(): string {
  return path.join(teamDir(), "users.json");
}

export function teamEventsFile(): string {
  return path.join(teamDir(), "events.json");
}

export function teamKeysFile(): string {
  return path.join(teamDir(), "keys.json");
}

export async function ensureTeamDir(): Promise<void> {
  await fs.mkdir(teamDir(), { recursive: true });
}
