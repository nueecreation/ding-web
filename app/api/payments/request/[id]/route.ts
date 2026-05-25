import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const request = await prisma.paymentRequest.findUnique({
    where: { id: params.id },
    include: { user: { select: { id: true, name: true } } },
  });

  if (!request) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const userId = (session.user as any).id;

  if (request.userId === userId) {
    return NextResponse.json({ error: "Cannot pay yourself" }, { status: 400 });
  }

  if (request.status === "PAID") {
    return NextResponse.json({ status: "PAID" });
  }

  if (request.status === "EXPIRED" || new Date() > request.expiresAt) {
    await prisma.paymentRequest.update({
      where: { id: params.id },
      data: { status: "EXPIRED" },
    }).catch(() => {});
    return NextResponse.json({ status: "EXPIRED" });
  }

  return NextResponse.json({
    status: request.status,
    vendorName: request.user.name ?? "Vendor",
    amountKobo: request.amountKobo,
    expiresAt: request.expiresAt.toISOString(),
  });
}
