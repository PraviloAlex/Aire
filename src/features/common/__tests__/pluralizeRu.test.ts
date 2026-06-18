import { describe, expect, it } from "vitest";
import { pluralizeRu } from "@/features/common/pluralizeRu";

const CYCLES = ["цикл", "цикла", "циклов"] as const;

describe("pluralizeRu — циклы", () => {
  it("1 → цикл", () => {
    expect(pluralizeRu(1, CYCLES)).toBe("цикл");
  });

  it("2, 3, 4 → цикла", () => {
    expect(pluralizeRu(2, CYCLES)).toBe("цикла");
    expect(pluralizeRu(3, CYCLES)).toBe("цикла");
    expect(pluralizeRu(4, CYCLES)).toBe("цикла");
  });

  it("5–20 → циклов", () => {
    expect(pluralizeRu(5, CYCLES)).toBe("циклов");
    expect(pluralizeRu(11, CYCLES)).toBe("циклов");
    expect(pluralizeRu(14, CYCLES)).toBe("циклов");
    expect(pluralizeRu(15, CYCLES)).toBe("циклов");
    expect(pluralizeRu(20, CYCLES)).toBe("циклов");
  });

  it("составные: 21 → цикл, 22–24 → цикла, 25 → циклов", () => {
    expect(pluralizeRu(21, CYCLES)).toBe("цикл");
    expect(pluralizeRu(22, CYCLES)).toBe("цикла");
    expect(pluralizeRu(24, CYCLES)).toBe("цикла");
    expect(pluralizeRu(25, CYCLES)).toBe("циклов");
  });

  it("реальные rounds практик", () => {
    expect(pluralizeRu(15, CYCLES)).toBe("циклов"); // box-breathing
    expect(pluralizeRu(18, CYCLES)).toBe("циклов"); // recovery
    expect(pluralizeRu(24, CYCLES)).toBe("цикла"); // body-softening
    expect(pluralizeRu(25, CYCLES)).toBe("циклов"); // coherent
  });

  it("0 → циклов", () => {
    expect(pluralizeRu(0, CYCLES)).toBe("циклов");
  });
});
