// file này chỉ để demo login react không liên quan tới BE
// import { createContext, useContext, useEffect, useState } from "react";
// import api from "../services/api";

// const AuthContext = createContext(null);
// export const useAuth = () => useContext(AuthContext);

// export default function AuthProvider({ children }) {
//   const [user, setUser] = useState(() => {
//     const u = localStorage.getItem("user");
//     return u ? JSON.parse(u) : null;
//   });
//   const [loading, setLoading] = useState(false);

//   const login = async (email, password) => {
//     setLoading(true);
//     try {
//       const { data } = await api.post("/auth/login", { email, password });
//       localStorage.setItem("token", data.token);
//       localStorage.setItem("user", JSON.stringify(data.user));
//       setUser(data.user);
//       return { ok: true, user: data.user };
//     } catch (e) {
//       return { ok: false, error: e?.response?.data?.error || e.message };
//     } finally {
//       setLoading(false);
//     }
//   };

//   const register = async (payload) => {
//     setLoading(true);
//     try {
//       const { data } = await api.post("/auth/register", payload);
//       return { ok: true, data };
//     } catch (e) {
//       return { ok: false, error: e?.response?.data?.error || e.message };
//     } finally {
//       setLoading(false);
//     }
//   };

//   const logout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     setUser(null);
//     window.location.href = "/login";
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, register, logout, loading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }
