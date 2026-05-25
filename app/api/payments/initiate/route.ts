import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { initializeTransaction } from "@/lib/paystack";
import { generateRef } from "@/lib/utils";
import { z } from "zod";

const schema = z.object({
  requestId: z.string().min(1),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { requestId } = schema.parse(body);

    const userId = (session.user as any).id;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user?.email) {
      return NextResponse.json(
        { error: "User email required for payment" },
        { status: 400 }
      );
    }

    const request = await prisma.paymentRequest.findUnique({
      where: { id: requestId },
      include: { user: true },
    });

    if (!request) {
      return NextResponse.json({ error: "Payment request not found" }, { status: 404 });
    }

    if (request.status !== "PENDING" || new Date() > request.expiresAt) {
      return NextResponse.json({ error: "Payment request expired or already paid" }, { status: 400 });
    }

    if (request.userId === userId) {
      return NextResponse.json({ error: "Cannot pay yourself" }, { status: 400 });
    }

    const ref = generateRef();

    const tx = await initializeTransaction({
      email: user.email,
      amountKobo: request.amountKobo,
      reference: ref,
      callbackUrl: `${process.env.NEXTAUTH_URL}/app/send/confirm?ref=${ref}`,
      metadata: {
        paymentRequestId: requestId,
        senderId: userId,
        receiverId: request.userId,
      },
    });

    await prisma.transaction.create({
      data: {
        paymentRequestId: requestId,
        senderId: userId,
        receiverId: request.userId,
        amountKobo: request.amountKobo,
        status: "PENDING",
        paystackRef: ref,
      },
    });

    return NextResponse.json({
      ok: true,
      authorizationUrl: tx.data.authorization_url,
      reference: ref,
    });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    return NextResponse.json(
      { error: err.message ?? "Failed to initiate payment" },
      { status: 500 }
    );
  }
}
