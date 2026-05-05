import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import API from "../services/api";
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
  const initialCode = searchParams.get("code") || "";

  const [code, setCode] = useState(initialCode);
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

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (initialCode) handleSearch();
  }, [initialCode]);


  const getStatusInfo = (status) => {
    if (!status)
      return {
        text: "Không xác định",
        color: "text-gray-500",
        bg: "bg-gray-100",
        icon: <FaClock />,
      };
    const s = status.toLowerCase();
    if (s.includes("pending") || s.includes("created") || s === "chờ lấy hàng")
      return {
        text: "Đang chờ lấy hàng",
        color: "text-blue-600",
        bg: "bg-blue-50",
        icon: <FaClock />,
      };
    if (s.includes("picked") || s.includes("taking") || s === "đã lấy hàng")
      return {
        text: "Đã lấy hàng",
        color: "text-indigo-600",
        bg: "bg-indigo-50",
        icon: <FaBoxOpen />,
      };
    if (
      s.includes("transit") ||
      s.includes("shipping") ||
      s === "đang vận chuyển"
    )
      return {
        text: "Đang vận chuyển",
        color: "text-orange-500",
        bg: "bg-orange-50",
        icon: <FaTruck />,
      };
    if (
      s.includes("delivered") ||
      s.includes("success") ||
      s.includes("completed")
    )
      return {
        text: "Giao thành công",
        color: "text-green-600",
        bg: "bg-green-50",
        icon: <FaCheckCircle />,
      };
    if (s.includes("cancel") || s === "đã hủy")
      return {
        text: "Đã hủy",
        color: "text-red-600",
        bg: "bg-red-50",
        icon: <FaTimesCircle />,
      };
    return {
      text: status,
      color: "text-[#113e48]",
      bg: "bg-gray-100",
      icon: <FaBoxOpen />,
    };
  };


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
  const handleSearch = async () => {
    setError("");
    setSuccess("");
    setShipment(null);
    setRouteGeoJSON(null);
    setDriverPos(null);
    if (animationRef.current) clearInterval(animationRef.current);

    if (!code.trim()) {
      setError("⚠️ Vui lòng nhập mã vận đơn!");
      return;
    }

    const customerId = localStorage.getItem("customer_id");
    setLoading(true);

    try {
      let url = `/customers/track/${code.trim()}`;
      if (customerId) {
        url += `?customer_id=${customerId}`;
      } else {
        if (!last4 || last4.length !== 4) {
          setError("⚠️ Vui lòng nhập 4 số cuối SĐT người nhận!");
          setLoading(false);
          return;
        }
        url += `?last4=${last4.trim()}`;
      }

      const res = await API.get(url);
      if (!res.data) {
        setError("❌ Không tìm thấy đơn hàng!");
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
      setError("❌ Mã vận đơn không hợp lệ hoặc không có quyền!");
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

    const features = [];


    if (pickup)
      features.push({
        type: "Feature",
        geometry: { type: "Point", coordinates: [pickup[1], pickup[0]] },
      });
    if (delivery)
      features.push({
        type: "Feature",
        geometry: { type: "Point", coordinates: [delivery[1], delivery[0]] },
      });
    if (routeGeoJSON) features.push(routeGeoJSON);

    if (features.length === 0) return;


    const featureCollection = { type: "FeatureCollection", features: features };

    try {
      const [minLng, minLat, maxLng, maxLat] = bbox(featureCollection);


      const isSamePoint = minLng === maxLng && minLat === maxLat;

      if (isSamePoint) {

        mapRef.current.flyTo({
          center: [minLng, minLat],
          zoom: 14,
          duration: 1000,
        });
      } else {

        mapRef.current.fitBounds(
          [
            [minLng, minLat],
            [maxLng, maxLat],
          ],
          {
            padding: 80,
            duration: 1500,
            maxZoom: 14,
          }
        );
      }
    } catch (error) {
    }
  }, [routeGeoJSON, pickup, delivery, shipment?.status]);


  const statusInfo = shipment ? getStatusInfo(shipment.status) : null;

  return (
    <div className="font-sans bg-slate-50 min-h-screen text-slate-700">
      {/* Khối nội dung */}
      <section className="relative pt-24 pb-32 bg-[#113e48] text-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        ></div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <span
            className="inline-block py-1.5 px-4 rounded-full bg-white/10 border border-white/20 text-orange-400 text-sm font-bold mb-6 uppercase tracking-wider backdrop-blur-md"
            data-aos="fade-down"
          >
            Realtime Tracking System
          </span>
          <h1
            className="text-3xl md:text-5xl font-extrabold mb-4"
            data-aos="fade-up"
          >
            Tra Cứu Hành Trình Đơn Hàng
          </h1>
          <p
            className="text-blue-100 text-lg mb-8"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            Theo dõi vị trí thực tế và trạng thái đơn hàng của bạn mọi lúc, mọi
            nơi.
          </p>
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
                onClick={handleSearch}
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
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div className="mt-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm font-medium flex items-center gap-2">
              {success}
            </div>
          )}
        </div>
      </section>

      {/* Render điều kiện */}
      {shipment && statusInfo && (
        <section className="py-16 px-6 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Phần giao diện */}
            <div className="lg:col-span-1 space-y-6" data-aos="fade-right">
              {/* Phần giao diện */}
              <div
                className={`p-6 rounded-3xl shadow-lg border-l-8 ${
                  statusInfo.bg
                } border-l-[${statusInfo.color.split("-")[1]}-500]`}
              >
                <h3 className="text-gray-500 text-sm font-bold uppercase mb-2">
                  Trạng thái hiện tại
                </h3>
                <div
                  className={`flex items-center gap-3 text-2xl font-black ${statusInfo.color}`}
                >
                  {statusInfo.icon} <span>{statusInfo.text}</span>
                </div>
                <p className="text-sm text-gray-500 mt-3 flex items-center gap-1">
                  <FaCalendarAlt /> Cập nhật:{" "}
                  {new Date(shipment.created_at).toLocaleString("vi-VN")}
                </p>
              </div>

              {/* Phần giao diện */}
              <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
                <h3 className="text-lg font-bold text-[#113e48] mb-4 flex items-center gap-2">
                  <FaBoxOpen className="text-orange-500" /> Thông tin kiện hàng
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500 text-sm">Mã đơn</span>
                    <span className="font-bold text-[#113e48]">
                      {shipment.tracking_code}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500 text-sm">Người gửi</span>
                    <span className="font-bold text-[#113e48]">
                      {shipment.sender_name}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500 text-sm">Người nhận</span>
                    <span className="font-bold text-[#113e48]">
                      {shipment.receiver_name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <span className="text-gray-500 text-sm">Thu hộ (COD)</span>
                    <span className="font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">
                      {parseInt(shipment.cod_amount || 0).toLocaleString(
                        "vi-VN"
                      )}{" "}
                      VNĐ
                    </span>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <h4 className="font-bold text-gray-700 mb-2 flex items-center gap-2 text-sm">
                    <FaMapMarkerAlt className="text-red-500" /> Địa chỉ nhận
                    hàng
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-3 rounded-xl">
                    {shipment.delivery_address}
                  </p>
                </div>
              </div>
            </div>

            {/* Phần giao diện */}
            <div className="lg:col-span-2" data-aos="fade-left">
              <div className="bg-white p-2 rounded-3xl shadow-xl border border-gray-200 h-[600px] relative z-0 overflow-hidden">
                <Map
                  ref={mapRef}
                  initialViewState={{
                    longitude: pickup ? pickup[1] : 106.7009,
                    latitude: pickup ? pickup[0] : 10.7769,
                    zoom: 6,
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
                          "line-color": "#f97316",
                          "line-width": 5,
                          "line-opacity": 0.8,
                          "line-dasharray": [2, 1],
                        }}
                        layout={{ "line-join": "round", "line-cap": "round" }}
                      />
                    </Source>
                  )}

                  {/* Render điều kiện */}
                  {pickup && (
                    <Marker
                      longitude={pickup[1]}
                      latitude={pickup[0]}
                      anchor="bottom"
                    >
                      <CustomMarker
                        icon={<FaBoxOpen size={20} />}
                        bgColor="bg-blue-600"
                        ringColor="bg-blue-400"
                      />
                      <Popup
                        longitude={pickup[1]}
                        latitude={pickup[0]}
                        offset={25}
                        closeButton={false}
                        closeOnClick={false}
                        anchor="top"
                      >
                        <div className="font-bold text-xs p-1">
                          📦 Điểm lấy hàng
                        </div>
                      </Popup>
                    </Marker>
                  )}

                  {/* Render điều kiện */}
                  {delivery && (
                    <Marker
                      longitude={delivery[1]}
                      latitude={delivery[0]}
                      anchor="bottom"
                    >
                      <CustomMarker
                        icon={<FaMapMarkerAlt size={20} />}
                        bgColor="bg-orange-600"
                        ringColor="bg-orange-400"
                      />
                      <Popup
                        longitude={delivery[1]}
                        latitude={delivery[0]}
                        offset={25}
                        closeButton={false}
                        closeOnClick={false}
                        anchor="top"
                      >
                        <div className="font-bold text-xs p-1">
                          🏠 Điểm giao hàng
                        </div>
                      </Popup>
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
                        icon={<FaTruck size={20} />}
                        bgColor="bg-[#113e48]"
                        ringColor="bg-[#113e48]"
                      />
                      <Popup
                        longitude={driverPos[1]}
                        latitude={driverPos[0]}
                        offset={25}
                        closeButton={false}
                        closeOnClick={false}
                        anchor="top"
                      >
                        <div className="text-center font-bold text-xs p-1">
                          {shipment.status === "completed" ||
                          shipment.status === "delivered" ? (
                            <span className="text-green-600">
                              Đã giao hàng
                            </span>
                          ) : (
                            <>
                              🚚 Đang vận chuyển <br />
                              <span className="text-[10px] text-gray-500 font-normal">
                                Tốc độ: 50km/h
                              </span>
                            </>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  )}
                </Map>

                {/* Phần giao diện */}
                <div className="absolute bottom-6 left-6 z-[1000] bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-lg max-w-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                      <FaTruck />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase">
                        Trạng thái xe
                      </p>
                      <p className="font-bold text-[#113e48]">
                        {shipment.status === "picking" ||
                        shipment.status === "delivering"
                          ? "Đang di chuyển"
                          : shipment.status === "completed" ||
                            shipment.status === "delivered"
                          ? "Đã đến nơi"
                          : "Chưa xuất phát"}
                      </p>
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