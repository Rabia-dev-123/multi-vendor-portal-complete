"use client";

import { signOut } from "next-auth/react";
import Button from "@/components/ui/button/Button";

interface SignOutButtonProps {
  children?: React.ReactNode;
  className?: string;
}

export default function SignOutButton({
  className,
  children,
}: SignOutButtonProps) {
  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/signin" });
  };

  return (
    <Button
      onClick={handleSignOut}
      className={className}
      variant="outline"
      size="sm"
    >
      {children}
    </Button>
  );
}
