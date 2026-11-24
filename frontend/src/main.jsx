import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import SimulareProvider from "./components/SimulareProvider.jsx";
import "./index.css";

// BrowserRouter: adresa din bara browserului decide ce pagină desenează App
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      {/* ceasul simulării curselor, comun tuturor paginilor */}
      <SimulareProvider>
        <App />
      </SimulareProvider>
    </BrowserRouter>
  </StrictMode>
);
