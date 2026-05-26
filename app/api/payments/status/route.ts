import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const requestId = searchParams.get("requestId");

  if (!requestId) {
    return NextResponse.json({ error: "Missing requestId" }, { status: 400 });
  }

  const userId = (session.user as any).id;

  const request = await prisma.paymentRequest.findFirst({
    where: { id: requestId, userId },
    include: {
      transaction: { include: { sender: true } },
    },
  });

  if (!request) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (request.status === "PENDING" && new Date() > request.expiresAt) {
    await prisma.paymentRequest.update({
      where: { id: requestId },
      data: { status: "EXPIRED" },
    });
    return NextResponse.json({ status: "EXPIRED" });
  }

  if (request.status === "OFFER") {
    // Vendor gets notified that a payer is ready
    const payer = request.payerUserId
      ? await prisma.user.findUnique({
          where: { id: request.payerUserId },
          select: { name: true },
        })
      : null;
    return NextResponse.json({
      status: "OFFER",
      amountKobo: request.amountKobo,
      payerName: payer?.name ?? "Someone",
    });
  }

  if (request.status === "PAID") {
    // Include which account received the money
    const receiveAccount = request.receiveAccountId
      ? await prisma.linkedBankAccount.findUnique({
          where: { id: request.receiveAccountId },
          select: { institutionName: true, accountNumber: true },
        })
      : null;

    return NextResponse.json({
      status: "PAID",
      amountKobo: request.amountKobo,
      expiresAt: request.expiresAt.toISOString(),
      paidBy: request.transaction?.sender?.name ?? null,
      paidAt: request.transaction?.createdAt?.toISOString() ?? null,
      receivedTo: receiveAccount
        ? {
            bank: receiveAccount.institutionName,
            last4: receiveAccount.accountNumber?.slice(-4) ?? "????",
          }
        : null,
    });
  }

  return NextResponse.json({
    status: request.status,
    amountKobo: request.amountKobo,
    expiresAt: request.expiresAt.toISOString(),
    paidBy: request.transaction?.sender?.name ?? null,
    paidAt: request.transaction?.createdAt?.toISOString() ?? null,
  });
}
