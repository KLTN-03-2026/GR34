import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  Truck,
  Wallet,
  MapPin,
  AlertCircle,
  Package,
  Loader2,
  Receipt,
  Banknote,
  ShieldCheck,
  Zap,
  Clock,
  Rocket,
} from "lucide-react";

// Sidebar tóm tắt đơn hàng
export default function OrderSummarySidebar({
  serviceType,
  setServiceType,
  creating = false,
  loading = false,
  shippingData = null,
  codAmount = 0,
}) {
  const [isOnFire, setIsOnFire] = useState(false);
  const safeFormat = (num) => (num || 0).toLocaleString("vi-VN") + "₫";

  const handleSelectService = (key) => {
    setServiceType(key);
    if (key === "fast") {
      setIsOnFire(true);
      setTimeout(() => setIsOnFire(false), 2500);
    } else {
      setIsOnFire(false);
    }
  };

  const serviceOptions = [
    {
      key: "economy",
      label: "Tiết kiệm",
      icon: Clock,
      time: shippingData?.is_inter_provincial ? "2-3 ngày" : "Trong 6h",
      color: "emerald",
    },
    {
      key: "express",
      label: "Nhanh",
      icon: Zap,
      time: shippingData?.is_inter_provincial ? "1-2 ngày" : "Trong 4h",
      color: "blue",
    },
    {
      key: "fast",
      label: "Hỏa tốc",
      icon: Rocket,
      time: shippingData?.is_inter_provincial ? "Trong ngày" : "1-2 giờ",
      color: "red",
    },
  ];

  const colorMap = {
    emerald: {
      activeContainer:
        "border-emerald-500 bg-gradient-to-br from-emerald-50 to-green-100 shadow-[0_10px_20px_-10px_rgba(16,185,129,0.5)] scale-[1.03] ring-4 ring-emerald-500/20 z-10 relative",
      activeIconBox:
        "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/40 scale-110",
      activeTitle: "text-emerald-800 font-extrabold text-[15px]",
      activeSubtitle: "text-emerald-600 font-bold",
      checkIcon: "text-emerald-500 drop-shadow-md scale-110",
    },
    blue: {
      activeContainer:
        "border-blue-500 bg-gradient-to-br from-blue-50 to-sky-100 shadow-[0_10px_20px_-10px_rgba(59,130,246,0.5)] scale-[1.03] ring-4 ring-blue-500/20 z-10 relative",
      activeIconBox:
        "bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg shadow-blue-500/40 scale-110",
      activeTitle: "text-blue-800 font-extrabold text-[15px]",
      activeSubtitle: "text-blue-600 font-bold",
      checkIcon: "text-blue-500 drop-shadow-md scale-110",
    },
    red: {
      activeContainer: `border-red-500 bg-gradient-to-br from-red-50 to-rose-100 shadow-[0_15px_30px_-10px_rgba(239,68,68,0.6)] scale-[1.05] ring-4 ring-red-500/30 z-10 relative ${isOnFire ? "is-on-fire" : ""}`,
      activeIconBox: `bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-xl shadow-red-500/50 scale-125 ${isOnFire ? "icon-on-fire" : "animate-[bounce_2s_infinite]"}`,
      activeTitle: `text-red-800 font-black text-[16px] ${isOnFire ? "text-on-fire" : ""}`,
      activeSubtitle: "text-red-600 font-bold tracking-widest",
      checkIcon: "text-red-500 drop-shadow-lg scale-125",
    },
  };

  return (
    <div className="lg:col-span-1">
      <style>{`
        @keyframes subtleGlow {
          0% { box-shadow: 0 0 8px rgba(239, 68, 68, 0.3), 0 0 15px rgba(239, 68, 68, 0.15); transform: scale(1.02); }
          50% { box-shadow: 0 0 12px rgba(239, 68, 68, 0.4), 0 0 25px rgba(245, 158, 11, 0.2); transform: scale(1.03); }
          100% { box-shadow: 0 0 10px rgba(239, 68, 68, 0.35), 0 0 20px rgba(239, 68, 68, 0.2); transform: scale(1.025); }
        }

        @keyframes gentlePulse {
          0% { transform: scale(1.1); }
          100% { transform: scale(1.15); }
        }

        .is-on-fire {
          animation: subtleGlow 1.2s ease-in-out infinite alternate !important;
          border-color: transparent !important;
        }

        .icon-on-fire {
          animation: gentlePulse 0.8s ease-in-out infinite alternate !important;
          color: #f87171 !important;
          border: 1px solid rgba(248, 113, 113, 0.3);
        }

        .text-on-fire {
          color: #dc2626 !important;
          text-shadow: 0 0 8px rgba(220, 38, 38, 0.3) !important;
          transition: all 0.3s ease;
        }
      `}</style>
      <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgb(0,0,0,0.12)] border border-gray-100 sticky top-6 overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_rgb(0,0,0,0.2)]">
        {/* Phần giao diện */}
        <div className="bg-gradient-to-br from-[#0f2c33] via-[#113e48] to-[#1a5c6a] px-7 py-6 relative overflow-hidden group">
          {/* Decorative glowing blobs */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/20 rounded-full blur-3xl group-hover:bg-teal-400/30 transition-all duration-700"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-500/20 rounded-full blur-2xl group-hover:bg-orange-400/30 transition-all duration-700"></div>

          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:scale-110 transition-transform duration-500">
              <Receipt
                className="text-orange-400 group-hover:animate-pulse"
                size={26}
              />
            </div>
            <div>
              <h3 className="text-lg font-black text-white tracking-wide drop-shadow-md">
                Chi phí vận chuyển
              </h3>
              <p className="text-xs text-teal-100/80 font-medium mt-0.5">
                Phí tự động cập nhật theo địa chỉ
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Phần giao diện */}
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">
              Chọn loại dịch vụ
            </p>
            <div className="space-y-2.5">
              {serviceOptions.map((opt) => {
                const isActive = serviceType === opt.key;
                const isFastDisabled =
                  opt.key === "fast" &&
                  shippingData &&
                  parseFloat(shippingData.distance_km) > 100;
                const Icon = opt.icon;
                const colors = colorMap[opt.color];
                return (
                  <button
                    key={opt.key}
                    type="button"
                    disabled={isFastDisabled}
                    onClick={() => handleSelectService(opt.key)}
                    className={`w-full px-5 py-4 rounded-2xl border-2 transition-all duration-300 flex justify-between items-center group overflow-hidden ${
                      isFastDisabled
                        ? "opacity-50 cursor-not-allowed bg-gray-100 border-gray-200"
                        : "hover:-translate-y-1 hover:shadow-xl"
                    } ${
                      isActive
                        ? colors.activeContainer
                        : !isFastDisabled
                          ? "border-transparent bg-gray-50/80 hover:border-gray-300 hover:bg-white"
                          : ""
                    }`}
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <div
                        className={`p-3 rounded-xl transition-all duration-500 ${
                          isActive
                            ? colors.activeIconBox
                            : "bg-white text-gray-400 shadow-sm group-hover:scale-110 group-hover:text-gray-700"
                        }`}
                      >
                        <Icon size={20} />
                      </div>
                      <div className="text-left">
                        <p
                          className={`font-bold text-sm ${isActive ? colors.activeTitle : "text-gray-700"}`}
                        >
                          {opt.label}{" "}
                          {isFastDisabled && (
                            <span className="text-[10px] text-red-500 font-normal normal-case">
                              (Quá 100km)
                            </span>
                          )}
                        </p>
                        <p
                          className={`text-[10px] font-semibold uppercase tracking-wide ${isActive ? colors.activeSubtitle : "text-gray-400"}`}
                        >
                          {opt.time}
                        </p>
                      </div>
                    </div>
                    {isActive && (
                      <CheckCircle
                        size={20}
                        className={`${colors.checkIcon} shrink-0`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Phần giao diện */}
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

          {/* Phần giao diện */}
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">
              Chi tiết cước phí
            </p>
            {loading ? (
              <div className="flex items-center justify-center py-10 gap-3 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-12 h-12 bg-orange-200 rounded-full animate-ping opacity-50"></div>
                  <Loader2
                    className="animate-spin text-orange-500 relative z-10"
                    size={28}
                  />
                </div>
                <span className="font-bold text-sm text-gray-600 tracking-wide animate-pulse">
                  Đang tính cước phí...
                </span>
              </div>
            ) : shippingData ? (
              <div className="space-y-3">
                {/* Phần giao diện */}
                <div className="flex justify-between items-center p-3.5 bg-gradient-to-r from-gray-50 to-white border border-gray-100 rounded-xl hover:shadow-md transition-shadow">
                  <span className="text-gray-600 flex items-center gap-2 text-sm font-medium">
                    <div className="p-1.5 bg-blue-50 rounded-lg">
                      <MapPin size={16} className="text-blue-500 shrink-0" />
                    </div>
                    <span>
                      Cước vận chuyển
                      <span className="text-[10px] text-gray-400 ml-1">
                        ({shippingData?.distance_km || 0}km)
                      </span>
                    </span>
                  </span>
                  <span className="font-bold text-gray-800 text-sm tabular-nums">
                    {safeFormat(shippingData?.base_fee)}
                  </span>
                </div>

                {/* Phần giao diện */}
                <div className="flex justify-between items-center p-3.5 bg-gradient-to-r from-gray-50 to-white border border-gray-100 rounded-xl hover:shadow-md transition-shadow group">
                  <span className="text-gray-600 flex items-center gap-2 text-sm font-medium">
                    <div className="p-1.5 bg-emerald-50 rounded-lg group-hover:scale-110 transition-transform">
                      <Banknote
                        size={16}
                        className="text-emerald-500 shrink-0"
                      />
                    </div>
                    Phí thu hộ COD
                  </span>
                  <span
                    className={`font-bold text-[15px] tabular-nums ${
                      (shippingData?.cod_fee || 0) === 0
                        ? "text-emerald-600"
                        : "text-gray-800"
                    }`}
                  >
                    {(shippingData?.cod_fee || 0) === 0
                      ? "Miễn phí"
                      : safeFormat(shippingData?.cod_fee)}
                  </span>
                </div>

                {/* Phần giao diện */}
                <div className="flex justify-between items-center p-3.5 bg-gradient-to-r from-gray-50 to-white border border-gray-100 rounded-xl hover:shadow-md transition-shadow group">
                  <span className="text-gray-600 flex items-center gap-2 text-sm font-medium">
                    <div className="p-1.5 bg-violet-50 rounded-lg group-hover:scale-110 transition-transform">
                      <ShieldCheck
                        size={16}
                        className="text-violet-500 shrink-0"
                      />
                    </div>
                    Thuế VAT (10%)
                  </span>
                  <span className="font-bold text-gray-800 text-[15px] tabular-nums">
                    {safeFormat(shippingData?.vat_fee)}
                  </span>
                </div>

                {/* Render điều kiện */}
                {shippingData?.is_inter_provincial && (
                  <div className="bg-blue-50/80 p-3 rounded-xl text-[11px] text-blue-700 flex gap-2 border border-blue-100 mt-1">
                    <AlertCircle
                      size={15}
                      className="shrink-0 text-blue-500 mt-0.5"
                    />
                    <span className="leading-relaxed">
                      Đơn liên tỉnh ({shippingData?.details?.receiver_province}
                      ). Đã áp dụng cước đường bộ.
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 mt-2 border-t-2 border-dashed border-gray-200">
                  <span className="text-sm font-extrabold text-gray-700 flex items-center gap-2 uppercase tracking-wide">
                    <div className="p-1.5 bg-[#113e48]/10 rounded-lg">
                      <Truck size={18} className="text-[#113e48]" />
                    </div>
                    Tổng phí ship
                  </span>
                  <span className="font-black text-[#113e48] text-xl tabular-nums drop-shadow-sm">
                    {safeFormat(shippingData?.total_shipping)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="inline-flex p-3 bg-gray-100 rounded-full mb-2">
                  <MapPin size={20} className="text-gray-400" />
                </div>
                <p className="text-sm text-gray-400 font-medium">
                  Nhập địa chỉ để tính phí
                </p>
              </div>
            )}
          </div>

          {/* Phần giao diện */}
          <div className="bg-gradient-to-br from-[#0f2c33] via-[#164a56] to-[#0d2f37] rounded-3xl p-6 text-white shadow-[0_15px_40px_-10px_rgba(17,62,72,0.6)] relative overflow-hidden group">
            {/* Animated glowing elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-teal-400/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" />

            <div className="relative z-10">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-black text-orange-400 uppercase tracking-widest drop-shadow-md flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                  </span>
                  Shipper sẽ thu khách
                </span>
                <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm border border-white/5 shadow-inner">
                  <Wallet
                    size={20}
                    className="text-orange-400 drop-shadow-md"
                  />
                </div>
              </div>

              {/* Phần giao diện */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs items-center">
                  <span className="text-teal-100/70 font-medium">
                    Tiền hàng (COD)
                  </span>
                  <span className="text-white font-bold tabular-nums bg-white/10 px-2 py-0.5 rounded-md">
                    {safeFormat(codAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-xs items-center">
                  <span className="text-teal-100/70 font-medium">
                    Phí vận chuyển
                  </span>
                  <span className="text-white font-bold tabular-nums bg-white/10 px-2 py-0.5 rounded-md">
                    {safeFormat(shippingData?.total_shipping)}
                  </span>
                </div>
              </div>

              {/* Phần giao diện */}
              <div className="h-px bg-gradient-to-r from-transparent via-teal-200/30 to-transparent mb-4" />

              {/* Phần giao diện */}
              <div className="flex justify-between items-end">
                <span className="text-sm text-teal-100/60 font-bold uppercase tracking-wider mb-1">
                  Tổng thu
                </span>
                <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-300 via-amber-200 to-yellow-100 tracking-tight tabular-nums drop-shadow-[0_2px_10px_rgba(251,146,60,0.3)]">
                  {safeFormat(shippingData?.total_collect)}
                </span>
              </div>
            </div>
          </div>

          {/* Nút hành động */}
          <button
            type="submit"
            disabled={creating || !shippingData || loading}
            className="group relative w-full bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 bg-[length:200%_auto] hover:bg-[position:right_center] text-white py-4 px-6 rounded-2xl font-black text-lg shadow-[0_10px_30px_-10px_rgba(249,115,22,0.8)] hover:shadow-[0_15px_40px_-15px_rgba(239,68,68,1)] transition-all duration-500 hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:saturate-0 disabled:cursor-not-allowed overflow-hidden flex items-center justify-center gap-3"
          >
            {/* Sweep effect */}
            <div className="absolute inset-0 w-[200%] -translate-x-[150%] bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:animate-[shimmer_2s_infinite]" />

            {creating && (
              <Loader2 className="animate-spin relative z-10" size={24} />
            )}
            <span className="relative z-10 tracking-wide">
              {creating ? "Đang xử lý..." : "Xem lại đơn hàng"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
