import { describe, expect, it } from "vitest";
import { HOME_STATE_ORDER, homePanicContent, homeStateContent } from "@/features/home/homeStateContent";

describe("homeStateContent", () => {
  it("lists first-screen states — no fear", () => {
    expect(HOME_STATE_ORDER).toEqual([
      "calm",
      "focus",
      "recover",
      "sleep",
      "pain",
      "irritation",
    ]);
  });

  it("provides complete content for every home state", () => {
    for (const state of HOME_STATE_ORDER) {
      expect(homeStateContent[state].title.length).toBeGreaterThan(0);
      expect(homeStateContent[state].subtitle.length).toBeGreaterThan(0);
      expect(homeStateContent[state].icon.length).toBeGreaterThan(0);
    }
  });

  it("provides panic content routed to physiological-sigh", () => {
    expect(homePanicContent.title).toContain("Паника");
    expect(homePanicContent.subtitle.length).toBeGreaterThan(0);
    expect(homePanicContent.icon.length).toBeGreaterThan(0);
    expect(homePanicContent.practiceId).toBe("physiological-sigh");
  });
});
