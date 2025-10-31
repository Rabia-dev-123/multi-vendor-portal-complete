"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: string[];
  fallbackUrl?: string;
}

/**
 * Client-side role guard component
 * Wraps components that should only be accessible to specific roles
 */
export default function RoleGuard({
  children,
  allowedRoles,
  fallbackUrl = "/signin",
}: RoleGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push(fallbackUrl);
      return;
    }

    if (!allowedRoles.includes(session.user.role)) {
      // Redirect to user's appropriate dashboard
      const userRole = session.user.role;
      let redirectUrl = "/signin";

      switch (userRole) {
        case "VENDOR":
          redirectUrl = "/vendor/dashboard";
          break;
        case "ADMIN":
          redirectUrl = "/admin/dashboard";
          break;
        case "SUPER_ADMIN":
          redirectUrl = "/superadmin/dashboard";
          break;
      }

      router.push(redirectUrl);
    }
  }, [session, status, router, allowedRoles, fallbackUrl]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!session || !allowedRoles.includes(session.user.role)) {
    return null;
  }

  return <>{children}</>;
}

