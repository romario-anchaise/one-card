import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  isThemePreference,
  readThemePreference,
  resolveTheme,
  THEME_STORAGE_KEY,
  type ThemePreference,
} from "../application/theme";
const ThemeContext = createContext<{
  preference: ThemePreference;
  setPreference: (value: ThemePreference) => void;
} | null>(null);
function readPreference() {
  try {
    return readThemePreference(window.localStorage);
  } catch {
    return "dark" as const;
  }
}
function applyTheme(preference: ThemePreference) {
  const resolved = resolveTheme(
    preference,
    window.matchMedia("(prefers-color-scheme: dark)").matches,
  );
  document.documentElement.dataset.theme = resolved;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", resolved === "light" ? "#f5f2eb" : "#0e0e12");
}
/** Applied before React mounts so a saved preference does not flash the wrong palette. */
export function initializeTheme() {
  applyTheme(readPreference());
}
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] =
    useState<ThemePreference>(readPreference);
  function setPreference(value: ThemePreference) {
    setPreferenceState(value);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, value);
    } catch {
      /* A theme remains usable when browser persistence is unavailable. */
    }
  }
  useEffect(() => {
    applyTheme(preference);
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const change = () => applyTheme(preference);
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, [preference]);
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY)
        setPreferenceState(
          isThemePreference(event.newValue) ? event.newValue : "dark",
        );
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return (
    <ThemeContext.Provider value={{ preference, setPreference }}>
      {children}
    </ThemeContext.Provider>
  );
}
export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("ThemeProvider is missing.");
  return value;
}
