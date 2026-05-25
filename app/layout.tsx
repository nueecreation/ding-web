import type { Metadata, Viewport } from "next";
import { Space_Grotesk, DM_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { ServiceWorkerRegister } from "@/components/app/ServiceWorkerRegister";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["300", "400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Ding! - Instant Payments for Nigeria",
  description: "Scan to pay. 3 steps, not 9. Works with any Nigerian bank.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Ding!",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "Ding! - Instant Payments for Nigeria",
    description: "Scan to pay. 3 steps, not 9. Works with any Nigerian bank.",
    siteName: "Ding!",
  },
};

export const viewport: Viewport = {
  themeColor: "#0D0D0D",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${dmSans.variable}`}>
      <body className="bg-bg text-text-primary font-body antialiased">
        <Providers>{children}</Providers>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
