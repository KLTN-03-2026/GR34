import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaShieldAlt,
  FaUserSecret,
  FaFileContract,
  FaLock,
  FaHistory,
  FaChevronRight,
} from "react-icons/fa";
import AOS from "aos";
import "aos/dist/aos.css";

export default function PrivacyPolicy() {
  useEffect(() => {
    AOS.init({ duration: 800, once: true });

    window.scrollTo(0, 0);
  }, []);


  const sidebarLinks = [
    {
      name: "Bảo mật thông tin",
      path: "/policy/privacy",
      active: true,
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
      active: false,
      icon: <FaLock />,
    },
  ];

  return (
    <div className="font-sans bg-gray-50 text-slate-700">
      {/* Khối nội dung */}
      <section className="relative py-24 bg-[#113e48] text-white overflow-hidden">
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

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-orange-400 text-sm font-bold mb-4 uppercase tracking-wider backdrop-blur-md">
            <FaShieldAlt /> Trung tâm chính sách
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4">
            CHÍNH SÁCH BẢO MẬT
          </h1>
          <p className="text-blue-100 max-w-2xl mx-auto text-lg">
            Cam kết của SpeedyShip về việc bảo vệ dữ liệu và quyền riêng tư của
            khách hàng.
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

              {/* Phần giao diện */}
              <div className="mt-8 bg-[#113e48] rounded-xl p-5 text-white text-center">
                <p className="text-sm font-medium mb-3">
                  Bạn cần giải đáp thêm?
                </p>
                <Link
                  to="/contact"
                  className="block w-full py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-lg transition"
                >
                  Liên hệ ngay
                </Link>
              </div>
            </div>
          </div>

          {/* Phần giao diện */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-2xl shadow-xl shadow-[#113e48]/5 border border-gray-100 p-8 md:p-12">
              <div className="prose prose-lg max-w-none text-gray-600">
                <p className="text-lg leading-relaxed mb-8">
                  Tại <strong className="text-[#113e48]">SpeedyShip</strong>,
                  chúng tôi hiểu rằng quyền riêng tư là vô cùng quan trọng.
                  Chính sách này mô tả cách chúng tôi thu thập, sử dụng và bảo
                  vệ thông tin cá nhân của bạn khi sử dụng dịch vụ vận chuyển
                  của chúng tôi.
                </p>

                {/* Phần giao diện */}
                <div className="mb-10" data-aos="fade-up">
                  <h3 className="flex items-center gap-3 text-2xl font-bold text-[#113e48] mb-4">
                    <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm">
                      01
                    </span>
                    Thu thập thông tin
                  </h3>
                  <p className="mb-4">
                    Chúng tôi thu thập các thông tin cần thiết để cung cấp dịch
                    vụ vận chuyển tốt nhất, bao gồm:
                  </p>
                  <ul className="list-none space-y-3 pl-4 border-l-2 border-orange-200">
                    <li className="flex items-start gap-3">
                      <FaLock className="mt-1 text-orange-500 text-sm" />
                      <span>
                        <strong>Thông tin định danh:</strong> Họ tên, số điện
                        thoại, địa chỉ email.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <FaLock className="mt-1 text-orange-500 text-sm" />
                      <span>
                        <strong>Thông tin giao hàng:</strong> Địa chỉ lấy hàng,
                        địa chỉ nhận hàng, ghi chú đơn hàng.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <FaLock className="mt-1 text-orange-500 text-sm" />
                      <span>
                        <strong>Dữ liệu vị trí:</strong> Để định vị tài xế và
                        tối ưu lộ trình (chỉ khi bạn cấp quyền).
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Phần giao diện */}
                <div className="mb-10" data-aos="fade-up">
                  <h3 className="flex items-center gap-3 text-2xl font-bold text-[#113e48] mb-4">
                    <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm">
                      02
                    </span>
                    Sử dụng thông tin
                  </h3>
                  <p>
                    Thông tin của bạn được sử dụng cho các mục đích minh bạch
                    sau:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <h4 className="font-bold text-[#113e48] mb-2">
                        Xử lý đơn hàng
                      </h4>
                      <p className="text-sm">
                        Điều phối tài xế, cập nhật trạng thái đơn hàng và thu hộ
                        COD.
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <h4 className="font-bold text-[#113e48] mb-2">
                        Cải thiện dịch vụ
                      </h4>
                      <p className="text-sm">
                        Phân tích dữ liệu để nâng cao trải nghiệm ứng dụng và
                        tốc độ giao hàng.
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <h4 className="font-bold text-[#113e48] mb-2">
                        Hỗ trợ khách hàng
                      </h4>
                      <p className="text-sm">
                        Giải quyết khiếu nại, thắc mắc và liên hệ khi có sự cố
                        phát sinh.
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <h4 className="font-bold text-[#113e48] mb-2">
                        An toàn & Bảo mật
                      </h4>
                      <p className="text-sm">
                        Phát hiện và ngăn chặn các hành vi gian lận, truy cập
                        trái phép.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Phần giao diện */}
                <div className="mb-10" data-aos="fade-up">
                  <h3 className="flex items-center gap-3 text-2xl font-bold text-[#113e48] mb-4">
                    <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm">
                      03
                    </span>
                    Chia sẻ thông tin
                  </h3>
                  <p>
                    SpeedyShip <strong>tuyệt đối không bán</strong> thông tin cá
                    nhân của bạn. Chúng tôi chỉ chia sẻ thông tin trong các
                    trường hợp:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 mt-2 marker:text-orange-500">
                    <li>
                      Chia sẻ với <strong>Tài xế đối tác</strong> để thực hiện
                      giao hàng (Chỉ Tên, SĐT, Địa chỉ).
                    </li>
                    <li>Yêu cầu từ cơ quan pháp luật có thẩm quyền.</li>
                    <li>
                      Các đối tác cổng thanh toán (VNPAY, Momo) để xử lý giao
                      dịch.
                    </li>
                  </ul>
                </div>

                {/* Phần giao diện */}
                <div className="mb-8" data-aos="fade-up">
                  <h3 className="flex items-center gap-3 text-2xl font-bold text-[#113e48] mb-4">
                    <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm">
                      04
                    </span>
                    Cam kết bảo mật
                  </h3>
                  <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-r-xl italic text-gray-700">
                    "Mọi dữ liệu cá nhân đều được lưu trữ trên hệ thống máy chủ
                    bảo mật, sử dụng công nghệ mã hóa SSL/TLS để đảm bảo an toàn
                    tuyệt đối trong quá trình truyền tải."
                  </div>
                </div>

                <div className="text-sm text-gray-400 mt-12 pt-6 border-t border-gray-100 flex items-center gap-2">
                  <FaHistory /> Cập nhật lần cuối: 15/12/2024
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}