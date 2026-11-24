/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import React, { Component, Suspense, lazy, useEffect } from "react";
import Home from "./pages/Home";
import { ProfileProvider } from "./lib/ProfileContext";
import { recordPageView } from "./lib/viewTracker";

class AppErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  declare readonly props: { children: React.ReactNode };
  state: { hasError: boolean };

  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("Application runtime error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p className="text-sm text-slate-400 mb-5 max-w-sm">
            The page encountered an unexpected issue while loading. Reload to try again.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors cursor-pointer"
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function PageTracker() {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/' || location.pathname === '') {
      recordPageView();
    }
  }, [location.pathname]);

  return null;
}

// Lazy-loaded components for optimal initial payload & dynamic chunking
const Admin = lazy(() => import("./pages/Admin"));
const AchievementDetail = lazy(() => import("./pages/AchievementDetail"));
const BlogDetail = lazy(() => import("./pages/BlogDetail"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const Resume = lazy(() => import("./pages/Resume"));

// High-fidelity page transition loader
const PageLoader = () => (
  <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center relative overflow-hidden">
    <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,99,235,0.1),rgba(255,255,255,0))] pointer-events-none"></div>
    <div className="flex flex-col items-center gap-4 relative z-10">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
        <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 animate-spin"></div>
      </div>
      <p className="text-xs font-mono text-slate-500 tracking-widest uppercase animate-pulse">Loading Experience...</p>
    </div>
  </div>
);

export default function App() {
  return (
    <ProfileProvider>
      <BrowserRouter>
        <PageTracker />
        <AppErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/admin/*" element={<Admin />} />
              <Route path="/achievement/:id" element={<AchievementDetail />} />
              <Route path="/blog/:id" element={<BlogDetail />} />
              <Route path="/project/:id" element={<ProjectDetail />} />
              <Route path="/resume" element={<Resume />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </Suspense>
        </AppErrorBoundary>
      </BrowserRouter>
    </ProfileProvider>
  );
}

