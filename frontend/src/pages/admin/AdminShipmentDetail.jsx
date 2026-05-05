import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../services/api";
import Map, { Layer, Marker, NavigationControl, Popup, Source } from "react-map-gl";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  ArrowLeft,
  Clock3,
  FileText,
  MapPin,
  CreditCard,
  Package,
  Phone,
  Truck,
  User,
} from "lucide-react";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const STATUS_LABELS = {
  pending: "Chờ xử lý",
  assigned: "Đã điều phối",
  picking: "Đang lấy hàng",
  picked: "Đã lấy hàng",
  delivering: "Đang giao hàng",
  delivered: "Giao thành công",
  completed: "Hoàn tất",
  failed: "Giao thất bại",
  canceled: "Đã hủy",
};

export default function AdminShipmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const mapRef = useRef(null);

  const [shipment, setShipment] = useState(null);
  const [popup, setPopup] = useState(null);
  const [routeGeoJSON, setRouteGeoJSON] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const loadDetail = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const { data } = await API.get(`/dispatcher/shipments/${id}`);
        if (!data || !data.id) {
          setShipment(null);
          setLoadError("Không tìm thấy đơn hàng hoặc dữ liệu chưa sẵn sàng.");
          return;
        }
        setShipment(data);
      } catch (error) {
        setShipment(null);
        setLoadError(
          error?.response?.data?.message ||
            "Không tải được chi tiết đơn hàng. Vui lòng kiểm tra server backend.",
        );
      } finally {
        setLoading(false);
      }
    };
    loadDetail();
  }, [id]);

  const points = useMemo(() => {
    if (!shipment) return {};
    const pickup =
      shipment.pickup_lat && shipment.pickup_lng
        ? [Number(shipment.pickup_lat), Number(shipment.pickup_lng)]
        : null;
    const delivery =
      shipment.delivery_lat && shipment.delivery_lng
        ? [Number(shipment.delivery_lat), Number(shipment.delivery_lng)]
        : null;
    const driver =
      shipment.latitude && shipment.longitude
        ? [Number(shipment.latitude), Number(shipment.longitude)]
        : null;
    return { pickup, delivery, driver };
  }, [shipment]);

  useEffect(() => {
    const fetchRoute = async () => {
      if (!points.pickup || !points.delivery) {
        setRouteGeoJSON(null);
        return;
      }
      try {
        const start = `${points.pickup[1]},${points.pickup[0]}`;
        const end = `${points.delivery[1]},${points.delivery[0]}`;
        const res = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&geometries=geojson`,
        );
        const data = await res.json();
        if (data.code === "Ok" && data.routes?.length) {
          setRouteGeoJSON({
            type: "Feature",
            geometry: data.routes[0].geometry,
          });
        } else {
          setRouteGeoJSON(null);
        }
      } catch (e) {
        setRouteGeoJSON(null);
      }
    };
    fetchRoute();
  }, [points.pickup, points.delivery]);

  useEffect(() => {
    if (!mapRef.current || !shipment) return;
    const coords = [points.pickup, points.delivery, points.driver].filter(Boolean);
    if (coords.length === 0) return;

    try {
      const flyTo = mapRef.current?.flyTo;
      const easeTo = mapRef.current?.easeTo;
      const fitBounds = mapRef.current?.fitBounds;
      if (typeof fitBounds !== "function") return;

      if (coords.length === 1) {
        if (typeof flyTo === "function") {
          flyTo({
            center: [coords[0][1], coords[0][0]],
            zoom: 13,
          });
        }
        return;
      }

      const bounds = new mapboxgl.LngLatBounds();
      coords.forEach(([lat, lng]) => bounds.extend([lng, lat]));
      if (typeof easeTo === "function") {
        easeTo({ zoom: 7, duration: 350 });
      }
      fitBounds(bounds, { padding: 90, duration: 1800, maxZoom: 14 });
    } catch (e) {
    }
  }, [points, shipment, routeGeoJSON]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#113e48]" />
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="bg-white border border-red-100 rounded-xl p-6 max-w-lg text-center">
          <p className="text-red-600 font-semibold">
            {loadError || "Đã xảy ra lỗi khi tải dữ liệu."}
          </p>
          <button
            onClick={() => navigate("/admin/shipments")}
            className="mt-4 px-4 py-2 rounded-lg bg-[#113e48] text-white text-sm font-semibold"
          >
            Quay lại danh sách đơn
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin/shipments")}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#113e48]">
              Chi tiết đơn hàng #{shipment.tracking_code || shipment.id}
            </h1>
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
              <Clock3 size={12} />
              Cập nhật: {new Date(shipment.updated_at || shipment.created_at).toLocaleString("vi-VN")}
            </p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
          {STATUS_LABELS[shipment.status] || shipment.status}
        </span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1 space-y-6">
          
          {/* Lấy hàng / Giao hàng */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <h3 className="font-bold text-[#113e48] flex items-center gap-2 text-sm uppercase tracking-wide">
              <MapPin size={16} /> Lộ trình & Địa chỉ
            </h3>
            <div className="flex gap-4 relative">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <Package size={16} />
                </div>
                <div className="w-0.5 h-full bg-gray-100 my-1"></div>
              </div>
              <div className="flex-1 pb-4">
                <p className="text-xs text-gray-400 font-bold uppercase mb-1">Điểm lấy hàng</p>
                <p className="text-sm text-gray-800 font-medium leading-relaxed">{shipment.pickup_address}</p>
              </div>
            </div>
            
            <div className="flex gap-4 relative">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                  <MapPin size={16} />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 font-bold uppercase mb-1">Điểm giao hàng</p>
                <p className="text-sm text-gray-800 font-medium leading-relaxed">{shipment.delivery_address}</p>
              </div>
            </div>
          </div>

          {/* Thông tin vận đơn */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-[#113e48] mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
              <FileText size={16} /> Thông tin vận đơn
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Người gửi</span>
                <span className="font-bold text-[#113e48]">{shipment.sender_name}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>SĐT gửi</span>
                <span className="font-medium text-gray-900">{shipment.sender_phone}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Người nhận</span>
                <span className="font-bold text-[#113e48]">{shipment.receiver_name}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>SĐT nhận</span>
                <span className="font-medium text-gray-900">{shipment.receiver_phone}</span>
              </div>
              <div className="h-px bg-gray-100 my-2"></div>
              <div className="flex justify-between text-gray-500">
                <span>Dịch vụ</span>
                <span className={`font-bold ${shipment.service_type === 'fast' ? "text-red-600" : "text-blue-600"} uppercase`}>
                  {shipment.service_type === 'fast' ? "Hỏa Tốc" : "Tiêu Chuẩn"}
                </span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Khối lượng</span>
                <span className="font-medium text-gray-900">{shipment.weight_kg || 0} kg</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Thu hộ (COD)</span>
                <span className="font-bold text-orange-600 text-base">{Number(shipment.cod_amount || 0).toLocaleString("vi-VN")} ₫</span>
              </div>
            </div>
          </div>

          {/* Thông tin tài xế */}
          {shipment.driver_name ? (
            <div className="bg-[#113e48] p-5 rounded-2xl text-white shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/20 transition-all"></div>
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-xl font-bold border-2 border-white/20">
                  {shipment.driver_name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-blue-200 uppercase font-bold mb-0.5">Tài xế phụ trách</p>
                  <p className="font-bold text-lg">{shipment.driver_name}</p>
                  <div className="flex flex-col gap-1.5 mt-2">
                    <p className="text-sm text-blue-100 flex items-center gap-2">
                      <Phone size={14} className="text-orange-400" /> {shipment.driver_phone || "Đang cập nhật SĐT"}
                    </p>
                    <p className="text-sm text-blue-100 flex items-center gap-2">
                      <Truck size={14} className="text-orange-400" /> Biển số: <span className="font-bold text-white tracking-wider">{shipment.plate_number || "Đang cập nhật"}</span>
                    </p>
                  </div>
                </div>
                {shipment.driver_phone && (
                  <a href={`tel:${shipment.driver_phone}`} className="bg-green-500 hover:bg-green-600 p-3 rounded-full shadow-lg transition-transform hover:scale-110">
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
                <p className="text-xs text-gray-400 uppercase font-bold mb-0.5">Tài xế phụ trách</p>
                <p className="font-bold text-gray-400 italic text-sm">Chưa phân công tài xế</p>
              </div>
            </div>
          )}
        </div>

        <div className="xl:col-span-2 bg-white border border-gray-100 rounded-xl overflow-hidden h-[72vh] min-h-[560px]">
          {!MAPBOX_TOKEN ? (
            <div className="h-full w-full flex items-center justify-center text-center p-6 text-gray-500">
              Thiếu cấu hình bản đồ (`VITE_MAPBOX_TOKEN`). Vui lòng cập nhật biến môi trường để hiển thị bản đồ.
            </div>
          ) : (
            <Map
              ref={mapRef}
              initialViewState={{ latitude: 16.0471, longitude: 108.2068, zoom: 6 }}
              mapStyle="mapbox://styles/mapbox/streets-v12"
              mapboxAccessToken={MAPBOX_TOKEN}
              style={{ width: "100%", height: "100%" }}
            >
            <NavigationControl position="bottom-right" />

            {routeGeoJSON && (
              <Source id="admin-shipment-route" type="geojson" data={routeGeoJSON}>
                <Layer
                  id="admin-route-glow"
                  type="line"
                  paint={{
                    "line-color": "#60a5fa",
                    "line-width": 10,
                    "line-opacity": 0.2,
                  }}
                />
                <Layer
                  id="admin-route-line"
                  type="line"
                  paint={{
                    "line-color": "#2563eb",
                    "line-width": 5,
                    "line-opacity": 0.9,
                  }}
                  layout={{ "line-join": "round", "line-cap": "round" }}
                />
              </Source>
            )}

            {points.pickup && (
              <Marker longitude={points.pickup[1]} latitude={points.pickup[0]} anchor="bottom">
                <button
                  onClick={() =>
                    setPopup({
                      title: "Vị trí lấy hàng",
                      desc: shipment.pickup_address,
                      lat: points.pickup[0],
                      lng: points.pickup[1],
                    })
                  }
                  className="w-9 h-9 rounded-full bg-blue-600 text-white border-2 border-white shadow-lg flex items-center justify-center"
                >
                  <Package size={16} />
                </button>
              </Marker>
            )}

            {points.delivery && (
              <Marker longitude={points.delivery[1]} latitude={points.delivery[0]} anchor="bottom">
                <button
                  onClick={() =>
                    setPopup({
                      title: "Vị trí giao hàng",
                      desc: shipment.delivery_address,
                      lat: points.delivery[0],
                      lng: points.delivery[1],
                    })
                  }
                  className="w-9 h-9 rounded-full bg-orange-500 text-white border-2 border-white shadow-lg flex items-center justify-center"
                >
                  <MapPin size={16} />
                </button>
              </Marker>
            )}

            {points.driver && (
              <Marker longitude={points.driver[1]} latitude={points.driver[0]} anchor="bottom">
                <button
                  onClick={() =>
                    setPopup({
                      title: "Vị trí tài xế",
                      desc: shipment.driver_name || "Tài xế đang hoạt động",
                      lat: points.driver[0],
                      lng: points.driver[1],
                    })
                  }
                  className="w-9 h-9 rounded-full bg-slate-800 text-white border-2 border-white shadow-lg flex items-center justify-center"
                >
                  <Truck size={16} />
                </button>
              </Marker>
            )}

            {popup && (
              <Popup
                longitude={popup.lng}
                latitude={popup.lat}
                closeOnClick={false}
                onClose={() => setPopup(null)}
                anchor="top"
              >
                <div className="text-sm">
                  <p className="font-bold">{popup.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{popup.desc}</p>
                </div>
              </Popup>
            )}
            </Map>
          )}
        </div>
      </div>
    </div>
  );
}
