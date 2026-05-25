"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface Transaction {
  id: string;
  direction: "sent" | "received";
  counterparty: string | null;
  amountKobo: number;
  createdAt: string;
}

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(kobo / 100);
}

function timeAgo(dateStr: string) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
  });
}

export function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [mode, setMode] = useState<"receive" | "send">("receive");
  const [recentTx, setRecentTx] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const firstName = session?.user?.name?.split(" ")[0] ?? "there";

  useEffect(() => {
    fetch("/api/transactions?filter=all")
      .then((r) => r.json())
      .then((d) => setRecentTx((d.transactions ?? []).slice(0, 5)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="px-5 py-6">
      <div className="mb-8">
        <p className="text-[#888070] text-sm mb-1">Good to see you,</p>
        <h1 className="font-display font-bold text-3xl text-[#F2F0E8]">
          {firstName}.
        </h1>
      </div>

      <div className="p-1.5 bg-[#181818] border border-white/8 rounded-2xl flex mb-8 relative">
        <div
          className="absolute top-1.5 bottom-1.5 rounded-xl bg-[#C8F135] transition-all duration-300 ease-out"
          style={{
            width: "calc(50% - 3px)",
            left: mode === "receive" ? "6px" : "calc(50% + 3px)",
          }}
        />
        <button
          onClick={() => { setMode("receive"); router.push("/app/receive"); }}
          className={`flex-1 py-3 rounded-xl text-sm font-bold z-10 relative transition-colors ${
            mode === "receive" ? "text-[#0D0D0D]" : "text-[#888070]"
          }`}
        >
          Receive Money
        </button>
        <button
          onClick={() => { setMode("send"); router.push("/app/send"); }}
          className={`flex-1 py-3 rounded-xl text-sm font-bold z-10 relative transition-colors ${
            mode === "send" ? "text-[#0D0D0D]" : "text-[#888070]"
          }`}
        >
          Send Money
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
        <button
          onClick={() => router.push("/app/receive")}
          className="p-5 rounded-2xl bg-[rgba(200,241,53,0.08)] border border-[rgba(200,241,53,0.15)] flex flex-col gap-3 text-left hover:bg-[rgba(200,241,53,0.12)] transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-[rgba(200,241,53,0.15)] flex items-center justify-center">
            <QRIcon />
          </div>
          <div>
            <div className="font-display font-semibold text-[#C8F135] text-base">
              Get paid
            </div>
            <div className="text-xs text-[#888070] mt-0.5">Show your QR</div>
          </div>
        </button>

        <button
          onClick={() => router.push("/app/send")}
          className="p-5 rounded-2xl bg-[#181818] border border-white/8 flex flex-col gap-3 text-left hover:bg-[#222222] transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#222222] flex items-center justify-center">
            <ScanIcon />
          </div>
          <div>
            <div className="font-display font-semibold text-[#F2F0E8] text-base">
              Pay someone
            </div>
            <div className="text-xs text-[#888070] mt-0.5">Scan their QR</div>
          </div>
        </button>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-[#F2F0E8] text-base">
            Recent
          </h2>
          <button
            onClick={() => router.push("/app/history")}
            className="text-xs text-[#C8F135] hover:text-[#B8E020] transition-colors"
          >
            See all
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-10">
            <div className="w-5 h-5 border-2 border-[#C8F135] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && recentTx.length === 0 && (
          <div className="py-10 text-center">
            <p className="text-[#4A4A44] text-sm">No transactions yet.</p>
            <p className="text-[#4A4A44] text-xs mt-1">
              Generate a QR and get paid first.
            </p>
          </div>
        )}

        {!loading && recentTx.length > 0 && (
          <div className="space-y-1">
            {recentTx.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center gap-3 p-3.5 rounded-xl hover:bg-[#181818] transition-colors"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
                    tx.direction === "received"
                      ? "bg-[rgba(74,222,128,0.1)]"
                      : "bg-[rgba(248,113,113,0.1)]"
                  }`}
                >
                  {tx.direction === "received" ? "↙" : "↗"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[#F2F0E8] truncate">
                    {tx.counterparty ?? (tx.direction === "received" ? "Someone" : "Unknown")}
                  </div>
                  <div className="text-xs text-[#4A4A44]">{timeAgo(tx.createdAt)}</div>
                </div>
                <div
                  className={`text-sm font-bold flex-shrink-0 ${
                    tx.direction === "received" ? "text-[#4ADE80]" : "text-[#F87171]"
                  }`}
                >
                  {tx.direction === "received" ? "+" : "-"}
                  {formatNaira(tx.amountKobo)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function QRIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="7" height="7" rx="1" stroke="#C8F135" strokeWidth="1.5"/>
      <rect x="5" y="5" width="3" height="3" fill="#C8F135"/>
      <rect x="14" y="3" width="7" height="7" rx="1" stroke="#C8F135" strokeWidth="1.5"/>
      <rect x="16" y="5" width="3" height="3" fill="#C8F135"/>
      <rect x="3" y="14" width="7" height="7" rx="1" stroke="#C8F135" strokeWidth="1.5"/>
      <rect x="5" y="16" width="3" height="3" fill="#C8F135"/>
      <rect x="14" y="14" width="2" height="2" fill="#C8F135"/>
      <rect x="18" y="14" width="3" height="3" fill="#C8F135"/>
      <rect x="14" y="18" width="3" height="3" fill="#C8F135"/>
    </svg>
  );
}

function ScanIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M23 3L4 10l7 4 4 7 8-18z" stroke="#F2F0E8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
