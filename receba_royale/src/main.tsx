// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import { PlayerPage } from "./pages/PlayerPage";
import { GlobalTopDecks } from "./components/GlobalTopDecks";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/player/:tag" element={<PlayerPage />} />
        <Route path="/global" element={<GlobalTopDecks />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
