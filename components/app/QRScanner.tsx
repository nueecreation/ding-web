"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  onScan: (value: string) => void;
}

type Phase =
  | "prompt"       // waiting for user tap (required for Safari iOS)
  | "requesting"   // calling getUserMedia
  | "starting"     // initialising html5-qrcode
  | "active"       // scanning
  | "denied"       // permission refused
  | "unsupported"  // no camera API
  | "error";       // anything else

function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function classifyError(err: any): Phase {
  const name: string = err?.name ?? "";
  const msg: string = (err?.message ?? "").toLowerCase();

  if (
    name === "NotAllowedError" ||
    name === "PermissionDeniedError" ||
    msg.includes("permission") ||
    msg.includes("denied") ||
    msg.includes("not allowed")
  ) return "denied";

  if (
    name === "NotSupportedError" ||
    name === "SecurityError" ||
    msg.includes("secure") ||
    msg.includes("https")
  ) return "unsupported";

  return "error";
}

export default function QRScanner({ onScan }: Props) {
  const scannerRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [phase, setPhase] = useState<Phase>("prompt");

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !navigator?.mediaDevices?.getUserMedia
    ) {
      setPhase("unsupported");
    }
  }, []);

  useEffect(() => {
    return () => {
      stopAll();
    };
  }, []);

  function stopAll() {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {});
      scannerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }

  async function startCamera() {
    setPhase("requesting");

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
    } catch (frontErr: any) {
      // Back camera failed — try front camera before giving up
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      } catch (err: any) {
        setPhase(classifyError(err));
        return;
      }
    }

    // Stop the probe stream — html5-qrcode opens its own
    stream.getTracks().forEach((t) => t.stop());
    streamRef.current = null;

    setPhase("starting");

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const el = document.getElementById("ding-qr-reader");
      if (!el) return;

      const scanner = new Html5Qrcode("ding-qr-reader");
      scannerRef.current = scanner;

      const config = { fps: 10, qrbox: { width: 220, height: 220 } };

      try {
        await scanner.start(
          { facingMode: "environment" },
          config,
          (text: string) => onScan(text),
          () => {}
        );
      } catch {
        await scanner.start(
          { facingMode: "user" },
          config,
          (text: string) => onScan(text),
          () => {}
        );
      }

      setPhase("active");
    } catch (err: any) {
      console.error("[QRScanner]", err?.name, err?.message);
      setPhase(classifyError(err));
    }
  }

  function retry() {
    stopAll();
    setPhase("prompt");
  }

  // Prompt — user must tap to trigger camera (required on Safari iOS)
  if (phase === "prompt") {
    return (
      <div className="mx-5">
        <button
          onClick={startCamera}
          className="w-full aspect-square rounded-2xl bg-[#181818] border border-white/8 flex flex-col items-center justify-center gap-4 hover:border-[rgba(200,241,53,0.3)] transition-colors group"
        >
          <div className="w-16 h-16 rounded-full bg-[rgba(200,241,53,0.1)] border border-[rgba(200,241,53,0.2)] flex items-center justify-center group-hover:bg-[rgba(200,241,53,0.15)] transition-colors">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="#C8F135" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="13" r="4" stroke="#C8F135" strokeWidth="2"/>
            </svg>
          </div>
          <div className="text-center px-6">
            <p className="text-[#F2F0E8] font-semibold text-sm mb-1">Tap to open camera</p>
            <p className="text-[#4A4A44] text-xs">You will be asked to allow camera access</p>
          </div>
        </button>
      </div>
    );
  }

  if (phase === "denied") {
    const ios = isIOS();
    return (
      <div className="mx-5 rounded-2xl bg-[#181818] border border-white/8 p-8 text-center">
        <div className="text-4xl mb-4">🔒</div>
        <p className="text-[#F2F0E8] font-semibold mb-2">Camera access blocked</p>
        <p className="text-[#888070] text-sm leading-relaxed mb-6">
          {ios
            ? "Please allow camera access in your iPhone Settings > Safari > Camera, then try again."
            : "Allow camera access in your browser settings for this site, then try again."}
        </p>
        <button
          onClick={retry}
          className="bg-[#C8F135] text-[#0D0D0D] font-bold px-6 py-3 rounded-2xl text-sm hover:bg-[#B8E020] transition-all"
        >
          Try again
        </button>
      </div>
    );
  }

  if (phase === "unsupported") {
    return (
      <div className="mx-5 rounded-2xl bg-[#181818] border border-white/8 p-8 text-center">
        <div className="text-4xl mb-4">📷</div>
        <p className="text-[#F2F0E8] font-semibold mb-2">Camera not available</p>
        <p className="text-[#888070] text-sm leading-relaxed">
          Camera scanning requires HTTPS and a supported browser. Try opening
          Ding! in Safari or Chrome on your phone.
        </p>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="mx-5 rounded-2xl bg-[#181818] border border-white/8 p-8 text-center">
        <div className="text-4xl mb-4">📷</div>
        <p className="text-[#F2F0E8] font-semibold mb-2">Could not start camera</p>
        <p className="text-[#888070] text-sm leading-relaxed mb-6">
          Make sure no other app is using the camera, then try again.
        </p>
        <button
          onClick={retry}
          className="bg-[#C8F135] text-[#0D0D0D] font-bold px-6 py-3 rounded-2xl text-sm hover:bg-[#B8E020] transition-all"
        >
          Try again
        </button>
      </div>
    );
  }

  // requesting | starting | active — show the video container
  return (
    <div className="relative mx-5">
      <div
        id="ding-qr-reader"
        className="overflow-hidden rounded-2xl bg-[#181818]"
        style={{ width: "100%", aspectRatio: "1/1" }}
      />

      {phase === "active" && (
        <div className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-56 h-56">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#C8F135] rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#C8F135] rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#C8F135] rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#C8F135] rounded-br-lg" />
              <div
                className="absolute left-0 right-0 h-0.5 animate-scan-line"
                style={{ background: "linear-gradient(90deg, transparent, #C8F135, transparent)" }}
              />
            </div>
          </div>
        </div>
      )}

      {(phase === "requesting" || phase === "starting") && (
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-[#181818] gap-3">
          <div className="w-8 h-8 border-2 border-[#C8F135] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#4A4A44] text-xs">
            {phase === "requesting" ? "Requesting camera..." : "Starting scanner..."}
          </p>
        </div>
      )}
    </div>
  );
}
