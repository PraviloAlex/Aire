import { describe, expect, it } from "vitest";
import { formatRemaining } from "@/features/session/formatTime";

describe("formatRemaining", () => {
  it("formats more than a minute as m:ss", () => {
    expect(formatRemaining(108)).toBe("1:48");
  });

  it("pads seconds under ten", () => {
    expect(formatRemaining(65)).toBe("1:05");
  });

  it("formats less than a minute", () => {
    expect(formatRemaining(42)).toBe("0:42");
  });

  it("returns 0:00 when finished", () => {
    expect(formatRemaining(0)).toBe("0:00");
  });

  it("clamps negative values to 0:00", () => {
    expect(formatRemaining(-5)).toBe("0:00");
  });

  it("rounds up partial seconds", () => {
    expect(formatRemaining(41.2)).toBe("0:42");
  });
});
