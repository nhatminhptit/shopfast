import { useEffect, useState } from "react";
import {
  ShoppingCart,
  Search,
  LogOut,
  Menu,
  Home,
  ShieldCheck,
  X,
  User,
  Settings,
  Package,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  clearCart,
  selectCartItemCount,
  setCurrentUser,
} from "../store/cartSlice";
import type { RootState } from "../store/store";
import type { AppDispatch } from "../store/store";

// 1. Hàm lấy thông tin Tên & Quyền từ Token động
function getUserInfo() {
  const token = localStorage.getItem("token");
  if (!token) return { role: null, email: "Khách" };

  try {
    const payload = JSON.parse(
      decodeURIComponent(
        window
          .atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
          .split("")
          .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
          .join(""),
      ),
    ) as { role?: string; email?: string; username?: string };

    return {
      role: payload.role,
      email: payload.email || payload.username || "user_test@shopfast.com",
    };
  } catch {
    return { role: null, email: "Khách" };
  }
}

type NavbarProps = {
  onLogout: () => void;
  onAdminDashboard: () => void;
  onHome: () => void;
};

export default function Navbar({
  onLogout,
  onAdminDashboard,
  onHome,
}: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  // Khởi tạo thông tin User
  const { role, email } = getUserInfo();
  const isAdmin = role === "ADMIN";
  // Cắt lấy phần tên trước @ để hiển thị thay cho chữ "Tài khoản"
  const displayName = email !== "Khách" ? email.split("@")[0] : "Tài khoản";

  useEffect(() => {
    if (email !== "Khách") {
      dispatch(setCurrentUser(email));
    }
  }, [dispatch, email]);

  const cartItemCount = useSelector((state: RootState) =>
    selectCartItemCount(state),
  );

  return (
    <>
      <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-cyan-500/20 shadow-lg shadow-cyan-900/20">
        <div className="w-full px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo & Nút gọi Hamburger */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="rounded-xl border border-cyan-500/20 bg-white/5 p-2 text-cyan-200 transition hover:bg-cyan-500/20 hover:text-cyan-300"
                aria-label="Mở menu điều hướng"
              >
                <Menu className="h-5 w-5" />
              </button>
              <Link
                to="/"
                onClick={onHome}
                className="flex-shrink-0 flex items-center gap-2 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl text-white tracking-wide hidden sm:block">
                  ShopFast
                </span>
              </Link>
            </div>

            {/* Thanh Tìm kiếm */}
            <div className="hidden md:block flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400/70 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  className="w-full bg-white/5 border border-cyan-500/20 rounded-full py-2 pl-10 pr-4 text-white placeholder:text-cyan-100/40 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
                />
              </div>
            </div>

            {/* Menu Dropdown Tài khoản */}
            <div className="flex items-center gap-6">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="relative text-cyan-100 hover:text-cyan-400 transition-colors"
                onClick={() => navigate("/cart")}
              >
                <ShoppingCart className="w-6 h-6" />
                <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-lg">
                  {cartItemCount}
                </span>
              </motion.button>

              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-2 bg-white/5 hover:bg-cyan-500/20 text-cyan-100 px-3 py-2 rounded-xl border border-cyan-500/20 transition-all"
                >
                  <div className="w-7 h-7 bg-cyan-500/20 rounded-full flex items-center justify-center border border-cyan-500/30">
                    <User className="w-4 h-4 text-cyan-300" />
                  </div>
                  {/* ĐÃ FIX: Hiện tên User động thay vì chữ "Tài khoản" */}
                  <span className="text-sm font-medium hidden sm:block max-w-[120px] truncate">
                    {displayName}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-cyan-400 transition-transform duration-300 ${isMenuOpen ? "rotate-180" : ""}`}
                  />
                </motion.button>

                <AnimatePresence>
                  {isMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-56 bg-slate-800/95 backdrop-blur-xl border border-cyan-500/20 rounded-2xl shadow-xl shadow-cyan-900/50 overflow-hidden py-2"
                    >
                      <div className="px-4 py-3 border-b border-cyan-500/20 mb-2">
                        <p className="text-sm text-cyan-100">
                          Đăng nhập với tư cách
                        </p>
                        {/* ĐÃ FIX: Hiện Email động */}
                        <p className="text-sm font-bold text-white truncate">
                          {email}
                        </p>
                      </div>

                      {/* ĐÃ FIX: Thêm onClick và text-left để nút có thể bấm được */}
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          alert("Chức năng Hồ sơ đang phát triển!");
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left text-cyan-100 hover:bg-cyan-500/20 transition-colors"
                      >
                        <User className="w-4 h-4 shrink-0" />{" "}
                        <span className="flex-1">Hồ sơ cá nhân</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          alert("Chức năng Đơn hàng đang phát triển!");
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left text-cyan-100 hover:bg-cyan-500/20 transition-colors"
                      >
                        <Package className="w-4 h-4 shrink-0" />{" "}
                        <span className="flex-1">Đơn hàng của tôi</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          alert("Chức năng Cài đặt đang phát triển!");
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left text-cyan-100 hover:bg-cyan-500/20 transition-colors"
                      >
                        <Settings className="w-4 h-4 shrink-0" />{" "}
                        <span className="flex-1">Cài đặt hệ thống</span>
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            onAdminDashboard();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left text-cyan-300 hover:bg-cyan-500/20 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 shrink-0" />{" "}
                          <span className="flex-1">Quản trị hệ thống</span>
                        </button>
                      )}

                      <div className="h-px bg-cyan-500/20 my-2"></div>

                      <button
                        onClick={() => {
                          dispatch(clearCart());
                          setIsMenuOpen(false);
                          onLogout();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left text-rose-400 hover:bg-rose-500/20 transition-colors font-medium"
                      >
                        <LogOut className="w-4 h-4 shrink-0" />{" "}
                        <span className="flex-1">Đăng xuất</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ĐÃ FIX LỖI XUYÊN THẤU: Đưa Drawer ra ngoài Nav, bọc màng đen z-[100] */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Đóng menu điều hướng"
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 z-[100] cursor-default bg-black/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed left-0 top-0 z-[110] flex h-full w-72 flex-col border-r border-cyan-500/20 bg-slate-950 shadow-2xl shadow-cyan-950/50"
            >
              <div className="flex h-16 shrink-0 items-center justify-between border-b border-cyan-500/20 px-5">
                <Link
                  to="/"
                  onClick={() => {
                    onHome();
                    setIsDrawerOpen(false);
                  }}
                  className="flex items-center gap-2"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg shadow-cyan-500/30">
                    <ShoppingCart className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-bold tracking-wide text-white">
                    ShopFast
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="rounded-lg p-2 text-cyan-100/60 hover:bg-white/10 hover:text-white"
                  aria-label="Đóng menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="space-y-2 p-5">
                <button
                  onClick={() => {
                    onHome();
                    setIsDrawerOpen(false);
                    navigate("/");
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-cyan-100 transition hover:bg-cyan-500/20"
                >
                  <Home className="h-5 w-5 text-cyan-400" /> Trang chủ
                </button>
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    navigate("/cart");
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-cyan-100 transition hover:bg-cyan-500/20"
                >
                  <ShoppingCart className="h-5 w-5 text-cyan-400" /> Giỏ hàng
                </button>
                {isAdmin && (
                  <button
                    onClick={() => {
                      onAdminDashboard();
                      setIsDrawerOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-cyan-300 transition hover:bg-cyan-500/20"
                  >
                    <ShieldCheck className="h-5 w-5" /> Quản trị hệ thống
                  </button>
                )}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
