import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaShieldAlt,
  FaUserSecret,
  FaFileContract,
  FaLock,
  FaChevronRight,
  FaBoxOpen,
  FaRulerCombined,
  FaWeightHanging,
  FaTruckLoading,
  FaBan,
  FaCheck,
} from "react-icons/fa";
import AOS from "aos";
import "aos/dist/aos.css";

export default function ShippingRules() {
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    window.scrollTo(0, 0);
  }, []);


  const sidebarLinks = [
    {
      name: "Bảo mật thông tin",
      path: "/policy/privacy",
      active: false,
      icon: <FaUserSecret />,
    },
    {
      name: "Giải quyết khiếu nại",
      path: "/policy/claims",
      active: false,
      icon: <FaShieldAlt />,
    },
    {
      name: "Điều khoản sử dụng",
      path: "/policy/terms",
      active: false,
      icon: <FaFileContract />,
    },
    {
      name: "Quy định gửi hàng",
      path: "/policy/shipping-rules",
      active: true,
      icon: <FaLock />,
    },
  ];

  return (
    <div className="font-sans bg-gray-50 text-slate-700">
      {/* Khối nội dung */}
      <section className="relative py-24 bg-[#113e48] text-white overflow-hidden">
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

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-orange-400 text-sm font-bold mb-4 uppercase tracking-wider backdrop-blur-md">
            <FaTruckLoading /> Tiêu chuẩn vận hành
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4">
            QUY ĐỊNH GỬI HÀNG
          </h1>
          <p className="text-blue-100 max-w-2xl mx-auto text-lg">
            Hướng dẫn chi tiết về quy cách đóng gói, tính cước và các tiêu chuẩn
            hàng hóa để đảm bảo an toàn tuyệt đối.
          </p>
        </div>
      </section>

      {/* Khối nội dung */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Phần giao diện */}
          <div className="lg:w-1/4 shrink-0">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-24">
              <h3 className="text-lg font-bold text-[#113e48] mb-6 border-b border-gray-100 pb-4">
                DANH MỤC
              </h3>
              <ul className="space-y-2">
                {sidebarLinks.map((item, index) => (
                  <li key={index}>
                    <Link
                      to={item.path}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all font-medium text-sm
                        ${
                          item.active
                            ? "bg-orange-50 text-orange-600 border border-orange-200 shadow-sm"
                            : "text-gray-600 hover:bg-gray-50 hover:text-[#113e48]"
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon} <span>{item.name}</span>
                      </div>
                      {item.active && <FaChevronRight className="text-xs" />}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-8 bg-[#113e48] rounded-xl p-5 text-white text-center">
                <p className="text-sm font-medium mb-3">Bạn cần trợ giúp?</p>
                <Link
                  to="/contact"
                  className="block w-full py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-lg transition"
                >
                  Tư vấn đóng gói
                </Link>
              </div>
            </div>
          </div>

          {/* Phần giao diện */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-2xl shadow-xl shadow-[#113e48]/5 border border-gray-100 p-8 md:p-12">
              <div className="prose prose-lg max-w-none text-gray-600">
                <p className="text-lg leading-relaxed mb-8">
                  Để đảm bảo hàng hóa được vận chuyển nhanh chóng và an toàn,
                  Quý khách vui lòng tuân thủ các quy định về đóng gói và khai
                  báo hàng hóa của{" "}
                  <strong className="text-[#113e48]">SpeedyShip</strong> dưới
                  đây.
                </p>

                {/* Phần giao diện */}
                <div className="mb-10" data-aos="fade-up">
                  <h3 className="flex items-center gap-3 text-2xl font-bold text-[#113e48] mb-4">
                    <span className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-sm">
                      01
                    </span>
                    Quy cách đóng gói
                  </h3>
                  <p className="mb-4">
                    Hàng hóa phải được đóng gói kỹ lưỡng để chịu được các tác
                    động lực thông thường trong quá trình vận chuyển.
                  </p>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                      <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                        <FaBoxOpen /> Hàng thông thường
                      </h4>
                      <ul className="text-sm space-y-2 list-disc pl-4 text-blue-900">
                        <li>Sử dụng thùng carton cứng, hình dạng vuông vức.</li>
                        <li>
                          Chèn xốp bong bóng hoặc giấy báo để lấp đầy khoảng
                          trống.
                        </li>
                        <li>Dán băng keo kín các miệng thùng.</li>
                      </ul>
                    </div>
                    <div className="bg-orange-50 p-5 rounded-xl border border-orange-100">
                      <h4 className="font-bold text-orange-800 mb-2 flex items-center gap-2">
                        <FaBan /> Hàng dễ vỡ / Chất lỏng
                      </h4>
                      <ul className="text-sm space-y-2 list-disc pl-4 text-orange-900">
                        <li>
                          Bọc từng sản phẩm bằng ít nhất 2 lớp xốp hơi (bubble
                          wrap).
                        </li>
                        <li>
                          Dán nhãn "Hàng dễ vỡ" hoặc "Hướng lên trên" bên ngoài.
                        </li>
                        <li>
                          Chai lọ chất lỏng phải được bịt kín miệng bằng băng
                          keo.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Phần giao diện */}
                <div className="mb-10" data-aos="fade-up">
                  <h3 className="flex items-center gap-3 text-2xl font-bold text-[#113e48] mb-4">
                    <span className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-sm">
                      02
                    </span>
                    Trọng lượng & Kích thước
                  </h3>
                  <p className="mb-3">
                    Cước phí sẽ được tính dựa trên trọng lượng thực tế hoặc{" "}
                    <strong>trọng lượng quy đổi</strong> (theo thể tích), tùy
                    theo giá trị nào lớn hơn.
                  </p>

                  <div className="bg-gray-100 p-6 rounded-xl text-center border-2 border-dashed border-gray-300">
                    <p className="font-bold text-gray-500 uppercase text-xs mb-2">
                      Công thức tính trọng lượng quy đổi (kg)
                    </p>
                    <div className="text-2xl md:text-3xl font-extrabold text-[#113e48] py-2 flex flex-col md:flex-row items-center justify-center gap-2">
                      <span className="flex items-center gap-2">
                        <FaRulerCombined className="text-orange-500" /> (Dài x
                        Rộng x Cao)
                      </span>
                      <span className="text-gray-400">/</span>
                      <span className="text-blue-600">6000</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2 italic">
                      * Đơn vị kích thước: cm
                    </p>
                  </div>

                  <div className="mt-4 flex items-start gap-3 bg-blue-50 p-4 rounded-lg">
                    <FaWeightHanging className="text-blue-600 text-xl mt-1 shrink-0" />
                    <p className="text-sm text-blue-800">
                      <strong>Ví dụ:</strong> Một thùng hàng nhẹ nhưng cồng kềnh
                      có kích thước 50x40x30 cm. <br />
                      Trọng lượng thực: 2kg. <br />
                      Trọng lượng quy đổi: (50*40*30)/6000 ={" "}
                      <strong>10kg</strong>. <br />
                      Cước phí sẽ tính theo <strong>10kg</strong>.
                    </p>
                  </div>
                </div>

                {/* Phần giao diện */}
                <div className="mb-8" data-aos="fade-up">
                  <h3 className="flex items-center gap-3 text-2xl font-bold text-[#113e48] mb-4">
                    <span className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-sm">
                      03
                    </span>
                    Danh mục hàng hóa
                  </h3>

                  <div className="space-y-4">
                    {/* Phần giao diện */}
                    <div className="border border-red-100 rounded-xl overflow-hidden">
                      <div className="bg-red-50 px-5 py-3 border-b border-red-100 flex items-center justify-between">
                        <span className="font-bold text-red-700 flex items-center gap-2">
                          <FaBan /> Hàng CẤM gửi (Từ chối vận chuyển)
                        </span>
                      </div>
                      <div className="p-5 bg-white text-sm text-gray-600">
                        <ul className="grid md:grid-cols-2 gap-2">
                          <li>• Chất ma túy, chất kích thích thần kinh.</li>
                          <li>• Vũ khí, đạn dược, trang thiết bị quân sự.</li>
                          <li>• Văn hóa phẩm đồi trụy, phản động.</li>
                          <li>• Vật sắc nhọn, nguy hiểm không có vỏ bọc.</li>
                          <li>
                            • Tiền mặt, kim khí quý, đá quý, giấy tờ có giá trị
                            như tiền.
                          </li>
                          <li>• Chất dễ cháy nổ, hóa chất độc hại.</li>
                        </ul>
                      </div>
                    </div>

                    {/* Phần giao diện */}
                    <div className="border border-yellow-100 rounded-xl overflow-hidden">
                      <div className="bg-yellow-50 px-5 py-3 border-b border-yellow-100 flex items-center justify-between">
                        <span className="font-bold text-yellow-700 flex items-center gap-2">
                          <FaCheck /> Hàng gửi có điều kiện
                        </span>
                      </div>
                      <div className="p-5 bg-white text-sm text-gray-600">
                        <p className="mb-2">
                          SpeedyShip nhận vận chuyển nhưng yêu cầu đóng gói đặc
                          biệt hoặc giấy tờ kèm theo:
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>
                            <strong>Hàng điện tử, công nghệ cao:</strong> Phải
                            đóng gỗ hoặc thùng xốp chịu lực.
                          </li>
                          <li>
                            <strong>Thực phẩm khô:</strong> Phải có nhãn mác,
                            hạn sử dụng, đóng gói kín, hút chân không.
                          </li>
                          <li>
                            <strong>Chất lỏng (Mỹ phẩm, Dầu gội...):</strong>{" "}
                            Phải chèn vật liệu thấm hút bên trong thùng.
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-gray-400 mt-12 pt-6 border-t border-gray-100 italic">
                  * SpeedyShip có quyền từ chối hoặc mở kiểm tra hàng hóa nếu
                  nghi ngờ có chứa vật phẩm cấm theo quy định của pháp luật.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}