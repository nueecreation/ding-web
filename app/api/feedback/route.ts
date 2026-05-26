import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
  email: z.string().email().optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  const sessionEmail = (session?.user as any)?.email as string | undefined;

  try {
    const body = await req.json();
    const { rating, comment, email } = schema.parse(body);

    const resolvedEmail = email || sessionEmail;

    await prisma.feedback.create({
      data: { rating, comment, email: resolvedEmail, userId },
    });

    if (resolvedEmail) {
      const name = resolvedEmail.split("@")[0];
      await prisma.waitlistEntry
        .upsert({
          where: { email: resolvedEmail },
          update: {},
          create: { name, email: resolvedEmail },
        })
        .catch(() => {});
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ error: err.message ?? "Failed" }, { status: 500 });
  }
}
