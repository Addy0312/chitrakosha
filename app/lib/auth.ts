import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from 'bcryptjs';
import { AuthOptions, User as NextAuthUser } from "next-auth";
import { Adapter } from "next-auth/adapters";

const prisma = new PrismaClient();

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({ where: { email: credentials.email } });

        if (!user || !user.password) {
          return null;
        }

        const isValidPassword = await bcrypt.compare(credentials.password, user.password);

        if (!isValidPassword) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          isArtist: user.isArtist,
          emailVerified: user.emailVerified,
        } as NextAuthUser;
      }
    })
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isArtist = (user as NextAuthUser).isArtist;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.isArtist = token.isArtist as boolean;
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
};
