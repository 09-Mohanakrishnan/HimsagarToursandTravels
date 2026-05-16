import { useState, useEffect } from "react";
import { Users, Calendar, MessageSquare, TrendingUp, ArrowUpRight, ArrowDownRight, Settings } from "lucide-react";
import { TravelEvent, Inquiry } from "../../types";
import { motion } from "motion/react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [stats, setStats] = useState({
    eventsCount: 0,
    inquiriesCount: 0,
    newInquiries: 0
  });
  const [recentInquiries, setRecentInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("adminToken");
      try {
        const [eventsRes, inquiriesRes] = await Promise.all([
          fetch("/api/events"),
          fetch("/api/admin/inquiries", { headers: { Authorization: `Bearer ${token}` } })
        ]);
        
        const events = await eventsRes.json();
        const inquiries = await inquiriesRes.json();
        
        setStats({
          eventsCount: events.length,
          inquiriesCount: inquiries.length,
          newInquiries: inquiries.filter((i: Inquiry) => i.status === 'pending').length
        });
        setRecentInquiries(inquiries.slice(0, 5));
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
    { label: "Total Inquiries", value: stats.inquiriesCount, icon: MessageSquare, color: "text-emerald-600", change: "+12% total", isUp: true },
    { label: "New Requests", value: stats.newInquiries, icon: Users, color: "text-orange-600", change: "Requires Action", isUp: false },
    { label: "Projected Rev", value: "₹4.5L+", icon: TrendingUp, color: "text-indigo-600", change: "+4% vs LY", isUp: true },
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
            <p className="text-4xl font-serif font-black italic tracking-tighter text-gray-800">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Recent Inquiries List */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-[3rem] p-10 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-2xl font-serif italic text-gray-800">Recent Inquiries</h3>
            <Link to="/admin/inquiries" className="text-xs uppercase tracking-widest font-black text-gray-300 hover:text-brand-primary transition-colors">
              View All Systems
            </Link>
          </div>

          <div className="space-y-6">
            {recentInquiries.map((inquiry, i) => (
              <div key={inquiry.id} className="group p-6 rounded-2xl bg-white border border-gray-50 flex items-center justify-between hover:bg-slate-50 transition-all shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-black italic">
                    {inquiry.name[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 group-hover:text-brand-primary transition-colors">{inquiry.name}</h4>
                    <p className="text-xs text-gray-400 italic font-serif">Interested in {inquiry.event_title || "General Query"}</p>
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

        {/* System Health / Quick Links */}
        <div className="bg-white border border-gray-100 rounded-[3rem] p-10 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="text-2xl font-serif italic mb-10 text-gray-800">Admin Quickstart</h3>
            <div className="space-y-4">
              <Link to="/admin/events" className="w-full p-6 h-32 rounded-3xl bg-brand-primary text-white flex flex-col justify-between hover:bg-brand-dark transition-all shadow-lg shadow-brand-primary/20">
                <Calendar size={28} />
                <span className="font-black uppercase tracking-tighter text-xl italic">Add New Tour</span>
              </Link>
              <div className="grid grid-cols-2 gap-4">
                <button className="aspect-square rounded-3xl bg-slate-50 border border-gray-50 flex flex-col items-center justify-center gap-3 hover:bg-slate-100 transition-colors shadow-sm">
                  <TrendingUp size={24} className="text-purple-500" />
                  <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Reports</span>
                </button>
                <button className="aspect-square rounded-3xl bg-slate-50 border border-gray-50 flex flex-col items-center justify-center gap-3 hover:bg-slate-100 transition-colors shadow-sm">
                  <Settings size={24} className="text-gray-300" />
                  <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">System</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="pt-10 mt-10 border-t border-gray-100">
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
