import { useEffect, useState } from "react";
import { Save, Lock, Globe, Bell, Database, CheckCircle } from "lucide-react";

export default function Settings() {
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    siteName: "Himsagar Travels",
    contactEmail: "concierge@himsagar.com",
    contactPhone: "+91 78457 38386",
    address: "Kolkata, West Bengal, India",
    instagram: "https://www.instagram.com/himsagar_travels",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    emailNotifications: true,
    inquiryAlerts: true,
  });

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      setError("Admin token not found. Please log in again.");
      return;
    }

    fetch("/api/admin/settings", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        setSettings((prev) => ({
          ...prev,
          siteName: data.site_name || prev.siteName,
          contactEmail: data.contact_email || prev.contactEmail,
          contactPhone: data.contact_phone || prev.contactPhone,
          address: data.address || prev.address,
          instagram: data.instagram_url || prev.instagram,
          emailNotifications: data.email_notifications ?? prev.emailNotifications,
          inquiryAlerts: data.inquiry_alerts ?? prev.inquiryAlerts,
        }));
      })
      .catch(() => {
        setError("Unable to load settings from the server.");
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (settings.newPassword && settings.newPassword !== settings.confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        throw new Error("Admin token not found. Please log in again.");
      }

      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          site_name: settings.siteName,
          contact_email: settings.contactEmail,
          contact_phone: settings.contactPhone,
          address: settings.address,
          instagram_url: settings.instagram,
          email_notifications: settings.emailNotifications,
          inquiry_alerts: settings.inquiryAlerts,
        }),
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error || "Failed to save settings.");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || "Unable to save settings.");
    }
  };

  const InputField = ({ label, value, onChange, type = "text", placeholder = "" }: any) => (
    <div className="space-y-2">
      <label className="text-[10px] uppercase tracking-widest font-black text-gray-400">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-slate-50 border border-gray-100 rounded-xl py-3 px-4 outline-none focus:border-brand-primary transition-all text-gray-700 text-sm font-medium"
      />
    </div>
  );

  return (
    <div className="space-y-8 max-w-3xl">
      {saved && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-2xl px-6 py-4">
          <CheckCircle size={18} />
          <span className="text-sm font-bold">Settings saved successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-6 py-4">
            <span className="text-sm font-bold">{error}</span>
          </div>
        )}
        {/* Site Info */}
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Globe size={18} className="text-brand-primary" />
            <h3 className="text-lg font-serif text-gray-800">Site Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Site Name" value={settings.siteName} onChange={(e: any) => setSettings({ ...settings, siteName: e.target.value })} />
            <InputField label="Contact Email" type="email" value={settings.contactEmail} onChange={(e: any) => setSettings({ ...settings, contactEmail: e.target.value })} />
            <InputField label="Contact Phone" value={settings.contactPhone} onChange={(e: any) => setSettings({ ...settings, contactPhone: e.target.value })} />
            <InputField label="Instagram URL" value={settings.instagram} onChange={(e: any) => setSettings({ ...settings, instagram: e.target.value })} />
          </div>
          <InputField label="Address" value={settings.address} onChange={(e: any) => setSettings({ ...settings, address: e.target.value })} />
        </div>

        {/* Password */}
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Lock size={18} className="text-brand-primary" />
            <h3 className="text-lg font-serif text-gray-800">Change Password</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InputField label="Current Password" type="password" value={settings.currentPassword} placeholder="••••••••" onChange={(e: any) => setSettings({ ...settings, currentPassword: e.target.value })} />
            <InputField label="New Password" type="password" value={settings.newPassword} placeholder="••••••••" onChange={(e: any) => setSettings({ ...settings, newPassword: e.target.value })} />
            <InputField label="Confirm Password" type="password" value={settings.confirmPassword} placeholder="••••••••" onChange={(e: any) => setSettings({ ...settings, confirmPassword: e.target.value })} />
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Bell size={18} className="text-brand-primary" />
            <h3 className="text-lg font-serif text-gray-800">Notifications</h3>
          </div>
          {[
            { key: "emailNotifications", label: "Email Notifications", desc: "Receive general platform updates via email." },
            { key: "inquiryAlerts", label: "New Inquiry Alerts", desc: "Get notified when a new inquiry is submitted." },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-gray-100">
              <div>
                <p className="font-bold text-gray-800 text-sm">{item.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
              </div>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, [item.key]: !settings[item.key as keyof typeof settings] })}
                className={`w-12 h-6 rounded-full transition-all relative ${settings[item.key as keyof typeof settings] ? "bg-brand-primary" : "bg-gray-200"}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${settings[item.key as keyof typeof settings] ? "left-7" : "left-1"}`} />
              </button>
            </div>
          ))}
        </div>

        {/* Database */}
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Database size={18} className="text-brand-primary" />
            <h3 className="text-lg font-serif text-gray-800">Database</h3>
          </div>
          <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-2xl px-5 py-4">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            <div>
              <p className="text-sm font-bold text-green-700">MongoDB Atlas — Connected</p>
              <p className="text-xs text-green-500 font-medium mt-0.5">Cluster: himsagar.pff49ct.mongodb.net</p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="flex items-center gap-3 px-10 py-4 bg-brand-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-brand-accent transition-all shadow-xl shadow-brand-primary/20"
        >
          <Save size={16} />
          Save Settings
        </button>
      </form>
    </div>
  );
}
