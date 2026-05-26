import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAccountBalance } from "@/lib/mono";
import { notFound } from "next/navigation";
import { NoAppPayPage } from "@/components/app/NoAppPayPage";
import { DingPayPage } from "@/components/app/DingPayPage";

export default async function PaymentPage({
  params,
}: {
  params: { id: string };
}) {
  const [session, request] = await Promise.all([
    getServerSession(authOptions),
    prisma.paymentRequest.findUnique({
      where: { id: params.id },
      include: {
        user: {
          include: {
            linkedBankAccounts: {
              orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
            },
          },
        },
      },
    }),
  ]);

  if (!request) notFound();

  const isExpired =
    request.status === "EXPIRED" || new Date() > request.expiresAt;
  const isPaid = request.status === "PAID";

  const vendorName = request.user.name ?? "Vendor";
  const vendorAccounts = request.user.linkedBankAccounts.map((a) => ({
    institutionName: a.institutionName,
    accountNumber: a.accountNumber ?? "",
    accountName: a.accountName ?? vendorName,
  }));

  const payerId = (session?.user as any)?.id as string | undefined;
  const isSelf = !!payerId && payerId === request.userId;

  // Scenario A: not logged in, or vendor viewing their own request
  if (!payerId || isSelf) {
    return (
      <NoAppPayPage
        requestId={params.id}
        vendorName={vendorName}
        amountKobo={request.amountKobo}
        bankAccounts={vendorAccounts}
        isExpired={isExpired}
        isPaid={isPaid}
        isSelf={isSelf}
      />
    );
  }

  // Scenario B: logged-in payer — fetch their accounts and balances
  const [payerUser, payerAccountsRaw] = await Promise.all([
    prisma.user.findUnique({
      where: { id: payerId },
      select: { email: true, phone: true },
    }),
    prisma.linkedBankAccount.findMany({
      where: { userId: payerId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    }),
  ]);

  const payerAccounts = await Promise.all(
    payerAccountsRaw.map(async (a) => {
      // Use DB balance (sandbox dummy data) if present; otherwise try Mono
      let balance: number | null = a.balanceKobo ?? null;
      if (balance === null && !a.monoAccountId.startsWith("mock_")) {
        try {
          const res = await getAccountBalance(a.monoAccountId);
          balance = typeof res?.data?.balance === "number" ? res.data.balance : null;
        } catch {}
      }
      return {
        id: a.id,
        institutionName: a.institutionName,
        accountNumber: a.accountNumber ?? "",
        accountName: a.accountName ?? "",
        isDefault: a.isDefault,
        balance,
      };
    })
  );

  const payerEmail =
    payerUser?.email ??
    (payerUser?.phone
      ? `${payerUser.phone.replace(/\D/g, "")}@pay.ding.ng`
      : "payer@ding.ng");

  return (
    <DingPayPage
      requestId={params.id}
      vendorName={vendorName}
      amountKobo={request.amountKobo}
      isExpired={isExpired}
      isPaid={isPaid}
      payerEmail={payerEmail}
      payerAccounts={payerAccounts}
    />
  );
}
