import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import {
  demoConnectionGateway,
  profileRepository,
} from "./infrastructure/demo";
import "./styles.css";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App
      repository={profileRepository}
      connectionGateway={demoConnectionGateway}
    />
  </StrictMode>,
);
