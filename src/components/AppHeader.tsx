import type { ReactNode } from "react";
import { Brand } from "./Brand";
import { ThemeControl } from "./ThemeControl";
export function AppHeader({
  className = "",
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <header className={`app-header ${className}`}>
      <Brand />
      <div className="app-header-actions">
        {children}
        <ThemeControl />
      </div>
    </header>
  );
}
