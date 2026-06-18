/// <reference lib="dom" />
import { useEffect, useLayoutEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { getOrbShaderColors, type OrbShaderColors } from "@/features/session/orbShader/orbShaderColors";
import { FRAGMENT_SRC, ORB_UNIFORM_NAMES, VERTEX_SRC } from "@/features/session/orbShader/orbShaderSource";
import type { BreathingGoal, BreathingPhaseName } from "@/types/breathing";

type ShaderOrbProps = Readonly<{
  goal: BreathingGoal;
  phaseName: BreathingPhaseName;
  durationSeconds: number;
  phaseElapsedSeconds: number;
  isPreparing: boolean;
  running: boolean;
  size?: number;
}>;

const SPEED = 1.3;
const AMP = 1.0;
const CHAOS = 0.85;
const GLOW = 1.0;
const DETAIL = 1.0;
const MAX_DPR = 2;
const MAX_BACKING_PX = 240;
// Длительность обратного отсчёта в мс — должна совпадать с PREP_SECONDS в BreathingSessionScreen.
const PREP_DURATION_MS = 3000;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

type PhaseParams = { scale: number; bright: number; ampMul: number };

function phaseToShaderParams(name: BreathingPhaseName, progress: number): PhaseParams {
  const e = easeInOut(progress);
  switch (name) {
    case "inhale":
    case "sigh":
      return { scale: lerp(0.92, 1.12, e), bright: lerp(0.64, 1.0, e), ampMul: lerp(0.55, 1.0, e) };
    case "hold":
      return { scale: 1.12, bright: 1.0, ampMul: 1.0 };
    case "exhale":
      return { scale: lerp(1.12, 0.92, e), bright: lerp(1.0, 0.64, e), ampMul: lerp(1.0, 0.55, e) };
    case "pause": {
      // Симметричное погружение: start=exhale-end, end=inhale-start — нулевой стык с обеих сторон.
      const s = Math.sin(progress * Math.PI);
      return { scale: lerp(0.92, 0.87, s), bright: lerp(0.64, 0.55, s), ampMul: lerp(0.55, 0.40, s) };
    }
    case "rest": {
      const s = Math.sin(progress * Math.PI);
      return { scale: lerp(0.92, 0.84, s), bright: lerp(0.64, 0.48, s), ampMul: lerp(0.55, 0.34, s) };
    }
  }
}

function compileShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl: WebGLRenderingContext): WebGLProgram | null {
  const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SRC);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SRC);
  if (!vs || !fs) return null;
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

