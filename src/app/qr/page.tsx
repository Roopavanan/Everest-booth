"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { brand } from "@/lib/brand";
import { logoSrc } from "@/lib/frames";

export default function QrPage() {
  const [qr, setQr] = useState("");
  const [url, setUrl] = useState("");

  useEffect(() => {
    const target = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    QRCode.toDataURL(target, { width: 800, margin: 1, color: { dark: "#7a1020", light: "#ffffff" } }).then((data) => {
      setQr(data);
      setUrl(target);
    });
  }, []);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-stone-200 p-6 print:bg-white print:p-0">
      <div className="flex w-full max-w-md flex-col items-center rounded-3xl border-8 border-amber-400 bg-[#7a1020] px-8 py-10 text-center text-white shadow-2xl print:shadow-none">
        <img src={logoSrc} alt="" className="h-20 w-auto" />
        <h1 className="font-display mt-3 text-3xl font-bold tracking-[0.2em] text-amber-300">{brand.short}</h1>
        <p className="text-sm tracking-[0.5em] text-amber-100">{brand.sub}</p>
        <p className="font-display mt-6 text-3xl italic">Selfie Booth</p>
        <p className="mt-2 text-lg font-semibold tracking-widest text-amber-200">SCAN · SNAP · SHARE</p>
        <div className="mt-6 rounded-2xl bg-white p-4">
          {qr ? <img src={qr} alt={`QR code for ${url}`} className="h-64 w-64" /> : <div className="h-64 w-64" />}
        </div>
        <p className="mt-6 text-sm text-white/80">Scan with your phone camera, pick a festive frame and share your photo!</p>
        <p className="mt-3 text-xs text-amber-200">{brand.hashtag}</p>
      </div>
      <p className="mt-4 text-xs text-stone-600 print:hidden">{url}</p>
      <button type="button" onClick={() => window.print()} className="mt-3 rounded-full bg-black px-6 py-2 text-white print:hidden">
        Print standee
      </button>
    </main>
  );
}
