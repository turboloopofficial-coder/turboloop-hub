import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { SITE } from "@/lib/constants";
import { Lock, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [, navigate] = useLocation();

  const loginMutation = trpc.admin.login.useMutation({
    onSuccess: () => {
      toast.success("Login successful");
      navigate("/admin");
    },
    onError: (err) => {
      toast.error(err.message || "Invalid credentials");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full" style={{ background: "radial-gradient(ellipse, rgba(34,211,238,0.05) 0%, transparent 60%)" }} />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full" style={{ background: "radial-gradient(ellipse, rgba(192,132,252,0.05) 0%, transparent 60%)" }} />

      <div
        className="w-full max-w-md p-8 md:p-10 rounded-2xl relative z-10"
        style={{
          background: "linear-gradient(135deg, rgba(13,20,40,0.7) 0%, rgba(13,20,40,0.4) 100%)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="text-center mb-8">
          <img src={SITE.logo} alt="Turbo Loop" className="h-14 w-auto mx-auto mb-4 object-contain rounded-xl" />
          <h1 className="text-2xl font-heading font-bold text-white">Admin Login</h1>
          <p className="text-sm text-gray-500 mt-1">Turbo Loop Community Hub</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm text-gray-400 font-medium">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@turboloop.tech"
              required
              className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-gray-600 outline-none transition-all duration-300"
              style={{
                background: "rgba(13,20,40,0.6)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(34,211,238,0.3)"; e.currentTarget.style.boxShadow = "0 0 15px rgba(34,211,238,0.08)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.boxShadow = "none"; }}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm text-gray-400 font-medium">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-gray-600 outline-none transition-all duration-300"
              style={{
                background: "rgba(13,20,40,0.6)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(34,211,238,0.3)"; e.currentTarget.style.boxShadow = "0 0 15px rgba(34,211,238,0.08)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.boxShadow = "none"; }}
            />
          </div>
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, rgba(34,211,238,0.15), rgba(34,211,238,0.05))",
              border: "1px solid rgba(34,211,238,0.3)",
              color: "#22D3EE",
              boxShadow: "0 0 20px rgba(34,211,238,0.1)",
            }}
          >
            {loginMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Lock className="h-4 w-4" />
            )}
            Sign In
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="text-sm text-gray-600 hover:text-cyan-400 transition-colors duration-300">
            &larr; Back to site
          </a>
        </div>
      </div>
    </div>
  );
}
