import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyTransaction } from "@/lib/paystack";
import { z } from "zod";

const schema = z.object({
  requestId: z.string().min(1),
  reference: z.string().min(1),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { requestId, reference } = schema.parse(body);
    const payerId = (session.user as any).id;

    const request = await prisma.paymentRequest.findUnique({
      where: { id: requestId },
      include: { user: { select: { name: true } } },
    });

    if (!request) {
      return NextResponse.json({ error: "Payment request not found" }, { status: 404 });
    }
    if (request.userId === payerId) {
      return NextResponse.json({ error: "Cannot pay yourself" }, { status: 400 });
    }
    if (request.status === "PAID") {
      return NextResponse.json({ ok: true, alreadyPaid: true });
    }
    if (request.status === "EXPIRED" || new Date() > request.expiresAt) {
      return NextResponse.json({ error: "Payment request expired" }, { status: 400 });
    }

    // Verify with Paystack before touching the DB
    const result = await verifyTransaction(reference);
    if (!result.status || result.data?.status !== "success") {
      return NextResponse.json(
        { error: "Payment not confirmed by Paystack" },
        { status: 400 }
      );
    }
    if (result.data.amount !== request.amountKobo) {
      return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
    }

    // Look up vendor's chosen receive account for receipt
    const receiveAccount = request.receiveAccountId
      ? await prisma.linkedBankAccount.findUnique({
          where: { id: request.receiveAccountId },
          select: { institutionName: true, accountNumber: true },
        })
      : null;
    const receivedTo = receiveAccount
      ? { bank: receiveAccount.institutionName, last4: receiveAccount.accountNumber?.slice(-4) ?? "????" }
      : null;

    // Idempotency: if this reference was already recorded, return success
    const existing = await prisma.transaction.findFirst({
      where: { paystackRef: reference },
    });
    if (existing) {
      return NextResponse.json({
        ok: true,
        vendorName: request.user.name ?? "Vendor",
        amountKobo: request.amountKobo,
        receivedTo,
      });
    }

    await prisma.$transaction([
      prisma.transaction.create({
        data: {
          paymentRequestId: requestId,
          senderId: payerId,
          receiverId: request.userId,
          amountKobo: request.amountKobo,
          status: "SUCCESS",
          paystackRef: reference,
        },
      }),
      prisma.paymentRequest.update({
        where: { id: requestId },
        data: { status: "PAID" },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      vendorName: request.user.name ?? "Vendor",
      amountKobo: request.amountKobo,
      receivedTo,
    });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    return NextResponse.json(
      { error: err.message ?? "Payment failed" },
      { status: 500 }
    );
  }
}