export function ShaderOrb({ goal, phaseName, durationSeconds, phaseElapsedSeconds, isPreparing, running, size = 196 }: ShaderOrbProps) {
  const hostRef = useRef<View | null>(null);
  const runningRef = useRef(running);
  const isPreparingRef = useRef(isPreparing);
  const colorsRef = useRef<OrbShaderColors>(getOrbShaderColors(goal));
  const phaseNameRef = useRef(phaseName);
  const durationRef = useRef(durationSeconds);
  // prepStartRef: wall-clock момент начала обратного отсчёта (мс).
  const prepStartRef = useRef(performance.now());
  // Единый источник прогресса фазы: логический elapsed из снапшота React
  // + wall-clock между тиками. Убирает рассинхрон двух часов (rAF vs setInterval),
  // из-за которого вдох на стыке раунда (например coherent) дёргался на ~1 кадр.
  const phaseElapsedRef = useRef(phaseElapsedSeconds);
  const lastSyncRef = useRef(performance.now());

  useLayoutEffect(() => {
    if (isPreparing && !isPreparingRef.current) {
      // Новый обратный отсчёт начался.
      prepStartRef.current = performance.now();
    }
    if (!isPreparing && isPreparingRef.current) {
      // Отсчёт завершился: фаза вдоха стартует с нуля прямо сейчас.
      phaseElapsedRef.current = 0;
      lastSyncRef.current = performance.now();
    }
    isPreparingRef.current = isPreparing;
  }, [isPreparing]);

  useEffect(() => {
    runningRef.current = running;
  }, [running]);

  useEffect(() => {
    colorsRef.current = getOrbShaderColors(goal);
  }, [goal]);

  // Каждый тик снапшота пересинхронизируем фазовые часы из единого источника (React).
  // useLayoutEffect — до отрисовки и до следующего кадра rAF, чтобы не было окна
  // со «старой» фазой/elapsed (именно оно давало рывок вдоха на стыке раунда).
  useLayoutEffect(() => {
    phaseNameRef.current = phaseName;
    durationRef.current = durationSeconds;
    phaseElapsedRef.current = phaseElapsedSeconds;
    lastSyncRef.current = performance.now();
  }, [phaseName, durationSeconds, phaseElapsedSeconds]);

  useEffect(() => {
    const host = hostRef.current as unknown as HTMLElement | null;
    if (!host || typeof document === "undefined") return undefined;

    const canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    host.appendChild(canvas);

    const gl = canvas.getContext("webgl", { premultipliedAlpha: false, antialias: true });
    if (!gl) {
      host.removeChild(canvas);
      return undefined;
    }

    const program = createProgram(gl);
    if (!program) {
      host.removeChild(canvas);
      return undefined;
    }
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(program, "p");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const u: Record<string, WebGLUniformLocation | null> = {};
    for (const name of ORB_UNIFORM_NAMES) {
      u[name] = gl.getUniformLocation(program, name);
    }

    let raf = 0;
    const startedAt = performance.now();
    // live: плавное затухание при паузе сессии (0.55) и восстановление при возобновлении (1.0).
    // Во время prep — полная яркость (1.0).
    let live = (runningRef.current || isPreparingRef.current) ? 1 : 0.55;

    const frame = (now: number) => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const rawW = canvas.clientWidth * dpr;
      const rawH = canvas.clientHeight * dpr;
      const cap = Math.min(1, MAX_BACKING_PX / Math.max(rawW, rawH, 1));
      const w = Math.round(rawW * cap);
      const h = Math.round(rawH * cap);
      if (w > 0 && h > 0 && (canvas.width !== w || canvas.height !== h)) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }

      const elapsed = (now - startedAt) / 1000;
      const t = elapsed * SPEED;

      let scale: number;
      let phaseBright: number;
      let ampMul: number;

      if (isPreparingRef.current) {
        // Prep-deflation: орб сдувается как "exhale" за PREP_DURATION_MS.
        // exhale(0)=1.12 → exhale(1)=0.92, стыкуется с inhale(0)=0.92 без прыжка.
        const prepProgress = Math.min(1, (now - prepStartRef.current) / PREP_DURATION_MS);
        ({ scale, bright: phaseBright, ampMul } = phaseToShaderParams("exhale", prepProgress));
      } else {
        // Phase-driven: elapsed из снапшота + wall-clock между тиками (единые часы).
        // На стыке фаз elapsed=0 → прогресс=0, вдох всегда стартует с маленького без прыжка.
        const localElapsed = phaseElapsedRef.current + (now - lastSyncRef.current) / 1000;
        const phaseProgress = Math.min(1, Math.max(0, localElapsed / Math.max(0.001, durationRef.current)));
        ({ scale, bright: phaseBright, ampMul } = phaseToShaderParams(phaseNameRef.current, phaseProgress));
      }

      // live: полная яркость во время prep и активной сессии, 0.55 при паузе.
      const liveTarget = (runningRef.current || isPreparingRef.current) ? 1 : 0.55;
      live += (liveTarget - live) * 0.05;
      const bright = phaseBright * live;

      const c = colorsRef.current;
      gl.uniform2f(u.uRes, canvas.width, canvas.height);
      gl.uniform1f(u.uTime, t);
      gl.uniform1f(u.uScale, scale);
      gl.uniform1f(u.uBright, bright);
      gl.uniform1f(u.uChaos, CHAOS);
      gl.uniform1f(u.uAmp, AMP * ampMul);
      gl.uniform1f(u.uGlow, GLOW);
      gl.uniform1f(u.uDetail, DETAIL);
      gl.uniform3fv(u.uC1, new Float32Array(c.c1));
      gl.uniform3fv(u.uC2, new Float32Array(c.c2));
      gl.uniform3fv(u.uC3, new Float32Array(c.c3));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      if (canvas.parentNode === host) {
        host.removeChild(canvas);
      }
    };
  }, []);

  return <View ref={hostRef} style={[styles.host, { width: size, height: size }]} pointerEvents="none" />;
}

const styles = StyleSheet.create({
  host: {
    alignItems: "center",
    justifyContent: "center",
  },
});
