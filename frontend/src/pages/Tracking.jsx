import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import API from "../services/api";
import Map, {
  Marker,
  Source,
  Layer,
  NavigationControl,
} from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  FaSearch,
  FaBoxOpen,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaCalendarAlt,
  FaTruck,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
} from "react-icons/fa";
import { AlertTriangle } from "lucide-react";


const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;


const CustomMarker = ({ icon, bgColor, ringColor, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="relative w-10 h-10 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-200"
    >
      <div
        className={`absolute inset-0 rounded-full opacity-30 animate-ping ${ringColor}`}
      ></div>
      <div
        className={`relative z-10 w-10 h-10 flex items-center justify-center rounded-full text-white shadow-xl border-2 border-white ${bgColor}`}
      >
        {icon}
      </div>
      <div
        className={`absolute -bottom-1 w-3 h-3 transform rotate-45 ${bgColor} border-r-2 border-b-2 border-white z-0`}
      ></div>
    </div>
  );
};

// Tra cứu đơn hàng công khai
export default function Tracking() {
  const [searchParams] = useSearchParams();

  const [code, setCode] = useState("");
  const [last4, setLast4] = useState("");
  const [shipment, setShipment] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);


  const [driverPos, setDriverPos] = useState(null);
  const [routeGeoJSON, setRouteGeoJSON] = useState(null);
  const [pickup, setPickup] = useState(null);
  const [delivery, setDelivery] = useState(null);

  const animationRef = useRef(null);
  const mapRef = useRef(null);
  const miniBarRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    window.scrollTo(0, 0);
    let rafId;
    const handleScroll = () => {
      rafId = requestAnimationFrame(() => {
        if (!miniBarRef.current) return;
        const scrollY = window.scrollY;
        if (scrollY > 380) {
          miniBarRef.current.style.opacity = "1";
          miniBarRef.current.style.transform = "translateY(0%)";
        } else {
          miniBarRef.current.style.opacity = "0";
          miniBarRef.current.style.transform = "translateY(-110%)";
        }
        if (imgRef.current) {
          const progress = Math.min(scrollY / 600, 1);
          imgRef.current.style.transform = `scale(${1 - progress * 0.12})`;
          imgRef.current.style.opacity = 1 - progress * 0.5;
        }
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Auto-submit khi có code + last4 từ URL
  useEffect(() => {
    const codeParam = searchParams.get("code") || "";
    const last4Param = searchParams.get("last4") || "";
    if (codeParam && last4Param) {
      setCode(codeParam);
      setLast4(last4Param);
      setTimeout(() => handleSearch(codeParam, last4Param), 50);
    }
  }, []);


  const getStatusInfo = (status) => {
    if (!status)
      return {
        text: "Không xác định",
        color: "text-gray-500",
        bg: "bg-gray-100",
        icon: <FaClock />,
      };
    const s = status.toLowerCase();
    if (s === "pending" || s === "created" || s.includes("chờ lấy"))
      return {
        text: "Chờ lấy hàng",
        color: "text-blue-600",
        bg: "bg-blue-50",
        icon: <FaClock />,
      };
    if (s === "assigned")
      return {
        text: "Đã phân công",
        color: "text-cyan-600",
        bg: "bg-cyan-50",
        icon: <FaTruck />,
      };
    if (s === "picking" || s.includes("picked") || s.includes("taking") || s === "đã lấy hàng")
      return {
        text: "Đang lấy hàng",
        color: "text-indigo-600",
        bg: "bg-indigo-50",
        icon: <FaBoxOpen />,
      };
    if (s === "delivering" || s.includes("transit") || s.includes("shipping") || s === "đang vận chuyển")
      return {
        text: "Đang giao hàng",
        color: "text-sky-600",
        bg: "bg-sky-50",
        icon: <FaTruck />,
      };
    if (s === "delivered" || s === "completed" || s === "success" || s.includes("giao thành công"))
      return {
        text: "Giao thành công",
        color: "text-green-600",
        bg: "bg-green-50",
        icon: <FaCheckCircle />,
      };
    if (s === "failed" || s.includes("thất bại"))
      return {
        text: "Giao thất bại",
        color: "text-red-600",
        bg: "bg-red-50",
        icon: <FaTimesCircle />,
      };
    if (s === "returning" || s.includes("hoàn hàng"))
      return {
        text: "Đang hoàn hàng",
        color: "text-purple-600",
        bg: "bg-purple-50",
        icon: <FaTruck />,
      };
    if (s === "returned" || s.includes("đã hoàn"))
      return {
        text: "Đã hoàn hàng",
        color: "text-purple-700",
        bg: "bg-purple-100",
        icon: <FaCheckCircle />,
      };
    if (s.includes("cancel") || s === "đã hủy")
      return {
        text: "Đã hủy",
        color: "text-red-700",
        bg: "bg-red-100",
        icon: <FaTimesCircle />,
      };
    // Fallback
    return {
      text: status,
      color: "text-[#113e48]",
      bg: "bg-gray-100",
      icon: <FaBoxOpen />,
    };
  };

  // Helper functions cho timeline
  const stepStatuses = {
    pickup: ["assigned", "picking", "delivering", "delivered", "completed", "success"],
    delivery: ["picking", "delivering", "delivered", "completed", "success"],
    completed: ["delivered", "completed", "success"],
  };

  const isStepActive = (step) => stepStatuses[step]?.includes(shipment?.status) || false;

  const getProgressWidth = () => {
    const status = shipment?.status;
    if (status === "pending" || status === "created") return 0;
    if (status === "assigned") return 33;
    if (status === "picking") return 66;
    if (["delivering", "delivered", "completed", "success"].includes(status)) return 100;
    return 0;
  };

  const getProgressColor = () => "#16a34a";


  const fetchRouteOSRM = async (start, end) => {
    if (!start || !end) return null;
    const startStr = `${start[1]},${start[0]}`;
    const endStr = `${end[1]},${end[0]}`;
    const daNang = "108.2022,16.0544";
    const nhaTrang = "109.1967,12.2388";

    const latDiff = Math.abs(start[0] - end[0]);
    let url = "";


    if (latDiff > 2) {
      url = `https://router.project-osrm.org/route/v1/driving/${startStr};${daNang};${nhaTrang};${endStr}?overview=full&geometries=geojson`;
    } else {
      url = `https://router.project-osrm.org/route/v1/driving/${startStr};${endStr}?overview=full&geometries=geojson`;
    }

    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.code === "Ok" && data.routes.length > 0) {
        return { type: "Feature", geometry: data.routes[0].geometry };
      }
    } catch (error) {
    }
    return null;
  };


// Xử lý tìm kiếm
  const handleSearch = async (overrideCode, overrideLast4) => {
    const urlCode = searchParams.get("code") || "";
    const urlLast4 = searchParams.get("last4") || "";
    const searchCode = overrideCode !== undefined ? overrideCode : (urlCode || code);
    const searchLast4 = overrideLast4 !== undefined ? overrideLast4 : (urlLast4 || last4);

    setError("");
    setSuccess("");
    setShipment(null);
    setRouteGeoJSON(null);
    setDriverPos(null);
    if (animationRef.current) clearInterval(animationRef.current);

    if (!searchCode.trim()) {
      setError("Vui lòng nhập mã vận đơn!");
      return;
    }

    const customerId = localStorage.getItem("customer_id");
    setLoading(true);

    try {
      let url = `/customers/track/${searchCode.trim()}`;
      if (customerId) {
        url += `?customer_id=${customerId}`;
      } else {
        if (!searchLast4 || searchLast4.length !== 4) {
          setError("Vui lòng nhập 4 số cuối SĐT người nhận!");
          setLoading(false);
          return;
        }
        url += `?last4=${searchLast4.trim()}`;
      }

      const res = await API.get(url);
      if (!res.data) {
        setError("Không tìm thấy đơn hàng!");
        return;
      }

      const data = res.data;
      setShipment(data);
      setSuccess("Tra cứu thành công!");


      let pk =
        data.pickup_lat && data.pickup_lng
          ? [Number(data.pickup_lat), Number(data.pickup_lng)]
          : [16.0471, 108.2068];
      let dl =
        data.delivery_lat && data.delivery_lng
          ? [Number(data.delivery_lat), Number(data.delivery_lng)]
          : [10.7769, 106.7009];

      setPickup(pk);
      setDelivery(dl);


      if (data.status === "picking" || data.status === "delivering") {
        const geoJson = await fetchRouteOSRM(pk, dl);
        setRouteGeoJSON(geoJson);
      } else if (
        data.status === "completed" ||
        data.status === "delivered" ||
        data.status === "success"
      ) {
        setDriverPos(dl);
        setRouteGeoJSON(null);
      } else {
        setDriverPos(null);
        setRouteGeoJSON(null);
      }
    } catch (err) {
      setError("Mã vận đơn không hợp lệ hoặc không có quyền!");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (
      !routeGeoJSON ||
      !routeGeoJSON.geometry ||
      !routeGeoJSON.geometry.coordinates
    )
      return;

    const pathCoordinates = routeGeoJSON.geometry.coordinates;
    let index = 0;
    const totalPoints = pathCoordinates.length;


    animationRef.current = setInterval(() => {
      if (index >= totalPoints) index = 0;
      const point = pathCoordinates[index];
      setDriverPos([point[1], point[0]]);
      index += 1;
    }, 800);

    return () => clearInterval(animationRef.current);
  }, [routeGeoJSON]);


  useEffect(() => {
    if (!mapRef.current) return;

    const points = [];
    if (pickup) points.push([pickup[1], pickup[0]]);
    if (delivery) points.push([delivery[1], delivery[0]]);
    if (driverPos) points.push([driverPos[1], driverPos[0]]);
    if (points.length === 0) return;

    if (points.length === 1) {
      mapRef.current.flyTo({ center: points[0], zoom: 14, duration: 1200 });
    } else {
      const lngs = points.map(p => p[0]);
      const lats = points.map(p => p[1]);
      mapRef.current.fitBounds(
        [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
        { padding: 40, duration: 1500, maxZoom: 15 }
      );
    }
  }, [routeGeoJSON, pickup, delivery, driverPos, shipment?.status]);


  const statusInfo = shipment ? getStatusInfo(shipment.status) : null;

  return (
    <div className="font-sans bg-slate-50 min-h-screen text-slate-700">
      {/* Thanh mini */}
      <div
        ref={miniBarRef}
        className="fixed top-[65px] left-0 right-0 z-30 h-16 bg-[#113e48]/97 backdrop-blur-md shadow-xl px-6 flex items-center"
        style={{ opacity: 0, transform: "translateY(-110%)", transition: "opacity 0.4s ease, transform 0.4s ease" }}
      >
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
          <span className="text-orange-300 font-bold text-sm tracking-widest uppercase whitespace-nowrap">
            Tra Cứu Đơn Hàng — Realtime Tracking
          </span>
          <div className="flex items-center gap-3">
            {[
              { num: "24/7", label: "Theo dõi" },
              { num: "GPS", label: "Realtime" },
              { num: "100%", label: "Minh bạch" },
              { num: "5M+", label: "Đơn/Năm" },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-1.5 bg-indigo-400/20 backdrop-blur-sm border border-indigo-200/20 rounded-full px-3 py-1">
                <span className="text-white font-extrabold text-sm leading-none">{s.num}</span>
                <span className="text-white/70 text-xs hidden sm:block">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Banner ảnh */}
      <section className="w-full overflow-hidden banner-entrance">
        <img
          ref={imgRef}
          src="/assets/img/tracking_banner.png"
          alt="Tracking Banner"
          className="w-full block object-contain"
          style={{ transformOrigin: "top center", willChange: "transform, opacity" }}
        />
      </section>

      {/* Phần đầu trang */}
      <section
        className="relative overflow-hidden py-16 px-6"
        style={{ background: "linear-gradient(135deg, #0f2027 0%, #113e48 50%, #203a43 100%)" }}
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative max-w-4xl mx-auto text-center">
          <span className="inline-block py-1.5 px-4 rounded-full bg-white/10 border border-white/20 text-orange-400 text-sm font-bold mb-6 uppercase tracking-wider backdrop-blur-md" data-aos="fade-down">
            Realtime Tracking System
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 text-white" data-aos="fade-up">
            Tra Cứu Hành Trình Đơn Hàng
          </h1>
          <p className="text-blue-100 text-lg mb-10" data-aos="fade-up" data-aos-delay="100">
            Theo dõi vị trí thực tế và trạng thái đơn hàng của bạn mọi lúc, mọi nơi.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto" data-aos="fade-up" data-aos-delay="200">
            {[
              { num: "24/7", label: "Theo dõi", sub: "Không ngừng nghỉ", color: "from-indigo-400/25 to-indigo-600/15" },
              { num: "GPS", label: "Realtime", sub: "Cập nhật liên tục", color: "from-blue-400/25 to-blue-600/15" },
              { num: "100%", label: "Minh bạch", sub: "Lộ trình rõ ràng", color: "from-violet-400/25 to-violet-600/15" },
              { num: "5M+", label: "Đơn/Năm", sub: "Tin tưởng bởi", color: "from-indigo-500/25 to-blue-700/15" },
            ].map((s, i) => (
              <div key={i} className={`bg-gradient-to-br ${s.color} backdrop-blur-md border border-white/10 rounded-2xl p-4 hover:-translate-y-1 transition-all shadow-lg`} data-aos="zoom-in" data-aos-delay={i * 80}>
                <div className="text-2xl font-extrabold text-white mb-1">{s.num}</div>
                <div className="text-sm font-bold text-white/90">{s.label}</div>
                <div className="text-xs text-white/60 mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Khối nội dung */}
      <section className="-mt-16 relative z-20 px-6">
        <div
          className="max-w-3xl mx-auto bg-white p-6 rounded-3xl shadow-xl border border-gray-100"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-5 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaBoxOpen className="text-gray-400" />
              </div>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                placeholder="Mã vận đơn (VD: SP123)"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-bold text-gray-700"
              />
            </div>

            {!localStorage.getItem("role") && (
              <div className="md:col-span-4 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaPhoneAlt className="text-gray-400" />
                </div>
                <input
                  value={last4}
                  onChange={(e) => setLast4(e.target.value.replace(/\D/g, ""))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch();
                  }}
                  maxLength={4}
                  placeholder="4 số cuối SĐT nhận"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-bold text-gray-700"
                />
              </div>
            )}

            <div
              className={`${
                !localStorage.getItem("role")
                  ? "md:col-span-3"
                  : "md:col-span-7"
              }`}
            >
              <button
                onClick={() => handleSearch()}
                disabled={loading}
                className={`w-full h-full py-3 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-orange-500 to-red-500 hover:shadow-orange-500/30 hover:-translate-y-1"
                }`}
              >
                {loading ? (
                  "Đang xử lý..."
                ) : (
                  <>
                    <FaSearch /> Tra cứu ngay
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium flex items-center gap-2 animate-pulse">
              <AlertTriangle className="w-4 h-4" /> {error}
            </div>
          )}
          {success && (
            <div className="mt-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm font-medium flex items-center gap-2">
              {success}
            </div>
          )}
        </div>
      </section>

      {/* Hiển thị có điều kiện */}
      {shipment && statusInfo && (
        <section className="py-8 px-4 md:px-6 max-w-7xl mx-auto">
          {/* Layout: Cột trái + Bản đồ bằng nhau */}
          <div className="flex flex-col lg:flex-row gap-5 items-stretch">

            {/* ─── CỘT TRÁI: Thông tin ─── */}
            <div className="lg:w-[320px] xl:w-[360px] shrink-0 space-y-4" data-aos="slide-right">

              {/* Trạng thái */}
              <div
                className="p-4 rounded-xl border-l-4 bg-white shadow-sm"
                style={{
                  borderLeftColor: statusInfo.bg.includes("blue") ? "#2563eb" :
                    statusInfo.bg.includes("cyan") ? "#0891b2" :
                    statusInfo.bg.includes("indigo") ? "#4f46e5" :
                    statusInfo.bg.includes("sky") ? "#0284c7" :
                    statusInfo.bg.includes("green") ? "#16a34a" :
                    statusInfo.bg.includes("red") ? "#dc2626" :
                    statusInfo.bg.includes("purple") ? "#7c3aed" : "#6b7280"
                }}
              >
                <div className="flex items-center gap-2">
                  <span className={`flex items-center gap-2 text-xl font-black ${statusInfo.color}`}>
                    {statusInfo.icon} {statusInfo.text}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 mt-2 flex items-center gap-1">
                  <FaCalendarAlt size={10} /> {new Date(shipment.created_at).toLocaleString("vi-VN")}
                </p>
              </div>

              {/* Timeline */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold text-[#113e48] mb-4 flex items-center gap-2">
                  <FaClock className="text-orange-500" /> Tiến trình vận chuyển
                </h3>
                <div className="flex items-start justify-between w-full relative px-2">
                  <div className="absolute top-5 left-0 w-full h-1 bg-gray-100 -z-10 rounded-full"></div>
                  <div
                    className="absolute top-5 left-0 h-1.5 bg-green-500 transition-all duration-700 ease-out -z-10 rounded-full"
                    style={{ width: `${getProgressWidth()}%` }}
                  ></div>
                  {[
                    { label: "Đặt hàng", icon: <FaBoxOpen size={16} /> },
                    { label: "Lấy hàng", icon: <FaBoxOpen size={16} /> },
                    { label: "Đang giao", icon: <FaTruck size={16} /> },
                    { label: "Hoàn thành", icon: <FaCheckCircle size={16} /> },
                  ].map((step, index) => {
                    const isActive = index === 0
                      ? true
                      : index === 1 ? isStepActive("pickup")
                      : index === 2 ? isStepActive("delivery")
                      : isStepActive("completed");
                    return (
                      <div key={index} className="flex flex-col items-center flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 bg-white ${
                          isActive ? "border-green-500 text-green-600 shadow-md bg-green-50" : "border-gray-200 text-gray-300"
                        }`}>
                          {step.icon}
                        </div>
                        <p className={`mt-2 text-[11px] font-bold text-center leading-tight ${isActive ? "text-[#113e48]" : "text-gray-400"}`}>
                          {step.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Thông tin kiện hàng */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold text-[#113e48] mb-4 flex items-center gap-2">
                  <FaBoxOpen className="text-orange-500" /> Thông tin vận đơn
                </h3>
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-xs">Mã đơn</span>
                    <span className="font-extrabold text-[#113e48] text-base tracking-wide">{shipment.tracking_code}</span>
                  </div>
                  {shipment.service_type && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-xs">Dịch vụ</span>
                      <span className={`font-bold px-2.5 py-1 rounded-full text-xs ${
                        shipment.service_type === "fast" ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                        : shipment.service_type === "express" ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                      }`}>
                        {shipment.service_type === "fast" ? "Hỏa tốc" : shipment.service_type === "express" ? "Giao nhanh" : "Tiết kiệm"}
                      </span>
                    </div>
                  )}
                  {shipment.item_name && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-xs">Tên hàng</span>
                      <span className="font-bold text-[#113e48] text-xs text-right max-w-[55%]">{shipment.item_name}</span>
                    </div>
                  )}
                  {(shipment.quantity || shipment.weight_kg) && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-xs">Số lượng</span>
                      <span className="font-bold text-[#113e48] text-xs">
                        {shipment.quantity ? `${shipment.quantity} kiện` : ""}
                        {shipment.quantity && shipment.weight_kg ? " · " : ""}
                        {shipment.weight_kg ? `${shipment.weight_kg} kg` : ""}
                      </span>
                    </div>
                  )}
                  <div className="h-px bg-gray-100 my-1"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-xs">Người gửi</span>
                    <span className="font-bold text-[#113e48] text-xs">{shipment.sender_name}</span>
                  </div>
                  {shipment.sender_phone && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-xs">SĐT gửi</span>
                      <span className="font-bold text-[#113e48] text-xs">{shipment.sender_phone}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-xs">Người nhận</span>
                    <span className="font-bold text-[#113e48] text-xs">{shipment.receiver_name}</span>
                  </div>
                  {shipment.receiver_phone && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-xs">SĐT nhận</span>
                      <span className="font-bold text-[#113e48] text-xs">{shipment.receiver_phone}</span>
                    </div>
                  )}
                  <div className="h-px bg-gray-100 my-1"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-xs">Thu hộ (COD)</span>
                    <span className="font-bold text-green-600 text-sm">
                      {parseInt(shipment.cod_amount || 0).toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  {shipment.shipping_fee && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-xs">Phí vận chuyển</span>
                      <span className="font-bold text-orange-600 text-sm">
                        {parseInt(shipment.shipping_fee || 0).toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  )}
                  {shipment.payment_method && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-xs">Thanh toán</span>
                      <span className="font-bold text-[#113e48] uppercase text-xs">
                        {shipment.payment_method === "COD" ? "COD" : shipment.payment_method === "wallet" ? "Ví điện tử" : "Thanh toán online"}
                      </span>
                    </div>
                  )}
                  <div className="h-px bg-gray-100 my-1"></div>
                  <div className="flex gap-2 items-start">
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
                      <FaBoxOpen size={12} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Từ</p>
                      <p className="text-xs font-bold text-[#113e48] leading-snug">{shipment.sender_name}</p>
                      <p className="text-[10px] text-gray-500 leading-relaxed mt-0.5">{shipment.pickup_address}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 items-start">
                    <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0 mt-0.5">
                      <FaMapMarkerAlt size={12} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Đến</p>
                      <p className="text-xs font-bold text-[#113e48] leading-snug">{shipment.receiver_name}</p>
                      <p className="text-[10px] text-gray-500 leading-relaxed mt-0.5">{shipment.delivery_address}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tài xế */}
              {shipment.driver_name && (
                <div className="bg-[#113e48] p-4 rounded-xl text-white flex items-center gap-3 shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-lg font-bold shrink-0">
                    {shipment.driver_name?.charAt(0)?.toUpperCase() || "T"}
                  </div>
                  <div>
                    <p className="text-[10px] text-blue-200 uppercase font-bold">Tài xế</p>
                    <p className="font-bold text-base leading-tight">{shipment.driver_name}</p>
                  </div>
                </div>
              )}
            </div>

            {/* ─── CỘT PHẢI: Bản đồ ─── */}
            <div className="flex-1 min-h-[480px] lg:min-h-0 relative" data-aos="slide-left">
              {/* Container bản đồ */}
              <div className="absolute inset-0 bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-lg">
                <Map
                  ref={mapRef}
                  initialViewState={{
                    longitude: 106.7,
                    latitude: 10.8,
                    zoom: 7,
                  }}
                  style={{ width: "100%", height: "100%" }}
                  mapStyle="mapbox://styles/mapbox/streets-v12"
                  mapboxAccessToken={MAPBOX_TOKEN}
                  onLoad={() => {
                    if (!mapRef.current) return;
                    const points = [];
                    if (pickup) points.push([pickup[1], pickup[0]]);
                    if (delivery) points.push([delivery[1], delivery[0]]);
                    if (driverPos) points.push([driverPos[1], driverPos[0]]);
                    if (points.length === 0) return;
                    if (points.length === 1) {
                      mapRef.current.flyTo({ center: points[0], zoom: 14, duration: 1200 });
                    } else {
                      const lngs = points.map(p => p[0]);
                      const lats = points.map(p => p[1]);
                      mapRef.current.fitBounds(
                        [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
                        { padding: 40, duration: 1500, maxZoom: 15 }
                      );
                    }
                  }}
                >
                  <NavigationControl position="bottom-right" />

                  {/* Tuyến đường */}
                  {routeGeoJSON && (
                    <Source id="route" type="geojson" data={routeGeoJSON}>
                      <Layer
                        id="route-line"
                        type="line"
                        paint={{
                          "line-color": ["completed", "delivered"].includes(shipment?.status) ? "#16a34a" : "#3b82f6",
                          "line-width": 5,
                          "line-opacity": 0.85,
                          ...(["picking", "assigned"].includes(shipment?.status) ? { "line-dasharray": [4, 2] } : {}),
                        }}
                        layout={{ "line-join": "round", "line-cap": "round" }}
                      />
                    </Source>
                  )}

                  {/* Marker điểm lấy hàng */}
                  {pickup && (
                    <Marker longitude={pickup[1]} latitude={pickup[0]} anchor="bottom">
                      <CustomMarker
                        icon={<FaMapMarkerAlt size={22} />}
                        bgColor="bg-blue-600"
                        ringColor="bg-blue-400"
                      />
                    </Marker>
                  )}

                  {/* Marker điểm giao hàng */}
                  {delivery && (
                    <Marker longitude={delivery[1]} latitude={delivery[0]} anchor="bottom">
                      <CustomMarker
                        icon={<FaMapMarkerAlt size={22} />}
                        bgColor="bg-orange-500"
                        ringColor="bg-orange-400"
                      />
                    </Marker>
                  )}

                  {/* Marker tài xế */}
                  {driverPos && (
                    <Marker longitude={driverPos[1]} latitude={driverPos[0]} anchor="bottom">
                      <CustomMarker
                        icon={<FaTruck size={22} />}
                        bgColor="bg-[#113e48]"
                        ringColor="bg-[#113e48]"
                      />
                    </Marker>
                  )}
                </Map>

                {/* Overlay trạng thái xe */}
                <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-xl max-w-[220px] border border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      ["completed", "delivered"].includes(shipment?.status)
                        ? "bg-green-100 text-green-600"
                        : shipment?.status === "failed" || shipment?.status?.includes("cancel")
                        ? "bg-red-100 text-red-600"
                        : "bg-blue-100 text-blue-600"
                    }`}>
                      <FaTruck size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase leading-none">Trạng thái</p>
                      <p className="font-extrabold text-[#113e48] text-sm leading-none mt-0.5">
                        {["picking", "delivering"].includes(shipment?.status)
                          ? "Đang vận chuyển"
                          : ["completed", "delivered"].includes(shipment?.status)
                          ? "Đã giao hàng"
                          : shipment?.status === "failed"
                          ? "Giao thất bại"
                          : "Chờ xử lý"}
                      </p>
                    </div>
                  </div>
                  {routeGeoJSON && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <p className="text-[10px] text-gray-400 leading-tight">
                        {["picking", "assigned"].includes(shipment?.status) ? "● Đang lấy hàng" : "● Đang giao hàng"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Legend đường đi */}
                <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-sm p-2.5 rounded-xl shadow-lg border border-gray-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-0.5 bg-blue-500 rounded-full"></div>
                      <span className="text-[10px] text-gray-500 font-medium">Đang vận chuyển</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-0.5 bg-blue-500 rounded-full" style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 2px, #3b82f6 2px, #3b82f6 4px)" }}></div>
                      <span className="text-[10px] text-gray-500 font-medium">Chờ lấy hàng</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-0.5 bg-green-500 rounded-full"></div>
                      <span className="text-[10px] text-gray-500 font-medium">Hoàn thành</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Khối nội dung */}
      <section className="py-20 bg-white border-t border-gray-100 mt-10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-[#113e48] mb-4">
            Cần hỗ trợ về đơn hàng này?
          </h2>
          <p className="text-gray-500 mb-8">
            Nếu có bất kỳ vấn đề gì về lộ trình hoặc thời gian giao hàng, vui
            lòng liên hệ CSKH.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/contact"
              className="px-8 py-3 bg-[#113e48] text-white font-bold rounded-full hover:bg-orange-500 transition-all shadow-lg flex items-center gap-2"
            >
              <FaPhoneAlt /> Liên hệ hỗ trợ
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}