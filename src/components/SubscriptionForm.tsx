import { useState } from "react";
import { CheckCircle2, Mail } from "lucide-react";
import { cn } from "../lib/utils";

type SubscriptionFormProps = {
  source: string;
  title?: string;
  description?: string;
  buttonLabel: string;
  placeholder?: string;
  className?: string;
  hideHeader?: boolean;
};

export default function SubscriptionForm({
  source,
  title = "",
  description = "",
  buttonLabel,
  placeholder = "Enter your email address",
  className = "",
  hideHeader = false,
}: SubscriptionFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error" | "duplicate">("idle");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("idle");
    setMessage("");

    if (!email.trim()) {
      setStatus("error");
      setMessage("Please enter your email.");
      return;
    }

    if (!isValidEmail(email)) {
      setStatus("error");
      setMessage("Enter a valid email address.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source }),
      });

      let payload: any = {};
      const text = await response.text();
      if (text) {
        try {
          payload = JSON.parse(text);
        } catch (jsonError) {
          console.warn("Non-JSON subscribe response", { status: response.status, text });
        }
      }

      if (response.ok) {
        setStatus("success");
        setMessage("Thank you! You are now subscribed.");
        setEmail("");
      } else if (response.status === 409) {
        setStatus("duplicate");
        setMessage(payload.message || "You are already subscribed.");
      } else {
        setStatus("error");
        setMessage(payload.error || "Subscription failed. Please try again.");
        console.error("Subscribe API error", response.status, payload, text);
      }
    } catch (err) {
      setStatus("error");
      setMessage("Unable to subscribe right now. Please try again later.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {!hideHeader && (
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] font-black text-brand-primary mb-3">{title}</p>
          <p className="text-sm text-white/70 leading-relaxed">{description}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="sr-only" htmlFor="subscription-email">Email</label>
        <input
          id="subscription-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={placeholder}
          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-white/40 outline-none focus:border-brand-primary transition-colors"
        />
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center whitespace-nowrap px-6 py-3 bg-brand-primary text-white uppercase tracking-[0.3em] text-[10px] font-black rounded-xl hover:bg-brand-accent transition-colors disabled:opacity-60"
        >
          {buttonLabel}
        </button>
      </form>

      {message ? (
        <div className={cn(
          "text-sm font-medium",
          status === "success" ? "text-emerald-300" : "text-rose-300"
        )} aria-live="polite">
          <span className="inline-flex items-center gap-2">
            {status === "success" && <CheckCircle2 size={16} />}
            {message}
          </span>
        </div>
      ) : null}
    </div>
  );
}
