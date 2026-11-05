import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ProductApp } from "./ProductApp";
import { initializeTheme, ThemeProvider } from "./components/ThemeProvider";
import "./styles.css";
import "./workspace.css";
import "./demo.css";
import "./reference.css";
import "./functionality.css";
import "./minimal.css";
import "./themes.css";
import "./controls.css";
initializeTheme();
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <ProductApp />
    </ThemeProvider>
  </StrictMode>,
);
