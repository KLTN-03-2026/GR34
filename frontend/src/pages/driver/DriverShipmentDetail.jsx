
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/api";
import Map, { Marker, NavigationControl } from "react-map-gl";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import toast, { Toaster } from "react-hot-toast";
import {
  ArrowLeft,
  Phone,
  MapPin,
  Package,
  CreditCard,
  Clock,
  Truck,
  CheckCircle2,
  Navigation2,
  AlertCircle,
  PackageOpen,
  ClipboardList,
  XCircle,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
mapboxgl.accessToken = MAPBOX_TOKEN;


const DriverMarker = () => (
  <div className="relative flex items-center justify-center w-10 h-10">
    <span className="absolute w-full h-full bg-blue-400 rounded-full opacity-30 animate-ping"></span>
    <div className="relative z-10 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white border-2 border-white shadow-lg">
      <Truck size={16} fill="currentColor" />
    </div>
  </div>
);

const LocationMarker = ({ type }) => (
  <div
    className={`flex items-center justify-center w-8 h-8 rounded-full text-white shadow-md border-2 border-white ${
      type === "pickup" ? "bg-orange-500" : "bg-green-600"
    }`}
  >
    {type === "pickup" ? <PackageOpen size={16} /> : <MapPin size={16} />}
  </div>
);


const STATUS_OPTIONS = [
  {
    value: "assigned",
    label: "Đã nhận đơn",
    icon: ClipboardList,
    color: "text-gray-600",
    bg: "bg-gray-100",
  },
  {
    value: "picking",
    label: "Đang lấy hàng",
    icon: PackageOpen,
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    value: "delivering",
    label: "Đang giao hàng",
    icon: Truck,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    value: "completed",
    label: "Hoàn tất",
    icon: CheckCircle2,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    value: "failed",
    label: "Thất bại",
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-50",
  },
];

const StatusDropdown = ({ currentStatus, onChange, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentOption =
    STATUS_OPTIONS.find((o) => o.value === currentStatus) || STATUS_OPTIONS[0];
  const Icon = currentOption.icon;

  if (disabled) {
    return (
      <div
        className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold ${currentOption.bg} ${currentOption.color} opacity-80 cursor-not-allowed`}
      >
        <Icon size={20} /> {currentOption.label}
      </div>
    );
  }

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold shadow-sm transition-all active:scale-95 bg-white border border-gray-200 hover:border-blue-400`}
      >
        <div className={`flex items-center gap-3 ${currentOption.color}`}>
          <Icon size={20} />
          <span>{currentOption.label}</span>
        </div>
        <ChevronDown
          size={18}
          className={`text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full mb-2 right-0 w-full bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
          >
            {STATUS_OPTIONS.map((option) => {
              if (option.value === "assigned") return null;
              const ItemIcon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                >
                  <div
                    className={`p-1.5 rounded-lg ${option.bg} ${option.color}`}
                  >
                    <ItemIcon size={16} />
                  </div>
                  <span className="font-medium text-gray-700">
                    {option.label}
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Chi tiết đơn hàng tài xế đang xử lý
export default function DriverShipmentDetail() {
  const { id, shipmentId } = useParams();
  const navigate = useNavigate();
  const mapRef = useRef(null);

  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);


  const [coords, setCoords] = useState({
    driver: { lat: 10.762622, lng: 106.660172 },
    pickup: { lat: 10.762622, lng: 106.660172 },
    delivery: { lat: 10.762622, lng: 106.660172 },
  });


  const geocodeAddress = async (address) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          address
        )}.json?access_token=${MAPBOX_TOKEN}&limit=1&country=VN`
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        return { lat, lng };
      }
    } catch (error) {
    }
    return null;
  };

  const fetchShipmentAndCoords = async () => {
    setLoading(true);
    try {

      const res = await API.get(`/shipments/${shipmentId}`);
      const data = res.data;
      setShipment(data);


      let driverPos = coords.driver;
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            driverPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };

            setCoords((prev) => ({ ...prev, driver: driverPos }));
          },
          (err) => console.error("GPS Error:", err)
        );
      }


      const [pickupCoords, deliveryCoords] = await Promise.all([
        geocodeAddress(data.pickup_address),
        geocodeAddress(data.delivery_address),
      ]);


      setCoords((prev) => ({
        ...prev,
        pickup: pickupCoords || prev.pickup,
        delivery: deliveryCoords || prev.delivery,
      }));


      if (pickupCoords && deliveryCoords && mapRef.current) {
        const bounds = new mapboxgl.LngLatBounds();
        bounds.extend([pickupCoords.lng, pickupCoords.lat]);
        bounds.extend([deliveryCoords.lng, deliveryCoords.lat]);
        bounds.extend([driverPos.lng, driverPos.lat]);
        mapRef.current.fitBounds(bounds, {
          padding: 80,
          duration: 900,
          maxZoom: 15,
        });
      }
    } catch (err) {
      toast.error("Không thể tải thông tin đơn hàng");
    } finally {
      setLoading(false);
    }
  };

