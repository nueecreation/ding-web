"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export function WaitlistForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setDone(true);
      toast("You are on the list. Watch your inbox.");
    } catch (err: any) {
      toast(err.message ?? "Something went wrong, try again");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="p-6 rounded-2xl border border-[rgba(200,241,53,0.2)] bg-[rgba(200,241,53,0.05)] animate-slide-up">
        <div className="text-[#C8F135] font-display font-bold text-xl mb-2">
          You are in.
        </div>
        <p className="text-[#888070] text-sm">
          We will email {email} when early access opens. Tell a friend who hates
          the 9-step transfer.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full bg-[#222222] border border-white/8 rounded-xl px-4 py-4 text-[#F2F0E8] placeholder:text-[#4A4A44] text-sm outline-none focus:border-[rgba(200,241,53,0.4)] transition-colors font-body"
        />
      </div>
      <div>
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full bg-[#222222] border border-white/8 rounded-xl px-4 py-4 text-[#F2F0E8] placeholder:text-[#4A4A44] text-sm outline-none focus:border-[rgba(200,241,53,0.4)] transition-colors font-body"
        />
      </div>
      <div>
        <input
          type="tel"
          placeholder="Phone number (optional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full bg-[#222222] border border-white/8 rounded-xl px-4 py-4 text-[#F2F0E8] placeholder:text-[#4A4A44] text-sm outline-none focus:border-[rgba(200,241,53,0.4)] transition-colors font-body"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#C8F135] text-[#0D0D0D] font-bold py-4 rounded-xl hover:bg-[#B8E020] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-body text-sm"
      >
        {loading ? "Joining..." : "Join the early access list"}
      </button>
      <p className="text-[#4A4A44] text-xs text-center">
        No spam. One email when you are in. Unsubscribe anytime.
      </p>
    </form>
  );
}
