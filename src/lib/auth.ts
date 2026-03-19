import { PrismaAdapter } from "@auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const providers: NextAuthOptions["providers"] = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

providers.push(
  CredentialsProvider({
    name: "credentials",
    credentials: {
      email:    { label: "Email",    type: "email"    },
      password: { label: "Senha",    type: "password" },
      name:     { label: "Nome",     type: "text"     },
      mode:     { label: "Mode",     type: "text"     },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null;

      const email    = credentials.email.trim().toLowerCase();
      const password = credentials.password;
      const mode     = credentials.mode ?? "login";

      if (mode === "register") {
        if (!credentials.name?.trim()) return null;
        const exists = await prisma.user.findUnique({ where: { email } });
        if (exists) throw new Error("EMAIL_IN_USE");
        const hashed = await bcrypt.hash(password, 12);
        const user = await prisma.user.create({
          data: {
            email,
            name: credentials.name.trim(),
            password: hashed,
          },
        });
        return { id: user.id, email: user.email, name: user.name, image: user.image };
      } else {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) throw new Error("NOT_FOUND");
        if (!user.password) throw new Error("USE_GOOGLE");
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) throw new Error("WRONG_PASSWORD");
        return { id: user.id, email: user.email, name: user.name, image: user.image };
      }
    },
  })
);

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  providers,
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.id = token.id as string;
      return session;
    },
  },
  pages: { signIn: "/login" },
};