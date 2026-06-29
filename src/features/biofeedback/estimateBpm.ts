import type { PulseQuality, PulseReading } from "./ppgTypes";

const MIN_BPM = 42;
const MAX_BPM = 180;
const MIN_DURATION_SECONDS = 8;
const GOOD_AMPLITUDE = 5.0;
const MIN_AMPLITUDE = 1.0;

function detrend(signal: readonly number[]): number[] {
  let sum = 0;
  for (const v of signal) sum += v;
  const mean = sum / signal.length;
  return signal.map((v) => v - mean);
}

function computeAmplitude(detrended: readonly number[]): number {
  let min = Infinity;
  let max = -Infinity;
  for (const v of detrended) {
    if (v < min) min = v;
    if (v > max) max = v;
  }
  return max - min;
}

function normalizedCorr(x: readonly number[], lag: number, r0: number): number {
  let sum = 0;
  const n = x.length - lag;
  for (let i = 0; i < n; i++) sum += x[i] * x[i + lag];
  return r0 > 0 ? sum / n / r0 : 0;
}

export function estimateBpm(signal: readonly number[], fps: number): PulseReading {
  if (signal.length < fps * MIN_DURATION_SECONDS) {
    return { bpm: null, quality: "none" };
  }

  const detrended = detrend(signal);
  const amplitude = computeAmplitude(detrended);

  if (amplitude < MIN_AMPLITUDE) {
    return { bpm: null, quality: "none" };
  }

  const minLag = Math.max(1, Math.round((fps * 60) / MAX_BPM));
  const maxLag = Math.min(Math.floor(signal.length / 2), Math.round((fps * 60) / MIN_BPM));

  let r0 = 0;
  for (const v of detrended) r0 += v * v;
  r0 /= detrended.length;

  let bestLag = -1;
  let bestCorr = -Infinity;

  for (let lag = minLag; lag <= maxLag; lag++) {
    const c = normalizedCorr(detrended, lag, r0);
    if (c > bestCorr) {
      bestCorr = c;
      bestLag = lag;
    }
  }

  if (bestLag < 0 || bestCorr <= 0) {
    const q: PulseQuality = amplitude >= GOOD_AMPLITUDE ? "weak" : "none";
    return { bpm: null, quality: q };
  }

  // Filter out harmonics of sub-range frequencies (e.g. 5 Hz detected as 150 BPM via lag=12)
  const halfLag = Math.round(bestLag / 2);
  if (halfLag >= 1 && halfLag < minLag) {
    const halfCorr = normalizedCorr(detrended, halfLag, r0);
    if (halfCorr > bestCorr * 0.8) {
      return { bpm: null, quality: "none" };
    }
  }

  const bpm = Math.round((fps * 60) / bestLag);
  const quality: PulseQuality = amplitude >= GOOD_AMPLITUDE ? "good" : "weak";
  return { bpm, quality };
}
