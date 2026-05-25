"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import { WaitlistPopup } from "@/components/WaitlistPopup";

const QRScanner = dynamic(() => import("./QRScanner"), { ssr: false });

type SendStep = "scan" | "confirm" | "paying" | "done";

interface PaymentRequest {
  requestId: string;
  vendorName: string;
  amountKobo: number;
}

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(kobo / 100);
}

export function SendPage() {
  const [step, setStep] = useState<SendStep>("scan");
  const [payment, setPayment] = useState<PaymentRequest | null>(null);
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [txRef, setTxRef] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      setTxRef(ref);
      verifyAndComplete(ref);
    }
  }, [searchParams]);

  async function verifyAndComplete(ref: string) {
    try {
      const res = await fetch(`/api/payments/verify?reference=${ref}`);
      const data = await res.json();
      if (data.paid) {
        setPayment({
          requestId: data.requestId ?? "",
          vendorName: data.vendorName ?? "Vendor",
          amountKobo: data.amountKobo ?? 0,
        });
        setStep("done");
        toast("Payment confirmed!");
        setTimeout(() => setShowPopup(true), 2000);
      }
    } catch {}
  }

  function handleScan(url: string) {
    const id = url.split("/p/")[1]?.split("?")[0];
    if (!id) {
      toast("Invalid Ding! QR code");
      return;
    }
    loadPaymentRequest(id);
  }

  async function loadPaymentRequest(requestId: string) {
    try {
      const res = await fetch(`/api/payments/request/${requestId}`);
      const data = await res.json();

      if (!res.ok) {
        toast(data.error ?? "Could not load payment request");
        return;
      }

      if (data.status === "EXPIRED") {
        toast("This QR has expired. Ask the vendor to refresh.");
        return;
      }
      if (data.status === "PAID") {
        toast("This payment has already been completed.");
        return;
      }

      setPayment({
        requestId,
        vendorName: data.vendorName ?? "Vendor",
        amountKobo: data.amountKobo,
      });
      setStep("confirm");
    } catch {
      toast("Could not read QR code. Try again.");
    }
  }

  async function pay() {
    if (!payment) return;
    setStep("paying");
    try {
      const res = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: payment.requestId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAuthUrl(data.authorizationUrl);
      setTxRef(data.reference);
      window.location.href = data.authorizationUrl;
    } catch (err: any) {
      toast(err.message ?? "Payment failed. Try again.");
      setStep("confirm");
    }
  }

  function reset() {
    setStep("scan");
    setPayment(null);
    setAuthUrl(null);
    setTxRef(null);
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      {showPopup && <WaitlistPopup onDismiss={() => setShowPopup(false)} />}
      {step === "scan" && (
        <div className="animate-slide-up">
          <div className="px-5 py-6 mb-2">
            <p className="text-[#888070] text-sm mb-1">Send money</p>
            <h1 className="font-display font-bold text-2xl text-[#F2F0E8]">
              Scan QR code
            </h1>
          </div>
          <QRScanner onScan={handleScan} />
          <div className="px-5 pt-4">
            <p className="text-center text-xs text-[#4A4A44]">
              Point your camera at a vendor's Ding! QR code
            </p>
          </div>
        </div>
      )}

      {step === "confirm" && payment && (
        <div className="px-5 py-6 animate-slide-up">
          <button
            onClick={reset}
            className="text-[#888070] text-sm mb-6 flex items-center gap-1 hover:text-[#F2F0E8] transition-colors"
          >
            ← Back
          </button>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#181818] border border-white/8 mb-6">
            <div className="w-12 h-12 rounded-xl bg-[rgba(200,241,53,0.1)] flex items-center justify-center flex-shrink-0">
              <span className="font-display font-bold text-[#C8F135] text-base">
                {(payment.vendorName ?? "V")
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
            </div>
            <div>
              <div className="font-semibold text-[#F2F0E8]">{payment.vendorName}</div>
              <div className="text-xs text-[#4ADE80] flex items-center gap-1">
                <span>✓</span> Verified on Ding!
              </div>
            </div>
          </div>

          <div className="text-center py-8">
            <div className="text-xs text-[#4A4A44] uppercase tracking-widest mb-3">
              Amount
            </div>
            <div className="font-display font-bold text-6xl text-[#C8F135] leading-none">
              {formatNaira(payment.amountKobo)}
            </div>
          </div>

          <button
            onClick={pay}
            className="w-full bg-[#C8F135] text-[#0D0D0D] font-bold py-4 rounded-2xl hover:bg-[#B8E020] transition-all text-base mb-3"
          >
            Pay {formatNaira(payment.amountKobo)}
          </button>
          <p className="text-center text-xs text-[#4A4A44]">
            Secured via NIBSS bank rails
          </p>
        </div>
      )}

      {step === "paying" && (
        <div className="flex flex-col items-center justify-center min-h-screen px-5 animate-fade-in">
          <div className="w-16 h-16 border-2 border-[#C8F135] border-t-transparent rounded-full animate-spin mb-6" />
          <div className="font-display font-semibold text-[#F2F0E8] text-xl mb-2">
            Completing payment
          </div>
          <p className="text-[#888070] text-sm text-center">
            You are being redirected to complete payment securely...
          </p>
        </div>
      )}

      {step === "done" && payment && (
        <div className="flex flex-col items-center justify-center min-h-screen px-5 animate-bounce-in">
          <div className="w-24 h-24 rounded-full bg-[rgba(74,222,128,0.1)] border-2 border-[#4ADE80] flex items-center justify-center mb-6 text-4xl">
            ✓
          </div>
          <div className="font-display font-bold text-4xl text-[#4ADE80] mb-1">
            {formatNaira(payment.amountKobo)} sent
          </div>
          <div className="text-[#888070] text-sm mb-2">to {payment.vendorName}</div>

          <div className="font-display font-bold text-2xl text-[#C8F135] mt-4 mb-10">
            Both sides Dinged!
          </div>

          <button
            onClick={reset}
            className="w-full max-w-xs border border-white/14 text-[#F2F0E8] font-semibold py-4 rounded-2xl hover:bg-white/5 transition-colors"
          >
            New payment
          </button>
        </div>
      )}
    </div>
  );
}
