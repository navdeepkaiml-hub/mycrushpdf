import "@/App.css";
import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import ToolPage from "@/pages/ToolPage";
import AllTools from "@/pages/AllTools";
import Blog from "@/pages/Blog";
import BlogArticle from "@/pages/BlogArticle";
import LegalPage from "@/pages/LegalPage";
import Contact from "@/pages/Contact";
import FaqPage from "@/pages/FaqPage";
import NotFound from "@/pages/NotFound";
import ProtectedRoute from "@/pages/admin/ProtectedRoute";
import { TOOLS } from "@/data/tools";

const AdminLogin = lazy(() => import("@/pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const lazyEl = (el) => <Suspense fallback={<div className="min-h-screen" />}>{el}</Suspense>;

const LEGAL_KEYS = [
  "about-us", "privacy-policy", "terms-and-conditions",
  "cookie-policy", "disclaimer", "security", "help",
];

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Home /> },
      ...TOOLS.map((t) => ({ path: `/${t.slug}`, element: <ToolPage slug={t.slug} /> })),
      { path: "/all-tools", element: <AllTools /> },
      { path: "/blog", element: <Blog /> },
      { path: "/blog/:slug", element: <BlogArticle /> },
      { path: "/contact-us", element: <Contact /> },
      { path: "/faq", element: <FaqPage /> },
      ...LEGAL_KEYS.map((k) => ({ path: `/${k}`, element: <LegalPage pageKey={k} /> })),
      { path: "/404", element: <NotFound /> },
      { path: "*", element: <NotFound /> },
    ],
  },
  { path: "/admin/login", element: lazyEl(<AdminLogin />) },
  {
    path: "/admin/dashboard",
    element: (
      <ProtectedRoute>
        {lazyEl(<AdminDashboard />)}
      </ProtectedRoute>
    ),
  },
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
