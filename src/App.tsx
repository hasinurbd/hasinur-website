/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import AchievementDetail from "./pages/AchievementDetail";
import BlogDetail from "./pages/BlogDetail";
import ProjectDetail from "./pages/ProjectDetail";
import { ProfileProvider } from "./lib/ProfileContext";

export default function App() {
  return (
    <ProfileProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/admin/*" element={<Admin />} />
          <Route path="/achievement/:id" element={<AchievementDetail />} />
          <Route path="/blog/:id" element={<BlogDetail />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </ProfileProvider>
  );
}
