import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import axios from "axios";
import { AuthProvider } from "./context/AuthContext.jsx";

axios.defaults.baseURL = "";

const token = localStorage.getItem("token");

if (token) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

function applyThemeFromStorage() {
  try {
    const root = document.documentElement;
    const body = document.body;

    root.classList.remove("dark");
    body.classList.remove("dark");

    localStorage.setItem("theme", "light");

    window.theme = {
      get: () => localStorage.getItem("theme"),

      set: (next) => {
        localStorage.setItem("theme", next);
        applyThemeFromStorage();
      },
    };
  } catch (error) {
    console.error("Theme error:", error);
  }
}

applyThemeFromStorage();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);