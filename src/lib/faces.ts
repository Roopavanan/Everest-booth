import type { FaceDetector } from "@mediapipe/tasks-vision";

// Face bounding box in camera (video) pixels.
export type Box = { x: number; y: number; w: number; h: number };

let detector: Promise<FaceDetector> | null = null;

// Loads MediaPipe's full-range BlazeFace model once (finds faces up to ~5 m away); runs fully on-device.
// The WASM runtime is copied to /mediapipe on install (scripts/copy-mediapipe.mjs).
export function loadFaceDetector() {
  detector ??= (async () => {
    const { FaceDetector, FilesetResolver } = await import("@mediapipe/tasks-vision");
    const fileset = await FilesetResolver.forVisionTasks("/mediapipe");
    const create = (delegate: "GPU" | "CPU") =>
      FaceDetector.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: "/models/blaze_face_full_range.tflite", delegate },
        runningMode: "VIDEO",
        minDetectionConfidence: 0.5,
      });
    try {
      return await create("GPU");
    } catch {
      return create("CPU");
    }
  })();
  return detector;
}

// Faces sorted left-to-right so consecutive detections can be compared.
export function detectFaces(d: FaceDetector, video: HTMLVideoElement, now: number): Box[] {
  return d
    .detectForVideo(video, now)
    .detections.flatMap(({ boundingBox: b }) => (b ? [{ x: b.originX, y: b.originY, w: b.width, h: b.height }] : []))
    .sort((a, b) => a.x - b.x);
}
