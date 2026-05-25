"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  onScan: (value: string) => void;
}

type ScannerState = "loading" | "active" | "denied" | "unsupported" | "error";

function classifyError(err: any): ScannerState {
  const name = err?.name ?? "";
  const message = (err?.message ?? "").toLowerCase();

  if (
    name === "NotAllowedError" ||
    name === "PermissionDeniedError" ||
    message.includes("permission") ||
    message.includes("denied") ||
    message.includes("not allowed")
  ) {
    return "denied";
  }

  if (
    name === "NotSupportedError" ||
    name === "SecurityError" ||
    message.includes("secure") ||
    message.includes("https") ||
    message.includes("not supported")
  ) {
    return "unsupported";
  }

  if (
    name === "NotFoundError" ||
    name === "DevicesNotFoundError" ||
    message.includes("not found") ||
    message.includes("no camera") ||
    message.includes("overconstrained") ||
    name === "OverconstrainedError"
  ) {
    return "error";
  }

  return "error";
}

export default function QRScanner({ onScan }: Props) {
  const scannerRef = useRef<any>(null);
  const startedRef = useRef(false);
  const [state, setState] = useState<ScannerState>("loading");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (startedRef.current) return;

    if (
      typeof window === "undefined" ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setState("unsupported");
      return;
    }

    startedRef.current = true;
    let html5QrCode: any;

    async function startScanner() {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");

        const el = document.getElementById("ding-qr-reader");
        if (!el) return;

        html5QrCode = new Html5Qrcode("ding-qr-reader");
        scannerRef.current = html5QrCode;

        const config = { fps: 10, qrbox: { width: 220, height: 220 } };

        try {
          await html5QrCode.start(
            { facingMode: "environment" },
            config,
            (text: string) => onScan(text),
            () => {}
          );
        } catch {
          await html5QrCode.start(
            { facingMode: "user" },
            config,
            (text: string) => onScan(text),
            () => {}
          );
        }

        setState("active");
      } catch (err: any) {
        console.error("[QRScanner]", err?.name, err?.message);
        setState(classifyError(err));
      }
    }

    startScanner();

    return () => {
      startedRef.current = false;
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [onScan, retryKey]);

  function retry() {
    setState("loading");
    setRetryKey((k) => k + 1);
    startedRef.current = false;
  }

  if (state === "denied") {
    return (
      <div className="mx-5 rounded-2xl bg-[#181818] border border-white/8 p-8 text-center">
        <div className="text-4xl mb-4">🔒</div>
        <p className="text-[#F2F0E8] font-semibold mb-2">Camera access blocked</p>
        <p className="text-[#888070] text-sm leading-relaxed mb-6">
          Ding! needs camera access to scan QR codes. Open your browser settings
          and allow camera access for this site, then try again.
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

  if (state === "unsupported") {
    return (
      <div className="mx-5 rounded-2xl bg-[#181818] border border-white/8 p-8 text-center">
        <div className="text-4xl mb-4">📷</div>
        <p className="text-[#F2F0E8] font-semibold mb-2">Camera not available</p>
        <p className="text-[#888070] text-sm leading-relaxed">
          Camera scanning requires a secure connection (HTTPS) and a supported
          browser. Try opening Ding! in Safari or Chrome on your phone.
        </p>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="mx-5 rounded-2xl bg-[#181818] border border-white/8 p-8 text-center">
        <div className="text-4xl mb-4">📷</div>
        <p className="text-[#F2F0E8] font-semibold mb-2">Could not start camera</p>
        <p className="text-[#888070] text-sm leading-relaxed mb-6">
          Make sure your device has a camera and that no other app is using it,
          then try again.
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

  return (
    <div className="relative mx-5">
      <div
        id="ding-qr-reader"
        className="overflow-hidden rounded-2xl bg-[#181818]"
        style={{ width: "100%", aspectRatio: "1/1" }}
      />

      {state === "active" && (
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

      {state === "loading" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-[#181818] gap-3">
          <div className="w-8 h-8 border-2 border-[#C8F135] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#4A4A44] text-xs">Starting camera...</p>
        </div>
      )}
    </div>
  );
}
