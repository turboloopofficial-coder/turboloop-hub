import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <img src={SITE.logo} alt="Turbo Loop" className="h-16 w-16 mx-auto mb-4 object-contain rounded-xl" />
          <h1 className="text-2xl font-heading font-bold text-white">Admin Login</h1>
          <p className="text-sm text-gray-500 mt-1">Turbo Loop Community Hub</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@turboloop.tech"
              required
              className="bg-[#0d1425] border-gray-700 text-white placeholder:text-gray-600 focus:border-cyan-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-300">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              className="bg-[#0d1425] border-gray-700 text-white placeholder:text-gray-600 focus:border-cyan-500"
            />
          </div>
          <Button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-[#0a0f1e] font-bold"
          >
            {loginMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Lock className="h-4 w-4 mr-2" />
            )}
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="text-sm text-gray-500 hover:text-cyan-400 transition-colors">
            &larr; Back to site
          </a>
        </div>
      </div>
    </div>
  );
}
