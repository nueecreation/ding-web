import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  requestId: z.string().min(1),
  receiveAccountId: z.string().min(1),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { requestId, receiveAccountId } = schema.parse(body);
    const userId = (session.user as any).id;

    const request = await prisma.paymentRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (request.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    // Require that a payer has actually engaged (payerUserId set by /offer)
    if (!request.payerUserId) {
      return NextResponse.json({ error: "No pending offer" }, { status: 400 });
    }
    if (request.status === "PAID" || request.status === "EXPIRED") {
      return NextResponse.json({ error: "No pending offer" }, { status: 400 });
    }
    // Idempotent: already confirmed — just return success so the payer can proceed
    if (request.status === "PENDING" && request.receiveAccountId) {
      return NextResponse.json({ ok: true });
    }

    // Verify the account belongs to this vendor
    const account = await prisma.linkedBankAccount.findFirst({
      where: { id: receiveAccountId, userId },
    });
    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Confirm: go back to PENDING with receiveAccountId set
    await prisma.paymentRequest.update({
      where: { id: requestId },
      data: {
        status: "PENDING",
        receiveAccountId,
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
