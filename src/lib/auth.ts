import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import connectDB from "@/lib/db/mongoose";
import { User } from "@/lib/db/models/User";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = String(credentials.email).toLowerCase();
        const password = String(credentials.password);

        await connectDB();

        const existingUser = await User.findOne({
          email,
        }).lean();

        if (!existingUser) return null;

        const passwordMatches = await compare(
          password,
          existingUser.passwordHash
        );

        if (!passwordMatches) return null;

        return {
          id: existingUser._id.toString(),
          name: existingUser.name,
          email: existingUser.email,
        };
      },
    }),
  ],
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
});
