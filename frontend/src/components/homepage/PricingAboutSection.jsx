import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTruckFast,
  faClock,
  faUserTie,
  faBoxOpen,
  faPaperPlane,
  faWarehouse,
} from "@fortawesome/free-solid-svg-icons";

const featuresData = [
  {
    icon: faTruckFast,
    title: "Phí vận chuyển quốc tế",
    desc: "Chi phí vận chuyển tối ưu từ quốc gia xuất xứ đến kho nhập khẩu.",
  },
  {
    icon: faClock,
    title: "Phí xử lý hải quan",
    desc: "Bao gồm làm hồ sơ, khai báo, kiểm tra và thông quan hàng hóa.",
  },
  {
    icon: faWarehouse,
    title: "Phí lưu kho",
    desc: "Linh hoạt theo diện tích và thời gian lưu trữ thực tế của hàng hóa.",
  },
  {
    icon: faBoxOpen,
    title: "Phí xử lý nội địa",
    desc: "Gồm xử lý, đóng gói, dán nhãn và giao hàng tận nơi.",
  },
  {
    icon: faUserTie,
    title: "Phí bảo hiểm hàng hóa",
    desc: "Bảo hiểm 100% giá trị hàng hóa trước mọi rủi ro vận chuyển.",
  },
];

const statsData = [
  { number: "10+", label: "Năm kinh nghiệm" },
  { number: "6+", label: "Kho hàng" },
  { number: "12k+", label: "Khách hàng" },
];

