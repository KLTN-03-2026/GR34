import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/api";
import Map, {
  Marker,
  Popup,
  Source,
  Layer,
  NavigationControl,
} from "react-map-gl";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import bbox from "@turf/bbox";
import toast from "react-hot-toast";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  ArrowLeft,
  Package,
  Phone,
  Truck,
  Clock,
  CheckCircle,
  CreditCard,
  MapPin,
} from "lucide-react";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const CustomMarker = ({ icon, bgColor, ringColor, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="relative w-10 h-10 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-200"
    >
      {}
      <div
        className={`absolute inset-0 rounded-full opacity-30 animate-ping ${ringColor}`}
      ></div>

      {}
      <div
        className={`relative z-10 w-10 h-10 flex items-center justify-center rounded-full text-white shadow-xl border-2 border-white ${bgColor}`}
      >
        {icon}
      </div>

      {}
      <div
        className={`absolute -bottom-1 w-3 h-3 transform rotate-45 ${bgColor} border-r-2 border-b-2 border-white z-0`}
      ></div>
    </div>
  );
};

function TrackingTimeline({ status }) {
  const steps = [
    { key: "pending", label: "Đã đặt hàng", icon: <Package size={18} /> },
    { key: "picking", label: "Đang lấy hàng", icon: <Package size={18} /> },
    { key: "delivering", label: "Đang giao hàng", icon: <Truck size={18} /> },
    {
      key: "completed",
      label: "Giao thành công",
      icon: <CheckCircle size={18} />,
    },
  ];

  const getStatusIndex = (s) => {
    switch (s) {
      case "pending":
        return 0;
      case "assigned":
      case "picking":
        return 1;
      case "delivering":
        return 2;
      case "delivered":
      case "completed":
        return 3;
      case "failed":
      case "canceled":
        return -1;
      default:
        return 0;
    }
  };

  const currentIndex = getStatusIndex(status);
  const isFailed = status === "failed" || status === "canceled";

  return (
    <div className="w-full py-4">
      <div className="flex items-start justify-between w-full relative">
        <div className="absolute top-5 left-0 w-full h-1 bg-gray-100 -z-10 rounded-full"></div>
        <div
          className={`absolute top-5 left-0 h-1 transition-all duration-700 ease-out -z-10 rounded-full ${
            isFailed ? "bg-red-500" : "bg-green-500"
          }`}
          style={{
            width: `${Math.max(0, (currentIndex / (steps.length - 1)) * 100)}%`,
          }}
        ></div>

        {steps.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          return (
            <div key={step.key} className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 bg-white
                  ${
                    isCurrent && isFailed
                      ? "border-red-500 text-red-600 shadow-md scale-110"
                      : isCompleted
                        ? "border-green-500 text-green-600 shadow-md bg-green-50"
                        : "border-gray-200 text-gray-300"
                  }
                `}
              >
                {step.icon}
              </div>
              <p
                className={`mt-2 text-[11px] md:text-xs font-bold text-center px-1 transition-colors duration-300 ${
                  isCurrent || isCompleted ? "text-[#113e48]" : "text-gray-400"
                } ${isCurrent && isFailed ? "text-red-600" : ""}`}
              >
                {step.label}
              </p>
            </div>
          );
        })}
      </div>
      {isFailed && (
        <div className="mt-6 p-3 bg-red-50 text-red-600 text-center rounded-xl text-sm font-bold border border-red-100 flex items-center justify-center gap-2 animate-pulse">
          <Clock size={16} /> Đơn hàng đã bị hủy hoặc giao thất bại.
        </div>
      )}
    </div>
  );
}

// Chi tiết đơn hàng khách hàng
export default function CustomerShipmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const mapRef = useRef(null);

  const [shipment, setShipment] = useState(null);
  const [routeGeoJSON, setRouteGeoJSON] = useState(null);
  const [waypoints, setWaypoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [popupInfo, setPopupInfo] = useState(null);

  const fetchRouteOSRM = async (start, end) => {
    if (!start || !end) return null;

    const startStr = `${start[1]},${start[0]}`;
    const endStr = `${end[1]},${end[0]}`;
    const midPointStr = "108.2022,16.0544";
    const latDiff = Math.abs(start[0] - end[0]);

    let url = "";
    if (latDiff > 4) {
      url = `https://router.project-osrm.org/route/v1/driving/${startStr};${midPointStr};${endStr}?overview=full&geometries=geojson`;
    } else {
      url = `https://router.project-osrm.org/route/v1/driving/${startStr};${endStr}?overview=full&geometries=geojson`;
    }

    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.code === "Ok" && data.routes.length > 0) {
        return {
          type: "Feature",
          geometry: data.routes[0].geometry,
        };
      }
    } catch (error) {}
    return null;
  };

  useEffect(() => {
    AOS.init({ duration: 600, easing: "ease-out-cubic", once: true });

    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/customers/shipment/${id}`);
        const data = res.data;
        setShipment(data);

        let pickup = null;
        let delivery = null;

        if (data.pickup_lat && data.pickup_lng) {
          pickup = [Number(data.pickup_lat), Number(data.pickup_lng)];
        }
        if (data.delivery_lat && data.delivery_lng) {
          delivery = [Number(data.delivery_lat), Number(data.delivery_lng)];
        }

        if (pickup && delivery) {
          setWaypoints([pickup, delivery]);

          if (data.status === "picking" || data.status === "delivering") {
            const geoJson = await fetchRouteOSRM(pickup, delivery);
            setRouteGeoJSON(geoJson);
          } else {
            setRouteGeoJSON(null);
          }
        }
      } catch (err) {
        toast.error("Không thể tải dữ liệu đơn hàng.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  useEffect(() => {
    if (!mapRef.current) return;

    let features = [];

    if (routeGeoJSON) {
      features.push(routeGeoJSON);
    } else if (waypoints.length > 0) {
      waypoints.forEach((pt) => {
        features.push({
          type: "Feature",
          geometry: { type: "Point", coordinates: [pt[1], pt[0]] },
        });
      });
    }

    if (features.length > 0) {
      const featureCollection = {
        type: "FeatureCollection",
        features: features,
      };

      const [minLng, minLat, maxLng, maxLat] = bbox(featureCollection);

      mapRef.current.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        { padding: 80, duration: 1000 },
      );
    }
  }, [routeGeoJSON, waypoints, shipment]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-orange-500"></div>
          <p className="text-gray-500 font-medium">
            Đang tải chi tiết đơn hàng...
          </p>
        </div>
      </div>
    );
  }

  if (!shipment)
    return <div className="p-10 text-center">Không tìm thấy đơn hàng</div>;

  const driverPos = shipment.driver_lat
    ? [Number(shipment.driver_lat), Number(shipment.driver_lng)]
    : waypoints[0];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-10 font-sans animate-in fade-in duration-500">
      {}
      <div className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-[50] px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-[#113e48] flex items-center gap-2">
            Chi tiết vận đơn{" "}
            <span className="text-blue-600 bg-blue-50 px-3 py-0.5 rounded-full text-sm font-mono tracking-wide">
              #{shipment.tracking_code}
            </span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
            <Clock size={10} /> Cập nhật lần cuối:{" "}
            {new Date(shipment.updated_at).toLocaleString("vi-VN")}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {}
        <div className="lg:col-span-1 space-y-6">
          <div
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
            data-aos="fade-up"
          >
            <h3 className="font-bold text-[#113e48] mb-4 text-sm uppercase tracking-wide">
              Tiến trình vận chuyển
            </h3>
            <TrackingTimeline status={shipment.status} />
          </div>

          <div
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            {}
            <div className="flex gap-4 relative">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <Package size={16} />
                </div>
                <div className="w-0.5 h-full bg-gray-100 my-1"></div>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase mb-1">
                  Điểm lấy hàng
                </p>
                <p className="font-bold text-[#113e48]">
                  {shipment.sender_name}
                </p>
                <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">
                  {shipment.pickup_address}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1">
                    <Phone size={10} /> {shipment.sender_phone}
                  </span>
                </div>
              </div>
            </div>
            {}
            <div className="flex gap-4 relative">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                  <MapPin size={16} />
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase mb-1">
                  Điểm giao hàng
                </p>
                <p className="font-bold text-[#113e48]">
                  {shipment.receiver_name}
                </p>
                <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">
                  {shipment.delivery_address}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1">
                    <Phone size={10} /> {shipment.receiver_phone}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            <h3 className="font-bold text-[#113e48] mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
              <CreditCard size={16} /> Thanh toán
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Hình thức</span>
                <span className="font-bold text-[#113e48] uppercase">
                  {shipment.payment_method || "COD"}
                </span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Phí vận chuyển</span>
                <span className="font-medium text-gray-900">
                  {Number(shipment.shipping_fee).toLocaleString()}₫
                </span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Thu hộ (COD)</span>
                <span className="font-medium text-gray-900">
                  {Number(shipment.cod_amount).toLocaleString()}₫
                </span>
              </div>
              <div className="h-px bg-gray-100 my-2"></div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-[#113e48]">
                  Tổng thu người nhận
                </span>
                <span className="text-xl font-extrabold text-orange-600">
                  {(
                    Number(shipment.cod_amount) + Number(shipment.shipping_fee)
                  ).toLocaleString()}
                  ₫
                </span>
              </div>
            </div>
          </div>

          {shipment.driver_name ? (
            <div className="bg-[#113e48] p-5 rounded-2xl text-white shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/20 transition-all"></div>
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-xl font-bold border-2 border-white/20">
                  {shipment.driver_name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-blue-200 uppercase font-bold mb-0.5">
                    Tài xế phụ trách
                  </p>
                  <p className="font-bold text-lg">{shipment.driver_name}</p>
                  <div className="flex flex-col gap-1.5 mt-2">
                    <p className="text-sm text-blue-100 flex items-center gap-2">
                      <Phone size={14} className="text-orange-400" />{" "}
                      {shipment.driver_phone || "Đang cập nhật SĐT"}
                    </p>
                    <p className="text-sm text-blue-100 flex items-center gap-2">
                      <Truck size={14} className="text-orange-400" /> Biển số:{" "}
                      <span className="font-bold text-white tracking-wider">
                        {shipment.plate_number || "Đang cập nhật"}
                      </span>
                    </p>
                  </div>
                </div>
                {shipment.driver_phone && (
                  <a
                    href={`tel:${shipment.driver_phone}`}
                    className="bg-green-500 hover:bg-green-600 p-3 rounded-full shadow-lg transition-transform hover:scale-110"
                  >
                    <Phone size={20} className="text-white" />
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                <Truck size={20} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 uppercase font-bold mb-0.5">
                  Tài xế phụ trách
                </p>
                <p className="font-bold text-gray-400 italic text-sm">
                  Chưa phân công tài xế
                </p>
              </div>
            </div>
          )}
        </div>

        {}
        <div
          className="lg:col-span-2 h-[600px] lg:h-auto min-h-[500px] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative z-0"
          data-aos="fade-left"
        >
          <Map
            ref={mapRef}
            initialViewState={{
              longitude: waypoints[0]?.[1] || 106.6297,
              latitude: waypoints[0]?.[0] || 10.8231,
              zoom: 13,
            }}
            style={{ width: "100%", height: "100%" }}
            mapStyle="mapbox://styles/mapbox/streets-v12"
            mapboxAccessToken={MAPBOX_TOKEN}
          >
            {}
            <NavigationControl position="bottom-right" />

            {}
            {routeGeoJSON && (
              <Source id="route" type="geojson" data={routeGeoJSON}>
                <Layer
                  id="route-line"
                  type="line"
                  paint={{
                    "line-color": "#3B82F6",
                    "line-width": 6,
                    "line-opacity": 0.8,
                  }}
                  layout={{
                    "line-join": "round",
                    "line-cap": "round",
                  }}
                />
              </Source>
            )}

            {}
            {waypoints[0] && (
              <Marker
                longitude={waypoints[0][1]}
                latitude={waypoints[0][0]}
                anchor="bottom"
              >
                <CustomMarker
                  icon={<Package size={20} />}
                  bgColor="bg-blue-600"
                  ringColor="bg-blue-400"
                  onClick={(e) => {
                    e.originalEvent.stopPropagation();
                    setPopupInfo({
                      longitude: waypoints[0][1],
                      latitude: waypoints[0][0],
                      title: "Điểm lấy hàng",
                      desc: shipment.pickup_address,
                      color: "text-blue-600",
                    });
                  }}
                />
              </Marker>
            )}

            {}
            {waypoints[1] && (
              <Marker
                longitude={waypoints[1][1]}
                latitude={waypoints[1][0]}
                anchor="bottom"
              >
                <CustomMarker
                  icon={<MapPin size={20} fill="currentColor" />}
                  bgColor="bg-orange-500"
                  ringColor="bg-orange-400"
                  onClick={(e) => {
                    e.originalEvent.stopPropagation();
                    setPopupInfo({
                      longitude: waypoints[1][1],
                      latitude: waypoints[1][0],
                      title: "Điểm giao hàng",
                      desc: shipment.delivery_address,
                      color: "text-orange-600",
                    });
                  }}
                />
              </Marker>
            )}

            {}
            {(shipment.status === "picking" ||
              shipment.status === "delivering") &&
              shipment.driver_lat && (
                <Marker
                  longitude={driverPos[1]}
                  latitude={driverPos[0]}
                  anchor="bottom"
                >
                  <CustomMarker
                    icon={<Truck size={20} />}
                    bgColor="bg-[#113e48]"
                    ringColor="bg-[#113e48]"
                    onClick={(e) => {
                      e.originalEvent.stopPropagation();
                      setPopupInfo({
                        longitude: driverPos[1],
                        latitude: driverPos[0],
                        title: "Vị trí tài xế",
                        desc: "Tài xế đang di chuyển...",
                        color: "text-[#113e48]",
                      });
                    }}
                  />
                </Marker>
              )}

            {}
            {popupInfo && (
              <Popup
                anchor="top"
                longitude={popupInfo.longitude}
                latitude={popupInfo.latitude}
                onClose={() => setPopupInfo(null)}
                closeOnClick={false}
                offset={10}
              >
                <div className="text-center p-1 max-w-[200px]">
                  <p className={`font-bold text-sm ${popupInfo.color}`}>
                    {popupInfo.title}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">{popupInfo.desc}</p>
                </div>
              </Popup>
            )}
          </Map>

          {}
          <div className="lg:hidden absolute top-4 left-4 right-4 bg-white/90 backdrop-blur p-3 rounded-xl shadow-lg border border-gray-100 z-[40]">
            <p className="text-xs font-bold text-gray-500 uppercase">
              Trạng thái hiện tại
            </p>
            <p className="text-lg font-extrabold text-[#113e48]">
              {shipment.status === "delivering"
                ? "🚚 Đang giao hàng"
                : shipment.status === "completed"
                  ? "Giao thành công"
                  : "📦 " + shipment.status}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
