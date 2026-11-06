import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import "react-markdown-studio/styles.css";
import "./styles.css";
import App from "./App";
import { recordVisit } from "./lib/metrics";

recordVisit();

const root = document.getElementById("root")!;
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);
// Production builds ship pre-rendered HTML (see scripts/postbuild.mjs); the dev server starts empty.
if (root.hasChildNodes()) hydrateRoot(root, app);
else createRoot(root).render(app);
