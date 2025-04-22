
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";  // This should load Tailwind styles properly

// Add console log to help with debugging
console.log("Starting application...");

// Get the root element
const container = document.getElementById("root");

// Ensure the container exists
if (!container) {
  console.error("Root container missing in index.html");
  throw new Error("Root container missing in index.html");
}

// Create and render the root
try {
  console.log("Rendering App to root element");
  createRoot(container).render(<App />);
  console.log("App rendered successfully");
} catch (error) {
  console.error("Failed to render App:", error);
}
