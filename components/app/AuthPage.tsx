"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export function AuthPage() {
  const [mode, setMode] = useState<"choice" | "phone" | "otp">("choice");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const router = useRouter();

  async function handleGoogle() {
    setLoading(true);
    const callbackUrl = `${window.location.origin}/app/home`;
    await signIn("google", { callbackUrl });
  }

  async function sendOTP() {
    if (!phone.trim()) return;
    setLoading(true);
    try {
      const formatted = phone.startsWith("+") ? phone : `+234${phone.replace(/^0/, "")}`;
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formatted }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.dev_otp) toast(`Dev OTP: ${data.dev_otp}`);
      setPhone(formatted);
      setMode("otp");
    } catch (err: any) {
      toast(err.message ?? "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOTP() {
    if (otp.length !== 6) return;
    setLoading(true);
    try {
      const result = await signIn("phone-otp", {
        phone,
        otp,
        redirect: false,
        callbackUrl: "/app/onboarding",
      });
      if (result?.error) throw new Error("Incorrect code. Try again.");
      router.push("/app/onboarding");
    } catch (err: any) {
      toast(err.message ?? "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-6">
      {showBanner && (
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 px-4 pt-4">
          <div className="flex items-start gap-3 bg-[#1A1A12] border border-[rgba(200,241,53,0.2)] rounded-2xl px-4 py-3">
            <span className="text-[#C8F135] text-sm mt-0.5 flex-shrink-0">🧪</span>
            <p className="text-[#888070] text-xs leading-relaxed flex-1">
              To experience the full Ding! demo, email{" "}
              <a
                href="mailto:debbie@spireteinc.com"
                className="text-[#C8F135] hover:underline"
              >
                debbie@spireteinc.com
              </a>{" "}
              to receive access to the two test accounts. This app is currently in test mode.
            </p>
            <button
              onClick={() => setShowBanner(false)}
              className="text-[#4A4A44] hover:text-[#888070] text-base leading-none flex-shrink-0 ml-1 transition-colors"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 mb-12">
          <div className="w-10 h-10 bg-[#C8F135] rounded-xl flex items-center justify-center text-[#0D0D0D] font-display font-bold text-lg">
            D
          </div>
          <span className="font-display font-bold text-2xl text-[#F2F0E8]">Ding!</span>
        </div>

        {mode === "choice" && (
          <div className="animate-slide-up">
            <h1 className="font-display font-bold text-3xl text-[#F2F0E8] mb-2">
              Welcome.
            </h1>
            <p className="text-[#888070] mb-10 leading-relaxed">
              Sign in or create your account. Takes 60 seconds.
            </p>

            <button
              onClick={handleGoogle}
              disabled={loading}
              className="w-full flex items-center gap-3 justify-center bg-[#181818] border border-white/14 text-[#F2F0E8] font-semibold py-4 rounded-2xl hover:bg-[#222222] transition-colors disabled:opacity-50 mb-3 text-sm"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            <button
              onClick={() => setMode("phone")}
              className="w-full flex items-center gap-3 justify-center bg-[#C8F135] text-[#0D0D0D] font-bold py-4 rounded-2xl hover:bg-[#B8E020] transition-colors text-sm"
            >
              <PhoneIcon />
              Continue with phone number
            </button>

            <p className="text-center text-xs text-[#4A4A44] mt-6">
              By continuing you agree to Ding!'s Terms and Privacy Policy.
              BVN verification required to transact.
            </p>
          </div>
        )}

        {mode === "phone" && (
          <div className="animate-slide-up">
            <button
              onClick={() => setMode("choice")}
              className="text-[#888070] text-sm mb-8 flex items-center gap-1 hover:text-[#F2F0E8] transition-colors"
            >
              <span>←</span> Back
            </button>
            <h1 className="font-display font-bold text-2xl text-[#F2F0E8] mb-2">
              Your number.
            </h1>
            <p className="text-[#888070] text-sm mb-8">
              We will send a 6-digit code. No spam.
            </p>
            <div className="relative mb-4">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888070] text-sm">
                +234
              </span>
              <input
                type="tel"
                placeholder="080 0000 0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                className="w-full bg-[#181818] border border-white/8 rounded-2xl pl-14 pr-4 py-4 text-[#F2F0E8] placeholder:text-[#4A4A44] text-base outline-none focus:border-[rgba(200,241,53,0.4)] transition-colors font-body"
                autoFocus
              />
            </div>
            <button
              onClick={sendOTP}
              disabled={loading || phone.length < 10}
              className="w-full bg-[#C8F135] text-[#0D0D0D] font-bold py-4 rounded-2xl hover:bg-[#B8E020] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send code"}
            </button>
          </div>
        )}

        {mode === "otp" && (
          <div className="animate-slide-up">
            <button
              onClick={() => setMode("phone")}
              className="text-[#888070] text-sm mb-8 flex items-center gap-1 hover:text-[#F2F0E8] transition-colors"
            >
              <span>←</span> Back
            </button>
            <h1 className="font-display font-bold text-2xl text-[#F2F0E8] mb-2">
              Enter the code.
            </h1>
            <p className="text-[#888070] text-sm mb-8">
              Sent to {phone}
            </p>
            <input
              type="tel"
              placeholder="000000"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="w-full bg-[#181818] border border-white/8 rounded-2xl px-4 py-4 text-[#F2F0E8] placeholder:text-[#4A4A44] text-2xl text-center font-display tracking-widest outline-none focus:border-[rgba(200,241,53,0.4)] transition-colors mb-4"
              autoFocus
            />
            <button
              onClick={verifyOTP}
              disabled={loading || otp.length !== 6}
              className="w-full bg-[#C8F135] text-[#0D0D0D] font-bold py-4 rounded-2xl hover:bg-[#B8E020] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying..." : "Verify"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.909-2.259c-.806.54-1.837.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013 10.82 19.79 19.79 0 01.1 2.18 2 2 0 012.11 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="#0D0D0D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
