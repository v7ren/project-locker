import { NextResponse } from "next/server";
import { getAuthGateMode } from "@/lib/auth/config";
import { readRequestSession } from "@/lib/auth/request-session";
import { getTeamUserForSession } from "@/lib/team/session-bridge";
import {
  generateRandomSelfBackupLoginKey,
  getTeamUserById,
  setSelfBackupLoginKey,
  setSelfProfileFields,
} from "@/lib/team/users-store";

export const runtime = "nodejs";

export async function GET() {
  if (getAuthGateMode() === "none") {
    return NextResponse.json({ error: "Profile requires authentication" }, { status: 503 });
  }
  const session = await readRequestSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const self = await getTeamUserForSession(session);
  if (!self) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    user: {
      id: self.id,
      username: self.username,
      role: self.role,
      email: self.email,
      hue: self.hue,
      avatarEmoji: self.avatarEmoji,
      hasBackupLoginKey: Boolean(self.backupLoginKeyHash),
    },
  });
}

export async function PATCH(request: Request) {
  if (getAuthGateMode() === "none") {
    return NextResponse.json({ error: "Profile requires authentication" }, { status: 503 });
  }
  const session = await readRequestSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const self = await getTeamUserForSession(session);
  if (!self) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const o = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};

  const hue = o.hue;
  const avatarEmoji = o.avatarEmoji;
  const backupLoginKey = o.backupLoginKey;
  const generateBackupLoginKey = o.generateBackupLoginKey === true;
  const gate = getAuthGateMode();
  if (gate === "email" && (backupLoginKey !== undefined || generateBackupLoginKey)) {
    return NextResponse.json(
      { error: "Access keys are managed by admins in email authentication mode." },
      { status: 400 },
    );
  }

  const profilePatch: { hue?: number; avatarEmoji?: string } = {};
  if (typeof hue === "number") profilePatch.hue = hue;
  if (typeof avatarEmoji === "string") profilePatch.avatarEmoji = avatarEmoji;
  if (Object.keys(profilePatch).length > 0) {
    await setSelfProfileFields(self.id, profilePatch);
  }

  let generatedBackupLoginKey: string | undefined;
  if (generateBackupLoginKey) {
    const gen = await generateRandomSelfBackupLoginKey(self.id);
    if (!gen) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    generatedBackupLoginKey = gen.plain;
  } else if (backupLoginKey !== undefined) {
    if (backupLoginKey === null) {
      await setSelfBackupLoginKey(self.id, null);
    } else if (typeof backupLoginKey === "string") {
      await setSelfBackupLoginKey(self.id, backupLoginKey.trim() === "" ? null : backupLoginKey);
    }
  }

  const updated = await getTeamUserById(self.id);
  if (!updated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: updated.id,
      username: updated.username,
      role: updated.role,
      email: updated.email,
      hue: updated.hue,
      avatarEmoji: updated.avatarEmoji,
      hasBackupLoginKey: Boolean(updated.backupLoginKeyHash),
    },
    ...(generatedBackupLoginKey ? { generatedBackupLoginKey } : {}),
  });
}
