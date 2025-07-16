import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import EmailProvider from "next-auth/providers/email"

const prisma = new PrismaClient()

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
  ],
  pages: {
    signIn: "/login", // Custom login page
  },
  callbacks: {
    async session({ session, user }: { session: any, user: any }) {
      session.user.id = user.id;
      session.user.isArtist = user.isArtist;
      return session;
    },
  },
}
