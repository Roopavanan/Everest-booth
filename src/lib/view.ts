import type { Box } from "./faces";
import { H, W, type FaceSpot } from "./frames";

// The part of the camera image (in video pixels) that fills the 3:4 frame. Preview and capture both use it.
export type View = { x: number; y: number; w: number; h: number };

// Directions are as seen on screen.
export type FitStatus = "ok" | "closer" | "back" | "up" | "down" | "left" | "right";

const MAX_ZOOM = 2.5;
// Detected box covers forehead-to-chin; it should fill this share of the cut-out's height (hair goes above).
const FACE_FILL = 0.62;

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

// Same crop as CSS object-fit: cover.
export function coverView(vw: number, vh: number): View {
  const k = Math.max(W / vw, H / vh);
  const w = W / k;
  const h = H / k;
  return { x: (vw - w) / 2, y: (vh - h) / 2, w, h };
}

// Zooms and pans so the face sits in the frame's face cut-out; reports what the person should do if it can't.
export function fitFace(face: Box, spot: FaceSpot, vw: number, vh: number, mirror: boolean): { view: View; status: FitStatus } {
  const base = Math.max(W / vw, H / vh);
  const wantH = spot.ry * 2 * FACE_FILL;
  const k = clamp(wantH / face.h, base, base * MAX_ZOOM);
  const w = W / k;
  const h = H / k;
  // The preview is mirrored for the front camera, so the target is mirrored back into video coordinates.
  const tx = mirror ? W - spot.cx : spot.cx;
  const ty = spot.cy + spot.ry * 0.1;
  const fx = face.x + face.w / 2;
  const fy = face.y + face.h / 2;
  const x = clamp(fx - tx / k, 0, vw - w);
  const y = clamp(fy - ty / k, 0, vh - h);

  const size = (face.h * k) / wantH;
  // How far the face still is from the cut-out once the crop hits the camera's edge, in cut-out radii.
  const dx = (((fx - x) * k - tx) / spot.rx) * (mirror ? -1 : 1);
  const dy = ((fy - y) * k - ty) / spot.ry;
  let status: FitStatus = "ok";
  if (size < 0.75) status = "closer";
  else if (size > 1 / FACE_FILL) status = "back";
  else if (Math.hypot(dx, dy) > 0.4) status = Math.abs(dy) >= Math.abs(dx) ? (dy < 0 ? "down" : "up") : dx < 0 ? "right" : "left";
  return { view: { x, y, w, h }, status };
}

export const lerpView = (a: View, b: View, t: number): View => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
  w: a.w + (b.w - a.w) * t,
  h: a.h + (b.h - a.h) * t,
});
