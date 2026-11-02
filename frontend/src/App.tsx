import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Auth from "./components/Auth";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import ProductDetail from "./components/ProductDetail";
import Cart from "./components/Cart";
import AdminDashboard from "./components/AdminDashboard";
import AIChatbot from "./components/AIChatbot";


function ProtectedLayout({ onLogout }: { onLogout: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);

  useEffect(() => {
    if (location.pathname !== "/") {
      setShowAdminDashboard(false);
    }
  }, [location.pathname]);

  return (
    <>
      <Navbar
        onLogout={onLogout}
        onHome={() => setShowAdminDashboard(false)}
        onAdminDashboard={() => {
          setShowAdminDashboard(true);
          navigate("/");
        }}
      />
      <Routes>
        <Route
          path="/"
          element={showAdminDashboard ? <AdminDashboard /> : <Home />}
        />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function AppRoutes() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => Boolean(localStorage.getItem("token")),
  );
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/login", { replace: true });
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isLoggedIn ? (
            <Navigate to="/" replace />
          ) : (
            <Auth
              onLoginSuccess={() => {
                setIsLoggedIn(true);
                navigate("/", { replace: true });
              }}
            />
          )
        }
      />
      <Route
        path="/*"
        element={
          isLoggedIn ? (
            <ProtectedLayout onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-900 selection:bg-cyan-500/30">
        <AppRoutes />
        <AIChatbot />
      </div>
    </BrowserRouter>
  );
}

export default App;
