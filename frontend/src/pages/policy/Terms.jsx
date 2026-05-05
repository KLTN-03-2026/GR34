import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaShieldAlt,
  FaUserSecret,
  FaFileContract,
  FaLock,
  FaChevronRight,
  FaGavel,
  FaBan,
  FaUserCheck,
  FaMoneyCheckAlt,
  FaExclamationCircle,
} from "react-icons/fa";
import AOS from "aos";
import "aos/dist/aos.css";

export default function Terms() {
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
      active: true,
      icon: <FaFileContract />,
    },
    {
      name: "Quy định gửi hàng",
      path: "/policy/shipping-rules",
      active: false,
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
            <FaFileContract /> Thông tin pháp lý
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4">
            ĐIỀU KHOẢN SỬ DỤNG
          </h1>
          <p className="text-blue-100 max-w-2xl mx-auto text-lg">
            Các quy định ràng buộc trách nhiệm giữa SpeedyShip và Người dùng để
            đảm bảo môi trường giao nhận an toàn.
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
                <p className="text-sm font-medium mb-3">Bạn cần tư vấn?</p>
                <Link
                  to="/contact"
                  className="block w-full py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-lg transition"
                >
                  Liên hệ Admin
                </Link>
              </div>
            </div>
          </div>

          {/* Phần giao diện */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-2xl shadow-xl shadow-[#113e48]/5 border border-gray-100 p-8 md:p-12">
              <div className="prose prose-lg max-w-none text-gray-600">
                <p className="text-lg leading-relaxed mb-8">
                  Chào mừng bạn đến với{" "}
                  <strong className="text-[#113e48]">SpeedyShip</strong>. Khi
                  truy cập và sử dụng dịch vụ của chúng tôi, bạn đồng ý tuân thủ
                  các điều khoản dưới đây. Vui lòng đọc kỹ trước khi sử dụng.
                </p>

                {/* Phần giao diện */}
                <div className="mb-10" data-aos="fade-up">
                  <h3 className="flex items-center gap-3 text-2xl font-bold text-[#113e48] mb-4">
                    <FaUserCheck className="text-orange-500" />
                    1. Đăng ký & Bảo mật tài khoản
                  </h3>
                  <ul className="list-disc pl-6 space-y-2 mt-2 marker:text-orange-500">
                    <li>
                      Người dùng cam kết cung cấp thông tin chính xác, đầy đủ và
                      cập nhật khi đăng ký tài khoản.
                    </li>
                    <li>
                      Bạn chịu hoàn toàn trách nhiệm bảo mật mật khẩu và các
                      hoạt động diễn ra dưới tài khoản của mình.
                    </li>
                    <li>
                      Thông báo ngay cho SpeedyShip nếu phát hiện tài khoản bị
                      truy cập trái phép.
                    </li>
                  </ul>
                </div>

                {/* Phần giao diện */}
                <div className="mb-10" data-aos="fade-up">
                  <h3 className="flex items-center gap-3 text-2xl font-bold text-[#113e48] mb-4">
                    <FaBan className="text-red-500" />
                    2. Hàng hóa cấm vận chuyển
                  </h3>
                  <p className="mb-3">
                    Người dùng <strong>tuyệt đối không</strong> gửi các loại
                    hàng hóa sau:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      "Vũ khí, đạn dược, vật liệu nổ",
                      "Ma túy, chất kích thích bị cấm",
                      "Văn hóa phẩm đồi trụy",
                      "Tiền mặt, kim khí quý, đá quý",
                      "Động vật hoang dã quý hiếm",
                      "Chất dễ cháy nổ, hóa chất độc hại",
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm font-medium border border-red-100"
                      >
                        <FaExclamationCircle /> {item}
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-sm italic text-gray-500">
                    * Nếu vi phạm, tài khoản sẽ bị khóa vĩnh viễn và chúng tôi
                    sẽ phối hợp với cơ quan chức năng để xử lý.
                  </p>
                </div>

                {/* Phần giao diện */}
                <div className="mb-10" data-aos="fade-up">
                  <h3 className="flex items-center gap-3 text-2xl font-bold text-[#113e48] mb-4">
                    <FaGavel className="text-orange-500" />
                    3. Quyền & Trách nhiệm
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-5 rounded-xl border-l-4 border-blue-500">
                      <h4 className="font-bold text-blue-800 mb-2">
                        Đối với Người gửi (Khách hàng)
                      </h4>
                      <p className="text-sm text-blue-900">
                        Chịu trách nhiệm về tính hợp pháp của hàng hóa. Đóng gói
                        đúng quy chuẩn để đảm bảo an toàn trong quá trình vận
                        chuyển. Thanh toán đầy đủ cước phí.
                      </p>
                    </div>
                    <div className="bg-orange-50 p-5 rounded-xl border-l-4 border-orange-500">
                      <h4 className="font-bold text-orange-800 mb-2">
                        Đối với SpeedyShip
                      </h4>
                      <p className="text-sm text-orange-900">
                        Đảm bảo giao hàng đúng thời gian cam kết. Bồi thường
                        thiệt hại theo chính sách nếu hàng hóa bị mất mát hoặc
                        hư hỏng do lỗi của đơn vị vận chuyển.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Phần giao diện */}
                <div className="mb-8" data-aos="fade-up">
                  <h3 className="flex items-center gap-3 text-2xl font-bold text-[#113e48] mb-4">
                    <FaMoneyCheckAlt className="text-orange-500" />
                    4. Thanh toán & Phí dịch vụ
                  </h3>
                  <p className="mb-3">
                    Cước phí được tính toán tự động dựa trên khoảng cách, trọng
                    lượng và loại dịch vụ. Giá hiển thị trên ứng dụng là giá
                    cuối cùng (đã bao gồm VAT và các phụ phí nếu có).
                  </p>
                  <p>
                    SpeedyShip có quyền thay đổi bảng giá và sẽ thông báo trước
                    ít nhất <strong>07 ngày</strong> trước khi áp dụng.
                  </p>
                </div>

                <div className="text-sm text-gray-400 mt-12 pt-6 border-t border-gray-100 flex justify-between items-center">
                  <span>© 2024 SpeedyShip JSC</span>
                  <span>Hiệu lực từ: 01/01/2024</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}