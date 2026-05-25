import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().max(20).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone } = schema.parse(body);

    const entry = await prisma.waitlistEntry.upsert({
      where: { email },
      update: { phone: phone ?? undefined },
      create: { name, email, phone: phone || null },
    });

    return NextResponse.json({ ok: true, id: entry.id });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Could not add to waitlist" },
      { status: 500 }
    );
  }
}
