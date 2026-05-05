import { useState, useEffect } from "react";
import API from "../services/api";
import toast from "react-hot-toast";
import AOS from "aos";
import "aos/dist/aos.css";

import {
  FaTruck,
  FaMoneyBillWave,
  FaClock,
  FaTools,
  FaCheckCircle,
  FaPaperPlane,
  FaFileAlt,
  FaUserCheck,
  FaIdCard,
  FaHandshake,
} from "react-icons/fa";

// Đăng ký làm tài xế
export default function ApplyDriver() {

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    license_plate: "",
    vehicle_type: "",
    experience: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 900, once: true });
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

// Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.phone || !form.email || !form.license_plate) {
      return toast.error("⚠️ Vui lòng nhập đầy đủ thông tin bắt buộc!");
    }

    try {
      setLoading(true);

      const res = await API.post("/drivers/apply", form);
      toast.success(res.data.message);


      setForm({
        name: "",
        phone: "",
        email: "",
        license_plate: "",
        vehicle_type: "",
        experience: "",
      });
    } catch (err) {
      toast.error("❌ Gửi thất bại, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-sans bg-gray-50 text-slate-800">
      {/* Khối nội dung */}
      <section
        className="relative py-28 bg-[#113e48] text-white overflow-hidden"
        data-aos="fade-down"
      >
        {/* Phần giao diện */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <pattern
              id="grid-pattern"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M0 40L40 0H20L0 20M40 40V20L20 40"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
              />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          </svg>
        </div>

        <div className="max-w-6xl mx-auto text-center px-6 relative z-10">
          <span className="inline-block py-1 px-3 rounded-full bg-orange-500/20 border border-orange-500 text-orange-400 text-sm font-bold mb-4 tracking-wider uppercase">
            Gia nhập đội ngũ
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
            TUYỂN DỤNG TÀI XẾ{" "}
            <span className="text-orange-500">SPEEDYSHIP</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            Thu nhập ổn định – Thời gian linh hoạt – Môi trường chuyên nghiệp.
            Cùng chúng tôi vận chuyển niềm tin trên mọi nẻo đường.
          </p>
        </div>
      </section>

      {/* Khối nội dung */}
      <section className="py-20 -mt-16 relative z-20 px-6">
        <div
          className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8"
          data-aos="fade-up"
        >
          {[
            {
              icon: <FaMoneyBillWave />,
              title: "Thu nhập hấp dẫn",
              desc: "Tài xế SpeedyShip có thu nhập từ 10–18 triệu/tháng tùy năng suất làm việc.",
              color: "text-green-500 bg-green-50",
            },
            {
              icon: <FaClock />,
              title: "Thời gian linh hoạt",
              desc: "Chủ động chọn giờ làm việc phù hợp với lịch trình cá nhân của bạn.",
              color: "text-blue-500 bg-blue-50",
            },
            {
              icon: <FaTools />,
              title: "Hỗ trợ toàn diện",
              desc: "Được hỗ trợ 24/7 từ bộ phận điều phối và chăm sóc tài xế chuyên nghiệp.",
              color: "text-orange-500 bg-orange-50",
            },
          ].map((b, i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-2xl shadow-xl shadow-[#113e48]/5 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 group"
            >
              <div
                className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl mb-6 ${b.color} transition-transform group-hover:scale-110`}
              >
                {b.icon}
              </div>
              <h3 className="text-xl font-bold text-[#113e48] mb-3 group-hover:text-orange-600 transition-colors">
                {b.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Khối nội dung */}
      <section className="py-16 bg-white" data-aos="fade-right">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          {/* Phần giao diện */}
          <div className="relative h-96 rounded-2xl overflow-hidden shadow-lg hidden md:block">
            <img
              src="https://images.unsplash.com/photo-1616432043562-3671ea2e5242?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
              alt="Driver"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-[#113e48]/20 mix-blend-multiply"></div>
          </div>

          {/* Phần giao diện */}
          <div>
            <div className="inline-flex items-center gap-2 mb-2 text-orange-600 font-bold uppercase tracking-wider text-sm">
              <FaCheckCircle /> Tiêu chí
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#113e48] mb-8">
              YÊU CẦU CƠ BẢN
            </h2>

            <ul className="space-y-4">
              {[
                "Có xe máy & giấy phép lái xe hạng A1/A2 trở lên",
                "Sử dụng điện thoại thông minh (Android/iOS) thành thạo",
                "Trung thực, trách nhiệm và tuân thủ quy định an toàn",
                "Giao tiếp lịch sự, thái độ phục vụ khách hàng tốt",
                "Ưu tiên ứng viên có kinh nghiệm giao hàng hoặc rành đường",
              ].map((req, i) => (
                <li
                  key={i}
                  className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-orange-200 transition-colors"
                >
                  <div className="bg-orange-100 p-1 rounded-full text-orange-600 mt-0.5">
                    <FaCheckCircle size={14} />
                  </div>
                  <span className="text-gray-700 font-medium">{req}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Khối nội dung */}
      <section className="py-24 bg-gray-50 relative">
        <div className="max-w-4xl mx-auto px-6" data-aos="fade-up">
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl shadow-[#113e48]/10 border border-gray-100">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-[#113e48] mb-4">
                NỘP ĐƠN ỨNG TUYỂN NGAY
              </h2>
              <p className="text-gray-500">
                Điền thông tin bên dưới, chúng tôi sẽ liên hệ lại sớm nhất.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Nhập họ tên..."
                  value={form.name}
                  onChange={handleChange}
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Số điện thoại *
                </label>
                <input
                  type="text"
                  name="phone"
                  placeholder="Nhập SĐT..."
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Nhập email..."
                  value={form.email}
                  onChange={handleChange}
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Biển số xe *
                </label>
                <input
                  type="text"
                  name="license_plate"
                  placeholder="VD: 43A-123.45"
                  value={form.license_plate}
                  onChange={handleChange}
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Loại xe
                </label>
                <input
                  type="text"
                  name="vehicle_type"
                  placeholder="VD: Xe máy (Honda Wave), Xe tải 1 tấn..."
                  value={form.vehicle_type}
                  onChange={handleChange}
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Kinh nghiệm (nếu có)
                </label>
                <textarea
                  name="experience"
                  placeholder="Mô tả kinh nghiệm lái xe hoặc giao hàng của bạn..."
                  value={form.experience}
                  onChange={handleChange}
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all h-32 resize-none"
                />
              </div>

              <div className="md:col-span-2 mt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 rounded-xl text-white font-bold text-lg uppercase tracking-wide shadow-lg transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3
                  ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#113e48] hover:bg-orange-500 shadow-[#113e48]/30 hover:shadow-orange-500/40"
                  }`}
                >
                  {loading ? (
                    "Đang xử lý..."
                  ) : (
                    <>
                      <FaPaperPlane /> Gửi hồ sơ ngay
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Khối nội dung */}
      <section className="py-24 bg-white border-t border-gray-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center">
          {/* Phần giao diện */}
          <div className="mb-16" data-aos="fade-up">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-4 py-2 rounded-full font-bold text-sm uppercase tracking-wide mb-4 border border-orange-200">
              <FaUserCheck /> <span>Quy trình</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-[#113e48] uppercase tracking-tight">
              QUY TRÌNH ỨNG TUYỂN
            </h2>
          </div>

          {/* Phần giao diện */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Phần giao diện */}
            <div className="hidden md:block absolute top-[70px] left-0 w-full h-0.5 border-t-2 border-dashed border-orange-200 -z-0"></div>

            {[
              {
                id: "01",
                title: "Nộp hồ sơ",
                desc: "Điền form đăng ký online hoặc nộp trực tiếp tại văn phòng.",
                icon: <FaFileAlt />,
              },
              {
                id: "02",
                title: "Phỏng vấn",
                desc: "Nhân sự sẽ gọi điện xác nhận thông tin và hẹn lịch phỏng vấn.",
                icon: <FaUserCheck />,
              },
              {
                id: "03",
                title: "Đào tạo",
                desc: "Tham gia khóa đào tạo ngắn hạn về quy trình và ứng dụng.",
                icon: <FaIdCard />,
              },
              {
                id: "04",
                title: "Nhận việc",
                desc: "Ký hợp đồng, nhận đồng phục và bắt đầu nhận đơn hàng.",
                icon: <FaHandshake />,
              },
            ].map((step, i) => (
              <div
                key={i}
                className="relative z-10 flex flex-col items-center group"
                data-aos="fade-up"
                data-aos-delay={i * 150}
              >
                {/* Phần giao diện */}
                <div className="w-36 h-36 rounded-full border-2 border-dashed border-orange-300 bg-white flex items-center justify-center mb-6 relative transition-all duration-500 group-hover:border-orange-500 group-hover:bg-orange-50">
                  {/* Phần giao diện */}
                  <div className="text-4xl text-orange-500 transition-transform duration-500 group-hover:scale-110">
                    {step.icon}
                  </div>

                  {/* Phần giao diện */}
                  <div className="absolute top-0 right-0 bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md border-2 border-white transform translate-x-1 -translate-y-1">
                    {step.id}
                  </div>
                </div>

                {/* Tiêu đề nội dung */}
                <h3 className="text-xl font-bold text-[#113e48] mb-2 group-hover:text-orange-600 transition-colors">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-500 max-w-[200px] leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}