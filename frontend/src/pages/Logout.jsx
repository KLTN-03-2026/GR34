import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Xử lý đăng xuất
export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {

    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");


    navigate("/login");
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-blue-50">
      <p className="text-blue-700 text-lg font-semibold">Đang đăng xuất...</p>
    </div>
  );
}
