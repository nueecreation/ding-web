"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  onScan: (value: string) => void;
}

export default function QRScanner({ onScan }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    let html5QrCode: any;

    async function startScanner() {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        const id = "ding-qr-reader";

        html5QrCode = new Html5Qrcode(id);
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decodedText: string) => {
            onScan(decodedText);
          },
          () => {}
        );
        setActive(true);
      } catch (err: any) {
        setError(
          err?.message?.includes("Permission")
            ? "Camera permission denied. Allow camera access to scan QR codes."
            : "Could not start camera. Try using a device with a camera."
        );
      }
    }

    startScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [onScan]);

  if (error) {
    return (
      <div className="mx-5 rounded-2xl bg-[#181818] border border-white/8 p-8 text-center">
        <div className="text-3xl mb-4">📷</div>
        <p className="text-[#F87171] text-sm font-medium mb-2">Camera error</p>
        <p className="text-[#4A4A44] text-xs">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative mx-5">
      <div
        id="ding-qr-reader"
        className="overflow-hidden rounded-2xl"
        style={{ width: "100%", aspectRatio: "1/1" }}
        ref={containerRef}
      />

      {active && (
        <div className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-black/20" />

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-60 h-60">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#C8F135] rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#C8F135] rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#C8F135] rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#C8F135] rounded-br-lg" />

              <div
                className="absolute left-0 right-0 h-0.5 animate-scan-line"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, #C8F135, transparent)",
                }}
              />
            </div>
          </div>
        </div>
      )}

      {!active && !error && (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-[#181818]">
          <div className="w-8 h-8 border-2 border-[#C8F135] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
