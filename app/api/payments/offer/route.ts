import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  requestId: z.string().min(1),
  payerAccountId: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { requestId, payerAccountId } = schema.parse(body);
    const payerId = (session.user as any).id;

    const request = await prisma.paymentRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return NextResponse.json({ error: "Payment request not found" }, { status: 404 });
    }
    if (request.userId === payerId) {
      return NextResponse.json({ error: "Cannot pay yourself" }, { status: 400 });
    }
    if (request.status === "PAID") {
      return NextResponse.json({ error: "Already paid" }, { status: 400 });
    }
    if (request.status === "EXPIRED" || new Date() > request.expiresAt) {
      return NextResponse.json({ error: "Payment request expired" }, { status: 400 });
    }

    // Reset expiresAt so the payer gets a full 5-min window from when they engage,
    // not from when the vendor first generated the QR.
    await prisma.paymentRequest.update({
      where: { id: requestId },
      data: {
        status: "OFFER",
        payerUserId: payerId,
        payerAccountId: payerAccountId ?? null,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    return NextResponse.json({ error: err.message ?? "Failed" }, { status: 500 });
  }
}
