import { BrowserRouter, Routes, Route, useLocation, useParams, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";
import Home from "./pages/Home";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import AdminLogin from "./pages/admin/Login";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import EventManager from "./pages/admin/EventManager";
import InquiryManager from "./pages/admin/InquiryManager";
import ContentManager from "./pages/admin/ContentManager";
import Settings from "./pages/admin/Settings";
import SubscriptionManager from "./pages/admin/SubscriptionManager";
import SEOManager from "./pages/admin/SEOManager";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import BlogManager from "./pages/admin/blog/BlogManager";
import BlogEditor from "./pages/admin/blog/BlogEditor";
import BlogCategories from "./pages/admin/blog/BlogCategories";
import EmailCampaignMonitor from "./pages/admin/blog/EmailCampaignMonitor";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}

/** Backward compatibility: redirect /events/:id (MongoDB ObjectId) to /tours/:slug */
function EventIdRedirect() {
  const { id } = useParams();
  const [slug, setSlug] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/events/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(data => {
        if (data.slug) {
          setSlug(data.slug);
        } else {
          // Fallback: if somehow no slug, just render the detail page at this URL
          setSlug(null);
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true));
  }, [id]);

  if (slug) return <Navigate to={`/tours/${slug}`} replace />;
  if (notFound) return <MainLayout><div className="pt-40 h-screen flex items-center justify-center text-3xl font-serif text-gray-400">Tour not found</div></MainLayout>;
  return <div className="h-screen flex items-center justify-center bg-white"><div className="animate-pulse text-brand-primary text-lg font-serif">Redirecting...</div></div>;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<MainLayout><Home /></MainLayout>} />
        <Route path="/events" element={<MainLayout><Events /></MainLayout>} />
        <Route path="/tours" element={<MainLayout><Events /></MainLayout>} />
        <Route path="/tours/:slug" element={<MainLayout><EventDetail /></MainLayout>} />
        {/* Backward compatibility: old /events/:id URLs redirect to /tours/:slug */}
        <Route path="/events/:id" element={<EventIdRedirect />} />
        <Route path="/about" element={<MainLayout><About /></MainLayout>} />
        <Route path="/contact" element={<MainLayout><Contact /></MainLayout>} />

        {/* Blog */}
        <Route path="/blog" element={<MainLayout><Blog /></MainLayout>} />
        <Route path="/blog/:slug" element={<MainLayout><BlogDetail /></MainLayout>} />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="events" element={<EventManager />} />
          <Route path="subscriptions" element={<SubscriptionManager />} />
          <Route path="inquiries" element={<InquiryManager />} />
          <Route path="content" element={<ContentManager />} />
          <Route path="seo" element={<SEOManager />} />
          <Route path="settings" element={<Settings />} />
          <Route path="blog" element={<BlogManager />} />
          <Route path="blog/new" element={<BlogEditor />} />
          <Route path="blog/edit/:id" element={<BlogEditor />} />
          <Route path="blog/categories" element={<BlogCategories />} />
          <Route path="blog/campaigns" element={<EmailCampaignMonitor />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<MainLayout><div className="pt-40 h-screen flex items-center justify-center text-3xl font-serif text-gray-400">404 — Page not found</div></MainLayout>} />
      </Routes>
    </BrowserRouter>
  );
}
