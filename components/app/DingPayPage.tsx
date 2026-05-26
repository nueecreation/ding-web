"use client";

import { useState } from "react";
import Script from "next/script";
import Link from "next/link";
import toast from "react-hot-toast";

interface PayerAccount {
  id: string;
  institutionName: string;
  accountNumber: string;
  accountName: string;
  isDefault: boolean;
  balance: number | null;
}

interface Props {
  requestId: string;
  vendorName: string;
  amountKobo: number;
  isExpired: boolean;
  isPaid: boolean;
  payerEmail: string;
  payerAccounts: PayerAccount[];
}

type Phase = "select" | "paying" | "done";

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(kobo / 100);
}

export function DingPayPage({
  requestId,
  vendorName,
  amountKobo,
  isExpired,
  isPaid,
  payerEmail,
  payerAccounts,
}: Props) {
  const [phase, setPhase] = useState<Phase>("select");
  const [selectedId, setSelectedId] = useState<string | null>(
    payerAccounts.find((a) => a.isDefault)?.id ?? payerAccounts[0]?.id ?? null
  );
  const [doneRef, setDoneRef] = useState("");

  const initials = vendorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function handlePay() {
    const PaystackPop = (window as any).PaystackPop;
    if (!PaystackPop) {
      toast("Payment system not ready, please try again in a moment");
      return;
    }

    setPhase("paying");

    const paystack = new PaystackPop();
    paystack.newTransaction({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email: payerEmail,
      amount: amountKobo,
      onSuccess: async (transaction: { reference: string }) => {
        try {
          const res = await fetch("/api/payments/ding-pay", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              requestId,
              reference: transaction.reference,
            }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          setDoneRef(transaction.reference);
          setPhase("done");
        } catch (err: any) {
          // Payment went through but recording failed — give reference so user can follow up
          toast(`Payment sent but not yet confirmed. Reference: ${transaction.reference}`);
          setPhase("select");
        }
      },
      onCancel: () => {
        setPhase("select");
      },
    });
  }

  if (phase === "done") {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-[#F2F0E8] font-body flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-20 h-20 rounded-full bg-[rgba(74,222,128,0.1)] border-2 border-[#4ADE80] flex items-center justify-center mx-auto mb-6 text-4xl">
            ✓
          </div>
          <h1 className="font-display font-bold text-3xl text-[#F2F0E8] mb-2">
            Payment sent!
          </h1>
          <p className="text-[#888070] mb-1">
            You paid {formatNaira(amountKobo)} to {vendorName}.
          </p>
          {doneRef && (
            <p className="text-[#4A4A44] text-xs mb-8 font-mono">
              {doneRef}
            </p>
          )}
          <Link
            href="/app/home"
            className="block w-full bg-[#C8F135] text-[#0D0D0D] font-bold py-4 rounded-2xl hover:bg-[#B8E020] transition-all text-center"
          >
            Back to Ding!
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Script src="https://js.paystack.co/v2/inline.js" strategy="beforeInteractive" />
      <div className="min-h-screen bg-[#0D0D0D] text-[#F2F0E8] font-body flex items-start justify-center p-4 pt-8">
        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-6 h-6 bg-[#C8F135] rounded-md flex items-center justify-center text-[#0D0D0D] font-display font-bold text-xs">
              D
            </div>
            <span className="font-display font-bold text-[#F2F0E8]">Ding!</span>
            <span className="ml-auto text-xs text-[#4ADE80] flex items-center gap-1">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="#4ADE80">
                <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm-1 14l-4-4 1.41-1.41L11 13.17l6.59-6.59L19 8l-8 8z"/>
              </svg>
              Ding! Pay
            </span>
          </div>

          {isPaid && (
            <div className="p-6 rounded-2xl border border-[rgba(74,222,128,0.2)] bg-[rgba(74,222,128,0.05)] text-center">
              <div className="text-4xl mb-3">✓</div>
              <div className="font-display font-bold text-[#4ADE80] text-xl mb-1">
                Already paid
              </div>
              <p className="text-[#888070] text-sm">
                This payment request has been completed.
              </p>
            </div>
          )}

          {isExpired && !isPaid && (
            <div className="p-6 rounded-2xl border border-[rgba(248,113,113,0.2)] bg-[rgba(248,113,113,0.05)] text-center">
              <div className="font-display font-bold text-[#F87171] text-xl mb-1">
                QR expired
              </div>
              <p className="text-[#888070] text-sm">
                Ask the vendor to generate a new QR code.
              </p>
            </div>
          )}

          {!isExpired && !isPaid && (
            <>
              {/* Vendor card */}
              <div className="p-4 rounded-2xl border border-white/8 bg-[#181818] flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[rgba(200,241,53,0.1)] flex items-center justify-center flex-shrink-0">
                  <span className="font-display font-bold text-[#C8F135] text-lg">
                    {initials}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-[#F2F0E8]">{vendorName}</div>
                  <div className="text-xs text-[#4ADE80] flex items-center gap-1">
                    <span>✓</span> Verified on Ding!
                  </div>
                </div>
              </div>

              {/* Amount */}
              <div className="p-5 rounded-2xl border border-[rgba(200,241,53,0.15)] bg-[rgba(200,241,53,0.05)] text-center mb-6">
                <div className="text-xs text-[rgba(200,241,53,0.6)] uppercase tracking-widest mb-1">
                  Amount
                </div>
                <div className="font-display font-bold text-4xl text-[#C8F135]">
                  {formatNaira(amountKobo)}
                </div>
              </div>

              {/* PAY FROM */}
              <div className="mb-6">
                <div className="text-xs text-[#4A4A44] uppercase tracking-widest mb-3">
                  Pay from
                </div>

                {payerAccounts.length === 0 ? (
                  <div className="p-5 rounded-2xl border border-white/8 bg-[#181818] text-center">
                    <p className="text-[#888070] text-sm mb-3">
                      No bank account linked yet.
                    </p>
                    <Link
                      href="/app/onboarding"
                      className="text-[#C8F135] text-sm font-semibold"
                    >
                      Link a bank account in Ding!
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {payerAccounts.map((acc) => {
                      const last4 = acc.accountNumber
                        ? acc.accountNumber.slice(-4)
                        : "····";
                      const isSelected = selectedId === acc.id;
                      return (
                        <button
                          key={acc.id}
                          onClick={() => setSelectedId(acc.id)}
                          className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${
                            isSelected
                              ? "border-[rgba(200,241,53,0.4)] bg-[rgba(200,241,53,0.05)]"
                              : "border-white/8 bg-[#181818] hover:border-white/20"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                              isSelected
                                ? "border-[#C8F135]"
                                : "border-[#4A4A44]"
                            }`}
                          >
                            {isSelected && (
                              <div className="w-2.5 h-2.5 rounded-full bg-[#C8F135]" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-[#F2F0E8]">
                              {acc.institutionName}{" "}
                              <span className="text-[#4A4A44] tracking-widest">
                                ···· {last4}
                              </span>
                            </div>
                            <div className="text-xs text-[#888070] mt-0.5 flex items-center gap-2 flex-wrap">
                              <span className="truncate">{acc.accountName}</span>
                              {acc.balance !== null && (
                                <span className="text-[#4A4A44] flex-shrink-0">
                                  {formatNaira(acc.balance)}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Pay button */}
              <button
                onClick={handlePay}
                disabled={phase === "paying" || payerAccounts.length === 0}
                className="w-full bg-[#C8F135] text-[#0D0D0D] font-bold py-4 rounded-2xl hover:bg-[#B8E020] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {phase === "paying" ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-[#0D0D0D] border-t-transparent rounded-full animate-spin" />
                    Opening payment...
                  </span>
                ) : (
                  `Pay ${formatNaira(amountKobo)} now`
                )}
              </button>

              <p className="text-center text-xs text-[#4A4A44] mt-4">
                Secured by Paystack
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}
