import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Lock, User, ArrowRight } from "lucide-react";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("adminToken", data.token);
        navigate("/admin/dashboard");
      } else {
        setError("Invalid username or password");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-navy via-[#1a2540] to-brand-navy p-6">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-primary/5 rounded-full blur-[120px] -mr-60 -mt-60" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-primary/5 rounded-full blur-[100px] -ml-40 -mb-40" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="flex justify-center mb-10">
          <img src="/logo.png" alt="Himsagar Travels" className="h-16 md:h-20 w-auto object-contain brightness-0 invert" />
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-3xl shadow-2xl">
          <h1 className="text-2xl font-serif mb-2 text-white text-center">Admin Access</h1>
          <p className="text-white/40 text-[10px] uppercase tracking-widest text-center mb-10 font-bold">Secure Internal Portal</p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-black text-white/40 ml-1">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                <input
                  required
                  type="text"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-11 pr-5 outline-none focus:border-brand-primary transition-all text-white placeholder:text-white/20 text-sm"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-black text-white/40 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                <input
                  required
                  type="password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-11 pr-5 outline-none focus:border-brand-primary transition-all text-white placeholder:text-white/20 text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-xs font-bold bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>
            )}

            <button
              disabled={loading}
              className="w-full py-4 bg-brand-primary text-white rounded-xl font-black text-sm hover:bg-brand-accent transition-all flex items-center justify-center gap-3 shadow-xl shadow-brand-primary/20 disabled:opacity-50 uppercase tracking-widest mt-2"
            >
              {loading ? "Authenticating..." : "Sign In"}
              <ArrowRight size={16} />
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-white/20 text-[10px] uppercase tracking-widest font-bold">
          Unauthorized access will be logged
        </p>
      </motion.div>
    </div>
  );
}
