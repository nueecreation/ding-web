"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface Props {
  onDismiss: () => void;
  initialEmail?: string;
}

export function FeedbackPopup({ onDismiss, initialEmail = "" }: Props) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    sessionStorage.setItem("feedback_shown", "1");
  }, []);

  async function submit() {
    if (!rating) {
      toast("Pick a star rating first");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          comment: comment.trim() || undefined,
          email: email.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to submit");
      setDone(true);
    } catch (err: any) {
      toast(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onDismiss} />
      <div className="relative w-full max-w-sm bg-[#181818] border border-white/10 rounded-3xl p-6 animate-slide-up">
        {done ? (
          <>
            <div className="text-center py-4">
              <div className="text-4xl mb-3">💚</div>
              <h2 className="font-display font-bold text-xl text-[#F2F0E8] mb-2">
                Thank you!
              </h2>
              <p className="text-[#888070] text-sm leading-relaxed">
                Your feedback helps us build the best payment experience in Nigeria.
              </p>
            </div>
            <button
              onClick={onDismiss}
              className="w-full bg-[#C8F135] text-[#0D0D0D] font-bold py-3.5 rounded-2xl hover:bg-[#B8E020] transition-all mt-4 text-sm"
            >
              Done
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-[#C8F135] rounded-xl flex items-center justify-center text-[#0D0D0D] font-display font-bold text-base flex-shrink-0">
                D
              </div>
              <span className="font-display font-bold text-lg text-[#F2F0E8]">Ding!</span>
            </div>

            <h2 className="font-display font-bold text-xl text-[#F2F0E8] mb-1">
              Enjoying Ding!?
            </h2>
            <p className="text-[#888070] text-sm mb-5">
              Rate your experience and help us improve.
            </p>

            <div className="flex gap-2 justify-center mb-5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHovered(n)}
                  onMouseLeave={() => setHovered(0)}
                  className="text-3xl transition-transform active:scale-110 select-none"
                >
                  <span className={(hovered || rating) >= n ? "opacity-100" : "opacity-20"}>
                    ⭐
                  </span>
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Anything specific? (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-[#222222] border border-white/8 rounded-xl px-4 py-3 text-[#F2F0E8] placeholder:text-[#4A4A44] text-sm outline-none focus:border-[rgba(200,241,53,0.4)] transition-colors mb-3"
            />

            <input
              type="email"
              placeholder="Email (join early access list)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#222222] border border-white/8 rounded-xl px-4 py-3 text-[#F2F0E8] placeholder:text-[#4A4A44] text-sm outline-none focus:border-[rgba(200,241,53,0.4)] transition-colors mb-4"
            />

            <button
              onClick={submit}
              disabled={loading || !rating}
              className="w-full bg-[#C8F135] text-[#0D0D0D] font-bold py-3.5 rounded-2xl hover:bg-[#B8E020] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm mb-3"
            >
              {loading ? "Submitting..." : "Submit feedback"}
            </button>
            <button
              onClick={onDismiss}
              className="block w-full text-[#4A4A44] text-sm py-2 hover:text-[#888070] transition-colors"
            >
              Maybe later
            </button>
          </>
        )}
      </div>
    </div>
  );
}
