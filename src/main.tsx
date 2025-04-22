
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";  // This should load Tailwind styles properly

// Get the root element
const container = document.getElementById("root");

// Ensure the container exists
if (!container) {
  throw new Error("Root container missing in index.html");
}

// Create and render the root
createRoot(container).render(<App />);
