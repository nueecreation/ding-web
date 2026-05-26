import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  amountKobo: z.number().int().min(100).max(100_000_000),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { amountKobo } = schema.parse(body);

    const userId = (session.user as any).id;

    await prisma.paymentRequest.updateMany({
      where: { userId, status: "PENDING" },
      data: { status: "EXPIRED" },
    });

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const request = await prisma.paymentRequest.create({
      data: {
        userId,
        amountKobo,
        expiresAt,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      ok: true,
      requestId: request.id,
      amountKobo: request.amountKobo,
      expiresAt: request.expiresAt.toISOString(),
    });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }
    return NextResponse.json(
      { error: err.message ?? "Failed to create payment request" },
      { status: 500 }
    );
  }
}
