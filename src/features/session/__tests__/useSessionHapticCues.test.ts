import { describe, expect, it } from "vitest";
import { hapticStyleForPhase } from "@/features/session/hapticStyles";

describe("hapticStyleForPhase — без goal", () => {
  it("возвращает light для inhale", () => {
    expect(hapticStyleForPhase("inhale")).toBe("light");
  });

  it("возвращает light для sigh", () => {
    expect(hapticStyleForPhase("sigh")).toBe("light");
  });

  it("возвращает light для hold", () => {
    expect(hapticStyleForPhase("hold")).toBe("light");
  });

  it("возвращает light для exhale", () => {
    expect(hapticStyleForPhase("exhale")).toBe("light");
  });

  it("возвращает null для pause", () => {
    expect(hapticStyleForPhase("pause")).toBeNull();
  });

  it("возвращает null для rest", () => {
    expect(hapticStyleForPhase("rest")).toBeNull();
  });
});

describe("hapticStyleForPhase — goal=sleep подавляет вибрацию", () => {
  it("возвращает null для inhale при sleep", () => {
    expect(hapticStyleForPhase("inhale", "sleep")).toBeNull();
  });

  it("возвращает null для hold при sleep", () => {
    expect(hapticStyleForPhase("hold", "sleep")).toBeNull();
  });

  it("возвращает null для exhale при sleep", () => {
    expect(hapticStyleForPhase("exhale", "sleep")).toBeNull();
  });
});

describe("hapticStyleForPhase — другие goal не затронуты", () => {
  it("возвращает light для inhale при calm", () => {
    expect(hapticStyleForPhase("inhale", "calm")).toBe("light");
  });

  it("возвращает light для inhale при focus", () => {
    expect(hapticStyleForPhase("inhale", "focus")).toBe("light");
  });
});
