import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Calendar, MessageSquare, LogOut, Settings, User, Menu, X, Globe, Mail } from "lucide-react";
import { cn } from "../../lib/utils";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) navigate("/admin/login");
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Tours", path: "/admin/events", icon: Calendar },
    { name: "Subscriptions", path: "/admin/subscriptions", icon: Mail },
    { name: "Page Content", path: "/admin/content", icon: Globe },
    { name: "Inquiries", path: "/admin/inquiries", icon: MessageSquare },
    { name: "Settings", path: "/admin/settings", icon: Settings },
  ];

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <aside className={cn(
      "bg-brand-navy flex flex-col h-full",
      mobile ? "w-72" : (sidebarOpen ? "w-64" : "w-20"),
      !mobile && "transition-all duration-300"
    )}>
      {/* Logo */}
      <div className="p-6 border-b border-white/10 flex items-center gap-2">
        <img src="/logo.png" alt="Himsagar Travels" className="h-10 md:h-12 w-auto object-contain brightness-0 invert shrink-0" />
        {/* {(sidebarOpen || mobile) && (
          <span className="text-[9px] font-black uppercase tracking-widest text-white/40 whitespace-nowrap">Adminnnn Panel</span>
        )} */}
      </div>

      <nav className="flex-grow p-4 space-y-1 pt-6">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setMobileSidebarOpen(false)}
            className={cn(
              "flex items-center gap-3 py-3 px-4 rounded-xl transition-all group",
              location.pathname === item.path
                ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20"
                : "text-white/40 hover:text-white hover:bg-white/5"
            )}
          >
            <item.icon size={16} className="flex-shrink-0" />
            {(sidebarOpen || mobile) && (
              <span className="text-[10px] uppercase tracking-[0.25em] font-black">{item.name}</span>
            )}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 p-3 rounded-xl text-white/30 hover:bg-red-500/10 hover:text-red-400 transition-all"
        >
          <LogOut size={16} className="flex-shrink-0" />
          {(sidebarOpen || mobile) && (
            <span className="text-[10px] uppercase tracking-[0.25em] font-black">Sign Out</span>
          )}
        </button>
      </div>
    </aside>
  );

  const currentPage = menuItems.find(m => m.path === location.pathname)?.name || "Management";

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full z-10">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => { setSidebarOpen(!sidebarOpen); setMobileSidebarOpen(!mobileSidebarOpen); }}
              className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-gray-500"
            >
              <Menu size={18} />
            </button>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Himsagar Travels</p>
              <h2 className="text-lg font-serif text-gray-800">{currentPage}</h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-bold text-gray-700">Administrator</span>
              <span className="text-[10px] text-brand-primary uppercase tracking-widest font-black">● Online</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center">
              <User size={16} className="text-brand-primary" />
            </div>
          </div>
        </header>

        <div className="flex-grow p-6 md:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
