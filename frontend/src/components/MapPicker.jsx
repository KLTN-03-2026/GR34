import { useState, useEffect, useRef, useCallback } from "react";
import Map, { Marker } from "react-map-gl";
import { MapPinOff, MapPin, Loader2, ZoomIn, ZoomOut, Maximize2, Minimize2, Navigation } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// Lọc bỏ mã bưu chính, "Việt Nam" / "Vietnam" khỏi địa chỉ trả về từ reverse geocode
const stripAddress = (raw) => {
  const parts = raw.split(",").map((p) => p.trim()).filter(Boolean);
  const filtered = parts.filter((p) => {
    const low = p.toLowerCase();
    if (low === "việt nam" || low === "vietnam") return false;
    if (/^\d{4,6}$/.test(p)) return false;
    return true;
  });
  return filtered.join(", ");
};

// Bản đồ chọn địa chỉ
export default function MapPicker({ defaultPos, onConfirm, onCancel }) {
  const mapRef = useRef(null);
  const [viewState, setViewState] = useState(null);
  const [marker, setMarker] = useState(null);
  const [address, setAddress] = useState("");
  const [loadingAddr, setLoadingAddr] = useState(false);
  const [geoError, setGeoError] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(15);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const debounceRef = useRef(null);

  // Ổn định — không bị tạo lại ở mỗi lần render
  const reverseGeocode = useCallback(async (lat, lng) => {
    setLoadingAddr(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=vi`,
        { headers: { "User-Agent": "SpeedyShip/1.0" } },
      );
      const data = await res.json();
      setAddress(stripAddress(data?.display_name || ""));
    } catch {
      setAddress("");
    } finally {
      setLoadingAddr(false);
    }
  }, []);

  useEffect(() => {
    setGeoError(false);

    const fetchLocationByIP = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        if (data.latitude && data.longitude) {
          setViewState({ latitude: data.latitude, longitude: data.longitude, zoom: 15 });
          setMarker({ latitude: data.latitude, longitude: data.longitude });
        } else {
          setGeoError(true);
        }
      } catch {
        setGeoError(true);
      }
    };

    if (defaultPos && defaultPos[0] && defaultPos[1]) {
      setViewState({ latitude: defaultPos[0], longitude: defaultPos[1], zoom: 15 });
      setMarker({ latitude: defaultPos[0], longitude: defaultPos[1] });
    } else if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setViewState({ latitude, longitude, zoom: 15 });
          setMarker({ latitude, longitude });
        },
        () => fetchLocationByIP(),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
      );
    } else {
      fetchLocationByIP();
    }
  }, [defaultPos]);

  // Reverse geocode khi điểm đánh dấu thay đổi
  useEffect(() => {
    if (!marker) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => reverseGeocode(marker.latitude, marker.longitude), 400);
    return () => clearTimeout(debounceRef.current);
  }, [marker?.latitude, marker?.longitude]);

  const handleZoomIn = () => {
    if (!mapRef.current) return;
    const z = Math.min(currentZoom + 1, 20);
    setCurrentZoom(z);
    mapRef.current.zoomTo(z, { duration: 300 });
  };

  const handleZoomOut = () => {
    if (!mapRef.current) return;
    const z = Math.max(currentZoom - 1, 1);
    setCurrentZoom(z);
    mapRef.current.zoomTo(z, { duration: 300 });
  };

  const handleFullscreen = () => {
    const el = document.getElementById("mappicker-container");
    if (!el) return;
    if (!isFullscreen) {
      el.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  if (geoError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-gray-300 shadow-sm p-6 text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4 shadow-inner">
          <MapPinOff size={40} />
        </div>
        <h3 className="text-xl font-bold text-[#113e48] mb-2">Không thể tự động định vị</h3>
        <p className="text-sm text-gray-500 mb-6 max-w-sm">
          Trình duyệt đang chặn quyền truy cập vị trí hoặc thiết bị không hỗ trợ. Bạn có muốn bỏ qua định vị tự động và tự chọn vị trí trên bản đồ không?
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm font-bold hover:bg-gray-100 transition-colors">Hủy</button>
          <button onClick={() => { setGeoError(false); const f = { latitude: 16.0544, longitude: 108.2022 }; setViewState({ ...f, zoom: 15 }); setMarker(f); }} className="px-5 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 shadow-md transition-colors">Chọn tay trên bản đồ</button>
        </div>
      </div>
    );
  }

  if (!viewState || !marker) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-gray-300 shadow-sm">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-gray-500 font-bold text-sm">Đang tìm vị trí của bạn...</p>
      </div>
    );
  }

  return (
    <div
      id="mappicker-container"
      className="w-full h-full relative flex flex-col rounded-xl overflow-hidden border border-gray-300 shadow-sm bg-white animate-zoom-pop"
    >
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt) => { setViewState(evt.viewState); setCurrentZoom(evt.viewState.zoom); }}
        onClick={(evt) => setMarker({ latitude: evt.lngLat.lat, longitude: evt.lngLat.lng })}
        style={{ width: "100%", height: "100%", flex: 1 }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        cursor="crosshair"
      >
        <Marker
          longitude={marker.longitude}
          latitude={marker.latitude}
          anchor="bottom"
          draggable
          onDragEnd={(evt) => setMarker({ latitude: evt.lngLat.lat, longitude: evt.lngLat.lng })}
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/684/684908.png"
            width={40}
            height={40}
            alt="marker"
            className="drop-shadow-lg cursor-pointer hover:scale-110 transition-transform"
          />
        </Marker>
      </Map>

      {/* Nút điều khiển phóng to/thu nhỏ — góc trên bên trái */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        <button onClick={handleZoomIn} className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors border border-gray-200" title="Phóng to">
          <ZoomIn size={18} className="text-gray-700" />
        </button>
        <button onClick={handleZoomOut} className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors border border-gray-200" title="Thu nhỏ">
          <ZoomOut size={18} className="text-gray-700" />
        </button>
        <button onClick={handleFullscreen} className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors border border-gray-200" title={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}>
          {isFullscreen ? <Minimize2 size={18} className="text-gray-700" /> : <Maximize2 size={18} className="text-gray-700" />}
        </button>
      </div>

      {/* Mức thu phóng — góc trên bên phải */}
      <div className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg border border-gray-200">
        <span className="text-xs font-medium text-gray-600">Zoom: {currentZoom.toFixed(1)}</span>
      </div>

      {/* Khung thông tin địa chỉ */}
      <div className="bg-gradient-to-r from-slate-50 to-white px-5 py-4 border-t border-slate-200 z-10">
        <div className="flex items-center justify-between gap-4">
          {/* Địa chỉ / trạng thái đang tải */}
          <div className="min-w-0 flex-1">
            {loadingAddr ? (
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <Loader2 size={12} className="animate-spin text-blue-500" />
                Đang dịch địa chỉ...
              </span>
            ) : address ? (
              <div className="flex items-start gap-1.5">
                <Navigation size={13} className="text-orange-500 shrink-0 mt-0.5" />
                <span className="text-[13px] text-slate-600 leading-snug break-words">{address}</span>
              </div>
            ) : null}
          </div>
          {/* Nút bấm */}
          <div className="flex gap-2 shrink-0">
            <button onClick={onCancel} className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all">Hủy</button>
            <button onClick={() => onConfirm({ lat: marker.latitude, lng: marker.longitude })} className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-1.5">
              <MapPin size={15} /> Xác nhận
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