// Xử lý thay đổi trạng thái
  const handleStatusChange = async (newStatus) => {
    const toastId = toast.loading("Đang cập nhật...");
    try {
      await API.patch(`/drivers/shipments/${shipmentId}/status`, {
        status: newStatus,
      });
      setShipment((prev) => ({ ...prev, status: newStatus }));
      toast.success("Đã cập nhật trạng thái!", { id: toastId });
    } catch (err) {
      toast.error("Lỗi cập nhật!", { id: toastId });
    }
  };

  useEffect(() => {
    fetchShipmentAndCoords();
  }, [shipmentId]);

  useEffect(() => {
    if (!mapRef.current) return;
    const bounds = new mapboxgl.LngLatBounds();
    bounds.extend([coords.pickup.lng, coords.pickup.lat]);
    bounds.extend([coords.delivery.lng, coords.delivery.lat]);
    bounds.extend([coords.driver.lng, coords.driver.lat]);
    mapRef.current.fitBounds(bounds, {
      padding: 80,
      duration: 700,
      maxZoom: 15,
    });
  }, [coords]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );

  if (!shipment)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <PackageOpen size={48} className="text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-800">
          Không tìm thấy đơn hàng
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium"
        >
          Quay lại
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      <Toaster position="top-center" />

      {/* Phần giao diện */}
      <div className="bg-white px-4 py-4 sticky top-0 z-30 shadow-sm border-b border-gray-100 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h1 className="text-lg font-bold text-[#113e48]">
            {shipment.tracking_code}
          </h1>
          <p className="text-xs text-gray-400 font-medium">Chi tiết đơn hàng</p>
        </div>
        <div className="w-10"></div>
      </div>

      <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-6">
        {/* Phần giao diện */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
          <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-gray-100 text-xs font-bold text-gray-600 flex items-center gap-2">
            <MapPin size={14} className="text-blue-500" /> Lộ trình vận chuyển
          </div>
          <div className="h-[250px] lg:h-[350px] w-full">
            <Map
              ref={mapRef}
              initialViewState={{
                latitude: coords.pickup.lat,
                longitude: coords.pickup.lng,
                zoom: 12,
              }}
              mapStyle="mapbox://styles/mapbox/streets-v12"
              style={{ width: "100%", height: "100%" }}
              attributionControl={false}
            >
              <NavigationControl position="bottom-right" showCompass={false} />

              {/* Phần giao diện */}
              <Marker
                latitude={coords.driver.lat}
                longitude={coords.driver.lng}
                anchor="center"
              >
                <DriverMarker />
              </Marker>

              {/* Phần giao diện */}
              <Marker
                latitude={coords.pickup.lat}
                longitude={coords.pickup.lng}
                anchor="bottom"
              >
                <LocationMarker type="pickup" />
              </Marker>

              {/* Phần giao diện */}
              <Marker
                latitude={coords.delivery.lat}
                longitude={coords.delivery.lng}
                anchor="bottom"
              >
                <LocationMarker type="delivery" />
              </Marker>
            </Map>
          </div>
        </div>

        {/* Phần giao diện */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="w-full sm:w-1/2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                Cập nhật trạng thái
              </label>
              <StatusDropdown
                currentStatus={shipment.status}
                onChange={handleStatusChange}
                disabled={
                  shipment.status === "completed" ||
                  shipment.status === "failed"
                }
              />
            </div>

            <div className="w-full sm:w-1/2 grid grid-cols-2 gap-3">
              <a
                href={`tel:${shipment.receiver_phone}`}
                className="flex flex-col items-center justify-center gap-1 p-3 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition border border-green-100"
              >
                <Phone size={20} />
                <span className="text-xs font-bold">Gọi khách</span>
              </a>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  shipment.delivery_address
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center justify-center gap-1 p-3 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition border border-blue-100"
              >
                <Navigation2 size={20} />
                <span className="text-xs font-bold">Chỉ đường</span>
              </a>
            </div>
          </div>
        </div>

        {/* Phần giao diện */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {/* Phần giao diện */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-orange-400"></div>
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-4">
                <PackageOpen className="text-orange-500" size={18} /> NGƯỜI GỬI
                (LẤY HÀNG)
              </h3>
              <div className="space-y-3 pl-4 border-l border-dashed border-gray-200 ml-2">
                <div>
                  <p className="text-sm font-bold text-gray-800">
                    {shipment.sender_name}
                  </p>
                  <a
                    href={`tel:${shipment.sender_phone}`}
                    className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1 mt-0.5"
                  >
                    <Phone size={12} /> {shipment.sender_phone}
                  </a>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">
                    Địa chỉ lấy hàng
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {shipment.pickup_address}
                  </p>
                </div>
              </div>
            </div>

            {/* Phần giao diện */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-4">
                <MapPin className="text-blue-500" size={18} /> NGƯỜI NHẬN (GIAO
                HÀNG)
              </h3>
              <div className="space-y-3 pl-4 border-l border-dashed border-gray-200 ml-2">
                <div>
                  <p className="text-sm font-bold text-gray-800">
                    {shipment.receiver_name}
                  </p>
                  <a
                    href={`tel:${shipment.receiver_phone}`}
                    className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1 mt-0.5"
                  >
                    <Phone size={12} /> {shipment.receiver_phone}
                  </a>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">
                    Địa chỉ giao hàng
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {shipment.delivery_address}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Phần giao diện */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 h-fit">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              <ClipboardList className="text-gray-500" size={18} /> THÔNG TIN
              KIỆN HÀNG
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500">
                    <Package size={16} />
                  </div>
                  <span className="text-sm text-gray-600 font-medium">
                    Loại hàng / Cân nặng
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-800">
                  {shipment.weight_kg} kg
                </span>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                    <CreditCard size={16} />
                  </div>
                  <span className="text-sm text-gray-600 font-medium">
                    Thu hộ (COD)
                  </span>
                </div>
                <span className="text-lg font-bold text-green-600">
                  {Number(shipment.cod_amount || 0).toLocaleString()} đ
                </span>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <Clock size={16} />
                  </div>
                  <span className="text-sm text-gray-600 font-medium">
                    Ngày tạo đơn
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-800">
                  {new Date(shipment.created_at).toLocaleDateString("vi-VN")}
                </span>
              </div>

              {shipment.note && (
                <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-100 mt-2">
                  <p className="text-xs font-bold text-yellow-700 uppercase mb-1 flex items-center gap-1">
                    <AlertCircle size={12} /> Ghi chú từ khách
                  </p>
                  <p className="text-sm text-gray-700 italic">
                    "{shipment.note}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}