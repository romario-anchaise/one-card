import { describe, it, expect } from "vitest";
import { readThemePreference, resolveTheme, isThemePreference } from "./theme";
describe("UI theme preferences", () => {
  it("uses an explicit choice regardless of the system palette", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });
  it("follows both system palettes in automatic mode", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
  });
  it("restores supported preferences and safely rejects corrupt data", () => {
    expect(readThemePreference({ getItem: () => "light" })).toBe("light");
    expect(readThemePreference({ getItem: () => "system" })).toBe("system");
    expect(readThemePreference({ getItem: () => "broken" })).toBe("dark");
    expect(isThemePreference("automatic")).toBe(false);
  });
  it("remains usable when private-mode storage is blocked", () => {
    expect(
      readThemePreference({
        getItem: () => {
          throw new Error("SecurityError");
        },
      }),
    ).toBe("dark");
  });
});
