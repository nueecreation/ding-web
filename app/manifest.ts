import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ding! - Instant Payments",
    short_name: "Ding!",
    description: "Scan to pay. 3 steps, not 9.",
    start_url: "/app/home",
    display: "standalone",
    background_color: "#0D0D0D",
    theme_color: "#0D0D0D",
    orientation: "portrait",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    categories: ["finance"],
    screenshots: [
      {
        src: "/screenshot-home.png",
        sizes: "390x844",
        type: "image/png",
      },
    ],
  };
}
