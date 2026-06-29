import { describe, expect, it } from "vitest";
import { estimateBpm } from "@/features/biofeedback/estimateBpm";

const FPS = 30;
const DURATION_SECS = 25;
const N = FPS * DURATION_SECS;

function sineSignal(freqHz: number, amplitude = 10, baseline = 128): number[] {
  return Array.from({ length: N }, (_, i) =>
    baseline + amplitude * Math.sin(2 * Math.PI * freqHz * (i / FPS))
  );
}

describe("estimateBpm", () => {
  it("синус 1 Гц (60 BPM) → bpm ≈ 60, quality good", () => {
    const result = estimateBpm(sineSignal(1.0), FPS);
    expect(result.bpm).not.toBeNull();
    expect(Math.abs((result.bpm as number) - 60)).toBeLessThanOrEqual(3);
    expect(result.quality).toBe("good");
  });

  it("синус 1.5 Гц (90 BPM) → bpm ≈ 90, quality good", () => {
    const result = estimateBpm(sineSignal(1.5), FPS);
    expect(result.bpm).not.toBeNull();
    expect(Math.abs((result.bpm as number) - 90)).toBeLessThanOrEqual(3);
    expect(result.quality).toBe("good");
  });

  it("плоский сигнал (константа) → bpm null, quality none", () => {
    const result = estimateBpm(Array.from({ length: N }, () => 128), FPS);
    expect(result.bpm).toBeNull();
    expect(result.quality).toBe("none");
  });

  it("слабый сигнал (амплитуда 0.3, peak-to-peak 0.6) → quality none", () => {
    const result = estimateBpm(sineSignal(1.0, 0.3), FPS);
    expect(result.bpm).toBeNull();
    expect(result.quality).toBe("none");
  });

  it("средняя амплитуда (1.5, peak-to-peak 3.0) → quality weak", () => {
    const result = estimateBpm(sineSignal(1.0, 1.5), FPS);
    expect(result.quality).toBe("weak");
  });

  it("5 Гц (300 BPM) — вне физиологического диапазона → bpm null", () => {
    const result = estimateBpm(sineSignal(5.0), FPS);
    expect(result.bpm).toBeNull();
  });

  it("слишком короткий сигнал (4 сек) → bpm null, quality none", () => {
    const shortSignal = sineSignal(1.0).slice(0, FPS * 4);
    const result = estimateBpm(shortSignal, FPS);
    expect(result.bpm).toBeNull();
    expect(result.quality).toBe("none");
  });
});
