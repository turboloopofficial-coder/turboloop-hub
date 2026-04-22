import { useState } from "react";
import { trpc } from "@/lib/trpc";
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: "#060a16" }}>
      {/* Background glows */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full" style={{ background: "radial-gradient(ellipse, rgba(34,211,238,0.04) 0%, transparent 60%)" }} />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full" style={{ background: "radial-gradient(ellipse, rgba(192,132,252,0.04) 0%, transparent 60%)" }} />

      <div
        className="w-full max-w-md p-8 md:p-10 rounded-xl relative z-10"
        style={{
          background: "rgba(10, 18, 38, 0.5)",
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="text-center mb-8">
          <div className="text-2xl font-bold mb-2">
            <span className="text-white">Turbo</span>
            <span className="text-cyan-400">Loop</span>
          </div>
          <h1 className="text-lg font-bold text-white">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to manage content</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm text-gray-400">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@turboloop.tech"
              required
              className="w-full px-4 py-3 rounded-lg text-sm text-white placeholder:text-gray-600 outline-none transition-all duration-300 focus:ring-1 focus:ring-cyan-500/30"
              style={{ background: "rgba(6,10,22,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm text-gray-400">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              className="w-full px-4 py-3 rounded-lg text-sm text-white placeholder:text-gray-600 outline-none transition-all duration-300 focus:ring-1 focus:ring-cyan-500/30"
              style={{ background: "rgba(6,10,22,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}
            />
          </div>
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-bold transition-all duration-300 disabled:opacity-50 hover:brightness-110"
            style={{
              background: "linear-gradient(135deg, #22D3EE, #06B6D4)",
              color: "#060a16",
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
