import { useEffect, useId, useRef } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import type { ThemePreference } from "../application/theme";
const choices: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Oscuro", icon: Moon },
  { value: "system", label: "Automático", icon: Monitor },
];
export function ThemeControl() {
  const { preference, setPreference } = useTheme();
  const ref = useRef<HTMLDetailsElement>(null);
  const id = useId();
  const Icon = choices.find((choice) => choice.value === preference)!.icon;
  useEffect(() => {
    const outside = (e: PointerEvent) => {
      if (
        e.target instanceof Node &&
        !ref.current?.contains(e.target) &&
        ref.current
      )
        ref.current.open = false;
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && ref.current?.open) {
        ref.current.open = false;
        ref.current.querySelector("summary")?.focus();
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, []);
  return (
    <details className="theme-control" ref={ref}>
      <summary aria-label="Cambiar apariencia" title="Apariencia">
        <Icon size={17} aria-hidden="true" />
      </summary>
      <fieldset className="theme-menu">
        <legend>Apariencia</legend>
        {choices.map((choice) => {
          const ChoiceIcon = choice.icon;
          return (
            <label key={choice.value}>
              <ChoiceIcon size={16} aria-hidden="true" />
              <span>{choice.label}</span>
              <input
                type="radio"
                name={`theme-${id}`}
                value={choice.value}
                checked={preference === choice.value}
                onChange={() => {
                  setPreference(choice.value);
                  if (ref.current) {
                    ref.current.open = false;
                    ref.current.querySelector("summary")?.focus();
                  }
                }}
              />
            </label>
          );
        })}
      </fieldset>
    </details>
  );
}
