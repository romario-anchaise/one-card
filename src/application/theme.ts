export type ThemePreference = "dark" | "light" | "system";
export type ResolvedTheme = "dark" | "light";
export const THEME_STORAGE_KEY = "one-card.ui.theme";
export function isThemePreference(value: unknown): value is ThemePreference {
  return value === "dark" || value === "light" || value === "system";
}
export function resolveTheme(
  preference: ThemePreference,
  systemIsDark: boolean,
): ResolvedTheme {
  return preference === "system"
    ? systemIsDark
      ? "dark"
      : "light"
    : preference;
}
export function readThemePreference(
  storage: Pick<Storage, "getItem">,
): ThemePreference {
  try {
    const value = storage.getItem(THEME_STORAGE_KEY);
    return isThemePreference(value) ? value : "dark";
  } catch {
    return "dark";
  }
}
