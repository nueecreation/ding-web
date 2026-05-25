import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyTransaction } from "@/lib/paystack";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const reference = searchParams.get("reference");

  if (!reference) {
    return NextResponse.json({ error: "Missing reference" }, { status: 400 });
  }

  try {
    const result = await verifyTransaction(reference);

    if (!result.status || result.data?.status !== "success") {
      return NextResponse.json({ paid: false, status: result.data?.status });
    }

    const tx = await prisma.transaction.findFirst({
      where: { paystackRef: reference },
      include: {
        paymentRequest: {
          include: { user: { select: { name: true } } },
        },
      },
    });

    if (!tx) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    if (tx.status !== "SUCCESS") {
      await prisma.$transaction([
        prisma.transaction.update({
          where: { id: tx.id },
          data: { status: "SUCCESS" },
        }),
        prisma.paymentRequest.update({
          where: { id: tx.paymentRequestId! },
          data: { status: "PAID" },
        }),
      ]);
    }

    return NextResponse.json({
      paid: true,
      amountKobo: tx.amountKobo,
      requestId: tx.paymentRequestId ?? "",
      vendorName: tx.paymentRequest?.user?.name ?? "Vendor",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Verification failed" },
      { status: 500 }
    );
  }
}
