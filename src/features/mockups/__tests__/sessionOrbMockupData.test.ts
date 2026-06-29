import { describe, expect, it } from "vitest";
import { sessionOrbMockupVariants } from "@/features/mockups/sessionOrbMockupData";

describe("sessionOrbMockupVariants", () => {
  it("contains three visual directions", () => {
    expect(sessionOrbMockupVariants).toHaveLength(3);
  });

  it("defines the required content and colors for every variant", () => {
    for (const variant of sessionOrbMockupVariants) {
      expect(variant.id).toBeTruthy();
      expect(variant.direction).toMatch(/asset|minimal|outside-text/);
      expect(variant.label).toBeTruthy();
      expect(variant.title).toBeTruthy();
      expect(variant.principle).toBeTruthy();
      expect(variant.phase).toBeTruthy();
      expect(variant.countdown).toBeTruthy();
      expect(variant.phrase).toBeTruthy();
      expect(variant.notes).not.toHaveLength(0);
      expect(variant.colors.core).toMatch(/^#[0-9A-F]{6}$/i);
      expect(variant.colors.glow).toMatch(/^#[0-9A-F]{6}$/i);
      expect(variant.colors.accent).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });

  it("keeps state phrases short enough for the mockup card", () => {
    for (const variant of sessionOrbMockupVariants) {
      expect(variant.phrase.length).toBeLessThanOrEqual(48);
    }
  });

  it("covers the three decision directions", () => {
    expect(sessionOrbMockupVariants.map((variant) => variant.direction)).toEqual([
      "asset",
      "minimal",
      "outside-text",
    ]);
  });
});
