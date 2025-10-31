import { auth } from "@/auth";

/**
 * Get the current session on the server side
 */
export async function getSession() {
  return await auth();
}

/**
 * Check if user has a specific feature flag enabled
 */
export function hasFeatureFlag(
  featureFlags: Record<string, any> | null | undefined,
  flag: string
): boolean {
  if (!featureFlags) return false;
  return !!featureFlags[flag];
}

/**
 * Check if user has required role
 */
export function hasRole(userRole: string | undefined, requiredRoles: string[]): boolean {
  if (!userRole) return false;
  return requiredRoles.includes(userRole);
}

/**
 * Get role-based redirect URL
 */
export function getRoleBasedRedirect(role: string): string {
  switch (role) {
    case "VENDOR":
      return "/vendor/dashboard";
    case "ADMIN":
      return "/admin/dashboard";
    case "SUPER_ADMIN":
      return "/superadmin/dashboard";
    default:
      return "/signin";
  }
}

