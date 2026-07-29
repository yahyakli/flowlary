import { describe, it, expect } from "vitest";
import { resolveThemePreference } from "./theme";

describe("theme preference resolution", () => {
  it("returns dark for a dark cookie value", () => {
    expect(resolveThemePreference("dark")).toBe("dark");
  });

  it("falls back to light for unsupported values", () => {
    expect(resolveThemePreference("neon" as any)).toBe("light");
  });
});
