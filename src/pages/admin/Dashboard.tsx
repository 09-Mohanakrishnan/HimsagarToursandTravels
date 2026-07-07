import { useState, useEffect } from "react";
import { Users, Calendar, MessageSquare, TrendingUp, ArrowUpRight, ArrowDownRight, Settings, Mail, BookOpen, FileText, Tag } from "lucide-react";
import { TravelEvent, Inquiry, Blog } from "../../types";
import { motion } from "motion/react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [stats, setStats] = useState({
    eventsCount: 0,
    inquiriesCount: 0,
    subscriptionCount: 0,
    newInquiries: 0,
  });
  const [blogStats, setBlogStats] = useState({ total: 0, published: 0, drafts: 0, categories: 0 });
  const [recentInquiries, setRecentInquiries] = useState<Inquiry[]>([]);
  const [recentBlogs, setRecentBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("adminToken");
      try {
        const eventsRes = await fetch("/api/events");
        const inquiriesRes = await fetch("/api/admin/inquiries", { headers: { Authorization: `Bearer ${token}` } });
        const subscriptionsRes = await fetch("/api/admin/subscriptions", { headers: { Authorization: `Bearer ${token}` } });
        const blogStatsRes = await fetch("/api/admin/blogs/stats", { headers: { Authorization: `Bearer ${token}` } });
        const recentBlogsRes = await fetch("/api/admin/blogs?limit=5", { headers: { Authorization: `Bearer ${token}` } });
        
        if (inquiriesRes.status === 401 || inquiriesRes.status === 403 || subscriptionsRes.status === 401 || subscriptionsRes.status === 403) {
          localStorage.removeItem("adminToken");
          window.location.href = "/admin/login";
          return;
        }

        const events = await eventsRes.json();
        const inquiries = await inquiriesRes.json();
        const subscriptions = await subscriptionsRes.json();
        const bStats = blogStatsRes.ok ? await blogStatsRes.json() : {};
        const bRecent = recentBlogsRes.ok ? await recentBlogsRes.json() : {};
        
        setStats({
          eventsCount: events.length,
          inquiriesCount: inquiries.length,
          subscriptionCount: subscriptions.length,
          newInquiries: inquiries.filter((i: Inquiry) => i.status === 'pending').length,
        });
        setBlogStats({ total: bStats.total || 0, published: bStats.published || 0, drafts: bStats.drafts || 0, categories: bStats.categories || 0 });
        setRecentInquiries(inquiries.slice(0, 5));
        setRecentBlogs(((bRecent.blogs || []) as any[]).map((b: any) => ({ ...b, id: b._id || b.id })).slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { label: "Active Tours", value: stats.eventsCount, icon: Calendar, color: "text-blue-600", change: "+2 this week", isUp: true },
    { label: "Newsletter Subscribers", value: stats.subscriptionCount, icon: Mail, color: "text-brand-primary", change: "+5 this week", isUp: true },
    { label: "Total Inquiries", value: stats.inquiriesCount, icon: MessageSquare, color: "text-emerald-600", change: "+12% total", isUp: true },
    { label: "New Requests", value: stats.newInquiries, icon: Users, color: "text-orange-600", change: "Requires Action", isUp: false },
  ];

  const blogStatCards = [
    { label: "Published", value: blogStats.published, icon: BookOpen, color: "text-emerald-600" },
    { label: "Drafts", value: blogStats.drafts, icon: FileText, color: "text-amber-500" },
    { label: "Categories", value: blogStats.categories, icon: Tag, color: "text-brand-primary" },
    { label: "Total Blogs", value: blogStats.total, icon: BookOpen, color: "text-gray-400" },
  ];

  if (loading) return <div>Loading systems...</div>;

  return (
    <div className="space-y-10">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white border border-gray-100 p-8 rounded-[2.5rem] relative group cursor-default shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={cn("p-4 rounded-2xl bg-slate-50", stat.color)}>
                <stat.icon size={24} />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest",
                stat.isUp ? "text-emerald-500" : "text-orange-500"
              )}>
                {stat.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {stat.change}
              </div>
            </div>
            <h3 className="text-gray-400 text-xs uppercase tracking-widest font-black mb-2">{stat.label}</h3>
            <p className="text-4xl font-serif font-black tracking-tighter text-gray-800">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Blog Stats Row */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-gray-400">Blog Overview</h2>
          <Link to="/admin/blog" className="text-xs uppercase tracking-widest font-black text-gray-300 hover:text-brand-primary transition-colors">Manage →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {blogStatCards.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.07 }}
              className="bg-white border border-gray-100 rounded-3xl p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
              <div className={cn("p-3 rounded-2xl bg-slate-50", stat.color)}><stat.icon size={18} /></div>
              <div>
                <p className="text-[9px] uppercase tracking-widest font-black text-gray-300 mb-0.5">{stat.label}</p>
                <p className="text-2xl font-black font-serif text-gray-800">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Recent Inquiries List */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-[3rem] p-10 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-2xl font-serif text-gray-800">Recent Inquiries</h3>
            <Link to="/admin/inquiries" className="text-xs uppercase tracking-widest font-black text-gray-300 hover:text-brand-primary transition-colors">
              View All Systems
            </Link>
          </div>

          <div className="space-y-6">
            {recentInquiries.map((inquiry, i) => (
              <div key={inquiry.id} className="group p-6 rounded-2xl bg-white border border-gray-50 flex items-center justify-between hover:bg-slate-50 transition-all shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-black">
                    {inquiry.name[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 group-hover:text-brand-primary transition-colors">{inquiry.name}</h4>
                    <p className="text-xs text-gray-400 font-serif">Interested in {inquiry.event_title || "General Query"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="hidden md:block">
                    <p className="text-xs text-gray-300 mb-1 font-bold uppercase tracking-widest">Received</p>
                    <p className="text-sm font-sans text-gray-600 font-medium">{new Date(inquiry.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className={cn(
                    "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm",
                    inquiry.status === 'pending' ? "bg-orange-50 text-white border-orange-100" : "bg-emerald-50 text-emerald-500 border-emerald-100"
                  )}>
                    {inquiry.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links + Blog Snippets */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-[3rem] p-8 shadow-sm">
            <h3 className="text-xl font-serif mb-6 text-gray-800">Admin Quickstart</h3>
            <div className="space-y-3">
              <Link to="/admin/events" className="w-full p-5 rounded-3xl bg-brand-primary text-white flex items-center gap-4 hover:bg-brand-dark transition-all shadow-lg shadow-brand-primary/20">
                <Calendar size={20} />
                <span className="font-black uppercase tracking-widest text-sm">Add New Tour</span>
              </Link>
              <Link to="/admin/blog/new" className="w-full p-5 rounded-3xl bg-slate-50 border border-gray-100 text-gray-600 flex items-center gap-4 hover:border-brand-primary hover:text-brand-primary transition-all">
                <BookOpen size={20} />
                <span className="font-black uppercase tracking-widest text-sm">Write Blog Post</span>
              </Link>
              <Link to="/admin/blog/campaigns" className="w-full p-5 rounded-3xl bg-slate-50 border border-gray-100 text-gray-600 flex items-center gap-4 hover:border-brand-primary hover:text-brand-primary transition-all">
                <Mail size={20} />
                <span className="font-black uppercase tracking-widest text-sm">Email Campaigns</span>
              </Link>
            </div>
          </div>

          {/* Recent Blogs */}
          {recentBlogs.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-serif text-gray-800">Recent Blogs</h3>
                <Link to="/admin/blog" className="text-[10px] uppercase tracking-widest font-black text-gray-300 hover:text-brand-primary transition-colors">All →</Link>
              </div>
              <div className="space-y-4">
                {recentBlogs.map(blog => (
                  <Link key={blog.id} to={`/admin/blog/edit/${blog.id}`} className="flex items-start gap-3 group">
                    <div className="w-12 h-10 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                      {blog.featuredImage ? <img src={blog.featuredImage} alt={blog.title} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-brand-primary/10" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-700 group-hover:text-brand-primary transition-colors line-clamp-1">{blog.title}</p>
                      <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full", blog.status === "published" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600")}>
                        {blog.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-3 text-emerald-500 text-xs mb-2 font-bold">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Database Synchronized
            </div>
            <p className="text-[10px] text-gray-300 uppercase tracking-[0.2em] font-black">Version 2.0.4-LTS (Build #455)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Inline helper for Dashboard
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}

