import { CheckCircle, Truck, XCircle, Package } from "lucide-react";

export const getNotificationStyle = (message, isRead) => {
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.includes("đã giao") || lowerMsg.includes("hoàn thành")) {
    return {
      icon: <CheckCircle size={16} />,
      bgClass: isRead ? "bg-white text-gray-600" : "bg-green-50 text-green-800",
      iconContainerClass: isRead ? "bg-gray-100 text-gray-400" : "bg-green-100 text-green-600",
      textClass: isRead ? "text-gray-600" : "text-green-800 font-semibold tracking-tight",
      hoverClass: "hover:bg-green-100",
      toastIconBg: "bg-green-100 text-green-600"
    };
  }
  
  if (lowerMsg.includes("lấy hàng") || lowerMsg.includes("đang giao") || lowerMsg.includes("phân công") || lowerMsg.includes("đang trên đường")) {
    return {
      icon: <Truck size={16} />,
      bgClass: isRead ? "bg-white text-gray-600" : "bg-blue-50 text-blue-800",
      iconContainerClass: isRead ? "bg-gray-100 text-gray-400" : "bg-blue-100 text-blue-600",
      textClass: isRead ? "text-gray-600" : "text-blue-800 font-semibold tracking-tight",
      hoverClass: "hover:bg-blue-100",
      toastIconBg: "bg-blue-100 text-blue-600"
    };
  }
  
  if (lowerMsg.includes("hủy") || lowerMsg.includes("thất bại")) {
    return {
      icon: <XCircle size={16} />,
      bgClass: isRead ? "bg-white text-gray-600" : "bg-red-50 text-red-800",
      iconContainerClass: isRead ? "bg-gray-100 text-gray-400" : "bg-red-100 text-red-600",
      textClass: isRead ? "text-gray-600" : "text-red-800 font-semibold tracking-tight",
      hoverClass: "hover:bg-red-100",
      toastIconBg: "bg-red-100 text-red-600"
    };
  }
  
  // Default (Created, Wallet, etc)
  return {
    icon: <Package size={16} />,
    bgClass: isRead ? "bg-white text-gray-600" : "bg-orange-50 text-[#113e48]",
    iconContainerClass: isRead ? "bg-gray-100 text-gray-400" : "bg-orange-100 text-orange-500",
    textClass: isRead ? "text-gray-600" : "text-[#113e48] font-semibold tracking-tight",
    hoverClass: "hover:bg-orange-100",
    toastIconBg: "bg-orange-100 text-orange-600"
  };
};
