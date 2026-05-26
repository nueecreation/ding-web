"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

interface BankAccount {
  institutionName: string;
  accountNumber: string;
  accountName: string;
}

interface Props {
  requestId: string;
  vendorName: string;
  amountKobo: number;
  bankAccounts: BankAccount[];
  isExpired: boolean;
  isPaid: boolean;
  isSelf?: boolean;
}

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(kobo / 100);
}

export function NoAppPayPage({
  requestId,
  vendorName,
  amountKobo,
  bankAccounts,
  isExpired,
  isPaid,
  isSelf = false,
}: Props) {
  const [copied, setCopied] = useState<string | null>(null);

  function copy(accountNumber: string) {
    navigator.clipboard.writeText(accountNumber).catch(() => {});
    setCopied(accountNumber);
    toast("Account number copied!");
    setTimeout(() => setCopied(null), 2000);
  }

  const initials = vendorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#F2F0E8] font-body flex items-start justify-center p-4 pt-8">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-6 h-6 bg-[#C8F135] rounded-md flex items-center justify-center text-[#0D0D0D] font-display font-bold text-xs">
            D
          </div>
          <span className="font-display font-bold text-[#F2F0E8]">Ding!</span>
          <span className="ml-auto text-xs text-[#4A4A44]">
            p/{requestId.slice(0, 8)}
          </span>
        </div>

        {isSelf && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(200,241,53,0.05)] border border-[rgba(200,241,53,0.1)] mb-4">
            <span className="text-[#C8F135] text-xs">ℹ</span>
            <p className="text-[#888070] text-xs">
              This is your payment request. Share the link or QR code with your customer.
            </p>
          </div>
        )}

        {isPaid && (
          <div className="p-6 rounded-2xl border border-[rgba(74,222,128,0.2)] bg-[rgba(74,222,128,0.05)] text-center mb-6">
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
          <div className="p-6 rounded-2xl border border-[rgba(248,113,113,0.2)] bg-[rgba(248,113,113,0.05)] text-center mb-6">
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
                <span className="font-display font-bold text-[#C8F135] text-lg">{initials}</span>
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
                Amount requested
              </div>
              <div className="font-display font-bold text-4xl text-[#C8F135]">
                {formatNaira(amountKobo)}
              </div>
            </div>

            {/* Bank accounts */}
            <div className="mb-6">
              <div className="text-xs text-[#4A4A44] uppercase tracking-widest mb-3">
                Transfer to any of these accounts
              </div>
              {bankAccounts.length === 0 ? (
                <p className="text-[#888070] text-sm text-center py-4">
                  No account details available. Ask the vendor.
                </p>
              ) : (
                bankAccounts.map((acc, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 rounded-xl bg-[#181818] border border-white/8 mb-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-mono text-base font-semibold text-[#F2F0E8] tracking-wider">
                        {acc.accountNumber}
                      </div>
                      <div className="text-xs text-[#888070] mt-0.5 truncate">
                        {acc.institutionName} · {acc.accountName}
                      </div>
                    </div>
                    <button
                      onClick={() => copy(acc.accountNumber)}
                      className={`ml-3 flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        copied === acc.accountNumber
                          ? "bg-[rgba(74,222,128,0.1)] text-[#4ADE80]"
                          : "bg-[#C8F135] text-[#0D0D0D] hover:bg-[#B8E020]"
                      }`}
                    >
                      {copied === acc.accountNumber ? "Copied!" : "Copy"}
                    </button>
                  </div>
                ))
              )}
            </div>

            <p className="text-center text-xs text-[#4A4A44] mb-6">
              Paste the account number into your bank app and send the exact amount above.
            </p>
          </>
        )}

        {!isSelf && (
          <div className="p-4 rounded-2xl border border-white/8 bg-[#181818] text-center">
            <p className="text-[#888070] text-sm mb-3">
              Pay faster next time. Install Ding!
            </p>
            <Link
              href="/app/auth"
              className="bg-[#C8F135] text-[#0D0D0D] font-bold text-sm px-6 py-2.5 rounded-xl inline-block hover:bg-[#B8E020] transition-colors"
            >
              Get Ding! Free
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
