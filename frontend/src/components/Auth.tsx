import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import api from "../api/client";

export default function Auth({
  onLoginSuccess,
}: {
  onLoginSuccess: () => void;
}) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("user_test@shopfast.com");
  const [password, setPassword] = useState("Password123@");
  const [name, setName] = useState("Khách hàng Test");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    try {
      if (isLogin) {
        const res = await api.post("/auth/login", { email, password });
        localStorage.setItem("token", res.data.accessToken);
        onLoginSuccess();
      } else {
        await api.post("/auth/register", { email, password, name });
        setMessage("Đăng ký thành công! Vui lòng đăng nhập.");
        setIsLogin(true);
      }
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Lỗi kết nối server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-cyan-900 to-blue-950 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-2xl border border-cyan-500/30 shadow-2xl shadow-cyan-500/20 rounded-3xl overflow-hidden p-8"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2 tracking-wide">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-cyan-100/70 text-sm">
            ShopFast - Trải nghiệm mua sắm đỉnh cao
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400/70 w-5 h-5" />
              <input
                type="text"
                placeholder="Họ và tên"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-cyan-500/20 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-cyan-100/40 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                required
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400/70 w-5 h-5" />
            <input
              type="email"
              placeholder="Email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-cyan-500/20 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-cyan-100/40 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400/70 w-5 h-5" />
            <input
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-cyan-500/20 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-cyan-100/40 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
              required
            />
          </div>

          {message && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-sm text-center ${message.includes("thành công") ? "text-emerald-400" : "text-rose-400"}`}
            >
              {message}
            </motion.p>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/30 disabled:opacity-50"
          >
            {isLoading ? "Đang xử lý..." : isLogin ? "Đăng nhập" : "Đăng ký"}
            {!isLoading && <ArrowRight className="w-5 h-5" />}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-cyan-100/60 text-sm">
            {isLogin ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
            >
              {isLogin ? "Đăng ký ngay" : "Đăng nhập"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
