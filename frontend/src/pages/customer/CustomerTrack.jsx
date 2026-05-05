import { useState, useEffect, useRef } from "react";
import API from "../../services/api";
import toast from "react-hot-toast";
import {
  Search,
  User,
  Phone,
  Truck,
  MapPin,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
} from "lucide-react";
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
import AOS from "aos";
import "aos/dist/aos.css";


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

// Tra cứu hành trình đơn hàng
export default function CustomerTrack() {
  const [trackingCode, setTrackingCode] = useState("");
  const [shipment, setShipment] = useState(null);
  const [routeGeoJSON, setRouteGeoJSON] = useState(null);
  const [waypoints, setWaypoints] = useState([]);
  const [driverPos, setDriverPos] = useState(null);
  const [loading, setLoading] = useState(false);
  const [popupInfo, setPopupInfo] = useState(null);

  const mapRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    AOS.init({ duration: 500 });
  }, []);


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
        return {
          type: "Feature",
          geometry: data.routes[0].geometry,
        };
      }
    } catch (error) {
    }
    return null;
  };

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!trackingCode.trim())
      return toast.error("⚠️ Vui lòng nhập mã vận đơn!");

    setLoading(true);
    setShipment(null);
    setRouteGeoJSON(null);
    setWaypoints([]);
    setDriverPos(null);
    setPopupInfo(null);
    if (animationRef.current) clearInterval(animationRef.current);

    try {
      const customerId =
        localStorage.getItem("customer_id") || localStorage.getItem("userId");
      const res = await API.get(
        `/customers/track/${trackingCode}?customer_id=${customerId}`
      );
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


      if (!pickup) pickup = [10.7769, 106.7009];
      if (!delivery) delivery = [21.0285, 105.8542];

      setWaypoints([pickup, delivery]);


      if (data.status === "picking" || data.status === "delivering") {

        const geoJson = await fetchRouteOSRM(pickup, delivery);
        setRouteGeoJSON(geoJson);
      } else if (
        data.status === "completed" ||
        data.status === "delivered" ||
        data.status === "success"
      ) {

        setDriverPos(delivery);
        setRouteGeoJSON(null);
      } else {

        setDriverPos(null);
        setRouteGeoJSON(null);
      }

      toast.success("Đã tìm thấy đơn hàng!");
    } catch (err) {
      toast.error("❌ Không tìm thấy đơn hàng hoặc bạn không có quyền xem!");
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
    if (!mapRef.current || waypoints.length === 0) return;

    let features = [];


    waypoints.forEach((pt) => {
      features.push({
        type: "Feature",
        geometry: { type: "Point", coordinates: [pt[1], pt[0]] },
      });
    });

    if (routeGeoJSON) features.push(routeGeoJSON);

    if (features.length > 0) {
      const featureCollection = {
        type: "FeatureCollection",
        features: features,
      };

      try {
        const [minLng, minLat, maxLng, maxLat] = bbox(featureCollection);


        const isSamePoint = minLng === maxLng && minLat === maxLat;

        if (isSamePoint) {
          mapRef.current.flyTo({ center: [minLng, minLat], zoom: 14 });
        } else {
          mapRef.current.fitBounds(
            [
              [minLng, minLat],
              [maxLng, maxLat],
            ],
            { padding: 80, duration: 1500, maxZoom: 14 }
          );
        }
      } catch (error) {
      }
    }
  }, [routeGeoJSON, waypoints, shipment]);


  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "picking":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "delivering":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "completed":
      case "delivered":
        return "text-green-600 bg-green-50 border-green-200";
      case "failed":
        return "text-red-600 bg-red-50 border-red-200";
      case "cancelled":
        return "text-gray-600 bg-gray-50 border-gray-200";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

