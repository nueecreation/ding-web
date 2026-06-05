"use client";

import { useState, type MouseEvent } from "react";
import Link from "next/link";
import { WaitlistForm } from "./WaitlistForm";

function scrollToWaitlist(e: MouseEvent<HTMLAnchorElement>) {
  e.preventDefault();
  document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" });
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#F2F0E8] font-body overflow-x-hidden">
      <Nav />
      <Hero />
      <VideoSection />
      <Problem />
      <Solution />
      <Stats />
      <HowItWorks />
      <Founder />
      <WaitlistSection />
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/8 bg-[#0D0D0D]/90 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#C8F135] rounded-lg flex items-center justify-center text-[#0D0D0D] font-display font-bold text-base">
            D
          </div>
          <span className="font-display font-bold text-xl">Ding!</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-[#C8F135] font-semibold border border-[rgba(200,241,53,0.3)] px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-full hover:bg-[rgba(200,241,53,0.08)] transition-colors whitespace-nowrap"
          >
            <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C8F135] opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-[#C8F135]" />
            </span>
            Try Ding! live
          </Link>
          <a
            href="#waitlist"
            onClick={scrollToWaitlist}
            className="bg-[#C8F135] text-[#0D0D0D] font-semibold text-xs sm:text-sm px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-full hover:bg-[#B8E020] transition-colors whitespace-nowrap"
          >
            Get early access
          </a>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 md:pt-32 md:pb-28">
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 bg-[rgba(200,241,53,0.1)] border border-[rgba(200,241,53,0.2)] rounded-full px-4 py-1.5 mb-8">
          <span className="w-1.5 h-1.5 bg-[#C8F135] rounded-full animate-pulse-dot" />
          <span className="text-[#C8F135] text-xs font-semibold tracking-wide">
            Building in public.
          </span>
        </div>

        <h1 className="font-display font-bold text-5xl md:text-7xl leading-[1.05] text-[#F2F0E8] mb-6">
          Pay anyone.
          <br />
          <span className="text-[#C8F135]">3 steps.</span>
          <br />
          Any bank.
        </h1>

        <p className="text-[#888070] text-lg md:text-xl leading-relaxed mb-10 max-w-2xl">
          Transferring money in Nigeria takes 9 steps and anywhere from 3 to 30 minutes. Ding! collapses
          it to a scan and a tap. No account numbers. No app switching. No waiting
          to &quot;see alert&quot;.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="#waitlist"
            onClick={scrollToWaitlist}
            className="bg-[#C8F135] text-[#0D0D0D] font-bold text-base px-8 py-4 rounded-2xl hover:bg-[#B8E020] transition-all hover:-translate-y-0.5 text-center"
          >
            Join the waitlist
          </a>
          <a
            href="#how"
            className="border border-white/14 text-[#F2F0E8] font-medium text-base px-8 py-4 rounded-2xl hover:bg-white/5 transition-colors text-center"
          >
            See how it works
          </a>
        </div>

        <div className="mt-6 flex flex-col items-start gap-1.5">
          <Link
            href="/app"
            target="_blank"
            rel="noopener noreferrer"
            className="relative inline-flex items-center gap-2.5 border border-[rgba(200,241,53,0.35)] text-[#C8F135] font-semibold text-sm px-6 py-3 rounded-2xl hover:bg-[rgba(200,241,53,0.08)] transition-colors group"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C8F135] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C8F135]" />
            </span>
            Try Ding! live
          </Link>
          <p className="text-[#4A4A44] text-xs pl-1">No bank account needed to explore.</p>
        </div>
      </div>

      <div className="mt-20 grid grid-cols-3 gap-3 md:gap-6 max-w-lg">
        {[
          { num: "25x", label: "faster than bank transfer" },
          { num: "3", label: "steps, not 9" },
          { num: "Any bank.", label: "works with what you have" },
        ].map((stat) => (
          <div key={stat.num}>
            <div className="font-display font-bold text-base md:text-3xl text-[#C8F135] mb-1 whitespace-nowrap">
              {stat.num}
            </div>
            <div className="text-[#888070] text-[10px] md:text-xs leading-snug">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function VideoSection() {
  return (
    <section className="border-t border-white/8 py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col items-center text-center">
          <h2 className="font-display font-bold text-5xl md:text-7xl leading-[1.05] text-[#C8F135] mb-6">
            See it in action.
          </h2>
          <p className="text-[#888070] text-lg md:text-xl leading-relaxed mb-12 max-w-2xl">
            Watch the full demo. No account numbers. No app switching.
          </p>
          <div className="relative w-full max-w-[340px] sm:max-w-[380px] aspect-[9/16] rounded-2xl overflow-hidden border border-white/8 bg-black shadow-[0_20px_60px_-20px_rgba(200,241,53,0.15)]">
            <iframe
              src="https://player.cloudinary.com/embed/?cloud_name=dj0ziyvy2&public_id=SaveClip.App_AQMH4ZtTogrK5gNPQI93hvRT4srLQcpl20k6nS5TFNnd4enwVD2x-k5nBZPMkel0QrSUdIaQthaIc2k4Vpemd1ZgMYoIuLSpJrmcnjQ_s7avu6&autoplay=true&muted=true&loop=true&controls=true"
              title="Ding! in action"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function Problem() {
  const steps = [
    "Open bank app",
    "Wait for it to load",
    "Find 'Transfer'",
    "Ask for account number",
    "Type in account number",
    "Select their bank",
    "Enter the amount",
    "Verify name. Hope it's right.",
    "Wait. Check for alert.",
  ];

  return (
    <section className="border-t border-white/8 py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-xl mb-12">
          <p className="text-[#C8F135] text-sm font-semibold tracking-widest uppercase mb-4">
            The problem
          </p>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-[#F2F0E8] leading-tight">
            Nine steps to pay for your suya.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-2">
            {steps.map((step, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-3.5 rounded-xl bg-[#181818] border border-white/8"
              >
                <div className="w-7 h-7 rounded-full bg-[rgba(248,113,113,0.1)] border border-[rgba(248,113,113,0.2)] flex items-center justify-center flex-shrink-0">
                  <span className="text-[#F87171] text-xs font-bold font-display">
                    {i + 1}
                  </span>
                </div>
                <span className="text-[#888070] text-sm">{step}</span>
              </div>
            ))}
            <div className="p-3.5 rounded-xl bg-[rgba(248,113,113,0.05)] border border-[rgba(248,113,113,0.15)] mt-4 space-y-1">
              <p className="text-[#F87171] text-sm font-medium">
                3 to 5 minutes. If everything goes well.
              </p>
              <p className="text-[#4A4A44] text-xs">
                Most people have waited much longer.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-[#F2F0E8] text-lg leading-relaxed">
              Every informal market vendor in Lagos knows this pain. Every Uber
              driver. Every small business owner collecting payment from 40
              customers a day.
            </p>
            <p className="text-[#888070] leading-relaxed">
              The problem is not Nigerians. The problem is a UX built for desktop
              banking in 2009 that nobody has had the nerve to replace.
            </p>
            <p className="text-[#C8F135] font-medium">Ding! has the nerve.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Solution() {
  return (
    <section className="border-t border-white/8 py-20 md:py-28 bg-[#181818]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-xl mb-16">
          <p className="text-[#C8F135] text-sm font-semibold tracking-widest uppercase mb-4">
            The solution
          </p>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-[#F2F0E8] leading-tight">
            Scan. Confirm. Done.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: "01",
              title: "Vendor enters amount",
              desc: "Type the amount. A QR appears instantly, full screen. No account number. No setup.",
              tag: "Receive mode",
            },
            {
              step: "02",
              title: "Customer scans",
              desc: "Open Ding! or point your camera at the QR. Amount and vendor name fill automatically.",
              tag: "Send mode",
            },
            {
              step: "03",
              title: "Both hear the Ding!",
              desc: "Payment confirmed instantly. No 'did it go?' No 'I didn't see the alert yet.' Done.",
              tag: "Instant",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="p-6 rounded-2xl border border-white/8 bg-[#0D0D0D] hover:border-[rgba(200,241,53,0.2)] transition-colors group"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="font-display font-bold text-4xl text-white/10 group-hover:text-[rgba(200,241,53,0.2)] transition-colors">
                  {item.step}
                </span>
                <span className="text-xs text-[#C8F135] font-medium bg-[rgba(200,241,53,0.1)] px-3 py-1 rounded-full">
                  {item.tag}
                </span>
              </div>
              <h3 className="font-display font-semibold text-xl text-[#F2F0E8] mb-3">
                {item.title}
              </h3>
              <p className="text-[#888070] text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stats() {
  return (
    <section className="border-t border-white/8 py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { num: "25x", label: "Faster than standard bank transfer", accent: true },
            { num: "3", label: "Steps to complete a payment", accent: false },
            { num: "8+", label: "Nigerian banks supported at launch", accent: false },
            { num: "0", label: "New accounts to create", accent: false },
          ].map((stat) => (
            <div key={stat.num} className="space-y-2">
              <div
                className={`font-display font-bold text-5xl md:text-6xl leading-none ${
                  stat.accent ? "text-[#C8F135]" : "text-[#F2F0E8]"
                }`}
              >
                {stat.num}
              </div>
              <div className="text-[#888070] text-sm leading-snug">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section
      id="how"
      className="border-t border-white/8 py-20 md:py-28 bg-[#181818]"
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-xl mb-16">
          <p className="text-[#C8F135] text-sm font-semibold tracking-widest uppercase mb-4">
            How it works
          </p>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-[#F2F0E8] leading-tight">
            One app. Two modes. Every transaction.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <div className="inline-flex items-center gap-2 bg-[rgba(200,241,53,0.1)] border border-[rgba(200,241,53,0.2)] rounded-full px-3 py-1.5 mb-6">
              <span className="text-[#C8F135] text-xs font-semibold">Receive Money</span>
            </div>
            <h3 className="font-display font-semibold text-2xl text-[#F2F0E8] mb-4">
              You are the vendor.
            </h3>
            <ul className="space-y-3">
              {[
                "Enter the amount on your numpad",
                "A full-screen QR appears instantly",
                "Customer scans it from across the counter",
                "You hear the Ding. Money is in your account.",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-[#888070] text-sm">
                  <span className="w-5 h-5 rounded-full bg-[#C8F135] text-[#0D0D0D] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="inline-flex items-center gap-2 bg-[rgba(167,139,250,0.1)] border border-[rgba(167,139,250,0.2)] rounded-full px-3 py-1.5 mb-6">
              <span className="text-[#A78BFA] text-xs font-semibold">Send Money</span>
            </div>
            <h3 className="font-display font-semibold text-2xl text-[#F2F0E8] mb-4">
              You are the customer.
            </h3>
            <ul className="space-y-3">
              {[
                "Tap 'Send Money' on your home screen",
                "Point your camera at the vendor's QR",
                "Amount and name fill automatically",
                "One tap to confirm. Both sides Dinged.",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-[#888070] text-sm">
                  <span className="w-5 h-5 rounded-full bg-[#A78BFA] text-[#0D0D0D] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 p-6 rounded-2xl border border-[rgba(200,241,53,0.15)] bg-[rgba(200,241,53,0.05)]">
          <p className="text-[#888070] text-sm">
            <span className="text-[#C8F135] font-medium">The same person does both. </span>
            You receive money as a vendor in the morning at your stall. You send money
            as a customer at lunch. Toggle between modes in one tap.
          </p>
        </div>
      </div>
    </section>
  );
}

function Founder() {
  return (
    <section className="border-t border-white/8 py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-2xl">
          <p className="text-[#C8F135] text-sm font-semibold tracking-widest uppercase mb-8">
            The founder
          </p>

          <blockquote className="font-display font-medium text-2xl md:text-3xl text-[#F2F0E8] leading-snug mb-10">
            &quot;Ding! is the product I kept wishing existed every single time
            I paid for something in Nigeria.&quot;
          </blockquote>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[rgba(200,241,53,0.1)] border border-[rgba(200,241,53,0.2)] flex items-center justify-center">
              <span className="font-display font-bold text-xl text-[#C8F135]">DO</span>
            </div>
            <div>
              <div className="font-display font-semibold text-[#F2F0E8] text-lg">
                Deborah Onyibe, MBA
              </div>
              <div className="text-[#888070] text-sm">
                Startup Brand Strategist. Building Ding! in public.
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            {[
              "2M+ users at Payday",
              "Serial Builder",
              "SCAD",
              "MBA",
              "Atlanta",
              "Lagos",
            ].map((tag) => (
              <span
                key={tag}
                className="text-xs text-[#888070] border border-white/8 rounded-full px-3 py-1.5"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function WaitlistSection() {
  return (
    <section
      id="waitlist"
      className="border-t border-white/8 py-20 md:py-28 bg-[#181818]"
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-xl">
          <p className="text-[#C8F135] text-sm font-semibold tracking-widest uppercase mb-4">
            Early access
          </p>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-[#F2F0E8] leading-tight mb-4">
            Join the early access list.
          </h2>
          <p className="text-[#888070] mb-10 leading-relaxed">
            Be one of the first users when Ding! officially launches. No spam.
            One email when you are in.
          </p>
          <WaitlistForm />
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/8 py-10">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#C8F135] rounded-md flex items-center justify-center text-[#0D0D0D] font-display font-bold text-xs">
            D
          </div>
          <span className="font-display font-bold text-[#F2F0E8]">Ding!</span>
        </div>
        <div className="text-[#4A4A44] text-sm text-center">
          Built in Lagos. Regulated under CBN framework. BVN-verified.
        </div>
        <div className="text-[#4A4A44] text-sm">
          &copy; {new Date().getFullYear()} Ding! Technologies Ltd.
        </div>
      </div>
    </footer>
  );
}
