import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { Providers } from "@/app/providers";
import { AppRouter } from "@/app/router";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Providers>
      <AppRouter />
    </Providers>
  </React.StrictMode>
);
