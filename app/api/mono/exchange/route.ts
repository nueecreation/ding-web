import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { exchangeToken, getAccountInfo } from "@/lib/mono";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  code: z.string().min(1),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { code } = schema.parse(body);

    const tokenData = await exchangeToken(code);
    const accountId = tokenData.id ?? tokenData.account_id;

    if (!accountId) {
      return NextResponse.json({ error: "Could not get account ID from Mono" }, { status: 400 });
    }

    const accountInfo = await getAccountInfo(accountId);
    const account = accountInfo.account ?? accountInfo;

    const userId = (session.user as any).id;

    const linked = await prisma.linkedBankAccount.upsert({
      where: { monoAccountId: accountId },
      update: {
        institutionName: account.institution?.name ?? "Unknown Bank",
        accountNumber: account.accountNumber ?? account.nuban,
        accountName: account.name,
        bankCode: account.institution?.bankCode,
      },
      create: {
        userId,
        monoAccountId: accountId,
        institutionName: account.institution?.name ?? "Unknown Bank",
        accountNumber: account.accountNumber ?? account.nuban,
        accountName: account.name,
        bankCode: account.institution?.bankCode,
        isDefault: true,
      },
    });

    return NextResponse.json({
      ok: true,
      account: {
        id: linked.id,
        bank: linked.institutionName,
        accountNumber: linked.accountNumber,
        accountName: linked.accountName,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Failed to link account" },
      { status: 500 }
    );
  }
}
