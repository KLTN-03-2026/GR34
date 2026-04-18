import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaShieldAlt,
  FaUserSecret,
  FaFileContract,
  FaLock,
  FaChevronRight,
  FaHeadset,
  FaSearch,
  FaHandHoldingUsd,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import AOS from "aos";
import "aos/dist/aos.css";

export default function Claims() {
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    window.scrollTo(0, 0);
  }, []);

  // Sidebar Links (Trạng thái active đổi sang dòng 2)
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
      active: true, // Đang ở trang này
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
      {/* 1. HERO HEADER */}
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
            <FaShieldAlt /> Trung tâm hỗ trợ
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4">
            GIẢI QUYẾT KHIẾU NẠI
          </h1>
          <p className="text-blue-100 max-w-2xl mx-auto text-lg">
            Quy trình minh bạch, công bằng và nhanh chóng để bảo vệ quyền lợi
            tối đa cho khách hàng.
          </p>
        </div>
      </section>

      {/* 2. MAIN CONTENT */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* SIDEBAR */}
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
                <p className="text-sm font-medium mb-3">Gặp vấn đề khẩn cấp?</p>
                <Link
                  to="/contact"
                  className="block w-full py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-lg transition"
                >
                  Gọi 1900 888 999
                </Link>
              </div>
            </div>
          </div>

          {/* CONTENT RIGHT */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-2xl shadow-xl shadow-[#113e48]/5 border border-gray-100 p-8 md:p-12">
              <div className="prose prose-lg max-w-none text-gray-600">
                <p className="text-lg leading-relaxed mb-8">
                  <strong className="text-[#113e48]">SpeedyShip</strong> cam kết
                  nỗ lực hết mình để đảm bảo hàng hóa được giao an toàn. Tuy
                  nhiên, nếu có sự cố xảy ra, chúng tôi tuân thủ quy trình xử lý
                  khiếu nại nghiêm ngặt dưới đây.
                </p>

                {/* Bước 1: Tiếp nhận */}
                <div className="mb-10" data-aos="fade-up">
                  <h3 className="flex items-center gap-3 text-2xl font-bold text-[#113e48] mb-4">
                    <span className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-sm">
                      01
                    </span>
                    Thời hiệu & Kênh tiếp nhận
                  </h3>
                  <div className="bg-orange-50 p-5 rounded-xl border-l-4 border-orange-500 mb-4">
                    <h4 className="font-bold text-orange-700 flex items-center gap-2 mb-2">
                      <FaExclamationTriangle /> Lưu ý quan trọng:
                    </h4>
                    <p className="text-sm text-orange-800">
                      Quý khách vui lòng gửi khiếu nại trong vòng{" "}
                      <strong>24 giờ</strong> kể từ khi nhận hàng (đối với hàng
                      hư hỏng/mất mát) hoặc <strong>03 ngày</strong> (đối với
                      sai sót cước phí/thu hộ).
                    </p>
                  </div>
                  <p>Các kênh tiếp nhận chính thức:</p>
                  <ul className="grid md:grid-cols-3 gap-4 list-none pl-0 mt-3">
                    <li className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex flex-col items-center text-center">
                      <FaHeadset className="text-2xl text-blue-600 mb-2" />
                      <strong>Hotline 24/7</strong>
                      <span className="text-sm">1900 888 999</span>
                    </li>
                    <li className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex flex-col items-center text-center">
                      <FaShieldAlt className="text-2xl text-blue-600 mb-2" />
                      <strong>Ứng dụng</strong>
                      <span className="text-sm">Mục "Báo cáo sự cố"</span>
                    </li>
                    <li className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex flex-col items-center text-center">
                      <FaFileContract className="text-2xl text-blue-600 mb-2" />
                      <strong>Email</strong>
                      <span className="text-sm">claims@speedyship.com</span>
                    </li>
                  </ul>
                </div>

                {/* Bước 2: Xác minh */}
                <div className="mb-10" data-aos="fade-up">
                  <h3 className="flex items-center gap-3 text-2xl font-bold text-[#113e48] mb-4">
                    <span className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-sm">
                      02
                    </span>
                    Quy trình xác minh
                  </h3>
                  <p className="mb-4">
                    Sau khi tiếp nhận, bộ phận Pháp chế & Xử lý khiếu nại sẽ
                    tiến hành xác minh trong vòng{" "}
                    <strong>3 - 5 ngày làm việc</strong>:
                  </p>
                  <ul className="space-y-3 pl-4 border-l-2 border-gray-200">
                    <li className="flex items-start gap-3">
                      <FaSearch className="mt-1 text-blue-500 text-sm shrink-0" />
                      <span>
                        Kiểm tra lịch trình di chuyển và camera hành trình (nếu
                        có).
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <FaSearch className="mt-1 text-blue-500 text-sm shrink-0" />
                      <span>
                        Làm việc với tài xế và nhân viên kho liên quan.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <FaSearch className="mt-1 text-blue-500 text-sm shrink-0" />
                      <span>
                        Giám định tình trạng hàng hóa thực tế (thông qua
                        ảnh/video hoặc trực tiếp).
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Bước 3: Bồi thường */}
                <div className="mb-10" data-aos="fade-up">
                  <h3 className="flex items-center gap-3 text-2xl font-bold text-[#113e48] mb-4">
                    <span className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-sm">
                      03
                    </span>
                    Chính sách bồi thường
                  </h3>
                  <div className="overflow-hidden rounded-xl border border-gray-200">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-[#113e48] text-white">
                        <tr>
                          <th className="p-4">Trường hợp</th>
                          <th className="p-4">Mức bồi thường</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        <tr>
                          <td className="p-4 font-medium">
                            Hàng có khai giá (Có bảo hiểm)
                          </td>
                          <td className="p-4 text-green-600 font-bold">
                            100% giá trị khai báo
                          </td>
                        </tr>
                        <tr>
                          <td className="p-4 font-medium">
                            Hàng không khai giá
                          </td>
                          <td className="p-4">
                            Tối đa 04 lần cước phí vận chuyển
                          </td>
                        </tr>
                        <tr>
                          <td className="p-4 font-medium">Hư hỏng một phần</td>
                          <td className="p-4">
                            Bồi thường theo tỷ lệ hư hỏng thực tế
                          </td>
                        </tr>
                        <tr>
                          <td className="p-4 font-medium">Trễ hẹn quá 24h</td>
                          <td className="p-4">
                            Miễn phí cước vận chuyển đơn hàng đó
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Bước 4: Hoàn tất */}
                <div className="mb-8" data-aos="fade-up">
                  <h3 className="flex items-center gap-3 text-2xl font-bold text-[#113e48] mb-4">
                    <span className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-sm">
                      04
                    </span>
                    Thời gian hoàn tiền
                  </h3>
                  <p className="flex items-center gap-2 mb-2">
                    <FaHandHoldingUsd className="text-green-500 text-xl" />
                    Tiền bồi thường sẽ được chuyển khoản vào tài khoản ngân hàng
                    của Quý khách trong vòng:
                  </p>
                  <ul className="list-disc pl-10 space-y-1 text-sm font-medium">
                    <li>
                      <strong>48 giờ</strong> đối với khách hàng cá nhân.
                    </li>
                    <li>
                      <strong>07 ngày</strong> đối với khách hàng doanh nghiệp
                      (theo kỳ đối soát công nợ).
                    </li>
                  </ul>
                </div>

                <div className="text-sm text-gray-400 mt-12 pt-6 border-t border-gray-100 flex items-center gap-2">
                  <FaCheckCircle className="text-green-500" /> Chính sách có
                  hiệu lực từ ngày 01/01/2024.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
