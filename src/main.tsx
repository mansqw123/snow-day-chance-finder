import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";  // This should load Tailwind styles properly

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root container missing in index.html");
}

createRoot(container).render(<App />);
