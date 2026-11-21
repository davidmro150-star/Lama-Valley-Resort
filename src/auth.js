
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import connectDB from "@/lib/mongodb";
import User from "@/models/User";

const ALLOWED_ROLES = ["admin", "manager"];

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Admin & Manager Credentials",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        if (
          typeof credentials?.email !== "string" ||
          typeof credentials?.password !== "string"
        ) {
          return null;
        }

        const email = credentials.email.trim().toLowerCase();
        const password = credentials.password;

        if (!email || !password || password.length > 128) {
          return null;
        }

        await connectDB();

        const user = await User.findOne({ email })
          .select("+password +passwordChangedAt");

        if (
          !user ||
          !user.isActive ||
          !ALLOWED_ROLES.includes(user.role)
        ) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          passwordChangedAt:
            user.passwordChangedAt?.getTime() || 0,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,
  },

  pages: {
    signIn: "/admin/login",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.passwordChangedAt =
          user.passwordChangedAt || 0;

        return token;
      }

      if (!token.id) {
        return null;
      }

      await connectDB();

      const currentUser = await User.findById(token.id)
        .select("role isActive passwordChangedAt")
        .lean();

      if (
        !currentUser ||
        !currentUser.isActive ||
        !ALLOWED_ROLES.includes(currentUser.role)
      ) {
        return null;
      }

      const currentPasswordChangedAt =
        currentUser.passwordChangedAt
          ? new Date(currentUser.passwordChangedAt).getTime()
          : 0;

      if (
        Number(token.passwordChangedAt || 0) !==
        currentPasswordChangedAt
      ) {
        return null;
      }

      token.role = currentUser.role;

      return token;
    },

    async session({ session, token }) {
      if (session.user && token?.id) {
        session.user.id = token.id;
        session.user.role = token.role;
      }

      return session;
    },
  },

  secret: process.env.AUTH_SECRET,

  trustHost: true,
});
