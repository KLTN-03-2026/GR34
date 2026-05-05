import React, { useState, useEffect } from "react";
import axios from "axios";
import OrderSummarySidebar from "./OrderSummarySidebar";

// Component tạo đơn hàng nhanh
export default function CreateOrder() {

  const [pickupAddress, setPickupAddress] = useState(
    "Đường Doãn Địch, Hòa Minh, Liên Chiểu, Đà Nẵng",
  );
  const [receiverAddress, setReceiverAddress] = useState(
    "Viet An, Đà Nẵng, Việt Nam",
  );
  const [weightKg, setWeightKg] = useState(2);
  const [codAmount, setCodAmount] = useState(100000);
  const [serviceType, setServiceType] = useState("express");


  const [shippingData, setShippingData] = useState(null);
  const [loadingFee, setLoadingFee] = useState(false);


  useEffect(() => {

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


        if (response.data.success) {
          setShippingData(response.data);
        }
      } catch (error) {
      } finally {
        setLoadingFee(false);
      }
    };


    const timeoutId = setTimeout(() => {
      fetchShippingFee();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [pickupAddress, receiverAddress, weightKg, codAmount, serviceType]);


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      {/* Phần giao diện */}
      <div className="lg:col-span-2 space-y-6">
        {/* Phần giao diện */}
        <div className="bg-white p-6 rounded-xl border border-gray-100">
          <h3 className="font-bold mb-4">Mô phỏng Input Địa Chỉ</h3>

          <label className="block text-sm mb-1">Địa chỉ lấy hàng</label>
          <input
            type="text"
            value={pickupAddress}
            onChange={(e) => setPickupAddress(e.target.value)}
            className="w-full border p-2 rounded mb-4"
          />

          <label className="block text-sm mb-1">Địa chỉ giao hàng</label>
          <input
            type="text"
            value={receiverAddress}
            onChange={(e) => setReceiverAddress(e.target.value)}
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

        {/* Phần giao diện */}
      </div>

      {/* Phần giao diện */}

      <OrderSummarySidebar
        serviceType={serviceType}
        setServiceType={setServiceType}
        codAmount={codAmount}
        shippingData={shippingData}
        loading={loadingFee}
        creating={false}
      />
    </div>
  );
}