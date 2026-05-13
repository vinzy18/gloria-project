import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import LogoGMIM from "../../components/LogoGMIM";
import { authApi } from "../../lib/api";
import { setAuth, isAuthenticated } from "../../lib/auth";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  if (isAuthenticated()) return <Navigate to="/admin" replace />;

  const { mutate, isPending } = useMutation({
    mutationFn: () => authApi.login(username, password),
    onSuccess: ({ data }) => {
      setAuth(data.token, data.user);
      toast.success("Login berhasil!");
      navigate("/admin");
    },
    onError: () => {
      toast.error("Username atau password salah");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Username dan password wajib diisi");
      return;
    }
    mutate();
  };

  return (
    <div className="min-h-screen bg-primary-900 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-primary-100 p-3 rounded-full">
              <LogoGMIM width={40} height={40} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-primary-800">Admin Gereja Gloria</h1>
          <p className="text-gray-500 text-sm mt-1">Masuk untuk mengelola data jemaat</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label-field">Username</label>
            <input
              type="text"
              className="input-field"
              placeholder="Masukkan username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label className="label-field">Password</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                className="input-field pr-10"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-primary-700 hover:bg-primary-800 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60"
          >
            {isPending ? "Masuk..." : "Masuk"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Default: admin / admin123
        </p>
      </div>
    </div>
  );
}
