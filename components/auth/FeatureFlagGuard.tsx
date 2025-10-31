"use client";

import { useSession } from "next-auth/react";
import { ReactNode } from "react";

interface FeatureFlagGuardProps {
  children: ReactNode;
  flag: string;
  fallback?: ReactNode;
}

/**
 * Component that conditionally renders based on feature flags
 * Useful for admins with specific permissions
 */
export default function FeatureFlagGuard({
  children,
  flag,
  fallback = null,
}: FeatureFlagGuardProps) {
  const { data: session } = useSession();

  const hasFlag =
    session?.user?.featureFlags && session.user.featureFlags[flag] === true;

  if (!hasFlag) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

