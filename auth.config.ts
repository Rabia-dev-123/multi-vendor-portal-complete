import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  providers: [], // Providers will be added in auth.ts
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.featureFlags = user.featureFlags;
      }
      return token;
    },
    async session({ session, token }) {
      // Add custom properties to session user
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.featureFlags = token.featureFlags as Record<
          string,
          boolean
        > | null;
      }

      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
};
