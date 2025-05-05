import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { BASE_PATH } from "./lib/gitHubPagesConfig";

// Log the base path configuration for debugging
console.log("Application running with base path:", BASE_PATH || "/");

createRoot(document.getElementById("root")!).render(
  <App />
);
