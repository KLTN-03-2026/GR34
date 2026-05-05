import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaCalculator,
  FaMoneyBillWave,
  FaSearchDollar,
  FaArrowRight,
  FaInfoCircle,
  FaPercent,
  FaBox,
  FaTruck,
  FaPlane,
  FaCity,
  FaRoute,
  FaWeightHanging,
} from "react-icons/fa";
import AOS from "aos";
import "aos/dist/aos.css";

export default function PriceList() {
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="font-sans bg-slate-50 text-slate-700">
      {/* Khối nội dung */}
      <section className="relative h-[350px] flex items-center justify-center overflow-hidden bg-[#113e48] text-white">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        ></div>
        <div className="absolute -top-1/2 -right-1/2 w-[800px] h-[800px] bg-orange-500/20 rounded-full blur-3xl"></div>

        <div className="relative z-10 text-center px-6 max-w-4xl mt-10">
          <div
            className="inline-flex items-center gap-2 py-1 px-4 rounded-full bg-white/10 border border-white/20 text-orange-400 font-bold text-xs uppercase tracking-wider backdrop-blur-md mb-6"
            data-aos="fade-down"
          >
            <FaMoneyBillWave /> Chi phí tối ưu - Minh bạch tuyệt đối
          </div>
          <h1
            className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight"
            data-aos="fade-up"
          >
            Bảng Giá Cước Vận Chuyển
          </h1>
          <div data-aos="fade-up" data-aos-delay="200">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg hover:shadow-orange-500/40 transform hover:-translate-y-1"
            >
              <FaCalculator /> Tra cứu cước phí tự động
            </Link>
          </div>
        </div>
      </section>

      {/* Khối nội dung */}
      <section className="py-24 px-4 md:px-6 max-w-7xl mx-auto -mt-16 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Phần giao diện */}
          <div
            className="bg-white rounded-3xl shadow-xl border border-blue-100 overflow-hidden flex flex-col"
            data-aos="fade-right"
          >
            {/* Phần giao diện */}
            <div className="bg-[#113e48] p-6 text-white flex items-center justify-between relative overflow-hidden">
              <div className="absolute -right-10 -top-10 text-white/10 text-9xl">
                <FaCity />
              </div>
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center text-3xl backdrop-blur-md border border-white/20">
                  <FaTruck />
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold uppercase tracking-wider">
                    Giao Nội Thành
                  </h3>
                  <p className="text-blue-200 text-sm">
                    Hà Nội, Đà Nẵng, TP.HCM
                  </p>
                </div>
              </div>
            </div>

            {/* Phần giao diện */}
            <div className="p-6 flex-grow">
              <div className="overflow-x-auto rounded-xl border border-gray-200 mb-6">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-4 text-sm font-bold text-gray-600">
                        Khoảng cách
                      </th>
                      <th className="p-4 text-sm font-bold text-[#113e48]">
                        Tiết kiệm (6h)
                      </th>
                      <th className="p-4 text-sm font-bold text-blue-600">
                        Nhanh (4h)
                      </th>
                      <th className="p-4 text-sm font-bold text-red-500">
                        Hỏa tốc (1-2h)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-medium">
                    <tr className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors">
                      <td className="p-4 text-gray-700">Dưới 5km</td>
                      <td className="p-4">16.500đ</td>
                      <td className="p-4 font-bold">22.000đ</td>
                      <td className="p-4 font-bold text-red-500 text-base">
                        35.000đ
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors">
                      <td className="p-4 text-gray-700">5km - 10km</td>
                      <td className="p-4">20.000đ</td>
                      <td className="p-4 font-bold">28.000đ</td>
                      <td className="p-4 font-bold text-red-500 text-base">
                        45.000đ
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors">
                      <td className="p-4 text-gray-700">10km - 20km</td>
                      <td className="p-4">30.000đ</td>
                      <td className="p-4 font-bold">40.000đ</td>
                      <td className="p-4 font-bold text-red-500 text-base">
                        5.000đ / km
                      </td>
                    </tr>
                    <tr className="hover:bg-blue-50/50 transition-colors">
                      <td className="p-4 text-gray-700">Trên 20km</td>
                      <td
                        className="p-4 text-gray-500 italic font-normal"
                        colSpan={3}
                      >
                        Liên hệ báo giá theo chuyến
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Phần giao diện */}
              <div className="p-4 bg-blue-50/80 rounded-xl border border-blue-100 text-sm text-blue-900 flex gap-3">
                <FaInfoCircle className="mt-0.5 shrink-0 text-lg text-blue-600" />
                <div>
                  <strong className="text-blue-700">Lưu ý quan trọng:</strong>
                  <ul className="list-disc pl-4 mt-1 space-y-1 text-gray-700">
                    <li>Miễn phí thu hộ (COD) dưới 2.000.000đ.</li>
                    <li>
                      Miễn phí quay đầu nếu giao không thành công (đối với shop
                      &gt; 100 đơn/tháng).
                    </li>
                    <li>Giá chưa bao gồm 10% VAT.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Phần giao diện */}
          <div
            className="bg-white rounded-3xl shadow-xl border border-orange-100 overflow-hidden flex flex-col"
            data-aos="fade-left"
          >
            {/* Phần giao diện */}
            <div className="bg-orange-600 p-6 text-white flex items-center justify-between relative overflow-hidden">
              <div className="absolute -right-10 -top-10 text-white/10 text-9xl">
                <FaRoute />
              </div>
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center text-3xl backdrop-blur-md border border-white/20">
                  <FaPlane />
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold uppercase tracking-wider">
                    Giao Liên Tỉnh
                  </h3>
                  <p className="text-orange-100 text-sm">
                    Đường bộ & Hàng không toàn quốc
                  </p>
                </div>
              </div>
            </div>

            {/* Phần giao diện */}
            <div className="p-6 flex-grow">
              <div className="overflow-x-auto rounded-xl border border-gray-200 mb-6">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-4 text-sm font-bold text-gray-600">
                        Trọng lượng
                      </th>
                      <th className="p-4 text-sm font-bold text-[#113e48]">
                        Nội miền <br />
                        <span className="font-normal text-xs">(1-2 ngày)</span>
                      </th>
                      <th className="p-4 text-sm font-bold text-[#113e48]">
                        Cận miền <br />
                        <span className="font-normal text-xs">(2-3 ngày)</span>
                      </th>
                      <th className="p-4 text-sm font-bold text-orange-600">
                        Liên miền <br />
                        <span className="font-normal text-xs">(3-5 ngày)</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-medium">
                    <tr className="border-b border-gray-100 hover:bg-orange-50/50 transition-colors">
                      <td className="p-4 text-gray-700">0 - 0.5 kg</td>
                      <td className="p-4">22.000đ</td>
                      <td className="p-4">28.000đ</td>
                      <td className="p-4 font-bold text-orange-600 text-base">
                        32.000đ
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-orange-50/50 transition-colors">
                      <td className="p-4 text-gray-700">0.5 - 2 kg</td>
                      <td className="p-4">30.000đ</td>
                      <td className="p-4">38.000đ</td>
                      <td className="p-4 font-bold text-orange-600 text-base">
                        45.000đ
                      </td>
                    </tr>
                    <tr className="hover:bg-orange-50/50 transition-colors">
                      <td className="p-4 text-gray-700">Mỗi 0.5kg tiếp theo</td>
                      <td className="p-4">+ 2.500đ</td>
                      <td className="p-4">+ 3.500đ</td>
                      <td className="p-4 font-bold text-orange-600 text-base">
                        + 5.000đ
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Phần giao diện */}
              <div className="p-4 bg-orange-50/80 rounded-xl border border-orange-100 text-sm text-orange-900 flex gap-3">
                <FaWeightHanging className="mt-0.5 shrink-0 text-lg text-orange-600" />
                <div>
                  <strong className="text-orange-700">
                    Công thức quy đổi trọng lượng:
                  </strong>
                  <p className="mt-1 text-gray-700 leading-relaxed">
                    Trọng lượng quy đổi (kg) = (Dài x Rộng x Cao) / 6000 (cm).
                    <br />
                    <em className="text-gray-500">
                      * Tính cước theo giá trị lớn hơn giữa Cân nặng thực tế và
                      Trọng lượng quy đổi.
                    </em>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Khối nội dung */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#113e48] mb-10 text-center uppercase tracking-wider">
            CÁC LOẠI PHÍ DỊCH VỤ CỘNG THÊM
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Phần giao diện */}
            <div
              className="bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:border-blue-300 hover:shadow-md transition-all group"
              data-aos="fade-up"
              data-aos-delay="0"
            >
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <FaSearchDollar />
              </div>
              <h4 className="font-bold text-xl text-slate-800 mb-3">
                Phí Thu Hộ (COD)
              </h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex justify-between py-1 border-b border-slate-200">
                  <span>Dưới 3tr:</span> <strong>Miễn phí</strong>
                </li>
                <li className="flex justify-between py-1">
                  <span>Trên 3tr:</span> <strong>0.8% giá trị</strong>
                </li>
              </ul>
            </div>

            {/* Phần giao diện */}
            <div
              className="bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:border-orange-300 hover:shadow-md transition-all group"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                <FaPercent />
              </div>
              <h4 className="font-bold text-xl text-slate-800 mb-3">
                Phí Bảo Hiểm
              </h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex justify-between py-1 border-b border-slate-200">
                  <span>Dưới 3tr:</span> <strong>Miễn phí</strong>
                </li>
                <li className="flex justify-between py-1">
                  <span>Trên 3tr:</span> <strong>0.5% khai giá</strong>
                </li>
              </ul>
            </div>

            {/* Phần giao diện */}
            <div
              className="bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:border-green-300 hover:shadow-md transition-all group"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <div className="w-14 h-14 bg-green-100 text-green-600 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:bg-green-600 group-hover:text-white transition-colors">
                <FaBox />
              </div>
              <h4 className="font-bold text-xl text-slate-800 mb-3">
                Phí Giao Lại / Hoàn Hàng
              </h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex justify-between py-1 border-b border-slate-200">
                  <span>Giao lại (lần 3):</span> <strong>10.000đ/lần</strong>
                </li>
                <li className="flex justify-between py-1">
                  <span>Hoàn hàng:</span> <strong>50% cước chiều đi</strong>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Khối nội dung */}
      <section className="py-20 bg-gradient-to-r from-[#113e48] to-slate-900 text-center text-white">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-6 leading-tight">
            Doanh nghiệp của bạn có lượng đơn lớn?
          </h2>
          <p className="text-lg text-blue-200 mb-10 max-w-2xl mx-auto">
            Chúng tôi có chính sách giá đặc biệt dành cho khách hàng có sản
            lượng trên 500 đơn/tháng. Nhận chiết khấu lên đến 30%.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/contact"
              className="px-8 py-4 bg-white text-[#113e48] font-bold rounded-full shadow-lg hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
            >
              Liên hệ nhận báo giá <FaArrowRight />
            </Link>
            <Link
              to="/register"
              className="px-8 py-4 bg-orange-500 border border-orange-500 text-white font-bold rounded-full hover:bg-orange-600 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-orange-500/30"
            >
              Đăng ký tài khoản ngay
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}