import Link from "next/link";
import { brand } from "@/lib/brand";
import { logoSrc, frames } from "@/lib/frames";

const steps = [
  { icon: "📷", title: "Snap", text: "Pick a festive frame & filter" },
  { icon: "👧", title: "Kids", text: "Cute traditional outfit frames" },
  { icon: "💌", title: "Share", text: "Save or send on WhatsApp" },
];

export default function Home() {
  const preview = [frames.find((f) => f.id === "princess")!, frames.find((f) => f.id === "festive")!];
  return (
    <main className="flex min-h-dvh flex-col items-center bg-[radial-gradient(ellipse_at_top,#9b1b2c,#2a0a10_70%)] px-6 pt-10 pb-8 text-center text-white">
      <img src={logoSrc} alt={`${brand.name} logo`} className="h-24 w-auto" />
      <h1 className="font-display mt-4 text-4xl font-bold tracking-[0.2em] text-amber-300">{brand.short}</h1>
      <p className="tracking-[0.5em] text-amber-100/80">{brand.sub}</p>
      <p className="font-display mt-6 text-2xl italic">Selfie Booth</p>
      <p className="mt-1 text-sm text-white/70">{brand.tagline} — take a photo in our festive frames!</p>

      <div className="mt-8 flex items-end justify-center gap-4">
        {preview.map((f, i) => (
          <div
            key={f.id}
            className={`aspect-3/4 w-32 overflow-hidden rounded-xl bg-linear-to-b from-stone-300 to-stone-500 shadow-xl ring-2 ring-amber-400/60 ${i ? "rotate-3" : "-rotate-3"}`}
          >
            <img src={f.src} alt={f.name} className="h-full w-full" />
          </div>
        ))}
      </div>

      <Link
        href="/booth"
        className="mt-10 w-full max-w-xs rounded-full bg-amber-400 py-4 text-lg font-bold text-black shadow-lg shadow-amber-500/30 active:scale-95"
      >
        Start Photo Booth
      </Link>

      <ul className="mt-10 grid w-full max-w-md grid-cols-3 gap-3 text-xs">
        {steps.map((s) => (
          <li key={s.title} className="rounded-xl bg-white/5 p-3">
            <div className="text-2xl">{s.icon}</div>
            <div className="mt-1 font-semibold text-amber-200">{s.title}</div>
            <div className="mt-0.5 text-white/60">{s.text}</div>
          </li>
        ))}
      </ul>

      <Link href="/qr" className="mt-auto pt-10 text-xs text-white/40 underline">
        Print QR standee
      </Link>
    </main>
  );
}
