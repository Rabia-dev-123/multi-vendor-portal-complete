"use client";
import { useSession } from "next-auth/react";
import {
  hasFeatureAccess,
  getEnabledFeatures,
} from "@/lib/utils/checkFeatureAccess";
import {
  DEFAULT_FEATURE_FLAGS,
  FeatureFlagKey,
  FeatureFlags,
} from "@/lib/featureFlags";

export function useAdminFeatureAccess(feature: FeatureFlagKey): boolean {
  const { data: session } = useSession();

  if (!session?.user) {
    return false;
  }

  // Super Admin always has access
  if (session.user.role === "SUPER_ADMIN") {
    return true;
  }

  // Check admin permissions
  if (session.user.role === "ADMIN") {
    return hasFeatureAccess(
      session.user.featureFlags as FeatureFlags | null,
      feature
    );
  }

  return false;
}

export function useAdminEnabledFeatures(): FeatureFlagKey[] {
  const { data: session } = useSession();

  if (!session?.user) {
    return [];
  }

  // Super Admin has all features
  if (session.user.role === "SUPER_ADMIN") {
    return Object.keys(DEFAULT_FEATURE_FLAGS) as FeatureFlagKey[];
  }

  // Get admin's enabled features
  if (session.user.role === "ADMIN") {
    return getEnabledFeatures(session.user.featureFlags as FeatureFlags | null);
  }

  return [];
}

export function useIsSuperAdmin(): boolean {
  const { data: session } = useSession();
  return session?.user?.role === "SUPER_ADMIN";
}

export function useAdminSession() {
  const { data: session, status } = useSession();

  return {
    session,
    status,
    isLoading: status === "loading",
    isAuthenticated: !!session,
    isSuperAdmin: session?.user?.role === "SUPER_ADMIN",
    isAdmin: session?.user?.role === "ADMIN",
  };
}
