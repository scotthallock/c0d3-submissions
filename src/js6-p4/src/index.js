import React from "react";
import ReactDOM from "react-dom";
import { AuthProvider } from "./components/AuthContext.js";
import App from "./components/PokemonClassesApp.js";

ReactDOM.render(
  <AuthProvider>
    <App />
  </AuthProvider>,
  document.getElementById("root")
);
