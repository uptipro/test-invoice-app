import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/global.css";
import App from "./App.jsx";
import { initGoogleAnalytics } from "./googleAnalytics.js";

initGoogleAnalytics();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
