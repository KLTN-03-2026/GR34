import { useEffect, useState, useRef } from "react";
import { Bell, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getNotificationStyle } from "../utils/notificationHelper";
import API from "../services/api";
import { io } from "socket.io-client";


const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
const socket = io(SOCKET_URL, { transports: ["websocket"] });

// Custom Toast với progress bar countdown
const ToastNotification = ({ message, duration = 6000, onClose }) => {
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const remainingTimeRef = useRef(duration);

  useEffect(() => {
    let lastTime = Date.now();
    
    const interval = setInterval(() => {
      const now = Date.now();
      if (!isPaused) {
        const elapsed = now - lastTime;
        remainingTimeRef.current -= elapsed;
        
        const currentProgress = Math.max(0, (remainingTimeRef.current / duration) * 100);
        setProgress(currentProgress);
        
        if (remainingTimeRef.current <= 0) {
          clearInterval(interval);
          onClose();
        }
      }
      lastTime = now;
    }, 16);
    
    return () => clearInterval(interval);
  }, [duration, isPaused, onClose]);
  
  const getProgressColor = () => {
    if (progress > 60) return "bg-green-500";
    if (progress > 30) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden w-80"
      style={{ zIndex: 99999 }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Progress bar ở dưới */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100">
        <div
          className={`h-full transition-colors duration-300 ${getProgressColor()}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Nội dung toast */}
      <div className="p-4 flex items-start gap-3">
        <div className={`p-2 rounded-full shrink-0 flex items-center justify-center ${getNotificationStyle(message, false).toastIconBg}`}>
          {getNotificationStyle(message, false).icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 text-sm">Thông báo mới!</p>
          <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">{message}</p>
          <p className="text-xs text-gray-400 mt-1">
            {Math.ceil((progress / 100) * (duration / 1000))}s
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
        >
          ✕
        </button>
      </div>
    </motion.div>
  );
};

// Thông báo cho tài xế
export default function DriverNotifications({ driverId }) {
  const [show, setShow] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [hasNew, setHasNew] = useState(false);
  const [toasts, setToasts] = useState([]);
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
      const unread = res.data.filter((n) => !n.is_read).length;
      setHasNew(unread > 0);
    } catch (err) {
    }
  };


  useEffect(() => {
    if (driverId) fetchNotifications();
  }, [driverId]);


  useEffect(() => {
    if (!driverId) return;
    socket.emit("registerDriver", driverId);

    const handleRealtimeNotification = (notif) => {
      const newNotification = {
        id: Date.now(),
        message: notif.message || "Bạn có thông báo mới!",
        is_read: 0,
        created_at: notif.created_at || new Date().toISOString(),
      };
      
      setHasNew(true);
      setNotifications((prev) => [newNotification, ...prev]);
      
      // Hiện toast popup với countdown 30 giây
      const toastId = `toast-${Date.now()}`;
      setToasts((prev) => [...prev, { id: toastId, message: newNotification.message }]);
    };

    socket.on("newAssignment", handleRealtimeNotification);
    socket.on("newNotification", handleRealtimeNotification);

    return () => {
      socket.off("newAssignment", handleRealtimeNotification);
      socket.off("newNotification", handleRealtimeNotification);
    };
  }, [driverId]);

  // Xóa toast khi hết giờ hoặc user đóng
  const removeToast = (toastId) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  };


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
      {/* Container hiển thị toasts - đặt z-index cao nhất */}
      <div className="fixed top-20 right-4 z-[99999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <div key={t.id} className="pointer-events-auto">
              <ToastNotification
                message={t.message}
                duration={t.duration || 6000}
                onClose={() => removeToast(t.id)}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>

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
                notifications.map((n) => {
                  const style = getNotificationStyle(n.message, n.is_read);
                  return (
                    <div
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      className={`p-4 border-b border-gray-50 cursor-pointer transition-all flex gap-3 ${style.hoverClass} ${style.bgClass}`}
                    >
                      <div className="shrink-0 mt-1">
                        <div className={`p-2 rounded-full flex items-center justify-center ${style.iconContainerClass}`}>
                          {style.icon}
                        </div>
                      </div>
                      <div>
                        <p className={`text-sm leading-snug ${style.textClass}`}>
                          {n.message}
                        </p>
                        <span className="text-[11px] text-gray-400 mt-1 block">
                          {new Date(n.created_at).toLocaleString("vi-VN")}
                        </span>
                      </div>
                    </div>
                  );
                })
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