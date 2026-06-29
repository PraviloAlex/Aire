/// <reference lib="dom" />
import { useEffect, useRef } from "react";

type Props = Readonly<{
  onFrame: (redAvg: number, fps: number) => void;
  onError: (msg: string) => void;
}>;

const SAMPLE_FPS = 30;
const FRAME_MS = Math.round(1000 / SAMPLE_FPS);
const CANVAS_SIZE = 64;
const SAMPLE_REGION = 16; // центральные 16×16 пикселей

export function PulseCamera({ onFrame, onError }: Props) {
  const onFrameRef = useRef(onFrame);
  const onErrorRef = useRef(onError);
  onFrameRef.current = onFrame;
  onErrorRef.current = onError;

  useEffect(() => {
    let stream: MediaStream | null = null;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    // Скрытый video элемент вне React-дерева
    const video = document.createElement("video");
    video.playsInline = true;
    video.muted = true;
    video.setAttribute("playsinline", "true");
    video.style.cssText =
      "position:fixed;left:-9999px;width:1px;height:1px;pointer-events:none;opacity:0.01";
    document.body.appendChild(video);

    const canvas = document.createElement("canvas");
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    const ctx = canvas.getContext("2d");

    const setup = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: CANVAS_SIZE },
            height: { ideal: CANVAS_SIZE },
          },
        });
        video.srcObject = stream;
        await video.play();

        if (!ctx) {
          onErrorRef.current("Контекст canvas недоступен");
          return;
        }

        const ox = (CANVAS_SIZE - SAMPLE_REGION) / 2;
        const oy = (CANVAS_SIZE - SAMPLE_REGION) / 2;
        const pixelCount = SAMPLE_REGION * SAMPLE_REGION;

        intervalId = setInterval(() => {
          if (!video.videoWidth) return;
          ctx.drawImage(video, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
          const { data } = ctx.getImageData(ox, oy, SAMPLE_REGION, SAMPLE_REGION);
          let redSum = 0;
          for (let i = 0; i < data.length; i += 4) redSum += data[i];
          onFrameRef.current(redSum / pixelCount, SAMPLE_FPS);
        }, FRAME_MS);
      } catch (err) {
        onErrorRef.current(
          err instanceof Error ? err.message : "Камера недоступна"
        );
      }
    };

    void setup();

    return () => {
      if (intervalId !== null) clearInterval(intervalId);
      if (stream) stream.getTracks().forEach((t) => t.stop());
      if (video.parentNode) video.parentNode.removeChild(video);
    };
  }, []);

  return null;
}
