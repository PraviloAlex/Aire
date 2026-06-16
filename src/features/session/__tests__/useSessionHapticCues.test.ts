import { describe, expect, it } from "vitest";
import { hapticStyleForPhase } from "@/features/session/hapticStyles";

describe("hapticStyleForPhase", () => {
  it("returns medium for inhale", () => {
    expect(hapticStyleForPhase("inhale")).toBe("medium");
  });

  it("returns medium for sigh", () => {
    expect(hapticStyleForPhase("sigh")).toBe("medium");
  });

  it("returns light for hold", () => {
    expect(hapticStyleForPhase("hold")).toBe("light");
  });

  it("returns light for exhale", () => {
    expect(hapticStyleForPhase("exhale")).toBe("light");
  });

  it("returns null for pause", () => {
    expect(hapticStyleForPhase("pause")).toBeNull();
  });

  it("returns null for rest", () => {
    expect(hapticStyleForPhase("rest")).toBeNull();
  });
});
