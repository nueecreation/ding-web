"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import Script from "next/script";

type Step = "welcome" | "bvn" | "bank" | "done";

export function OnboardingPage() {
  const [step, setStep] = useState<Step>("welcome");
  const [bvn, setBvn] = useState("");
  const [bvnLoading, setBvnLoading] = useState(false);
  const [monoLoaded, setMonoLoaded] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  async function verifyBVN() {
    if (bvn.length !== 11) return;
    setBvnLoading(true);
    try {
      const res = await fetch("/api/bvn/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bvn }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast(`Identity verified.`);
      setStep("bank");
    } catch (err: any) {
      toast(err.message ?? "BVN verification failed");
    } finally {
      setBvnLoading(false);
    }
  }

  function openMonoConnect() {
    if (typeof window === "undefined") return;
    const Connect = (window as any).Connect;
    if (!Connect) {
      toast("Bank linking is loading, try in a moment");
      return;
    }

    const connect = new Connect({
      key: process.env.NEXT_PUBLIC_MONO_PUBLIC_KEY,
      onSuccess: async ({ code }: { code: string }) => {
        try {
          const res = await fetch("/api/mono/exchange", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          toast(`${data.account.bank} linked.`);
          setStep("done");
        } catch (err: any) {
          toast(err.message ?? "Failed to link account");
        }
      },
      onClose: () => {},
    });
    connect.setup();
    connect.open();
  }

  const steps: Step[] = ["welcome", "bvn", "bank", "done"];
  const stepIndex = steps.indexOf(step);

  return (
    <>
      <Script
        src="https://connect.withmono.com/connect.js"
        onLoad={() => setMonoLoaded(true)}
      />
      <div className="min-h-screen bg-[#0D0D0D] px-5 py-8">
        <div className="max-w-sm mx-auto">
          <div className="flex items-center gap-2 mb-10">
            {steps.slice(0, 3).map((s, i) => (
              <div key={s} className="flex items-center gap-1">
                <div
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i <= stepIndex ? "bg-[#C8F135]" : "bg-[#222222]"
                  } ${i === stepIndex ? "w-8" : "w-4"}`}
                />
              </div>
            ))}
            <span className="ml-auto text-xs text-[#4A4A44]">
              Step {Math.min(stepIndex + 1, 3)} of 3
            </span>
          </div>

          {step === "welcome" && (
            <div className="animate-slide-up">
              <div className="w-16 h-16 bg-[#C8F135] rounded-2xl flex items-center justify-center text-[#0D0D0D] font-display font-bold text-3xl mb-8">
                D
              </div>
              <h1 className="font-display font-bold text-3xl text-[#F2F0E8] mb-4">
                Let us set you up.
              </h1>
              <p className="text-[#888070] leading-relaxed mb-8">
                Two quick steps: verify your identity with your BVN, then link your
                Nigerian bank account. Takes about 2 minutes.
              </p>
              <div className="space-y-3 mb-10">
                {[
                  { n: 1, title: "BVN verification", desc: "Nigerian identity standard. Required by CBN." },
                  { n: 2, title: "Link bank account", desc: "Powered by Mono. Connect any Nigerian bank." },
                ].map((item) => (
                  <div
                    key={item.n}
                    className="flex items-start gap-3 p-4 rounded-2xl bg-[#181818] border border-white/8"
                  >
                    <div className="w-7 h-7 rounded-full bg-[rgba(200,241,53,0.1)] border border-[rgba(200,241,53,0.2)] flex items-center justify-center flex-shrink-0">
                      <span className="text-[#C8F135] text-xs font-bold font-display">{item.n}</span>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#F2F0E8]">{item.title}</div>
                      <div className="text-xs text-[#888070] mt-0.5">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setStep("bvn")}
                className="w-full bg-[#C8F135] text-[#0D0D0D] font-bold py-4 rounded-2xl hover:bg-[#B8E020] transition-all"
              >
                Let us go
              </button>
            </div>
          )}

          {step === "bvn" && (
            <div className="animate-slide-up">
              <h1 className="font-display font-bold text-2xl text-[#F2F0E8] mb-2">
                BVN verification
              </h1>
              <p className="text-[#888070] text-sm mb-8 leading-relaxed">
                Your Bank Verification Number confirms your identity. It is 11 digits
                and you can find it by dialing *565*0# on any Nigerian network.
              </p>

              <div className="mb-2">
                <label className="text-xs text-[#4A4A44] uppercase tracking-widest block mb-2">
                  Bank Verification Number
                </label>
                <input
                  type="tel"
                  placeholder="00000000000"
                  maxLength={11}
                  value={bvn}
                  onChange={(e) => setBvn(e.target.value.replace(/\D/g, ""))}
                  className="w-full bg-[#181818] border border-white/8 rounded-2xl px-4 py-4 text-[#F2F0E8] placeholder:text-[#4A4A44] text-xl text-center font-display tracking-widest outline-none focus:border-[rgba(200,241,53,0.4)] transition-colors"
                  autoFocus
                />
              </div>

              <div className="flex items-start gap-2 p-3 rounded-xl bg-[rgba(200,241,53,0.05)] border border-[rgba(200,241,53,0.1)] mb-8">
                <span className="text-[#C8F135] text-xs mt-0.5">ℹ</span>
                <p className="text-[#888070] text-xs leading-relaxed">
                  Your BVN is used only to verify your identity. Ding! never stores
                  or shares your BVN. Powered by Paystack's identity API.
                </p>
              </div>

              <button
                onClick={verifyBVN}
                disabled={bvnLoading || bvn.length !== 11}
                className="w-full bg-[#C8F135] text-[#0D0D0D] font-bold py-4 rounded-2xl hover:bg-[#B8E020] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {bvnLoading ? "Verifying..." : "Verify BVN"}
              </button>

              <button
                onClick={() => router.push("/app/home")}
                className="w-full mt-3 text-[#888070] text-sm py-2 hover:text-[#F2F0E8] transition-colors"
              >
                Skip for now in test mode
              </button>
            </div>
          )}

          {step === "bank" && (
            <div className="animate-slide-up">
              <h1 className="font-display font-bold text-2xl text-[#F2F0E8] mb-2">
                Link your bank
              </h1>
              <p className="text-[#888070] text-sm mb-8 leading-relaxed">
                Connect your Nigerian bank account so money can flow in and out.
                We support GTBank, Access, Zenith, UBA, First Bank, Opay, Kuda, Sterling,
                and more.
              </p>

              <div className="grid grid-cols-4 gap-2 mb-8">
                {["GTB", "ACC", "ZEN", "UBA", "1ST", "OPA", "KUD", "STR"].map(
                  (bank) => (
                    <div
                      key={bank}
                      className="aspect-square rounded-xl bg-[#181818] border border-white/8 flex items-center justify-center"
                    >
                      <span className="text-xs text-[#888070] font-display font-bold">
                        {bank}
                      </span>
                    </div>
                  )
                )}
              </div>

              <div className="flex items-start gap-2 p-3 rounded-xl bg-[rgba(200,241,53,0.05)] border border-[rgba(200,241,53,0.1)] mb-8">
                <span className="text-[#C8F135] text-xs mt-0.5">🔒</span>
                <p className="text-[#888070] text-xs leading-relaxed">
                  Bank linking is powered by Mono, a CBN-licensed open banking provider.
                  Ding! never sees your banking passwords.
                </p>
              </div>

              <button
                onClick={openMonoConnect}
                className="w-full bg-[#C8F135] text-[#0D0D0D] font-bold py-4 rounded-2xl hover:bg-[#B8E020] transition-all"
              >
                Connect my bank
              </button>
              <button
                onClick={() => setStep("done")}
                className="w-full mt-3 text-[#888070] text-sm py-2 hover:text-[#F2F0E8] transition-colors"
              >
                Skip for now
              </button>
            </div>
          )}

          {step === "done" && (
            <div className="animate-bounce-in text-center">
              <div className="w-20 h-20 rounded-full bg-[rgba(200,241,53,0.1)] border-2 border-[#C8F135] flex items-center justify-center mx-auto mb-6 text-4xl">
                ✓
              </div>
              <h1 className="font-display font-bold text-3xl text-[#F2F0E8] mb-3">
                You are in.
              </h1>
              <p className="text-[#888070] leading-relaxed mb-10">
                Your account is ready. Start receiving money instantly or scan to
                pay someone right now.
              </p>
              <button
                onClick={() => router.push("/app/home")}
                className="w-full bg-[#C8F135] text-[#0D0D0D] font-bold py-4 rounded-2xl hover:bg-[#B8E020] transition-all"
              >
                Go to Ding! home
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
