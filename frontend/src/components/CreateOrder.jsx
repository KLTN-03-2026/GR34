import React, { useState, useEffect } from "react";
import axios from "axios";
import OrderSummarySidebar from "./OrderSummarySidebar"; // Import Sidebar của bạn

export default function CreateOrder() {
  // ==========================================
  // 1. STATE QUẢN LÝ DỮ LIỆU TỪ FORM BÊN TRÁI
  // ==========================================
  // Lưu ý: Các biến này phải được gắn vào thuộc tính value và onChange của các thẻ <input> bên form
  const [pickupAddress, setPickupAddress] = useState(
    "Đường Doãn Địch, Hòa Minh, Liên Chiểu, Đà Nẵng",
  );
  const [receiverAddress, setReceiverAddress] = useState(
    "Viet An, Đà Nẵng, Việt Nam",
  );
  const [weightKg, setWeightKg] = useState(2);
  const [codAmount, setCodAmount] = useState(100000);
  const [serviceType, setServiceType] = useState("express"); // Tiết kiệm, Nhanh, Hỏa tốc

  // ==========================================
  // 2. STATE QUẢN LÝ DỮ LIỆU TỪ BACKEND TRẢ VỀ
  // ==========================================
  const [shippingData, setShippingData] = useState(null);
  const [loadingFee, setLoadingFee] = useState(false);

  // ==========================================
  // 3. LOGIC GỌI API TỰ ĐỘNG
  // ==========================================
  useEffect(() => {
    // Nếu chưa nhập đủ địa chỉ thì không tính phí
    if (!pickupAddress || !receiverAddress) {
      setShippingData(null);
      return;
    }

    const fetchShippingFee = async () => {
      setLoadingFee(true);
      try {
        const response = await axios.post(
          "http://localhost:5000/api/shipping/calculate-fee",
          {
            pickup_address: pickupAddress,
            receiver_address: receiverAddress,
            weight_kg: weightKg,
            service_type: serviceType,
            cod_amount: codAmount,
          },
        );

        // Lưu kết quả Backend trả về vào state
        if (response.data.success) {
          setShippingData(response.data);
        }
      } catch (error) {
        console.error("Lỗi tính phí:", error);
      } finally {
        setLoadingFee(false);
      }
    };

    // Delay 1 giây sau khi gõ xong mới gọi API để đỡ lag server
    const timeoutId = setTimeout(() => {
      fetchShippingFee();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [pickupAddress, receiverAddress, weightKg, codAmount, serviceType]); // Hàm chạy lại khi 1 trong 5 biến này thay đổi

  // ==========================================
  // 4. GIAO DIỆN (UI)
  // ==========================================
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      {/* CỘT BÊN TRÁI: FORM NHẬP LIỆU */}
      <div className="lg:col-span-2 space-y-6">
        {/* Ví dụ về cách gắn State vào Form (Bạn áp dụng cho code form thực tế của bạn) */}
        <div className="bg-white p-6 rounded-xl border border-gray-100">
          <h3 className="font-bold mb-4">Mô phỏng Input Địa Chỉ</h3>

          <label className="block text-sm mb-1">Địa chỉ lấy hàng</label>
          <input
            type="text"
            value={pickupAddress}
            onChange={(e) => setPickupAddress(e.target.value)} // QUAN TRỌNG: Phải cập nhật State khi gõ
            className="w-full border p-2 rounded mb-4"
          />

          <label className="block text-sm mb-1">Địa chỉ giao hàng</label>
          <input
            type="text"
            value={receiverAddress}
            onChange={(e) => setReceiverAddress(e.target.value)} // QUAN TRỌNG: Phải cập nhật State khi gõ
            className="w-full border p-2 rounded mb-4"
          />

          <div className="flex gap-4">
            <div>
              <label className="block text-sm mb-1">Cân nặng (kg)</label>
              <input
                type="number"
                value={weightKg}
                onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">
                Tiền thu hộ COD (VNĐ)
              </label>
              <input
                type="number"
                value={codAmount}
                onChange={(e) => setCodAmount(parseFloat(e.target.value) || 0)}
                className="w-full border p-2 rounded"
              />
            </div>
          </div>
        </div>

        {/* Chèn code các component form Thông tin người gửi, nhận, hàng hóa của bạn vào đây */}
      </div>

      {/* CỘT BÊN PHẢI: SIDEBAR THANH TOÁN */}
      {/* QUAN TRỌNG NHẤT: TRUYỀN PROPS XUỐNG SIDEBAR */}
      <OrderSummarySidebar
        serviceType={serviceType}
        setServiceType={setServiceType}
        codAmount={codAmount}
        shippingData={shippingData} // Đẩy cục data JSON từ backend xuống đây
        loading={loadingFee} // Trạng thái đang tải
        creating={false}
      />
    </div>
  );
}
