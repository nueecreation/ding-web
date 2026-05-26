import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  requestId: z.string().min(1),
});

export async function POST(req: Request) {
  if (process.env.NEXT_PUBLIC_TEST_MODE !== "true") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { requestId } = schema.parse(body);
    const payerId = (session.user as any).id;

    const request = await prisma.paymentRequest.findUnique({
      where: { id: requestId },
      include: { user: { select: { name: true } } },
    });

    if (!request) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (request.userId === payerId) {
      return NextResponse.json({ error: "Cannot pay yourself" }, { status: 400 });
    }
    if (request.status === "PAID") {
      return NextResponse.json({ ok: true, alreadyPaid: true });
    }

    const receiveAccount = request.receiveAccountId
      ? await prisma.linkedBankAccount.findUnique({
          where: { id: request.receiveAccountId },
          select: { institutionName: true, accountNumber: true },
        })
      : null;
    const receivedTo = receiveAccount
      ? { bank: receiveAccount.institutionName, last4: receiveAccount.accountNumber?.slice(-4) ?? "????" }
      : null;

    const mockRef = `TEST-${Date.now()}`;

    const existing = await prisma.transaction.findFirst({
      where: { paymentRequestId: requestId },
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
          paystackRef: mockRef,
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
    return NextResponse.json({ error: err.message ?? "Failed" }, { status: 500 });
  }
}
