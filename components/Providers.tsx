"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: "#C8F135",
            color: "#0D0D0D",
            fontFamily: "var(--font-dm-sans)",
            fontWeight: 600,
            fontSize: "14px",
            borderRadius: "100px",
            padding: "12px 20px",
            boxShadow: "0 8px 32px rgba(200,241,53,0.25)",
          },
          duration: 3000,
        }}
      />
    </SessionProvider>
  );
}
