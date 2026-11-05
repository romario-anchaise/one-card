import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ProductApp } from "./ProductApp";
import "./styles.css";
import "./workspace.css";
import "./demo.css";
import "./reference.css";
import "./functionality.css";
import "./minimal.css";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ProductApp />
  </StrictMode>,
);
