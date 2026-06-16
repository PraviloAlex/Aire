import { describe, expect, it } from "vitest";
import { getArticleById, getCardForGoal, learnArticles } from "@/data/learnArticles";
import type { BreathingGoal } from "@/types/breathing";

describe("getArticleById", () => {
  it("returns article when id exists", () => {
    const article = getArticleById("breath-basics");
    expect(article).toBeDefined();
    expect(article?.id).toBe("breath-basics");
  });

  it("returns undefined for unknown id", () => {
    expect(getArticleById("nonexistent-xyz")).toBeUndefined();
  });

  it("returns correct article for each id in the dataset", () => {
    learnArticles.forEach((a) => {
      expect(getArticleById(a.id)?.id).toBe(a.id);
    });
  });
});

describe("getCardForGoal", () => {
  const goals: BreathingGoal[] = ["calm", "focus", "fear", "recover", "sleep", "pain", "irritation"];

  it("returns a defined article for every goal", () => {
    goals.forEach((goal) => {
      expect(getCardForGoal(goal)).toBeDefined();
    });
  });

  it("returned article goals include the requested goal", () => {
    goals.forEach((goal) => {
      const card = getCardForGoal(goal);
      if (card) {
        expect(card.goals).toContain(goal);
      }
    });
  });

  it("returned article has required fields", () => {
    const card = getCardForGoal("calm");
    expect(card).toHaveProperty("id");
    expect(card).toHaveProperty("title");
    expect(card).toHaveProperty("body");
    expect(card).toHaveProperty("goals");
    expect(card).toHaveProperty("readSeconds");
    expect(card).toHaveProperty("readingTime");
  });
});

describe("learnArticles data integrity", () => {
  it("all articles have readSeconds > 0", () => {
    learnArticles.forEach((a) => {
      expect(a.readSeconds).toBeGreaterThan(0);
    });
  });

  it("all articles have at least one goal", () => {
    learnArticles.forEach((a) => {
      expect(a.goals.length).toBeGreaterThan(0);
    });
  });

  it("all article ids are unique", () => {
    const ids = learnArticles.map((a) => a.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(learnArticles.length);
  });

  it("has 6 articles total", () => {
    expect(learnArticles.length).toBe(6);
  });
});
