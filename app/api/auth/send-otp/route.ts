import { NextResponse } from "next/server";
import { otpStore } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
});

function generateOTP(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone } = schema.parse(body);

    const code = generateOTP();
    const expires = Date.now() + 5 * 60 * 1000;

    otpStore.set(phone, { code, expires });

    if (process.env.NODE_ENV === "development") {
      console.log(`[DEV] OTP for ${phone}: ${code}`);
      return NextResponse.json({ ok: true, dev_otp: code });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
