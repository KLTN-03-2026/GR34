import { useState, useEffect } from "react";
import Map, { Marker, NavigationControl, GeolocateControl } from "react-map-gl";
import { MapPinOff } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// Bản đồ chọn địa chỉ
export default function MapPicker({ defaultPos, onConfirm, onCancel }) {
  const [viewState, setViewState] = useState(null);
  const [marker, setMarker] = useState(null);


  const [geoError, setGeoError] = useState(false);

  useEffect(() => {
    setGeoError(false);


    const fetchLocationByIP = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();

        if (data.latitude && data.longitude) {

          setViewState({
            latitude: data.latitude,
            longitude: data.longitude,
            zoom: 12,
          });
          setMarker({ latitude: data.latitude, longitude: data.longitude });
        } else {
          setGeoError(true);
        }
      } catch (err) {
        setGeoError(true);
      }
    };


    if (defaultPos && defaultPos[0] && defaultPos[1]) {
      setViewState({
        latitude: defaultPos[0],
        longitude: defaultPos[1],
        zoom: 15,
      });
      setMarker({ latitude: defaultPos[0], longitude: defaultPos[1] });
    } else if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setViewState({ latitude, longitude, zoom: 15 });
          setMarker({ latitude, longitude });
        },
        (error) => {

          fetchLocationByIP();
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
      );
    } else {

      fetchLocationByIP();
    }
  }, [defaultPos]);

  if (geoError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-gray-300 shadow-sm p-6 text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4 shadow-inner">
          <MapPinOff size={40} />
        </div>
        <h3 className="text-xl font-bold text-[#113e48] mb-2">
          Không thể tự động định vị
        </h3>
        <p className="text-sm text-gray-500 mb-6 max-w-sm">
          Trình duyệt đang chặn quyền truy cập vị trí hoặc thiết bị không hỗ
          trợ. Bạn có muốn bỏ qua định vị tự động và tự chọn vị trí trên bản đồ
          không?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm font-bold hover:bg-gray-100 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={() => {
              setGeoError(false);
              const fallback = { latitude: 16.0544, longitude: 108.2022 };
              setViewState({ ...fallback, zoom: 15 });
              setMarker(fallback);
            }}
            className="px-5 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 shadow-md transition-colors"
          >
            Chọn tay trên bản đồ
          </button>
        </div>
      </div>
    );
  }

  if (!viewState || !marker) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-gray-300 shadow-sm">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-gray-500 font-bold text-sm">
          Đang tìm vị trí của bạn...
        </p>
      </div>
    );
  }


  return (
    <div className="w-full h-full relative flex flex-col rounded-xl overflow-hidden border border-gray-300 shadow-sm bg-white">
      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        onClick={(evt) =>
          setMarker({ latitude: evt.lngLat.lat, longitude: evt.lngLat.lng })
        }
        style={{ width: "100%", height: "100%", flex: 1 }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        cursor="crosshair"
      >
        <GeolocateControl
          position="top-left"
          showUserLocation={true}
          onGeolocate={(e) => {
            setMarker({
              latitude: e.coords.latitude,
              longitude: e.coords.longitude,
            });
          }}
        />
        <NavigationControl position="top-left" />

        <Marker
          longitude={marker.longitude}
          latitude={marker.latitude}
          anchor="bottom"
          draggable
          onDragEnd={(evt) =>
            setMarker({ latitude: evt.lngLat.lat, longitude: evt.lngLat.lng })
          }
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

      {/* Phần giao diện */}
      <div className="bg-white p-4 border-t flex justify-between items-center z-10">
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            Tọa độ đã chọn:
          </span>
          <span className="text-sm font-mono text-blue-600 font-bold">
            {marker.latitude.toFixed(6)}, {marker.longitude.toFixed(6)}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="px-5 py-2 rounded-lg bg-gray-100 text-gray-600 text-sm font-semibold hover:bg-gray-200 transition"
          >
            Hủy
          </button>
          <button
            onClick={() =>
              onConfirm({ lat: marker.latitude, lng: marker.longitude })
            }
            className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}