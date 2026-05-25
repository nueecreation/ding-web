"use client";

import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { WaitlistPopup } from "@/components/WaitlistPopup";

const NAV_ITEMS = [
  { href: "/app/home", icon: HomeIcon, label: "Home" },
  { href: "/app/receive", icon: ReceiveIcon, label: "Receive" },
  { href: "/app/send", icon: SendIcon, label: "Send" },
  { href: "/app/history", icon: HistoryIcon, label: "History" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const isOnboarding = pathname === "/app/onboarding";
  const isAuth = pathname === "/app/auth";
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated" && !isAuth) {
      router.push("/app/auth");
    }
    if (status === "authenticated" && isAuth) {
      router.push("/app/home");
    }
  }, [status, router, isAuth]);

  useEffect(() => {
    if (isAuth || isOnboarding) return;
    const timer = setTimeout(() => setShowPopup(true), 3 * 60 * 1000);
    return () => clearTimeout(timer);
  }, [isAuth, isOnboarding]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#C8F135] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated" && !isAuth) return null;

  return (
    <div className="min-h-screen bg-[#0D0D0D] max-w-[430px] mx-auto relative">
      {showPopup && <WaitlistPopup onDismiss={() => setShowPopup(false)} />}
      {!isOnboarding && !isAuth && <AppHeader />}
      <main className={!isOnboarding && !isAuth ? "pb-24 min-h-screen" : "min-h-screen"}>
        {children}
      </main>
      {!isOnboarding && !isAuth && <BottomNav pathname={pathname} />}
    </div>
  );
}

function AppHeader() {
  return (
    <header className="sticky top-0 z-40 bg-[rgba(13,13,13,0.92)] backdrop-blur-xl border-b border-white/8 px-5 h-14 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-[#C8F135] rounded-lg flex items-center justify-center text-[#0D0D0D] font-display font-bold text-sm">
          D
        </div>
        <span className="font-display font-bold text-lg text-[#F2F0E8]">Ding!</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 bg-[#4ADE80] rounded-full animate-pulse-dot" />
        <span className="text-[#4A4A44] text-xs">Live</span>
      </div>
    </header>
  );
}

function BottomNav({ pathname }: { pathname: string }) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-[rgba(13,13,13,0.95)] backdrop-blur-xl border-t border-white/8 px-2 pb-6 pt-2 z-40 flex">
      {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-xl transition-all ${
              active ? "bg-[rgba(200,241,53,0.1)]" : "hover:bg-white/5"
            }`}
          >
            <Icon active={active} />
            <span
              className={`text-[10px] font-semibold tracking-wide ${
                active ? "text-[#C8F135]" : "text-[#4A4A44]"
              }`}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
        stroke={active ? "#C8F135" : "#4A4A44"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={active ? "rgba(200,241,53,0.15)" : "none"}
      />
    </svg>
  );
}

function ReceiveIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect
        x="3"
        y="3"
        width="7"
        height="7"
        rx="1"
        stroke={active ? "#C8F135" : "#4A4A44"}
        strokeWidth="2"
      />
      <rect
        x="14"
        y="3"
        width="7"
        height="7"
        rx="1"
        stroke={active ? "#C8F135" : "#4A4A44"}
        strokeWidth="2"
      />
      <rect
        x="3"
        y="14"
        width="7"
        height="7"
        rx="1"
        stroke={active ? "#C8F135" : "#4A4A44"}
        strokeWidth="2"
      />
      <circle cx="17.5" cy="17.5" r="1.5" fill={active ? "#C8F135" : "#4A4A44"} />
    </svg>
  );
}

function SendIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M23 3L4 10l7 4 4 7 8-18z"
        stroke={active ? "#C8F135" : "#4A4A44"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={active ? "rgba(200,241,53,0.15)" : "none"}
      />
    </svg>
  );
}

function HistoryIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke={active ? "#C8F135" : "#4A4A44"}
        strokeWidth="2"
      />
      <path
        d="M12 6v6l4 2"
        stroke={active ? "#C8F135" : "#4A4A44"}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
