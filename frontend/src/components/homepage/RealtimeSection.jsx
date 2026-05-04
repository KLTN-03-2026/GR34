import { useState, useEffect } from "react";

import Map, { Marker, NavigationControl } from "react-map-gl";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import { useChat } from "../../hooks/useChat.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRobot,
  faMapLocationDot,
  faHeadset,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";

export default function AIRealtimeSection() {

  const [driverPos, setDriverPos] = useState([16.0678, 108.2208]);
  const { openAIChat, openSupportChat } = useChat();


  useEffect(() => {
    const timer = setInterval(() => {
      setDriverPos((prev) => [
        prev[0] + (Math.random() - 0.5) * 0.005,
        prev[1] + (Math.random() - 0.5) * 0.005,
      ]);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-orange-50 to-transparent pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-start relative z-10">
        {}
        <div data-aos="fade-right">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 text-orange-600 mb-6 border border-orange-200">
            <FontAwesomeIcon icon={faRobot} className="text-xl" />
            <span className="font-bold text-lg uppercase tracking-wider">
              Hỗ trợ toàn diện
            </span>
          </div>

          <h3 className="text-3xl md:text-4xl font-extrabold text-[#113e48] mb-6 leading-tight">
            Công Nghệ AI & <br />
            <span className="text-orange-500">Con Người Kết Hợp</span>
          </h3>

          <p className="text-slate-600 text-lg mb-10 leading-relaxed">
            SpeedyShip mang đến trải nghiệm hỗ trợ khách hàng vượt trội nhờ sự
            kết hợp giữa tốc độ của AI và sự tận tâm của đội ngũ tư vấn viên.
          </p>

          <div className="grid sm:grid-cols-2 gap-6">
            {}
            <div className="relative bg-white p-6 rounded-2xl shadow-md border border-[#113e48] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden">
              <div className="absolute inset-0 bg-orange-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-0"></div>
              <div className="absolute top-0 -left-[100%] w-full h-full bg-white/20 skew-x-[45deg] group-hover:left-[100%] transition-all duration-700 z-1"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-xl mb-4 group-hover:bg-white/20 group-hover:text-white transition">
                  <FontAwesomeIcon icon={faRobot} />
                </div>
                <h4 className="text-xl font-bold text-[#113e48] mb-2 group-hover:text-white">
                  Trợ Lý AI 24/7
                </h4>
                <p className="text-slate-500 text-sm mb-6 min-h-[60px] group-hover:text-white/90">
                  Trả lời tức thì mọi câu hỏi về giá cước, lộ trình và trạng
                  thái.
                </p>
                <button
                  onClick={openAIChat}
                  className="text-[#113e48] font-bold text-sm uppercase flex items-center gap-2 group-hover:text-white"
                >
                  Chat với AI <FontAwesomeIcon icon={faArrowRight} />
                </button>
              </div>
            </div>

            {}
            <div className="relative bg-white p-6 rounded-2xl shadow-md border border-orange-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden">
              <div className="absolute inset-0 bg-[#113e48] translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-0"></div>
              <div className="absolute top-0 -left-[100%] w-full h-full bg-white/20 skew-x-[45deg] group-hover:left-[100%] transition-all duration-700 z-1"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-full bg-orange-200 flex items-center justify-center text-xl mb-4 group-hover:bg-white/20 group-hover:text-white transition">
                  <FontAwesomeIcon icon={faHeadset} />
                </div>
                <h4 className="text-xl font-bold text-orange-500 mb-2 group-hover:text-white">
                  Tư Vấn Viên
                </h4>
                <p className="text-slate-500 text-sm mb-6 min-h-[60px] group-hover:text-white/90">
                  Kết nối trực tiếp với nhân viên hỗ trợ khi cần.
                </p>
                <button
                  onClick={openSupportChat}
                  className="text-orange-500 font-bold text-sm uppercase flex items-center gap-2 group-hover:text-white"
                >
                  Gặp nhân viên <FontAwesomeIcon icon={faArrowRight} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {}
        <div data-aos="fade-left" className="relative mt-8 lg:mt-0">
          <div className="bg-white rounded-[30px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-2 border relative z-10 overflow-hidden">
            <div className="px-6 py-5 flex justify-between items-center border-b bg-white z-20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <FontAwesomeIcon icon={faMapLocationDot} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Hoạt động hôm nay
                  </p>
                  <p className="text-xs text-slate-500">
                    Dữ liệu thời gian thực
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-[#113e48]">3,214</p>
                <div className="flex items-center gap-1 justify-end">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-[10px] font-bold text-green-600 uppercase">
                    Live
                  </span>
                </div>
              </div>
            </div>

            <div className="h-[400px] w-full rounded-[24px] overflow-hidden mt-2">
              <Map
                mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
                initialViewState={{
                  longitude: driverPos[1],
                  latitude: driverPos[0],
                  zoom: 13,
                }}
                longitude={driverPos[1]}
                latitude={driverPos[0]}
                zoom={13}
                style={{ width: "100%", height: "100%" }}
                mapStyle="mapbox://styles/mapbox/streets-v12"
              >
                <NavigationControl position="bottom-right" />

                <Marker
                  longitude={driverPos[1]}
                  latitude={driverPos[0]}
                  anchor="center"
                >
                  <div className="relative">
                    <span className="absolute -inset-3 rounded-full bg-orange-400 opacity-30 animate-ping"></span>
                    <span className="block w-4 h-4 bg-orange-500 rounded-full"></span>
                  </div>
                </Marker>
              </Map>

              <div className="absolute bottom-4 left-4 z-[500] bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                  Xem hành trình trực tiếp: Xe #8392
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-200 rounded-full blur-3xl opacity-30"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-200 rounded-full blur-3xl opacity-30"></div>
        </div>
      </div>
    </section>
  );
}
