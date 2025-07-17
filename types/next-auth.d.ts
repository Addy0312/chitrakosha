import NextAuth from "next-auth";
import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isArtist: boolean;
      firstName?: string | null;
      lastName?: string | null;
      bio?: string | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    isArtist: boolean;
    firstName?: string | null;
    lastName?: string | null;
    emailVerified?: Date | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    isArtist: boolean;
    firstName?: string | null;
    lastName?: string | null;
  }
}