import React from "react";
import { createRoot } from "react-dom/client";
import TaskManager from "./App.jsx";

if (!window.storage) {
  window.storage = {
    async get(key) {
      const value = window.localStorage.getItem(key);
      return value === null ? null : { value };
    },
    async set(key, value) {
      window.localStorage.setItem(key, value);
    },
  };
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <TaskManager />
  </React.StrictMode>
);
