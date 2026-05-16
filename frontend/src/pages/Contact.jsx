import { useEffect, useRef, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { useChat } from "../hooks/useChat";
import ChatBubble from "../components/ChatBubble";
import API from "../services/api";
import toast from "../lib/toast";
import {
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaClock,
  FaPaperPlane,
} from "react-icons/fa";

import Map, { Marker, Popup, NavigationControl } from "react-map-gl";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const OFFICE_COORDS = {
  lat: 16.0544,
  lng: 108.2022,
};

const OfficeMarker = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      className="relative w-12 h-12 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-200"
    >
      {/* Phần giao diện */}
      <div className="absolute inset-0 bg-orange-500 rounded-full opacity-20 animate-ping"></div>

      {/* Hình ảnh minh họa */}
      <img
        src="https://cdn-icons-png.flaticon.com/512/684/684908.png"
        alt="Office"
        className="relative z-10 w-10 h-10 drop-shadow-lg"
      />

      {/* Phần giao diện */}
      <div className="absolute -bottom-2 w-3 h-3 bg-white transform rotate-45 border-r border-b border-gray-300 z-0"></div>
    </div>
  );
};

// Trang liên hệ
export default function Contact() {
  const mapRef = useRef(null);
  const miniBarRef = useRef(null);
  const imgRef = useRef(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPopup, setShowPopup] = useState(true);

  const { supportOpen, openSupportChat, closeSupportChat } = useChat();

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    window.scrollTo(0, 0);
    let rafId;
    const handleScroll = () => {
      rafId = requestAnimationFrame(() => {
        if (!miniBarRef.current) return;
        const scrollY = window.scrollY;
        if (scrollY > 380) {
          miniBarRef.current.style.opacity = "1";
          miniBarRef.current.style.transform = "translateY(0%)";
        } else {
          miniBarRef.current.style.opacity = "0";
          miniBarRef.current.style.transform = "translateY(-110%)";
        }
        if (imgRef.current) {
          const progress = Math.min(scrollY / 600, 1);
          imgRef.current.style.transform = `scale(${1 - progress * 0.12})`;
          imgRef.current.style.opacity = 1 - progress * 0.5;
        }
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.easeTo({
      center: [OFFICE_COORDS.lng, OFFICE_COORDS.lat],
      zoom: 15,
      duration: 800,
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      if (!/^\d*$/.test(value)) return;
      if (value.length > 10) return;
    }
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Vui lòng nhập họ và tên.";
    if (!form.email) {
      newErrors.email = "Vui lòng nhập email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Email không đúng định dạng (VD: abc@gmail.com).";
    }
    if (form.phone && !/^0\d{9}$/.test(form.phone)) {
      newErrors.phone = "SĐT phải bắt đầu bằng 0 và đủ 10 số.";
    }
    if (!form.message.trim()) newErrors.message = "Vui lòng nhập nội dung tin nhắn.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return toast.error("Vui lòng kiểm tra lại thông tin!");
    }
    setErrors({});

    setLoading(true);
    try {
      await API.post("/contact", form);
      toast.success("Gửi yêu cầu thành công! Cảm ơn bạn đã liên hệ.");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch {
      toast.error("Không thể gửi yêu cầu, vui lòng thử lại sau!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-sans bg-gray-50">
      

      {/* Mini-bar */}
      <div
        ref={miniBarRef}
        className="fixed top-[65px] left-0 right-0 z-30 h-16 bg-[#113e48]/97 backdrop-blur-md shadow-xl px-6 flex items-center"
        style={{
          opacity: 0,
          transform: "translateY(-110%)",
          transition: "opacity 0.4s ease, transform 0.4s ease",
        }}
      >
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
          <span className="text-orange-300 font-bold text-sm tracking-widest uppercase whitespace-nowrap">
            Liên Hệ & Hỗ Trợ SpeedyShip
          </span>
          <div className="flex items-center gap-3">
            {[
              { num: "24/7", label: "Hỗ trợ" },
              { num: "1900 888 999", label: "Hotline" },
              { num: "<1h", label: "Phản hồi" },
              { num: "100%", label: "Tận tâm" },
            ].map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 bg-slate-400/20 backdrop-blur-sm border border-slate-200/20 rounded-full px-3 py-1"
              >
                <span className="text-white font-extrabold text-sm leading-none">
                  {s.num}
                </span>
                <span className="text-white/70 text-xs hidden sm:block">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Banner ảnh */}
      <section className="w-full overflow-hidden banner-entrance">
        <img
          ref={imgRef}
          src="/assets/img/contact_banner.png"
          alt="Contact Banner"
          className="w-full block object-contain"
          style={{
            transformOrigin: "top center",
            willChange: "transform, opacity",
          }}
        />
      </section>

      {/* Header section */}
      <section
        className="relative overflow-hidden py-20 px-6"
        style={{
          background:
            "linear-gradient(135deg, #0f2027 0%, #113e48 50%, #203a43 100%)",
        }}
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Trái: tiêu đề */}
          <div data-aos="fade-right">
            <span className="inline-block py-1.5 px-4 rounded-full bg-white/10 border border-white/20 text-orange-400 text-sm font-bold mb-6 tracking-widest uppercase backdrop-blur-sm">
              Hỗ trợ 24/7
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-5 leading-tight text-white">
              Liên hệ &amp; Hỗ trợ <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300">
                SpeedyShip
              </span>
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-xl">
              SpeedyShip Đà Nẵng luôn sẵn sàng lắng nghe và hỗ trợ bạn mọi lúc
              mọi nơi. Hãy để lại lời nhắn, chúng tôi sẽ phản hồi ngay lập tức.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={openSupportChat}
                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white font-bold rounded-full shadow-lg shadow-orange-500/30 hover:-translate-y-1 transition-all flex items-center gap-2"
              >
                Gửi tin nhắn ↓
              </button>
              <a
                href="tel:1900888999"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/30 hover:bg-white hover:text-[#113e48] text-white font-bold rounded-full transition-all flex items-center gap-2"
              >
                <FaPhoneAlt className="w-4 h-4 mr-1" />
                1900 888 999
              </a>
            </div>
          </div>

          {/* Phải: stats cards */}
          <div className="grid grid-cols-2 gap-4" data-aos="fade-left">
            {[
              {
                num: "24/7",
                label: "Hỗ trợ",
                sub: "Luôn sẵn sàng",
                color: "from-slate-400/25 to-slate-600/15",
              },
              {
                num: "<1h",
                label: "Phản hồi",
                sub: "Tốc độ xử lý",
                color: "from-blue-400/25 to-blue-600/15",
              },
              {
                num: "1900 888 999",
                label: "Hotline",
                sub: "Gọi miễn phí",
                color: "from-indigo-400/25 to-indigo-600/15",
                small: true,
              },
              {
                num: "100%",
                label: "Tận tâm",
                sub: "Cam kết chất lượng",
                color: "from-slate-500/25 to-blue-700/15",
              },
            ].map((s, i) => (
              <div
                key={i}
                className={`bg-gradient-to-br ${s.color} backdrop-blur-md border border-white/10 rounded-2xl p-4 hover:-translate-y-1 transition-all shadow-lg`}
                data-aos="zoom-in"
                data-aos-delay={i * 80}
              >
                <div className={`font-extrabold text-white mb-1 ${s.small ? "text-lg leading-tight" : "text-2xl"}`}>{s.num}</div>
                <div className="text-sm font-bold text-white/90">{s.label}</div>
                <div className="text-xs text-white/60 mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Khối nội dung */}
      <section className="max-w-7xl mx-auto py-20 px-6 grid lg:grid-cols-2 gap-12 -mt-10 relative z-20">
        {/* Phần giao diện */}
        <div
          data-aos="fade-right"
          className="bg-white p-8 rounded-2xl shadow-xl shadow-[#113e48]/5 border border-gray-100 h-full flex flex-col"
        >
          <h3 className="text-2xl font-bold mb-8 text-[#113e48] flex items-center gap-3">
            <span className="w-2 h-8 bg-orange-500 rounded-full"></span>
            Thông tin liên hệ
          </h3>

          <div className="space-y-6 mb-8 text-gray-600">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-lg shrink-0">
                <FaMapMarkerAlt />
              </div>
              <div>
                <h4 className="font-bold text-[#113e48]">Văn phòng chính</h4>
                <p>55 Nguyễn Văn Linh, Quận Hải Châu, TP. Đà Nẵng</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center text-lg shrink-0">
                <FaPhoneAlt />
              </div>
              <div>
                <h4 className="font-bold text-[#113e48]">Hotline hỗ trợ</h4>
                <p className="text-lg font-bold text-orange-600">
                  1900 888 999
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center text-lg shrink-0">
                <FaEnvelope />
              </div>
              <div>
                <h4 className="font-bold text-[#113e48]">Email</h4>
                <p>support@speedyship.com</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-lg shrink-0">
                <FaClock />
              </div>
              <div>
                <h4 className="font-bold text-[#113e48]">Giờ làm việc</h4>
                <p>Thứ 2 - Thứ 7 (8:00 - 18:00)</p>
              </div>
            </div>
          </div>

          {/* Phần giao diện */}
          <div className="rounded-xl shadow-inner overflow-hidden h-[300px] border border-gray-200 mt-auto relative">
            <Map
              ref={mapRef}
              initialViewState={{
                latitude: OFFICE_COORDS.lat,
                longitude: OFFICE_COORDS.lng,
                zoom: 14,
              }}
              style={{ width: "100%", height: "100%" }}
              mapStyle="mapbox://styles/mapbox/streets-v12"
              mapboxAccessToken={MAPBOX_TOKEN}
              scrollZoom={false}
            >
              <NavigationControl position="bottom-right" />

              {/* Phần giao diện */}
              <Marker
                longitude={OFFICE_COORDS.lng}
                latitude={OFFICE_COORDS.lat}
                anchor="bottom"
              >
                <OfficeMarker onClick={() => setShowPopup(true)} />
              </Marker>

              {/* Render điều kiện */}
              {showPopup && (
                <Popup
                  longitude={OFFICE_COORDS.lng}
                  latitude={OFFICE_COORDS.lat}
                  anchor="top"
                  onClose={() => setShowPopup(false)}
                  offset={20}
                  closeButton={false}
                  closeOnClick={false}
                >
                  <div className="text-center p-2">
                    <strong className="text-orange-600 text-lg block mb-1">
                      SpeedyShip Đà Nẵng
                    </strong>
                    <span className="text-gray-600 text-xs font-semibold">
                      55 Nguyễn Văn Linh
                    </span>
                  </div>
                </Popup>
              )}
            </Map>
          </div>
        </div>

        {/* Phần giao diện */}
        <div
          data-aos="fade-left"
          className="bg-white p-8 md:p-10 rounded-2xl shadow-xl shadow-[#113e48]/5 border border-gray-100"
        >
          <h3 className="text-2xl font-bold mb-2 text-[#113e48]">
            ✉️ Gửi thắc mắc cho chúng tôi
          </h3>
          <p className="text-gray-500 mb-8">
            Nếu bạn có câu hỏi hoặc cần tư vấn dịch vụ, vui lòng điền vào biểu
            mẫu dưới đây.
          </p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Họ và tên *
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Nhập tên của bạn..."
                className={`w-full border bg-gray-50 p-3.5 rounded-xl focus:outline-none focus:ring-2 transition-all ${
                  errors.name
                    ? "border-red-400 focus:ring-red-400/20 focus:border-red-400"
                    : "border-gray-200 focus:ring-orange-500/20 focus:border-orange-500"
                }`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">⚠ {errors.name}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="text"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="example@email.com"
                  className={`w-full border bg-gray-50 p-3.5 rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    errors.email
                      ? "border-red-400 focus:ring-red-400/20 focus:border-red-400"
                      : "border-gray-200 focus:ring-orange-500/20 focus:border-orange-500"
                  }`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">⚠ {errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="VD: 0901234567"
                  maxLength={10}
                  inputMode="numeric"
                  className={`w-full border bg-gray-50 p-3.5 rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    errors.phone
                      ? "border-red-400 focus:ring-red-400/20 focus:border-red-400"
                      : "border-gray-200 focus:ring-orange-500/20 focus:border-orange-500"
                  }`}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">⚠ {errors.phone}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nội dung tin nhắn *
              </label>
              <textarea
                rows="5"
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Bạn cần hỗ trợ vấn đề gì?..."
                className={`w-full border bg-gray-50 p-3.5 rounded-xl focus:outline-none focus:ring-2 transition-all resize-none ${
                  errors.message
                    ? "border-red-400 focus:ring-red-400/20 focus:border-red-400"
                    : "border-gray-200 focus:ring-orange-500/20 focus:border-orange-500"
                }`}
              />
              {errors.message && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">⚠ {errors.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-[#113e48] hover:bg-orange-500 text-white py-4 rounded-xl font-bold uppercase tracking-wide transition-all shadow-lg hover:shadow-orange-500/30 flex items-center justify-center gap-2 transform hover:-translate-y-1
              ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {loading ? (
                "Đang gửi..."
              ) : (
                <>
                  <FaPaperPlane /> Gửi yêu cầu ngay
                </>
              )}
            </button>
          </form>
        </div>
      </section>

      {/* Khối nội dung */}
      <section className="bg-white py-16 border-t border-gray-100 text-center">
        <div className="max-w-4xl mx-auto px-6" data-aos="fade-up">
          <h4 className="text-2xl font-bold mb-4 text-[#113e48]">
            Vẫn chưa tìm thấy câu trả lời?
          </h4>
          <p className="text-gray-500 mb-8 max-w-xl mx-auto">
            Đừng ngần ngại liên hệ trực tiếp với tổng đài hoặc gửi email cho bộ
            phận hỗ trợ khách hàng của chúng tôi.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:1900888999"
              className="inline-flex items-center justify-center gap-2 bg-orange-100 text-orange-600 px-8 py-3 rounded-full font-bold hover:bg-orange-200 transition"
            >
              <FaPhoneAlt /> Gọi 1900 888 999
            </a>
            <a
              href="mailto:support@speedyship.com"
              className="inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition"
            >
              <FaEnvelope /> support@speedyship.com
            </a>
          </div>
        </div>
      </section>
      {supportOpen && <ChatBubble onClose={closeSupportChat} />}
    </div>
  );
}
