import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./components/AuthContext.js";
import App from "./components/StarLessonApp.js";

const root = createRoot(document.getElementById("root"));

root.render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);