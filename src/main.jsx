import React from "react";
import ReactDOM from "react-dom/client";
import AppContent from "./App";
import { BrowserRouter as Router } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Router>
    <AppContent />
  </Router>
);
