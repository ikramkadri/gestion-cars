import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ConvexProvider, ConvexReactClient } from "convex/react";

// تعريف الواجهة لـ Vite ليفهم وجود env بدون استخدام any
interface ImportMetaEnv {
  readonly VITE_CONVEX_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// الآن نستخدم الرابط بشكل طبيعي وسيختفي الخطأ والتنبيه
const convex = new ConvexReactClient((import.meta as unknown as ImportMeta).env.VITE_CONVEX_URL);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConvexProvider client={convex}>
      <App />
    </ConvexProvider>
  </React.StrictMode>
);
