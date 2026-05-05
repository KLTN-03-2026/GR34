import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaNetworkWired,
  FaRobot,
  FaSatelliteDish,
  FaShieldAlt,
  FaArrowRight,
  FaWarehouse,
  FaMapMarkedAlt,
  FaCheckCircle,
  FaBoxes,
  FaBarcode,
  FaLayerGroup,
  FaSortAmountDown,
} from "react-icons/fa";
import AOS from "aos";
import "aos/dist/aos.css";

export default function Warehouse() {
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="font-sans bg-slate-50 text-slate-700">
      {/* Khối nội dung */}
      <section className="relative h-[450px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1920&q=80"
            alt="Warehouse Operation"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#113e48]/90 mix-blend-multiply"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center text-white mt-10">
          <div data-aos="fade-down">
            <span className="inline-flex items-center gap-2 py-1 px-4 rounded-full bg-orange-500/20 border border-orange-500 text-orange-400 font-bold text-xs uppercase tracking-wider backdrop-blur-md mb-4">
              <FaNetworkWired /> Hệ thống Mega Hubs
            </span>
          </div>
          <h1
            className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight"
            data-aos="fade-up"
          >
            Trung Tâm Khai Thác & <br />
            <span className="text-orange-500">Lưu Trữ Hàng Hóa Thông Minh</span>
          </h1>
          <p
            className="text-base md:text-lg text-gray-300 max-w-2xl mx-auto mb-8"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            Hạ tầng kho vận 50.000m² được quy hoạch khoa học, đảm bảo hàng hóa
            được sắp xếp ngăn nắp, an toàn và dễ dàng truy xuất.
          </p>

          <div data-aos="fade-up" data-aos-delay="200">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg hover:shadow-orange-500/40"
            >
              Liên hệ hợp tác <FaArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Khối nội dung */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
            {[
              { num: "36+", label: "Hub Khai Thác" },
              { num: "2M+", label: "Đơn/Ngày" },
              { num: "100%", label: "Tự Động Hóa" },
              { num: "24/7", label: "Vận Hành" },
            ].map((stat, i) => (
              <div key={i} className="py-8 text-center group">
                <div className="text-3xl font-extrabold text-[#113e48] group-hover:text-orange-600 transition-colors">
                  {stat.num}
                </div>
                <div className="text-xs text-gray-500 uppercase font-bold tracking-wide mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Khối nội dung */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-[#113e48] mb-3">
            CÔNG NGHỆ VẬN HÀNH
          </h2>
          <p className="text-gray-500">
            Sự kết hợp hoàn hảo giữa con người và máy móc
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 text-xl mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <FaRobot />
            </div>
            <h3 className="text-lg font-bold text-[#113e48] mb-3">
              Matrix Sorting
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Hệ thống băng chuyền ma trận tự động phân loại hàng hóa theo mã
              bưu chính, loại bỏ 99% sai sót thủ công.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600 text-xl mb-6 group-hover:bg-orange-500 group-hover:text-white transition-colors">
              <FaSatelliteDish />
            </div>
            <h3 className="text-lg font-bold text-[#113e48] mb-3">
              Real-time Tracking
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Mỗi kiện hàng được gắn "Digital ID", cho phép định vị chính xác vị
              trí trong kho theo thời gian thực (Real-time).
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center text-green-600 text-xl mb-6 group-hover:bg-green-600 group-hover:text-white transition-colors">
              <FaShieldAlt />
            </div>
            <h3 className="text-lg font-bold text-[#113e48] mb-3">
              AI Security
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Camera AI giám sát quy trình xử lý hàng, tự động phát hiện và cảnh
              báo các hành vi quăng quật hàng hóa.
            </p>
          </div>
        </div>
      </section>

      {/* Khối nội dung */}
      <section className="py-10 px-6 max-w-7xl mx-auto space-y-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative" data-aos="fade-right">
            <img
              src="https://images.unsplash.com/photo-1565514020125-7df36c84c149?auto=format&fit=crop&w=800&q=80"
              alt="Mega Hub"
              className="rounded-2xl shadow-xl w-full object-cover h-[400px]"
            />
            <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-lg border-l-4 border-orange-500 hidden md:block">
              <div className="text-sm font-bold text-gray-500">
                Tốc độ xử lý
              </div>
              <div className="text-2xl font-extrabold text-[#113e48]">
                25.000 kiện/giờ
              </div>
            </div>
          </div>

          <div data-aos="fade-left">
            <span className="text-orange-600 font-bold uppercase tracking-wider text-xs">
              Quy mô hạ tầng
            </span>
            <h2 className="text-3xl font-extrabold text-[#113e48] mt-2 mb-4">
              Hệ thống Mega Hubs <br /> Chuẩn Quốc Tế
            </h2>
            <p className="text-gray-600 text-base leading-relaxed mb-6">
              Không chỉ là nhà kho, đây là những trung tâm điều phối thông minh.
              Được đặt tại các cửa ngõ giao thương huyết mạch, giúp luân chuyển
              hàng hóa liên tục.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <FaCheckCircle className="text-blue-600" />
                <span className="text-slate-700">
                  Tổng diện tích khai thác: <strong>50.000m²</strong>
                </span>
              </li>
              <li className="flex items-center gap-3">
                <FaCheckCircle className="text-blue-600" />
                <span className="text-slate-700">
                  Kết nối trực tiếp <strong>63/63 tỉnh thành</strong>
                </span>
              </li>
              <li className="flex items-center gap-3">
                <FaCheckCircle className="text-blue-600" />
                <span className="text-slate-700">
                  Vận hành liên tục <strong>24/7/365</strong>
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Khối nội dung */}
      <section className="py-20 bg-white mt-20 relative border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#113e48] mb-4 uppercase tracking-wider">
              QUY CHUẨN LƯU TRỮ & SẮP XẾP
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Hàng hóa không bao giờ bị "để lung tung". Mọi kiện hàng đều có
              "địa chỉ" riêng và được sắp xếp theo quy tắc khoa học để tối ưu
              thời gian lấy hàng.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Phần giao diện */}
            <div
              className="bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:border-orange-200 hover:shadow-lg transition-all"
              data-aos="fade-up"
              data-aos-delay="0"
            >
              <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-3xl mb-4 text-[#113e48]">
                <FaLayerGroup />
              </div>
              <h4 className="font-bold text-lg text-[#113e48] mb-2">
                Phân khu chuyên biệt
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Kho được chia thành các khu vực riêng: Hàng cồng kềnh, hàng dễ
                vỡ, hàng giá trị cao và hàng tiêu chuẩn. Giúp bảo vệ an toàn tối
                đa cho từng loại hàng.
              </p>
            </div>

            {/* Phần giao diện */}
            <div
              className="bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:border-orange-200 hover:shadow-lg transition-all"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-3xl mb-4 text-[#113e48]">
                <FaMapMarkedAlt />
              </div>
              <h4 className="font-bold text-lg text-[#113e48] mb-2">
                Định vị Bin Location
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Mỗi ô kệ đều có mã địa chỉ (Ví dụ: A-01-05). Hệ thống sẽ chỉ
                định chính xác vị trí đặt hàng ngay khi hàng vừa nhập kho.
              </p>
            </div>

            {/* Phần giao diện */}
            <div
              className="bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:border-orange-200 hover:shadow-lg transition-all"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-3xl mb-4 text-[#113e48]">
                <FaBarcode />
              </div>
              <h4 className="font-bold text-lg text-[#113e48] mb-2">
                Quản lý mã vạch
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                100% kiện hàng được dán mã vận đơn. Nhân viên sử dụng máy quét
                PDA để kiểm soát hàng vào/ra, loại bỏ hoàn toàn việc ghi chép
                thủ công.
              </p>
            </div>

            {/* Phần giao diện */}
            <div
              className="bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:border-orange-200 hover:shadow-lg transition-all"
              data-aos="fade-up"
              data-aos-delay="300"
            >
              <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-3xl mb-4 text-[#113e48]">
                <FaSortAmountDown />
              </div>
              <h4 className="font-bold text-lg text-[#113e48] mb-2">
                Quy tắc FIFO
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Áp dụng quy tắc "First In - First Out" (Nhập trước xuất trước)
                để đảm bảo hàng hóa không bị lưu kho quá lâu, đặc biệt là hàng
                thực phẩm/mỹ phẩm.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Khối nội dung */}
      <section className="py-20 bg-[#113e48] text-center mt-20">
        <div className="max-w-3xl mx-auto px-6 text-white">
          <FaWarehouse className="text-5xl mx-auto mb-4 opacity-50" />
          <h2 className="text-3xl font-extrabold mb-4">
            An tâm gửi trọn niềm tin
          </h2>
          <p className="text-blue-100 mb-8">
            Hàng hóa của bạn được chăm sóc bởi quy trình chuyên nghiệp nhất.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/customer/create-order"
              className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-full shadow-lg hover:shadow-orange-500/30 transition-all flex items-center justify-center gap-2"
            >
              Tạo đơn hàng ngay <FaArrowRight />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}