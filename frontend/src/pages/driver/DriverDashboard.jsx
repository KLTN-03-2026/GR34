import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import {
  PackageCheck,
  Truck,
  ClipboardCheck,
  Clock,
  MapPin,
  AlertCircle,
} from "lucide-react";

import Map, { Marker, NavigationControl, GeolocateControl } from "react-map-gl";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import API from "../../services/api";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

// --- Components Con ---
const DriverMarker = () => (
  <div className="relative flex items-center justify-center w-12 h-12">
    <span className="absolute w-full h-full bg-blue-400 rounded-full opacity-30 animate-ping"></span>
    <div className="relative z-10 w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white border-2 border-white shadow-lg">
      <Truck size={18} fill="currentColor" />
    </div>
  </div>
);

const StatCard = ({ title, value, icon: Icon, colorClass, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className={`relative overflow-hidden rounded-2xl p-5 bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow`}
  >
    <div
      className={`absolute top-0 right-0 p-3 opacity-10 ${colorClass} rounded-bl-2xl`}
    >
      <Icon size={40} />
    </div>
    <div className="flex items-center gap-4">
      <div
        className={`p-3 rounded-xl ${colorClass} bg-opacity-10 text-white shadow-sm`}
      >
        <Icon size={24} className={`text-${colorClass.split("-")[1]}-600`} />
        <div className="text-white">
          <Icon />
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      </div>
    </div>
  </motion.div>
);

export default function DriverDashboard() {
  const { id } = useParams();
  const mapRef = useRef(null);

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [driverLocation, setDriverLocation] = useState(null); // Để null ban đầu để check

  // Socket
  useEffect(() => {
    const socket = io("http://localhost:5000");
    if (id) socket.emit("registerDriver", id);

    socket.on("newAssignment", () => {
      toast.success("📦 Bạn có đơn hàng mới!");
      fetchStats();
    });

    return () => socket.disconnect();
  }, [id]);

  const fetchStats = async () => {
    try {
      const res = await API.get(`/drivers/dashboard/${id}`);
      setStats(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  const fetchLocation = async () => {
    try {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setDriverLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (error) => {
            console.error("Lỗi GPS:", error);
            // Fallback vị trí mặc định (TP.HCM) nếu lỗi GPS
            setDriverLocation({ latitude: 10.762622, longitude: 106.660172 });
          },
        );
      } else {
        setDriverLocation({ latitude: 10.762622, longitude: 106.660172 });
      }
    } catch (err) {
      console.error("Lỗi lấy vị trí:", err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchLocation();
    const interval = setInterval(fetchLocation, 300000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats)
    return (
      <div className="p-6 text-center text-gray-500">Không có dữ liệu.</div>
    );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 pb-20 lg:p-8 space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            👋 Xin chào, Tài xế <span className="text-blue-600">#{id}</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
            <MapPin size={14} /> Khu vực hoạt động: TP.HCM
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-sm font-medium text-green-600">Trực tuyến</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="col-span-2 lg:col-span-1 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 text-white shadow-lg shadow-blue-200"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">
                Đơn đang giao
              </p>
              <h3 className="text-3xl font-bold">{stats.delivering || 0}</h3>
            </div>
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Truck size={24} className="text-white" />
            </div>
          </div>
        </motion.div>

        <StatCard
          title="Đã hoàn thành"
          value={stats.completed || 0}
          icon={PackageCheck}
          colorClass="bg-green-100"
          delay={0.2}
        />
        <StatCard
          title="Đang lấy hàng"
          value={stats.picking || 0}
          icon={Clock}
          colorClass="bg-orange-100"
          delay={0.3}
        />
        <StatCard
          title="Được phân công"
          value={stats.assigned || 0}
          icon={ClipboardCheck}
          colorClass="bg-gray-100"
          delay={0.4}
        />
      </div>

      {/* Mapbox - Chỉ render khi có location */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <MapPin size={18} className="text-blue-500" /> Bản đồ hoạt động
          </h3>
        </div>

        {/* Container phải có height cố định */}
        <div className="h-[300px] w-full relative bg-gray-100">
          {driverLocation ? (
            <Map
              ref={mapRef}
              initialViewState={{
                latitude: driverLocation.latitude,
                longitude: driverLocation.longitude,
                zoom: 14,
              }}
              mapStyle="mapbox://styles/mapbox/streets-v12"
              style={{ width: "100%", height: "100%" }}
              attributionControl={false}
            >
              <NavigationControl position="top-right" showCompass={false} />
              <GeolocateControl position="top-right" />
              <Marker
                latitude={driverLocation.latitude}
                longitude={driverLocation.longitude}
                anchor="center"
              >
                <DriverMarker />
              </Marker>
            </Map>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              Đang tải bản đồ...
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 lg:p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          Đơn hàng gần đây
        </h2>
        <div className="space-y-3">
          {stats.recentShipments?.length > 0 ? (
            stats.recentShipments.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-white"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                    <PackageCheck size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm">
                      {s.tracking_code}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Khách: {s.receiver_name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700 capitalize mb-1">
                    {s.status}
                  </span>
                  <p className="text-[10px] text-gray-400">
                    {new Date(s.updated_at).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 flex flex-col items-center">
              <div className="bg-gray-50 p-4 rounded-full mb-3">
                <AlertCircle size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">
                Chưa có hoạt động nào gần đây.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
