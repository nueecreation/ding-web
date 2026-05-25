import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatNaira, nairaFromKobo } from "@/lib/utils";
import { NoAppPayPage } from "@/components/app/NoAppPayPage";

export default async function PaymentPage({
  params,
}: {
  params: { id: string };
}) {
  const request = await prisma.paymentRequest.findUnique({
    where: { id: params.id },
    include: {
      user: {
        include: {
          linkedBankAccounts: {
            where: { isDefault: true },
            take: 1,
          },
        },
      },
    },
  });

  if (!request) notFound();

  const isExpired =
    request.status === "EXPIRED" ||
    request.status === "PAID" ||
    new Date() > request.expiresAt;

  const vendorName = request.user.name ?? "Vendor";
  const bankAccounts = request.user.linkedBankAccounts.map((a) => ({
    bank: a.institutionName,
    accountNumber: a.accountNumber ?? "",
    accountName: a.accountName ?? vendorName,
  }));

  return (
    <NoAppPayPage
      requestId={params.id}
      vendorName={vendorName}
      amountKobo={request.amountKobo}
      bankAccounts={bankAccounts}
      isExpired={isExpired}
      isPaid={request.status === "PAID"}
    />
  );
}
