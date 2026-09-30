import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./db";

declare module "next-auth" {
  interface User {
    isPremium?: boolean;
    username?: string | null;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      isPremium: boolean;
      username?: string | null;
    };
  }
}

declare module "next-auth" {
  interface JWT {
    id?: string;
    isPremium?: boolean;
    username?: string | null;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/signin",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email || "")
          .toLowerCase()
          .trim();
        const password = String(credentials?.password || "");
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        const premiumActive =
          user.isPremium && (!user.premiumUntil || user.premiumUntil > new Date());

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          isPremium: !!premiumActive,
          username: user.username,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.isPremium = user.isPremium;
        token.username = user.username;
      }
      if (trigger === "update" && session) {
        if (typeof session.isPremium === "boolean") token.isPremium = session.isPremium;
        if (session.name) token.name = session.name;
      }
      // Refresh premium status periodically
      if (token.id && (!token.lastPremiumCheck || Date.now() - Number(token.lastPremiumCheck) > 60_000)) {
        try {
          const dbUser = await prisma.user.findUnique({ where: { id: String(token.id) } });
          if (dbUser) {
            token.isPremium =
              dbUser.isPremium && (!dbUser.premiumUntil || dbUser.premiumUntil > new Date());
            token.username = dbUser.username;
            token.name = dbUser.name;
          }
          (token as { lastPremiumCheck?: number }).lastPremiumCheck = Date.now();
        } catch {
          /* ignore */
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id || "");
        session.user.isPremium = Boolean(token.isPremium);
        session.user.username = (token.username as string | null) || null;
      }
      return session;
    },
  },
});
