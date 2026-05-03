import { useEffect, useState, useRef } from "react";
import { Bell, Package, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../services/api";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
const socket = io(SOCKET_URL, { transports: ["websocket"] });

// Thông báo cho khách hàng
export default function CustomerNotifications({ customerId }) {
  const [show, setShow] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [hasNew, setHasNew] = useState(false);
  const dropdownRef = useRef(null);

// Tải danh sách thông báo
  const fetchNotifications = async () => {
    try {
      const res = await API.get(`/notifications/customer/${customerId}`);
      setNotifications(res.data);
    } catch (err) {
    }
  };

  useEffect(() => {
    if (customerId) fetchNotifications();
  }, [customerId]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShow(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!customerId) return;

    socket.emit("joinCustomer", customerId);

    socket.on("newCustomerNotification", (notif) => {
      setHasNew(true);
      setNotifications((prev) => [
        {
          id: Date.now(),
          message: notif.message,
          is_read: 0,
          created_at: notif.created_at,
        },
        ...prev,
      ]);
    });

    return () => socket.off("newCustomerNotification");
  }, [customerId]);

// Đánh dấu thông báo đã đọc
  const markAsRead = async (id, isRead) => {
    if (isRead) return;
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
      );
    } catch (err) {
    }
  };

// Đánh dấu tất cả thông báo đã đọc
  const markAllAsRead = async () => {
    try {
      await API.put(`/notifications/customer/${customerId}/read-all`);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
      setHasNew(false);
    } catch (err) {
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="relative select-none" ref={dropdownRef}>
      {}
      <motion.button
        whileTap={{ scale: 0.9 }}
        animate={hasNew ? { rotate: [0, -15, 15, -15, 15, 0] } : {}}
        transition={{ duration: 0.6 }}
        onClick={() => {
          setShow(!show);
          setHasNew(false);
          if (!show) fetchNotifications();
        }}
        className="relative p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-full transition-all"
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

      {}
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
                Thông báo của bạn
                {unreadCount > 0 && (
                  <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {unreadCount} mới
                  </span>
                )}
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
                >
                  <CheckCircle2 size={14} /> Đọc tất cả
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto no-scrollbar bg-white rounded-b-2xl">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markAsRead(n.id, n.is_read)}
                    className={`p-4 border-b border-gray-50 cursor-pointer transition-all flex gap-3 hover:bg-orange-100 ${
                      n.is_read
                        ? "bg-white text-gray-600"
                        : "bg-orange-50 text-[#113e48]"
                    }`}
                  >
                    <div className="shrink-0 mt-1">
                      <div
                        className={`p-2 rounded-full ${
                          n.is_read
                            ? "bg-gray-100 text-gray-400"
                            : "bg-orange-100 text-orange-500"
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
