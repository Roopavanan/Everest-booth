import { applyFilter, type FilterDef } from "./filters";
import { H, W, type Frame } from "./frames";

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

// Renders camera (cover-cropped exactly like CSS object-fit: cover) + filter + frame into a JPEG.
export async function capturePhoto(
  video: HTMLVideoElement,
  { mirror, frame, filter }: { mirror: boolean; frame: Frame; filter: FilterDef },
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas not supported");

  const vw = video.videoWidth;
  const vh = video.videoHeight;
  const scale = Math.max(W / vw, H / vh);
  const dw = vw * scale;
  const dh = vh * scale;
  ctx.save();
  if (mirror) {
    ctx.translate(W, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(video, (W - dw) / 2, (H - dh) / 2, dw, dh);
  ctx.restore();

  applyFilter(ctx, W, H, filter);
  ctx.drawImage(await loadImage(frame.src), 0, 0, W, H);

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Capture failed"))), "image/jpeg", 0.92),
  );
}
