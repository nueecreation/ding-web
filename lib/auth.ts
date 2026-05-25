import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      httpOptions: {
        timeout: 10000,
      },
    }),
    CredentialsProvider({
      id: "phone-otp",
      name: "Phone OTP",
      credentials: {
        phone: { label: "Phone", type: "text" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.otp) return null;
        const stored = otpStore.get(credentials.phone);
        if (!stored) return null;
        if (Date.now() > stored.expires) {
          otpStore.delete(credentials.phone);
          return null;
        }
        if (stored.code !== credentials.otp) return null;
        otpStore.delete(credentials.phone);

        let user = await prisma.user.findUnique({
          where: { phone: credentials.phone },
        });
        if (!user) {
          user = await prisma.user.create({
            data: { phone: credentials.phone, name: "" },
          });
        }
        return { id: user.id, phone: user.phone ?? undefined, name: user.name ?? "" };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url === baseUrl || url === `${baseUrl}/`) {
        return `${baseUrl}/app/home`;
      }
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return `${baseUrl}/app/home`;
    },
  },
  pages: {
    signIn: "/app/auth",
    newUser: "/app/onboarding",
  },
};

export const otpStore = new Map<string, { code: string; expires: number }>();
