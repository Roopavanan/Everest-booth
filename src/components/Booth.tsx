"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { brand } from "@/lib/brand";
import { capturePhoto, preloadFrames } from "@/lib/capture";
import { cssFilter, filters } from "@/lib/filters";
import { frames, type FrameCategory } from "@/lib/frames";

type Facing = "user" | "environment";
type Photo = { blob: Blob; url: string };

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function Booth() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const busy = useRef(false);

  const [facing, setFacing] = useState<Facing>("user");
  const [cam, setCam] = useState<"starting" | "ready" | "error">("starting");
  const [camError, setCamError] = useState("");
  const [retry, setRetry] = useState(0);

  const [category, setCategory] = useState<FrameCategory>("family");
  const [frameId, setFrameId] = useState(frames[0].id);
  const [filterId, setFilterId] = useState(filters[0].id);
  const [timer, setTimer] = useState(true);

  const [count, setCount] = useState(0);
  const [flash, setFlash] = useState(false);
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [toast, setToast] = useState("");

  const frame = frames.find((f) => f.id === frameId) ?? frames[0];
  const filter = filters.find((f) => f.id === filterId) ?? filters[0];
  const mirror = facing === "user";

  useEffect(() => preloadFrames(frames), []);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;
    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Camera needs a secure (https) connection.");
        }
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing, width: { ideal: 1440 }, height: { ideal: 1920 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();
        setCam("ready");
      } catch (e) {
        if (cancelled) return;
        const name = e instanceof DOMException ? e.name : "";
        setCamError(
          name === "NotAllowedError"
            ? "Camera permission was blocked. Allow camera access in your browser settings and try again."
            : name === "NotFoundError"
              ? "No camera found on this device."
              : e instanceof Error
                ? e.message
                : "Could not start the camera.",
        );
        setCam("error");
      }
    })();
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [facing, retry]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  function restartCamera(next: Facing = facing) {
    setCam("starting");
    setCamError("");
    if (next !== facing) setFacing(next);
    else setRetry((r) => r + 1);
  }

  function pickCategory(c: FrameCategory) {
    setCategory(c);
    if (frame.category !== c) setFrameId(frames.find((f) => f.category === c)!.id);
  }

  async function shoot() {
    const video = videoRef.current;
    if (busy.current || cam !== "ready" || !video) return;
    busy.current = true;
    try {
      if (timer) {
        for (let n = 3; n > 0; n--) {
          setCount(n);
          await wait(1000);
        }
        setCount(0);
      }
      setFlash(true);
      const blob = await capturePhoto(video, { mirror, frame, filter });
      setPhoto({ blob, url: URL.createObjectURL(blob) });
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Capture failed");
    } finally {
      busy.current = false;
      setTimeout(() => setFlash(false), 450);
    }
  }

  function discard() {
    if (photo) URL.revokeObjectURL(photo.url);
    setPhoto(null);
  }

  const fileName = () => `${brand.short.toLowerCase()}-booth-${Date.now()}.jpg`;

  function save() {
    if (!photo) return;
    const a = document.createElement("a");
    a.href = photo.url;
    a.download = fileName();
    document.body.appendChild(a);
    a.click();
    a.remove();
    setToast("Saved! On iPhone, long-press the photo to add it to Photos.");
  }

  async function share() {
    if (!photo) return;
    const file = new File([photo.blob], fileName(), { type: "image/jpeg" });
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: brand.name, text: `${brand.tagline} ${brand.hashtag}` });
      } catch (e) {
        if (!(e instanceof DOMException && e.name === "AbortError")) setToast("Sharing failed. Try Save instead.");
      }
    } else {
      save();
    }
  }

  const visibleFrames = frames.filter((f) => f.category === category);

  return (
    <main className="flex min-h-dvh flex-col bg-[#2a0a10] text-white">
      <header className="flex h-14 shrink-0 items-center justify-between px-4">
        <Link href="/" className="text-sm text-amber-200/80" aria-label="Back to home">
          ← Home
        </Link>
        <span className="font-display text-lg font-bold tracking-widest text-amber-300">{brand.short}</span>
        <button
          type="button"
          onClick={() => restartCamera(facing === "user" ? "environment" : "user")}
          disabled={!!photo}
          className="rounded-full bg-white/10 px-3 py-1.5 text-sm disabled:opacity-30"
          aria-label="Switch camera"
        >
          ⟲ Flip
        </button>
      </header>

      <div className="flex flex-1 items-center justify-center px-3">
        <div
          className="relative aspect-3/4 overflow-hidden rounded-2xl bg-black shadow-2xl shadow-black/60 ring-2 ring-amber-400/40"
          style={{ width: "min(100%, calc((100dvh - 300px) * 0.75))" }}
        >
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className="absolute inset-0 h-full w-full object-cover"
            style={{ transform: mirror ? "scaleX(-1)" : undefined, filter: cssFilter(filter) }}
          />
          <img src={frame.src} alt="" className="pointer-events-none absolute inset-0 h-full w-full" />

          {cam === "starting" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-sm">Starting camera…</div>
          )}
          {cam === "error" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/80 p-6 text-center text-sm">
              <p>{camError}</p>
              <button type="button" onClick={() => restartCamera()} className="rounded-full bg-amber-400 px-5 py-2 font-semibold text-black">
                Try again
              </button>
            </div>
          )}
          {count > 0 && (
            <div key={count} className="countdown absolute inset-0 flex items-center justify-center text-[9rem] font-black text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.7)]">
              {count}
            </div>
          )}
          {photo && <img src={photo.url} alt="Your booth photo" className="absolute inset-0 h-full w-full" />}
          {flash && <div className="flash pointer-events-none absolute inset-0 bg-white" />}
        </div>
      </div>

      <div className="shrink-0 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {photo ? (
          <div className="mx-auto flex max-w-md flex-col gap-3">
            <div className="grid grid-cols-3 gap-3">
              <button type="button" onClick={discard} className="rounded-xl border border-white/30 py-3 font-semibold">
                ✕ Discard
              </button>
              <button type="button" onClick={share} className="rounded-xl bg-amber-400 py-3 font-bold text-black">
                ↗ Share
              </button>
              <button type="button" onClick={save} className="rounded-xl border border-white/30 py-3 font-semibold">
                ↓ Save
              </button>
            </div>
            <p className="text-center text-xs text-white/50">Tag us {brand.hashtag}</p>
          </div>
        ) : (
          <div className="mx-auto flex max-w-md flex-col gap-3">
            <div className="flex justify-center gap-2">
              {(["family", "kids"] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => pickCategory(c)}
                  className={`rounded-full px-4 py-1 text-sm font-semibold ${category === c ? "bg-amber-400 text-black" : "bg-white/10"}`}
                >
                  {c === "family" ? "Family Frames" : "Kids Frames"}
                </button>
              ))}
            </div>

            <div className="no-scrollbar flex gap-2 overflow-x-auto">
              {visibleFrames.map((f) => (
                <button key={f.id} type="button" onClick={() => setFrameId(f.id)} className="flex shrink-0 flex-col items-center gap-1">
                  <span
                    className={`block aspect-3/4 w-14 overflow-hidden rounded-lg bg-linear-to-b from-stone-400 to-stone-600 ring-2 ${f.id === frame.id ? "ring-amber-400" : "ring-transparent"}`}
                  >
                    <img src={f.src} alt="" className="h-full w-full" />
                  </span>
                  <span className={`text-[10px] ${f.id === frame.id ? "text-amber-300" : "text-white/60"}`}>{f.name}</span>
                </button>
              ))}
            </div>

            <div className="no-scrollbar flex gap-2 overflow-x-auto">
              {filters.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilterId(f.id)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs ${f.id === filter.id ? "bg-white text-black" : "bg-white/10"}`}
                >
                  <span className="h-3 w-3 rounded-full" style={{ background: f.swatch }} />
                  {f.name}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between px-6">
              <button
                type="button"
                onClick={() => setTimer((t) => !t)}
                className="w-16 rounded-full bg-white/10 py-1.5 text-xs"
                aria-label="Toggle 3 second timer"
              >
                ⏱ {timer ? "3s" : "Off"}
              </button>
              <button
                type="button"
                onClick={shoot}
                disabled={cam !== "ready" || count > 0}
                className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white disabled:opacity-40"
                aria-label="Take photo"
              >
                <span className="h-15 w-15 rounded-full bg-amber-400 transition active:scale-90" />
              </button>
              <span className="w-16" />
            </div>
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed inset-x-4 bottom-28 z-10 mx-auto max-w-sm rounded-xl bg-black/85 px-4 py-3 text-center text-sm">{toast}</div>
      )}
    </main>
  );
}
