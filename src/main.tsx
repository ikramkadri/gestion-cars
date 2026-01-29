import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ConvexProvider, ConvexReactClient } from "convex/react";

// هذا هو الرابط اللي يربطك بالسحاب (تلقايه في .env.local)
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* تغليف الـ Backend */}
    <ConvexProvider client={convex}> 
        <App />
    </ConvexProvider>
  </React.StrictMode>
)