import { applyFilter, type FilterDef } from "./filters";
import { H, W, type Frame } from "./frames";
import type { View } from "./view";

const imageCache = new Map<string, Promise<HTMLImageElement>>();

function loadImage(src: string) {
  let p = imageCache.get(src);
  if (!p) {
    p = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Could not load frame"));
      img.src = src;
    });
    imageCache.set(src, p);
  }
  return p;
}

export function preloadFrames(frames: Frame[]) {
  frames.forEach((f) => loadImage(f.src).catch(() => {}));
}

// Renders the visible part of the camera (the same view as the preview) + filter + frame into a JPEG.
export async function capturePhoto(
  video: HTMLVideoElement,
  { mirror, frame, filter, view }: { mirror: boolean; frame: Frame; filter: FilterDef; view: View },
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas not supported");

  ctx.save();
  if (mirror) {
    ctx.translate(W, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(video, view.x, view.y, view.w, view.h, 0, 0, W, H);
  ctx.restore();

  applyFilter(ctx, W, H, filter);
  ctx.drawImage(await loadImage(frame.src), 0, 0, W, H);

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Capture failed"))), "image/jpeg", 0.92),
  );
}
