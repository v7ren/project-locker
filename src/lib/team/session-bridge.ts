import type { SessionUser } from "@/lib/auth/session";
import {
  ensureTeamUserFromEmail,
  getTeamUserByEmail,
  getTeamUserById,
  type TeamUserRecord,
} from "@/lib/team/users-store";

export async function getTeamUserForSession(session: SessionUser): Promise<TeamUserRecord | null> {
  let row: TeamUserRecord | null;
  if (session.kind === "email") {
    let r = await getTeamUserByEmail(session.email);
    if (!r) {
      await ensureTeamUserFromEmail(session.email);
      r = await getTeamUserByEmail(session.email);
    }
    row = r;
  } else {
    row = await getTeamUserById(session.userId);
  }
  if (!row || row.memberStatus === "pending") {
    return null;
  }
  return row;
}
