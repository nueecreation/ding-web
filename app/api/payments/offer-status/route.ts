import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Payer polls this to know when vendor has confirmed their receive account.
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

  const payerId = (session.user as any).id;

  const request = await prisma.paymentRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (request.payerUserId !== payerId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (request.status === "PAID") {
    return NextResponse.json({ offerStatus: "paid" });
  }
  if (request.status === "EXPIRED" || new Date() > request.expiresAt) {
    return NextResponse.json({ offerStatus: "expired" });
  }
  if (request.status === "OFFER") {
    return NextResponse.json({ offerStatus: "waiting" });
  }
  // PENDING with receiveAccountId = vendor confirmed, ready to pay
  if (request.status === "PENDING" && request.receiveAccountId) {
    return NextResponse.json({ offerStatus: "confirmed" });
  }

  return NextResponse.json({ offerStatus: "waiting" });
}
