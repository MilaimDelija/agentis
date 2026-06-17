import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub({ clientId: process.env.GITHUB_ID!, clientSecret: process.env.GITHUB_SECRET! })],
  callbacks: {
    async signIn({ user, profile }) {
      if (!user.email) return false;
      const p = profile as any;
      await prisma.builder.upsert({
        where: { githubId: String(p.id) },
        update: { displayName: user.name ?? user.email, avatarUrl: user.image ?? null },
        create: {
          githubId: String(p.id),
          username: p.login ?? user.email.split("@")[0],
          displayName: user.name ?? user.email,
          email: user.email,
          avatarUrl: user.image ?? null,
          bio: p.bio ?? null,
          website: p.blog ?? null,
          location: p.location ?? null,
          github: p.login ?? null,
        },
      });
      return true;
    },
    async session({ session }) {
      if (session.user?.email) {
        const builder = await prisma.builder.findUnique({
          where: { email: session.user.email },
          select: { id: true, username: true, displayName: true, avatarUrl: true },
        });
        if (builder) (session as any).builder = builder;
      }
      return session;
    },
  },
  pages: { signIn: "/sign-in" },
});
