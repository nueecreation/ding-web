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
  const filter = searchParams.get("filter") ?? "all";
  const userId = (session.user as any).id;

  const where =
    filter === "sent"
      ? { senderId: userId }
      : filter === "received"
      ? { receiverId: userId }
      : { OR: [{ senderId: userId }, { receiverId: userId }] };

  const transactions = await prisma.transaction.findMany({
    where: { ...where, status: "SUCCESS" },
    include: {
      sender: { select: { id: true, name: true } },
      receiver: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({
    transactions: transactions.map((tx) => ({
      id: tx.id,
      direction: tx.senderId === userId ? "sent" : "received",
      counterparty:
        tx.senderId === userId ? tx.receiver.name : tx.sender.name,
      amountKobo: tx.amountKobo,
      createdAt: tx.createdAt.toISOString(),
      ref: tx.paystackRef,
    })),
  });
}
