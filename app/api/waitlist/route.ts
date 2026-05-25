import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Resend } from "resend";

const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().max(20).optional(),
});

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone } = schema.parse(body);

    const entry = await prisma.waitlistEntry.upsert({
      where: { email },
      update: { phone: phone ?? undefined },
      create: { name, email, phone: phone || null },
    });

    resend.emails.send({
      from: "Ding! <onboarding@resend.dev>",
      to: "debbie@spireteinc.com",
      subject: "New Ding! Waitlist Signup",
      html: `
        <p>New waitlist signup:</p>
        <ul>
          <li><strong>Name:</strong> ${name}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Phone:</strong> ${phone ?? "not provided"}</li>
        </ul>
      `,
    }).catch(() => {});

    return NextResponse.json({ ok: true, id: entry.id });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    console.error("[waitlist]", err?.message ?? err);
    return NextResponse.json(
      { error: "Could not add to waitlist", detail: err?.message },
      { status: 500 }
    );
  }
}
