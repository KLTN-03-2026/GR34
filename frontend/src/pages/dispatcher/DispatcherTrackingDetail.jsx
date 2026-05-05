import { useEffect, useState, useRef } from "react";
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
import {
  ArrowLeft,
  Package,
  Phone,
  Truck,
  Clock,
  CheckCircle,
  MapPin,
  User,
} from "lucide-react";


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


const translateStatus = (status) => {
  const map = {
    pending: "Chờ xử lý",
    assigned: "Đã phân công",
    picking: "Đang lấy hàng",
    delivering: "Đang giao hàng",
    delivered: "Đã giao hàng",
    completed: "Hoàn tất",
    failed: "Giao thất bại",
    canceled: "Đã hủy",
  };
  return map[status] || status;
};


// Chi tiết vận đơn đang theo dõi
export default function DispatcherTrackingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const mapRef = useRef(null);

  const [shipment, setShipment] = useState(null);
  const [routeGeoJSON, setRouteGeoJSON] = useState(null);
  const [pickup, setPickup] = useState(null);
  const [delivery, setDelivery] = useState(null);
  const [driverPos, setDriverPos] = useState(null);
  const [popupInfo, setPopupInfo] = useState(null);


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

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await API.get(`/dispatcher/shipments/${id}`);
        const data = res.data;
        setShipment(data);


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

          if (data.driver_lat) {
            setDriverPos([Number(data.driver_lat), Number(data.driver_lng)]);
          } else {
            setDriverPos(pk);
          }
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
      }
    };
    fetchDetail();
  }, [id]);


  useEffect(() => {

    if (!mapRef.current || !pickup || !delivery) return;

    const features = [];

    features.push({
      type: "Feature",
      geometry: { type: "Point", coordinates: [pickup[1], pickup[0]] },
    });
    features.push({
      type: "Feature",
      geometry: { type: "Point", coordinates: [delivery[1], delivery[0]] },
    });


    if (routeGeoJSON) features.push(routeGeoJSON);

    const featureCollection = { type: "FeatureCollection", features: features };

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
  }, [routeGeoJSON, pickup, delivery]);

  if (!shipment)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 pb-10 font-sans">
      {}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-50 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              Vận đơn{" "}
              <span className="text-blue-600">#{shipment.tracking_code}</span>
            </h1>
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <Clock size={12} /> Cập nhật:{" "}
              {new Date(shipment.updated_at).toLocaleString("vi-VN")}
            </p>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-bold border ${
            shipment.status === "completed"
              ? "bg-green-100 text-green-700 border-green-200"
              : shipment.status === "delivering"
              ? "bg-orange-100 text-orange-700 border-orange-200"
              : "bg-blue-100 text-blue-700 border-blue-200"
          }`}
        >
          {translateStatus(shipment.status)}
        </span>
      </div>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {}
        <div className="lg:col-span-1 space-y-6">
          {}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-6">
            <div className="flex gap-4 relative">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Package size={16} />
                </div>
                <div className="w-0.5 h-full bg-gray-200 my-1"></div>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                  Người gửi
                </p>
                <p className="font-bold text-gray-800">
                  {shipment.sender_name}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {shipment.pickup_address}
                </p>
              </div>
            </div>
            <div className="flex gap-4 relative">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                  <MapPin size={16} />
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                  Người nhận
                </p>
                <p className="font-bold text-gray-800">
                  {shipment.receiver_name}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {shipment.delivery_address}
                </p>
              </div>
            </div>
          </div>

          {}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <User size={18} className="text-gray-400" /> Thông tin tài xế
            </h3>
            {shipment.driver_name ? (
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl">
                  👮‍♂️
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-800">
                    {shipment.driver_name}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Truck size={12} />{" "}
                    {shipment.plate_number || "Chưa có biển số"}
                  </p>
                </div>
                <a
                  href={`tel:${shipment.driver_phone}`}
                  className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition shadow-lg hover:scale-110"
                >
                  <Phone size={18} />
                </a>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic text-center py-2">
                Chưa phân công tài xế
              </p>
            )}
          </div>
        </div>

        {}
        <div className="lg:col-span-2 h-[600px] bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
          <Map
            ref={mapRef}
            initialViewState={{
              longitude: 106.6297,
              latitude: 10.8231,
              zoom: 6,
            }}
            style={{ width: "100%", height: "100%" }}
            mapStyle="mapbox://styles/mapbox/streets-v12"
            mapboxAccessToken={MAPBOX_TOKEN}
          >
            <NavigationControl position="bottom-right" />

            {}
            {routeGeoJSON && (
              <Source id="route" type="geojson" data={routeGeoJSON}>
                <Layer
                  id="route-line"
                  type="line"
                  paint={{
                    "line-color": "#3B82F6",
                    "line-width": 5,
                    "line-opacity": 0.8,
                  }}
                  layout={{ "line-join": "round", "line-cap": "round" }}
                />
              </Source>
            )}

            {}
            {pickup && (
              <Marker
                longitude={pickup[1]}
                latitude={pickup[0]}
                anchor="bottom"
              >
                <CustomMarker
                  icon={<Package size={20} />}
                  bgColor="bg-blue-600"
                  ringColor="bg-blue-400"
                  onClick={(e) => {
                    e.originalEvent.stopPropagation();
                    setPopupInfo({
                      lat: pickup[0],
                      lng: pickup[1],
                      title: "Điểm lấy hàng",
                      desc: shipment.pickup_address,
                      color: "text-blue-600",
                    });
                  }}
                />
              </Marker>
            )}

            {}
            {delivery && (
              <Marker
                longitude={delivery[1]}
                latitude={delivery[0]}
                anchor="bottom"
              >
                <CustomMarker
                  icon={<MapPin size={20} fill="currentColor" />}
                  bgColor="bg-orange-600"
                  ringColor="bg-orange-400"
                  onClick={(e) => {
                    e.originalEvent.stopPropagation();
                    setPopupInfo({
                      lat: delivery[0],
                      lng: delivery[1],
                      title: "Điểm giao hàng",
                      desc: shipment.delivery_address,
                      color: "text-orange-600",
                    });
                  }}
                />
              </Marker>
            )}

            {}
            {driverPos && (
              <Marker
                longitude={driverPos[1]}
                latitude={driverPos[0]}
                anchor="bottom"
              >
                <CustomMarker
                  icon={<Truck size={20} />}
                  bgColor="bg-gray-800"
                  ringColor="bg-gray-600"
                  onClick={(e) => {
                    e.originalEvent.stopPropagation();
                    setPopupInfo({
                      lat: driverPos[0],
                      lng: driverPos[1],
                      title: "Vị trí tài xế",
                      desc: "Tài xế đang hoạt động",
                      color: "text-gray-800",
                    });
                  }}
                />
              </Marker>
            )}

            {}
            {popupInfo && (
              <Popup
                anchor="top"
                longitude={popupInfo.lng}
                latitude={popupInfo.lat}
                onClose={() => setPopupInfo(null)}
                closeOnClick={false}
                offset={15}
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
        </div>
      </div>
    </div>
  );
}
