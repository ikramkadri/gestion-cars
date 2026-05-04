// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConvexReactClient, ConvexProvider } from "convex/react";
import App from './App';
import './index.css';

// تكوين Convex Client
const convexUrl = import.meta.env.VITE_CONVEX_URL;

if (!convexUrl) {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <div className="h-screen w-full flex items-center justify-center bg-slate-900 text-white p-6 text-center">
      <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-3xl max-w-md">
        <h1 className="text-2xl font-black mb-4">⚠️ خطأ في الإعدادات</h1>
        <p className="text-slate-400 font-bold">المتغير <code className="text-red-400">VITE_CONVEX_URL</code> مفقود في ملف .env.local</p>
      </div>
    </div>
  );
  console.error("Environment validation failed: Missing VITE_CONVEX_URL");
  throw new Error("Missing environment variable: VITE_CONVEX_URL");
}

const convex = new ConvexReactClient(convexUrl);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConvexProvider client={convex}>
      <App />
    </ConvexProvider>
  </React.StrictMode>
);