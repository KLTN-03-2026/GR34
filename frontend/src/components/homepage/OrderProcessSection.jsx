import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCube,
  faFileCirclePlus,
  faCreditCard,
  faTruckFast,
  faClipboardCheck,
} from "@fortawesome/free-solid-svg-icons";

const processSteps = [
  {
    id: "01",
    title: "Tạo đơn hàng",
    desc: "Liên hệ hoặc sử dụng hệ thống đặt hàng trực tuyến để chọn sản phẩm, xác nhận đơn hàng và kiểm tra.",
    icon: faFileCirclePlus,
  },
  {
    id: "02",
    title: "Xác nhận & thanh toán",
    desc: "Xác nhận thông tin đơn hàng, chọn phương thức thanh toán và hoàn thành quá trình thanh toán.",
    icon: faCreditCard,
  },
  {
    id: "03",
    title: "Xử lý & vận chuyển",
    desc: "Nhà cung cấp xác nhận đơn hàng, chuẩn bị hàng hóa, bao gói và chọn dịch vụ vận chuyển phù hợp.",
    icon: faTruckFast,
  },
  {
    id: "04",
    title: "Nhận hàng & xác nhận",
    desc: "Vận chuyển hàng hóa đến địa chỉ giao hàng, nhận hàng, kiểm tra và xác nhận việc nhận hàng.",
    icon: faClipboardCheck,
  },
];

const OrderProcessSection = () => {
  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden">
      {/* Phần giao diện */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <img
          src="https://img.freepik.com/free-vector/world-map-background-template_1017-31327.jpg"
          alt="World Map Background"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        {/* Phần giao diện */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 text-orange-600 mb-4 border border-orange-200">
            <FontAwesomeIcon icon={faCube} className="text-orange-500" />
            <span className="text-orange-500 font-bold text-[20px] uppercase tracking-wider">
              Order Hàng
            </span>
          </div>
          <h2 className="text-2xl md:text-4xl font-extrabold text-slate-800 uppercase leading-tight">
            Quy trình Order Hàng
          </h2>
        </div>

        {/* Phần giao diện */}
        <div className="relative grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          {/* Phần giao diện */}
          <div className="hidden xl:block absolute top-[90px] left-0 w-full h-20 -z-10 pointer-events-none">
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 1200 100"
              preserveAspectRatio="none"
            >
              <path
                d="M0,50 C300,50 300,50 600,50 C900,50 900,50 1200,50"
                fill="none"
                stroke="#fb923c"
                strokeWidth="2"
                strokeDasharray="10 10"
                className="opacity-40"
              />
            </svg>
          </div>

          {processSteps.map((step, index) => (
            <div
              key={step.id}

              className="group flex flex-col items-center text-center relative p-6 rounded-2xl hover:bg-white hover:shadow-2xl transition-all duration-300 overflow-hidden"
            >
              {/* Phần giao diện */}

              <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-[-25deg] group-hover:left-[100%] transition-all duration-1000 ease-in-out z-0"></div>

              {/* Phần giao diện */}
              <div className="relative z-10 flex flex-col items-center">
                {/* Phần giao diện */}
                <div className="relative mb-8">
                  {/* Phần giao diện */}
                  <div className="w-40 h-40 rounded-full border-2 border-dashed border-orange-300 group-hover:border-[#113e48] flex items-center justify-center bg-white shadow-xl transition-colors duration-500 relative z-10">
                    {/* Phần giao diện */}
                    <div className="w-32 h-32 rounded-full bg-orange-50 group-hover:bg-[#113e48] flex items-center justify-center transition-colors duration-500">
                      {/* Phần giao diện */}
                      <FontAwesomeIcon
                        icon={step.icon}
                        className="text-4xl text-orange-500 group-hover:text-white transition-all duration-500 ease-in-out group-hover:scale-x-[-1]"
                      />
                    </div>
                  </div>

                  {/* Phần giao diện */}
                  <div className="absolute top-0 right-0 w-10 h-10 rounded-full bg-orange-500 border-4 border-white shadow-md flex items-center justify-center z-20 group-hover:bg-[#113e48] group-hover:scale-110 transition-all duration-300">
                    <span className="text-white font-bold text-sm">
                      {step.id}
                    </span>
                  </div>
                </div>

                {/* Tiêu đề nội dung */}
                <h3 className="text-xl font-bold text-[#113e48] mb-3 group-hover:text-orange-500 transition-colors">
                  {step.title}
                </h3>

                <p className="text-gray-500 text-base leading-relaxed px-2">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OrderProcessSection;