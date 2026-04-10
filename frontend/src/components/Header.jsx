import React from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");
  //đăng xuất trở lại trang login
  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const goToDashboard = () => {
    if (!user?.role) {
      navigate("/login");
    } else if (user.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/customer");
    }
  };

  return (
    <header className="w-full border-b bg-white sticky top-0 z-50 shadow">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <h1
          onClick={() => navigate("/")}
          className="font-extrabold text-xl cursor-pointer select-none"
        >
          🚚 <span className="text-blue-600">SpeedyShip</span>
        </h1>

        {/* User menu */}
        <div className="flex items-center gap-3">
          {token && user?.name ? (
            <>
              <span className="text-sm text-gray-700 font-medium">
                👋 Xin chào,{" "}
                <span className="text-blue-600 font-semibold">{user.name}</span>{" "}
                ({user.role})
              </span>

              <button
                onClick={goToDashboard}
                className="px-3 py-1.5 rounded-md bg-yellow-400 hover:bg-yellow-500 text-black text-sm font-semibold transition"
              >
                🧭 Trung tâm
              </button>

              <button
                onClick={logout}
                className="px-3 py-1.5 rounded-md bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition"
              >
                🚪 Đăng xuất
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition"
            >
              🔐 Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
