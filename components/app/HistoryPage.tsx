"use client";

import { useState, useEffect } from "react";

type FilterType = "all" | "sent" | "received";

interface Transaction {
  id: string;
  direction: "sent" | "received";
  counterparty: string | null;
  amountKobo: number;
  createdAt: string;
  ref: string | null;
}

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(kobo / 100);
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return `Today, ${date.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}`;
  }
  if (diffDays === 1) {
    return `Yesterday, ${date.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}`;
  }
  return date.toLocaleDateString("en-NG", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function HistoryPage() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/transactions?filter=${filter}`)
      .then((r) => r.json())
      .then((d) => setTransactions(d.transactions ?? []))
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false));
  }, [filter]);

  const sentTotal = transactions
    .filter((t) => t.direction === "sent")
    .reduce((sum, t) => sum + t.amountKobo, 0);

  const receivedTotal = transactions
    .filter((t) => t.direction === "received")
    .reduce((sum, t) => sum + t.amountKobo, 0);

  return (
    <div className="px-5 py-6">
      <div className="mb-6">
        <p className="text-[#888070] text-sm mb-1">Your activity</p>
        <h1 className="font-display font-bold text-2xl text-[#F2F0E8]">History</h1>
      </div>

      {transactions.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-4 rounded-2xl bg-[#181818] border border-white/8">
            <div className="text-xs text-[#4A4A44] uppercase tracking-widest mb-1">
              Sent
            </div>
            <div className="font-display font-bold text-xl text-[#F87171]">
              {formatNaira(sentTotal)}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-[#181818] border border-white/8">
            <div className="text-xs text-[#4A4A44] uppercase tracking-widest mb-1">
              Received
            </div>
            <div className="font-display font-bold text-xl text-[#4ADE80]">
              {formatNaira(receivedTotal)}
            </div>
          </div>
        </div>
      )}

      <div className="flex p-1 bg-[#181818] border border-white/8 rounded-xl mb-6">
        {(["all", "received", "sent"] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all capitalize ${
              filter === f
                ? "bg-[#C8F135] text-[#0D0D0D]"
                : "text-[#888070] hover:text-[#F2F0E8]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-[#C8F135] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && transactions.length === 0 && (
        <div className="py-16 text-center">
          <div className="text-4xl mb-4">📋</div>
          <p className="text-[#888070] text-sm font-medium">No transactions yet</p>
          <p className="text-[#4A4A44] text-xs mt-1">
            {filter === "all"
              ? "Start by generating a QR or scanning one."
              : filter === "sent"
              ? "You have not sent any payments yet."
              : "You have not received any payments yet."}
          </p>
        </div>
      )}

      {!loading && transactions.length > 0 && (
        <div>
          {transactions.map((tx, i) => (
            <div
              key={tx.id}
              className={`flex items-center gap-3 py-4 ${
                i < transactions.length - 1 ? "border-b border-white/8" : ""
              }`}
            >
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center text-lg flex-shrink-0 ${
                  tx.direction === "received"
                    ? "bg-[rgba(74,222,128,0.1)]"
                    : "bg-[rgba(248,113,113,0.1)]"
                }`}
              >
                {tx.direction === "received" ? "↙" : "↗"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[#F2F0E8] truncate">
                  {tx.counterparty ??
                    (tx.direction === "received" ? "Someone" : "Unknown")}
                </div>
                <div className="text-xs text-[#4A4A44] mt-0.5">
                  {formatDate(tx.createdAt)} · QR
                </div>
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
  );
}
