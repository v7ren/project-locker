import { NextResponse } from "next/server";
import { getAuthGateMode } from "@/lib/auth/config";
import { readRequestSession } from "@/lib/auth/request-session";
import { findRedeemKeyForSecret, incrementKeyUses } from "@/lib/team/keys-store";
import { getTeamUserForSession } from "@/lib/team/session-bridge";
import { promoteUserToMember } from "@/lib/team/users-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (getAuthGateMode() === "none") {
    return NextResponse.json({ error: "Authentication is disabled" }, { status: 503 });
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
  const redeemKey = typeof o.redeemKey === "string" ? o.redeemKey : "";
  if (!redeemKey.trim()) {
    return NextResponse.json({ error: "Redeem key required" }, { status: 400 });
  }

  const found = await findRedeemKeyForSecret(redeemKey.trim());
  if (!found.ok) {
    return NextResponse.json({ error: found.error }, { status: 400 });
  }

  if (found.key.redeemEffect === "promote_to_member") {
    await promoteUserToMember(self.id);
  }

  await incrementKeyUses(found.key.id);

  return NextResponse.json({ ok: true });
}
