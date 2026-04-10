import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

export const authConfig = {
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
