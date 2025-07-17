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
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember Me", type: "checkbox" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter both email and password");
        }

        const user = await prisma.user.findUnique({ 
          where: { email: credentials.email.toLowerCase() } 
        });

        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }

        const isValidPassword = await bcrypt.compare(credentials.password, user.password);

        if (!isValidPassword) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user.id,
          name: user.name,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          isArtist: user.isArtist,
          emailVerified: user.emailVerified,
          image: user.image,
        } as NextAuthUser;
      }
    })
  ],
  pages: {
    signIn: "/login",
    error: "/login",
    verifyRequest: "/verify-request",
    newUser: "/onboarding",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session) {
        // Handle session updates
        return { ...token, ...session.user };
      }
      
      if (user) {
        token.id = user.id;
        token.isArtist = (user as NextAuthUser).isArtist;
        token.firstName = (user as any).firstName;
        token.lastName = (user as any).lastName;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.isArtist = token.isArtist as boolean;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    // Set maxAge based on rememberMe flag (30 days or 24 hours)
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  debug: process.env.NODE_ENV === "development",
};
