import NextAuth from "next-auth";
import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isArtist: boolean;
      bio?: string | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    isArtist: boolean;
    emailVerified?: Date | null;
  }
}