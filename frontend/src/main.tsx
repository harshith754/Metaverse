import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router";
import "./styles/global.css";
import { SocketProvider } from "./providers/socket-provider";

const rootElement = document.getElementById("root")!;

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <SocketProvider>
        <RouterProvider router={router} />
      </SocketProvider>
    </React.StrictMode>
  );
}
