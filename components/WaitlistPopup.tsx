"use client";

interface WaitlistPopupProps {
  onDismiss: () => void;
}

export function WaitlistPopup({ onDismiss }: WaitlistPopupProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-6 sm:items-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onDismiss}
      />
      <div className="relative w-full max-w-sm bg-[#181818] border border-white/10 rounded-3xl p-6 animate-slide-up">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 bg-[#C8F135] rounded-xl flex items-center justify-center text-[#0D0D0D] font-display font-bold text-base flex-shrink-0">
            D
          </div>
          <span className="font-display font-bold text-lg text-[#F2F0E8]">Ding!</span>
        </div>

        <h2 className="font-display font-bold text-xl text-[#F2F0E8] mb-2">
          Enjoying Ding!?
        </h2>
        <p className="text-[#888070] text-sm leading-relaxed mb-6">
          Be one of the first users when we officially launch. Join the early
          access list at dingafrica.com and we will let you know the moment
          we go live.
        </p>

        <a
          href="https://dingafrica.com/waitlist"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-[#C8F135] text-[#0D0D0D] font-bold py-3.5 rounded-2xl hover:bg-[#B8E020] transition-all text-center text-sm mb-3"
        >
          Join the waitlist at dingafrica.com
        </a>
        <button
          onClick={onDismiss}
          className="block w-full text-[#4A4A44] text-sm py-2 hover:text-[#888070] transition-colors"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