export default function PricingAboutSection() {
  return (
    <section className="py-24 bg-white overflow-hidden relative">
      {/* Phần giao diện */}
      <div className="absolute top-10 right-0 md:right-10 opacity-30 pointer-events-none animate-pulse">
        <div
          className="w-48 h-48"
          style={{
            backgroundImage: "radial-gradient(#113e48 2px, transparent 2px)",
            backgroundSize: "20px 20px",
          }}
        ></div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Phần giao diện */}
          <div>
            <div className="mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 text-orange-600 mb-4 border border-orange-200">
                <FontAwesomeIcon icon={faBoxOpen} className="text-xl" />
                <span className="font-bold text-xl uppercase tracking-wider">
                  Bảng giá dịch vụ
                </span>
              </div>
              <h2 className="text-3xl font-extrabold uppercase text-[#113e48] mb-4 leading-tight">
                Phí dịch vụ nhập hàng <br />
                <span className="text-orange-500">Uy tín & Trọn gói</span>
              </h2>
              <p className="text-slate-600 max-w-lg">
                Cam kết bảng giá minh bạch, không phát sinh chi phí ẩn. Tùy
                chỉnh linh hoạt theo nhu cầu cụ thể của từng doanh nghiệp.
              </p>
            </div>

            {/* Phần giao diện */}
            <div className="space-y-4">
              {featuresData.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-5 group p-4 rounded-2xl hover:bg-slate-50 transition-all duration-300 relative overflow-hidden cursor-default"
                >
                  {/* Phần giao diện */}

                  <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-slate-400/10 to-transparent skew-x-[45deg] group-hover:left-[100%] transition-all duration-700 ease-in-out z-0"></div>

                  <div className="relative z-10 flex-shrink-0 w-14 h-14 rounded-xl bg-white border border-gray-100 shadow-lg text-orange-500 flex items-center justify-center text-xl transition-all duration-300 group-hover:bg-[#113e48] group-hover:text-white">
                    <FontAwesomeIcon icon={item.icon} />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-lg font-bold text-[#113e48] mb-2 group-hover:text-orange-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-slate-600 text-base leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Phần giao diện */}

            <div className="mt-10">
              <Link to="/services/price-list">
                <button className="relative overflow-hidden group inline-flex items-center gap-2 bg-[#113e48] text-white px-8 py-3.5 rounded-full font-bold uppercase text-sm tracking-wide hover:bg-orange-500 transition-all duration-300 shadow-xl shadow-[#113e48]/20 hover:shadow-orange-500/30 transform hover:-translate-y-1">
                  <span className="relative z-10 flex items-center gap-2">
                    Xem chi tiết
                    <FontAwesomeIcon icon={faPaperPlane} />
                  </span>

                  {/* Phần giao diện */}

                  <div className="absolute top-0 -left-[100%] w-full h-full bg-white/20 skew-x-[45deg] group-hover:left-[100%] transition-all duration-700 ease-in-out"></div>
                </button>
              </Link>
            </div>
          </div>

          {/* Phần giao diện */}
          <div className="relative mt-12 lg:mt-0 h-full w-full lg:w-[95%] mx-auto">
            <div className="hidden sm:flex flex-col items-center justify-start relative w-full h-full px-3 sm:px-4 lg:px-0">
              {/* Phần giao diện */}
              <div className="relative w-full rounded-[30px] lg:rounded-[40px] overflow-hidden bg-white shadow-[0_20px_60px_rgba(17,62,72,0.15)] border-6 lg:border-8 border-white z-20 group transform hover:-translate-y-2 transition-all duration-500">
                <img
                  src="/assets/img/pricing2.png"
                  alt="bảng giá dịch vụ ngang"
                  className="w-full h-auto object-contain bg-white"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#113e48]/5 via-transparent to-[#113e48]/10 mix-blend-overlay pointer-events-none"></div>
                <div className="absolute top-0 -left-[100%] w-full h-full bg-white/30 skew-x-[45deg] group-hover:left-[100%] transition-all duration-700 ease-in-out z-30"></div>
              </div>

              {/* Phần giao diện */}
              <div className="relative w-[85%] lg:w-[75%] -mt-4 lg:-mt-6 rounded-[25px] lg:rounded-[30px] border-6 lg:border-8 border-white bg-white shadow-[0_25px_70px_rgba(17,62,72,0.3)] overflow-hidden z-30 group hover:-translate-y-1 transition-all duration-500">
                <img
                  src="/assets/img/pricing1.png"
                  alt="bản giá dịch vụ dọc"
                  className="w-full h-auto object-contain bg-white"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#113e48]/10 via-transparent to-transparent pointer-events-none"></div>
              </div>

              {/* Phần giao diện */}
              <div className="absolute top-1/4 -right-8 z-0 hidden lg:block pointer-events-none">
                <div className="w-48 h-48 rounded-full border-[3px] border-dashed border-[#113e48]/25 flex items-center justify-center animate-[spin_15s_linear_infinite]">
                  <div className="w-36 h-36 rounded-full bg-gradient-to-br from-orange-500/10 to-transparent"></div>
                </div>
              </div>
            </div>

            {/* Phần giao diện */}
            <div className="sm:hidden flex flex-col gap-6 px-3 py-4">
              {/* Phần giao diện */}
              <div className="rounded-[30px] overflow-hidden shadow-[0_15px_40px_rgba(17,62,72,0.3)] border-6 border-white w-full group transform hover:-translate-y-2 transition-all duration-500 z-20">
                <img
                  src="/assets/img/pricing2.png"
                  alt="banner giá dịch vụ ngang"
                  className="w-full h-auto object-contain bg-white transform group-hover:scale-105 transition-transform duration-700 filter group-hover:brightness-110"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#113e48]/5 via-transparent to-[#113e48]/10 mix-blend-overlay pointer-events-none"></div>
              </div>

              {/* Phần giao diện */}
              <div className="rounded-[30px] border-6 border-white shadow-[0_25px_70px_rgba(17,62,72,0.3)] overflow-hidden w-4/5 mx-auto -mt-10 z-30 group hover:-translate-y-1 transition-all duration-500">
                <img
                  src="/assets/img/pricing1.png"
                  alt="bản giá dịch vụ dọc"
                  className="w-full h-auto object-contain bg-white filter group-hover:brightness-105 transition-all duration-500 transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#113e48]/10 via-transparent to-transparent pointer-events-none"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}