"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import { WaitlistPopup } from "@/components/WaitlistPopup";

const QRCodeSVG = dynamic(
  () => import("react-qr-code").then((m) => ({ default: m.QRCode })),
  { ssr: false, loading: () => <div className="w-[220px] h-[220px] bg-white/10 rounded-xl animate-pulse" /> }
);

type ReceiveStep = "enter" | "qr" | "paid";

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(kobo / 100);
}

export function ReceivePage() {
  const [step, setStep] = useState<ReceiveStep>("enter");
  const [amountStr, setAmountStr] = useState("");
  const [requestId, setRequestId] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState(300);
  const [loading, setLoading] = useState(false);
  const [paidBy, setPaidBy] = useState<string | null>(null);
  const [paidAt, setPaidAt] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const amountNaira = amountStr ? parseInt(amountStr) : 0;
  const amountKobo = amountNaira * 100;

  const appUrl =
    (typeof window !== "undefined" ? window.location.origin : "") ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "";

  const qrValue = requestId ? `${appUrl}/p/${requestId}` : "";

  function numPress(key: string) {
    if (key === "del") {
      setAmountStr((a) => (a.length > 1 ? a.slice(0, -1) : ""));
    } else if (key === "00") {
      setAmountStr((a) => (a ? a + "00" : a));
    } else {
      setAmountStr((a) => {
        const next = (a + key).replace(/^0+/, "");
        return next.length > 7 ? a : next;
      });
    }
  }

  async function generateQR() {
    if (amountKobo < 100) {
      toast("Enter at least N1");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountKobo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRequestId(data.requestId);
      setExpiresAt(new Date(data.expiresAt));
      setTimeLeft(Math.floor((new Date(data.expiresAt).getTime() - Date.now()) / 1000));
      setStep("qr");
    } catch (err: any) {
      toast(err.message ?? "Failed to generate QR");
    } finally {
      setLoading(false);
    }
  }

  const checkStatus = useCallback(async () => {
    if (!requestId) return;
    try {
      const res = await fetch(`/api/payments/status?requestId=${requestId}`);
      const data = await res.json();
      if (data.status === "PAID") {
        clearInterval(pollRef.current!);
        clearInterval(timerRef.current!);
        setPaidBy(data.paidBy);
        setPaidAt(data.paidAt);
        setStep("paid");
        toast("Payment received!");
        setTimeout(() => setShowPopup(true), 2000);
      } else if (data.status === "EXPIRED") {
        clearInterval(pollRef.current!);
        clearInterval(timerRef.current!);
        setTimeLeft(0);
      }
    } catch {}
  }, [requestId]);

  useEffect(() => {
    if (step !== "qr" || !requestId) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          clearInterval(pollRef.current!);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    pollRef.current = setInterval(checkStatus, 3000);

    return () => {
      clearInterval(timerRef.current!);
      clearInterval(pollRef.current!);
    };
  }, [step, requestId, checkStatus]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  function reset() {
    clearInterval(pollRef.current!);
    clearInterval(timerRef.current!);
    setStep("enter");
    setAmountStr("");
    setRequestId(null);
    setExpiresAt(null);
    setTimeLeft(300);
    setPaidBy(null);
    setPaidAt(null);
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      {showPopup && <WaitlistPopup onDismiss={() => setShowPopup(false)} />}
      {step === "enter" && (
        <div className="px-5 py-6 animate-slide-up">
          <div className="mb-6">
            <p className="text-[#888070] text-sm mb-1">Receive money</p>
            <h1 className="font-display font-bold text-2xl text-[#F2F0E8]">
              How much?
            </h1>
          </div>

          <div className="py-8 text-center">
            <p className="text-xs text-[#4A4A44] uppercase tracking-widest mb-3">
              Nigerian Naira
            </p>
            <div className="font-display font-bold text-6xl text-[#C8F135] leading-none min-h-[72px] flex items-center justify-center">
              {amountStr ? (
                <>
                  <span className="text-3xl mr-1 self-start mt-2 text-[rgba(200,241,53,0.6)]">
                    ₦
                  </span>
                  {parseInt(amountStr).toLocaleString()}
                </>
              ) : (
                <span className="text-[rgba(200,241,53,0.3)]">0</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "00", "0", "del"].map(
              (k) => (
                <button
                  key={k}
                  onClick={() => numPress(k)}
                  className={`py-5 rounded-2xl text-xl font-display font-semibold transition-all active:scale-95 ${
                    k === "del"
                      ? "bg-[#181818] border border-white/8 text-[#888070] text-base"
                      : "bg-[#181818] border border-white/8 text-[#F2F0E8] hover:bg-[#222222]"
                  }`}
                >
                  {k === "del" ? "⌫" : k}
                </button>
              )
            )}
          </div>

          <button
            onClick={generateQR}
            disabled={loading || amountKobo < 100}
            className="w-full bg-[#C8F135] text-[#0D0D0D] font-bold py-4 rounded-2xl hover:bg-[#B8E020] transition-all disabled:opacity-40 disabled:cursor-not-allowed text-base"
          >
            {loading ? "Generating..." : "Generate QR"}
          </button>
        </div>
      )}

      {step === "qr" && (
        <div className="flex flex-col min-h-screen bg-[#0D0D0D] animate-fade-in">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
            <button
              onClick={reset}
              className="text-[#888070] text-sm hover:text-[#F2F0E8] transition-colors"
            >
              ← Change
            </button>
            <div className="text-center">
              <div className="text-xs text-[#4A4A44]">
                {timeLeft > 0
                  ? `Refreshes in ${mins}:${String(secs).padStart(2, "0")}`
                  : "Expired"}
              </div>
            </div>
            <button
              onClick={checkStatus}
              className="text-xs text-[#C8F135] font-medium hover:text-[#B8E020] transition-colors"
            >
              Check
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-5 py-8">
            <p className="text-[#888070] text-sm mb-2">Show this to your customer</p>
            <p className="font-display font-bold text-3xl text-[#F2F0E8] mb-8">
              {formatNaira(amountKobo)}
            </p>

            <div
              className={`p-5 rounded-3xl bg-white shadow-2xl transition-opacity ${
                timeLeft === 0 ? "opacity-30" : "opacity-100"
              }`}
              style={{
                boxShadow: timeLeft > 0
                  ? "0 0 0 1px rgba(200,241,53,0.3), 0 32px 64px rgba(0,0,0,0.6)"
                  : undefined,
              }}
            >
                <QRCodeSVG
                value={qrValue}
                size={220}
                bgColor="#ffffff"
                fgColor="#0D0D0D"
                level="M"
              />
            </div>

            {timeLeft === 0 && (
              <p className="text-[#F87171] text-sm mt-6">QR expired. Generate a new one.</p>
            )}

            {timeLeft > 0 && (
              <div className="flex items-center gap-2 mt-6">
                <span className="w-2 h-2 bg-[#4ADE80] rounded-full animate-pulse-dot" />
                <span className="text-[#888070] text-sm">Waiting for payment...</span>
              </div>
            )}

            <div className="mt-auto pt-8 w-full">
              <div className="p-4 rounded-2xl bg-[#181818] border border-white/8 text-center">
                <p className="text-xs text-[#4A4A44]">
                  Customer without Ding!? They can still pay via{" "}
                  <span className="text-[#888070]">pay.ding.ng</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === "paid" && (
        <div className="flex flex-col items-center justify-center min-h-screen px-5 animate-bounce-in">
          <div className="w-24 h-24 rounded-full bg-[rgba(74,222,128,0.1)] border-2 border-[#4ADE80] flex items-center justify-center mb-6 text-4xl">
            ✓
          </div>

          <div className="font-display font-bold text-5xl text-[#4ADE80] mb-2">
            {formatNaira(amountKobo)}
          </div>
          <div className="text-[#888070] text-sm mb-1">received</div>
          {paidBy && (
            <div className="text-[#F2F0E8] font-medium">from {paidBy}</div>
          )}

          <div className="font-display font-bold text-2xl text-[#C8F135] mt-6 mb-10">
            Ding!
          </div>

          <div className="w-full max-w-xs space-y-3">
            <div className="p-4 rounded-2xl bg-[#181818] border border-white/8">
              {[
                ["Amount", formatNaira(amountKobo)],
                ["From", paidBy ?? "Customer"],
                ["Time", paidAt ? new Date(paidAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "just now"],
                ["Status", "Confirmed"],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="flex justify-between py-2.5 border-b border-white/8 last:border-0 text-sm"
                >
                  <span className="text-[#4A4A44]">{k}</span>
                  <span className={k === "Status" ? "text-[#4ADE80] font-medium" : "text-[#F2F0E8] font-medium"}>
                    {v}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={reset}
              className="w-full border border-white/14 text-[#F2F0E8] font-semibold py-4 rounded-2xl hover:bg-white/5 transition-colors"
            >
              New payment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