// Lấy nhãn tên trạng thái tiếng Việt
  const getStatusLabel = (status) => {
    const map = {
      pending: "Chờ xử lý",
      assigned: "Đã phân công",
      picking: "Đang lấy hàng",
      delivering: "Đang giao hàng",
      delivered: "Đã giao hàng",
      completed: "Hoàn tất",
      failed: "Giao thất bại",
      cancelled: "Đã hủy",
    };
    return map[status] || status;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans animate-in fade-in duration-500">
      {/* Phần giao diện */}
      <div className="bg-[#113e48] pt-10 pb-24 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/10 rounded-full blur-2xl -translate-x-1/2 translate-y-1/2"></div>

        <div className="max-w-2xl mx-auto text-center relative z-10">
          <h1 className="text-3xl font-extrabold text-white mb-2">
            Tra cứu hành trình đơn hàng
          </h1>
          <p className="text-blue-200 text-sm mb-8">
            Nhập mã vận đơn để theo dõi trạng thái và vị trí tài xế theo thời
            gian thực.
          </p>

          <form
            onSubmit={handleTrack}
            className="bg-white p-2 rounded-2xl shadow-xl flex items-center gap-2 max-w-lg mx-auto transform transition-transform hover:scale-[1.02]"
          >
            <div className="pl-4 text-gray-400">
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="VD: SP123456789"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              className="flex-1 py-3 outline-none text-gray-700 font-medium placeholder:font-normal"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold transition-colors disabled:opacity-70 flex items-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              ) : (
                "Tra cứu"
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Phần giao diện */}
      <div className="max-w-6xl mx-auto px-4 -mt-16 relative z-20">
        {shipment ? (
          <div
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            data-aos="fade-up"
          >
            {/* Phần giao diện */}
            <div className="lg:col-span-1 space-y-6">
              {/* Phần giao diện */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-bold text-gray-400">
                    TRẠNG THÁI
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-extrabold border ${getStatusColor(
                      shipment.status
                    )}`}
                  >
                    {getStatusLabel(shipment.status)}
                  </span>
                </div>
                <h2 className="text-2xl font-extrabold text-[#113e48] mb-1">
                  #{shipment.tracking_code}
                </h2>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Clock size={14} /> Cập nhật:{" "}
                  {new Date(shipment.updated_at).toLocaleString("vi-VN")}
                </p>
              </div>

              {/* Phần giao diện */}
              {shipment.driver_name ? (
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-2xl border-2 border-white shadow-sm">
                    👮‍♂️
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-400 uppercase">
                      Tài xế phụ trách
                    </p>
                    <h3 className="font-bold text-[#113e48] text-lg">
                      {shipment.driver_name}
                    </h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <Truck size={12} />{" "}
                      {shipment.plate_number || "Chưa cập nhật biển số"}
                    </p>
                  </div>
                  <a
                    href={`tel:${shipment.driver_phone}`}
                    className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition-transform hover:scale-110"
                  >
                    <Phone size={20} />
                  </a>
                </div>
              ) : (
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                    <User size={24} />
                  </div>
                  <p className="text-sm text-gray-500">
                    Đơn hàng chưa được phân công tài xế.
                  </p>
                </div>
              )}

              {/* Phần giao diện */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 space-y-6">
                <div className="flex gap-4 relative">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 ring-4 ring-blue-100"></div>
                    <div className="w-0.5 h-full bg-gray-100 my-1"></div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">
                      Điểm lấy hàng
                    </p>
                    <p className="font-bold text-[#113e48] text-sm">
                      {shipment.sender_name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                      {shipment.pickup_address}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 relative">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-orange-500 ring-4 ring-orange-100"></div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">
                      Điểm giao hàng
                    </p>
                    <p className="font-bold text-[#113e48] text-sm">
                      {shipment.receiver_name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                      {shipment.delivery_address}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Phần giao diện */}
            <div className="lg:col-span-2 h-[500px] lg:h-auto bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden relative z-0">
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
                <NavigationControl position="bottom-right" />

                {/* Render điều kiện */}
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
                      layout={{ "line-join": "round", "line-cap": "round" }}
                    />
                  </Source>
                )}

                {/* Render điều kiện */}
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

                {/* Render điều kiện */}
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

                {/* Render điều kiện */}
                {driverPos && (
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

                {/* Render điều kiện */}
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
                      <p className="text-xs text-gray-600 mt-1">
                        {popupInfo.desc}
                      </p>
                    </div>
                  </Popup>
                )}
              </Map>

              {/* Phần giao diện */}
              <div className="lg:hidden absolute top-4 left-4 right-4 bg-white/90 backdrop-blur p-3 rounded-xl shadow-lg border border-gray-100 z-[40]">
                <p className="text-xs font-bold text-gray-500 uppercase">
                  Trạng thái hiện tại
                </p>
                <p className="text-lg font-extrabold text-[#113e48]">
                  {getStatusLabel(shipment.status)}
                </p>
              </div>
            </div>
          </div>
        ) : (

          !loading && (
            <div
              className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100"
              data-aos="fade-up"
            >
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                <Package size={40} />
              </div>
              <h3 className="text-lg font-bold text-gray-700">
                Chưa có kết quả tra cứu
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                Vui lòng nhập đúng mã vận đơn để xem chi tiết hành trình.
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}