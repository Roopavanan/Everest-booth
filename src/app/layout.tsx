import type { Metadata, Viewport } from "next";
import { Geist, Playfair_Display } from "next/font/google";
import { brand } from "@/lib/brand";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: `${brand.name} Selfie Booth`, template: `%s · ${brand.name}` },
  description: `Snap a festive selfie with ${brand.name} frames and share it with your family.`,
};

export const viewport: Viewport = {
  themeColor: "#2a0a10",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${playfair.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
