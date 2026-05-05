import { Navigate, Outlet } from "react-router-dom";

// Route bảo vệ yêu cầu đăng nhập
const ProtectedRoute = ({ allowedRoles, children }) => {
  const token = localStorage.getItem("token");
  const rawRole = localStorage.getItem("role");
  const userRole = rawRole ? rawRole.trim().toLowerCase() : "";


  if (!token) {
    return <Navigate to="/login" replace />;
  }


  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }


  return children ? children : <Outlet />;
};

export default ProtectedRoute;
