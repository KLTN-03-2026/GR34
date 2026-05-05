import { useEffect, useState, useRef } from "react";
import { Bell, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../services/api";
import { io } from "socket.io-client";


const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
const socket = io(SOCKET_URL, { transports: ["websocket"] });

// Thông báo cho tài xế
export default function DriverNotifications({ driverId }) {
  const [show, setShow] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [hasNew, setHasNew] = useState(false);
  const dropdownRef = useRef(null);


  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShow(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


// Tải danh sách thông báo
  const fetchNotifications = async () => {
    try {
      const res = await API.get(`/notifications/driver/${driverId}`);
      setNotifications(res.data);
    } catch (err) {
    }
  };


  useEffect(() => {
    if (driverId) fetchNotifications();
  }, [driverId]);


  useEffect(() => {
    if (!driverId) return;
    socket.emit("registerDriver", driverId);

    const handleRealtimeNotification = () => {
      setHasNew(true);
      fetchNotifications();
    };

    socket.on("newAssignment", handleRealtimeNotification);
    socket.on("newNotification", handleRealtimeNotification);

    return () => {
      socket.off("newAssignment", handleRealtimeNotification);
      socket.off("newNotification", handleRealtimeNotification);
    };
  }, [driverId]);


// Đánh dấu thông báo đã đọc
  const markAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
      );
    } catch (err) {
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="relative select-none" ref={dropdownRef}>
      {/* Phần giao diện */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        animate={hasNew ? { rotate: [0, -15, 15, -15, 15, 0] } : {}}
        transition={{ duration: 0.6 }}
        onClick={() => {
          setShow(!show);
          setHasNew(false);
          if (!show) fetchNotifications();
        }}
        className="relative p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-all"
        title="Thông báo"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <motion.span
            layoutId="dot"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"
          />
        )}
      </motion.button>

      {/* Phần giao diện */}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden z-50 transform origin-top-right"
          >
            <div className="p-4 border-b border-gray-100 font-semibold text-[#113e48] bg-gray-50 flex justify-between items-center">
              <span className="flex items-center gap-2">
                Thông báo tài xế
                {unreadCount > 0 && (
                  <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {unreadCount} mới
                  </span>
                )}
              </span>
              <button
                onClick={fetchNotifications}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Làm mới
              </button>
            </div>

            <div className="max-h-[400px] overflow-y-auto no-scrollbar bg-white rounded-b-2xl">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    className={`p-4 border-b border-gray-50 cursor-pointer transition-all flex gap-3 hover:bg-blue-100 ${
                      n.is_read
                        ? "bg-white text-gray-600"
                        : "bg-blue-50 text-[#113e48]"
                    }`}
                  >
                    <div className="shrink-0 mt-1">
                      <div
                        className={`p-2 rounded-full ${
                          n.is_read
                            ? "bg-gray-100 text-gray-400"
                            : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        <Package size={16} />
                      </div>
                    </div>
                    <div>
                      <p
                        className={`text-sm leading-snug ${
                          n.is_read
                            ? "text-gray-600"
                            : "text-[#113e48] font-semibold tracking-tight"
                        }`}
                      >
                        {n.message}
                      </p>
                      <span className="text-[11px] text-gray-400 mt-1 block">
                        {new Date(n.created_at).toLocaleString("vi-VN")}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-gray-400 text-sm text-center flex flex-col items-center gap-2">
                  <Bell size={24} className="text-gray-300" />
                  Không có thông báo nào.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}