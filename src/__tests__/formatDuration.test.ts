import { describe, expect, it } from "vitest";
import { formatDuration, formatMinutes } from "@/utils/formatDuration";

describe("formatDuration", () => {
  it("formats minutes and padded seconds", () => {
    expect(formatDuration(65)).toBe("1:05");
  });

  it("clamps negative input to zero", () => {
    expect(formatDuration(-4)).toBe("0:00");
  });

  it("rounds down fractional seconds", () => {
    expect(formatDuration(12.9)).toBe("0:12");
  });
});

describe("formatMinutes", () => {
  it("returns at least one minute", () => {
    expect(formatMinutes(20)).toBe("1 мин");
  });
});
