import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

export const authConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isDashboard = nextUrl.pathname.startsWith("/dashboard") || 
                          nextUrl.pathname.startsWith("/expenses") ||
                          nextUrl.pathname.startsWith("/goals") ||
                          nextUrl.pathname.startsWith("/debts") ||
                          nextUrl.pathname.startsWith("/history") ||
                          nextUrl.pathname.startsWith("/settings") ||
                          nextUrl.pathname.startsWith("/api");

      // We handle the actual redirection in middleware.ts for more control,
      // but this callback is part of the standard v5 pattern.
      return true; 
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id as string;
      }
      if (trigger === "update" && session?.name) {
        token.name = session.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        if (token.name) {
          session.user.name = token.name as string;
        }
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
