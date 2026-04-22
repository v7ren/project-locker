import { getAuthEnvConfig, getAuthGateMode, isAllowedEmail } from "@/lib/auth/config";
import type { TeamRole, TeamUserRecord } from "@/lib/team/users-store";

/**
 * Role used for authorization. Allowlisted OTP emails are always treated as admins.
 */
export function effectiveTeamRole(user: TeamUserRecord): TeamRole {
  if (getAuthGateMode() === "email") {
    const config = getAuthEnvConfig();
    if (config && user.email && isAllowedEmail(config, user.email)) {
      return "admin";
    }
  }
  return user.role;
}

export function isEffectiveAdmin(user: TeamUserRecord): boolean {
  return effectiveTeamRole(user) === "admin";
}

export function isViewer(user: TeamUserRecord): boolean {
  return effectiveTeamRole(user) === "viewer";
}

/** Docs + project home; not dashboard / AI / team admin / calendar. */
export function canUseTeamCalendar(user: TeamUserRecord): boolean {
  return !isViewer(user);
}

export function canUseProjectDashboard(user: TeamUserRecord): boolean {
  return !isViewer(user);
}

export function canUseProjectAi(user: TeamUserRecord): boolean {
  return !isViewer(user);
}

export function canManageTeamAdmin(user: TeamUserRecord): boolean {
  return isEffectiveAdmin(user);
}
