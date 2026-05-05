import React from "react";
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
  const safeFormat = (num) => (num || 0).toLocaleString("vi-VN") + "₫";

  const serviceOptions = [
    {
      key: "economy",
      label: "Tiết kiệm",
      icon: Clock,
      time: shippingData?.is_inter_provincial ? "2-3 ngày" : "Trong 6h",
      color: "blue",
    },
    {
      key: "express",
      label: "Nhanh",
      icon: Zap,
      time: shippingData?.is_inter_provincial ? "1-2 ngày" : "Trong 4h",
      color: "orange",
    },
    {
      key: "fast",
      label: "Hỏa tốc",
      icon: Rocket,
      time: shippingData?.is_inter_provincial ? "Trong ngày" : "1-2 giờ",
      color: "red",
    },
  ];

  return (
    <div className="lg:col-span-1">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 sticky top-6 overflow-hidden">
        {/* Phần giao diện */}
        <div className="bg-gradient-to-r from-[#113e48] to-[#1a5c6a] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
              <Receipt className="text-orange-400" size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Chi phí vận chuyển
              </h3>
              <p className="text-[11px] text-white/60 font-medium">
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
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setServiceType(opt.key)}
                    className={`w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-200 flex justify-between items-center group hover:shadow-md ${
                      isActive
                        ? "border-orange-500 bg-gradient-to-r from-orange-50 to-amber-50 shadow-sm"
                        : "border-gray-100 bg-gray-50/50 hover:border-gray-200 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg transition-colors ${
                          isActive
                            ? "bg-orange-500 text-white shadow-sm"
                            : "bg-white text-gray-400 group-hover:text-gray-600"
                        }`}
                      >
                        <Icon size={16} />
                      </div>
                      <div className="text-left">
                        <p
                          className={`font-bold text-sm ${isActive ? "text-orange-700" : "text-gray-700"}`}
                        >
                          {opt.label}
                        </p>
                        <p
                          className={`text-[10px] font-semibold uppercase tracking-wide ${isActive ? "text-orange-400" : "text-gray-400"}`}
                        >
                          {opt.time}
                        </p>
                      </div>
                    </div>
                    {isActive && (
                      <CheckCircle
                        size={20}
                        className="text-orange-500 shrink-0"
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
              <div className="flex items-center justify-center py-8 gap-2">
                <div className="relative">
                  <Loader2
                    className="animate-spin text-orange-500"
                    size={24}
                  />
                  <div className="absolute inset-0 animate-ping opacity-20 rounded-full bg-orange-400" />
                </div>
                <span className="font-semibold text-sm text-gray-500">
                  Đang tính cước phí...
                </span>
              </div>
            ) : shippingData ? (
              <div className="space-y-2">
                {/* Phần giao diện */}
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-500 flex items-center gap-2 text-sm">
                    <MapPin
                      size={14}
                      className="text-blue-500 shrink-0"
                    />
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
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-500 flex items-center gap-2 text-sm">
                    <Banknote
                      size={14}
                      className="text-emerald-500 shrink-0"
                    />
                    Phí thu hộ COD
                  </span>
                  <span
                    className={`font-bold text-sm tabular-nums ${
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
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-500 flex items-center gap-2 text-sm">
                    <ShieldCheck
                      size={14}
                      className="text-violet-500 shrink-0"
                    />
                    Thuế VAT (10%)
                  </span>
                  <span className="font-bold text-gray-800 text-sm tabular-nums">
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
                      Đơn liên tỉnh (
                      {shippingData?.details?.receiver_province}). Đã áp dụng
                      cước đường bộ.
                    </span>
                  </div>
                )}

                {/* Phần giao diện */}
                <div className="flex justify-between items-center pt-2 mt-1 border-t border-dashed border-gray-200">
                  <span className="text-sm font-bold text-gray-600 flex items-center gap-2">
                    <Truck size={15} className="text-[#113e48]" />
                    Tổng phí ship
                  </span>
                  <span className="font-extrabold text-[#113e48] text-base tabular-nums">
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
          <div className="bg-gradient-to-br from-[#113e48] via-[#164a56] to-[#0d2f37] rounded-2xl p-5 text-white shadow-xl relative overflow-hidden">
            {/* Phần giao diện */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/5 rounded-full" />
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/5 rounded-full" />

            <div className="relative z-10">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[11px] font-bold text-orange-400 uppercase tracking-widest">
                  Shipper sẽ thu khách
                </span>
                <div className="p-1.5 bg-white/10 rounded-lg">
                  <Wallet size={16} className="text-orange-400" />
                </div>
              </div>

              {/* Phần giao diện */}
              <div className="space-y-1 mb-3">
                <div className="flex justify-between text-[11px]">
                  <span className="text-white/50">Tiền hàng (COD)</span>
                  <span className="text-white/70 font-semibold tabular-nums">
                    {safeFormat(codAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-white/50">Phí vận chuyển</span>
                  <span className="text-white/70 font-semibold tabular-nums">
                    {safeFormat(shippingData?.total_shipping)}
                  </span>
                </div>
              </div>

              {/* Phần giao diện */}
              <div className="h-px bg-gradient-to-r from-white/10 via-white/20 to-white/10 mb-3" />

              {/* Phần giao diện */}
              <div className="flex justify-between items-end">
                <span className="text-xs text-white/40 font-medium">
                  Tổng thu
                </span>
                <span className="text-3xl font-black text-white tracking-tight tabular-nums">
                  {safeFormat(shippingData?.total_collect)}
                </span>
              </div>
            </div>
          </div>

          {/* Nút hành động */}
          <button
            type="submit"
            disabled={creating || !shippingData || loading}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-4 rounded-xl font-bold text-base shadow-lg shadow-orange-500/20 transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:saturate-0 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {creating && <Loader2 className="animate-spin" size={20} />}
            {creating ? "Đang xử lý..." : "Xác nhận & Tạo đơn"}
          </button>
        </div>
      </div>
    </div>
  );
}