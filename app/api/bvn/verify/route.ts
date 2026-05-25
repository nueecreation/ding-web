import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { verifyBVN } from "@/lib/paystack";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  bvn: z.string().length(11).regex(/^\d{11}$/),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { bvn } = schema.parse(body);

    const result = await verifyBVN(bvn);

    if (!result.status || !result.data) {
      return NextResponse.json(
        { error: "BVN verification failed. Check the number and try again." },
        { status: 400 }
      );
    }

    const userId = (session.user as any).id;
    await prisma.user.update({
      where: { id: userId },
      data: {
        bvnVerified: true,
        name: result.data.first_name
          ? `${result.data.first_name} ${result.data.last_name ?? ""}`.trim()
          : undefined,
      },
    });

    return NextResponse.json({
      ok: true,
      name: result.data.first_name,
    });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json({ error: "Invalid BVN format" }, { status: 400 });
    }
    return NextResponse.json(
      { error: err.message ?? "Verification failed" },
      { status: 500 }
    );
  }
}
