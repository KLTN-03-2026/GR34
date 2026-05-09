import { useState, useEffect } from "react";
import API from "../../services/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";


import DiaChiSelector from "../../components/DiaChiSelector.jsx";
import AddressBookModal from "../../components/AddressBookModal.jsx";
import OrderSummarySidebar from "../../components/OrderSummarySidebar.jsx";
import LocationMapModal from "../../components/LocationMapModal.jsx";


import {
  Package,
  MapPin,
  User,
  Truck,
  Map,
  Hash,
  Scale,
  DollarSign,
  Book,
  X,
  CheckCircle,
  AlertCircle,
  Wallet
} from "lucide-react";


const WAREHOUSE = {
  address: "55 Nguyễn Văn Linh, Quận Hải Châu, TP. Đà Nẵng",
  lat: 16.0600,
  lng: 108.2130,
  name: "Kho SpeedyShip Đà Nẵng",
  phone: "1900 888 999",
};

const FORBIDDEN_WORDS = [
  "chất cấm", "ma túy", "vũ khí", "cháy nổ", "pháo", "súng", 
  "đạn", "dao", "độc hại", "thuốc phiện", "hàng lậu"
];

// Form tạo đơn hàng mới
export default function CustomerCreateShipment() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    sender_name: "",
    sender_phone: "",
    receiver_name: "",
    receiver_phone: "",
    pickup_address: "",
    pickup_lat: null,
    pickup_lng: null,
    delivery_address: "",
    delivery_lat: null,
    delivery_lng: null,
    item_name: "",
    quantity: 1,
    weight_kg: "",
    cod_amount: "",
    shipping_fee: 0,
  });

  const [pickupOption, setPickupOption] = useState("sender");
  const [creating, setCreating] = useState(false);
  const [estimatedFee, setEstimatedFee] = useState(0);
  const [distanceKm, setDistanceKm] = useState(0);
  const [serviceType, setServiceType] = useState("express");

  const [shippingData, setShippingData] = useState(null);
  const [showReview, setShowReview] = useState(false);
  const [loadingFee, setLoadingFee] = useState(false);

  const [activeMap, setActiveMap] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressTarget, setAddressTarget] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  const customerId =
    JSON.parse(localStorage.getItem("user"))?.id ||
    localStorage.getItem("userId");

  useEffect(() => {
    AOS.init({
      duration: 500,
      easing: "ease-out-cubic",
      once: true,
      offset: 50,
    });
  }, []);


  useEffect(() => {
    if (!form.pickup_address || !form.delivery_address) {
      setShippingData(null);
      return;
    }

    const fetchShippingFee = async () => {
      setLoadingFee(true);
      try {
        const response = await API.post("/shipping/calculate-fee", {
          pickup_address: form.pickup_address,
          receiver_address: form.delivery_address,
          pickup_lat: form.pickup_lat,
          pickup_lng: form.pickup_lng,
          delivery_lat: form.delivery_lat,
          delivery_lng: form.delivery_lng,
          weight_kg: parseFloat(form.weight_kg) || 0.5,
          service_type: serviceType,
          cod_amount: parseFloat(form.cod_amount) || 0,
        });

        if (response.data.success) {
          const dist = parseFloat(response.data.distance_km) || 0;
          setShippingData(response.data);
          setEstimatedFee(response.data.total_shipping);
          setDistanceKm(dist);
          setForm((prev) => ({
            ...prev,
            shipping_fee: response.data.total_shipping,
          }));

          if (dist > 100 && serviceType === "fast") {
            setServiceType("express");
            toast.error("Khoảng cách trên 100km không hỗ trợ Hỏa Tốc. Đã tự động chuyển sang Giao Nhanh!");
          }
        }
      } catch (error) {
        toast.error("Không thể tính phí vận chuyển");
      } finally {
        setLoadingFee(false);
      }
    };

    const timeoutId = setTimeout(fetchShippingFee, 1000);
    return () => clearTimeout(timeoutId);
  }, [
    form.pickup_address,
    form.delivery_address,
    form.weight_kg,
    form.cod_amount,
    serviceType,
  ]);

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "sender_phone" || name === "receiver_phone") {
      value = value.replace(/\D/g, "");
    }

    if (name === "quantity" || name === "weight_kg") {
      if (Number(value) > 100) {
        toast.error("Quá số kiện hoặc khối lượng cho phép. Vui lòng liên hệ với chúng tôi để tạo đơn hàng lớn!", {
          id: "limit-toast",
          style: {
            background: "#fee2e2",
            color: "#b91c1c",
            fontWeight: "bold",
            border: "1px solid #ef4444",
          },
          icon: "🚫",
        });
        return;
      }
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleResetAddress = (type) => {
    if (type === "pickup")
      setForm((p) => ({
        ...p,
        pickup_address: "",
        pickup_lat: null,
        pickup_lng: null,
      }));
    else
      setForm((p) => ({
        ...p,
        delivery_address: "",
        delivery_lat: null,
        delivery_lng: null,
      }));
  };

  const openAddressBook = async (target) => {
    setAddressTarget(target);
    setShowAddressModal(true);
    if (savedAddresses.length === 0) {
      setLoadingAddresses(true);
      try {
        const res = await API.get(`/addresses/${customerId}`);
        setSavedAddresses(res.data);
      } catch (error) {
        toast.error("Không tải được sổ địa chỉ");
      } finally {
        setLoadingAddresses(false);
      }
    }
  };
  const handleSelectAddress = async (addr) => {
    const isPickup = addressTarget === "pickup";


    setForm((prev) => ({
      ...prev,
      [isPickup ? "sender_name" : "receiver_name"]: addr.name,
      [isPickup ? "sender_phone" : "receiver_phone"]: addr.phone,
      [isPickup ? "pickup_address" : "delivery_address"]: addr.address,
      [isPickup ? "pickup_lat" : "delivery_lat"]: addr.lat || null,
      [isPickup ? "pickup_lng" : "delivery_lng"]: addr.lng || null,
    }));


    if (!addr.lat || !addr.lng) {
      const loadToast = toast.loading("Đang xác thực địa chỉ...");
      try {
        const fetchCoords = async (query) => {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
          );
          return await res.json();
        };


        let data = await fetchCoords(addr.address);


        if (data.length === 0) {

          const parts = addr.address.split(/[, ]+/);
          if (parts.length > 2) {
            const fallbackQuery = parts.slice(1).join(" ");
            data = await fetchCoords(fallbackQuery);
          }
        }

        if (data && data.length > 0) {
          const { lat, lon } = data[0];
          setForm((prev) => ({
            ...prev,
            [isPickup ? "pickup_lat" : "delivery_lat"]: parseFloat(lat),
            [isPickup ? "pickup_lng" : "delivery_lng"]: parseFloat(lon),
          }));
          toast.success("Đã xác định vị trí trên trục đường chính!");
        } else {
          toast.error(
            "Không tìm thấy đường này, vui lòng ghim thủ công trên bản đồ.",
          );
        }
      } catch (error) {
        toast.error("Lỗi kết nối bản đồ.");
      } finally {
        toast.dismiss(loadToast);
      }
    }

    setShowAddressModal(false);
  };


  const getCurrentLocation = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject("Không hỗ trợ");
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => reject(err),
        { enableHighAccuracy: true },
      );
    });

  const handleOpenMap = async (type) => {
    const isPickup = type === "pickup";
    if (
      isPickup
        ? form.pickup_lat && form.pickup_lng
        : form.delivery_lat && form.delivery_lng
    ) {
      setActiveMap(type);
      return;
    }


    const loadToast = toast.loading("Đang định vị...");
    try {
      const pos = await getCurrentLocation();
      setForm((p) => ({
        ...p,
        [isPickup ? "pickup_lat" : "delivery_lat"]: pos.lat,
        [isPickup ? "pickup_lng" : "delivery_lng"]: pos.lng,
      }));
    } catch (e) {
    } finally {
      toast.dismiss(loadToast);
      setActiveMap(type);
    }
  };


// Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerId) return toast.error("⚠️ Bạn chưa đăng nhập!");
    if (!form.pickup_lat || !form.delivery_lat)
      return toast.error("Vui lòng chọn vị trí lấy và giao hàng");

    if (pickupOption === "sender") {
      if (!form.sender_phone.startsWith("0") || form.sender_phone.length !== 10) {
        return toast.error("Số điện thoại người gửi phải bắt đầu bằng số 0 và có đúng 10 chữ số!");
      }
    }

    if (!form.receiver_phone.startsWith("0") || form.receiver_phone.length !== 10) {
      return toast.error("Số điện thoại người nhận phải bắt đầu bằng số 0 và có đúng 10 chữ số!");
    }

    if (Number(form.quantity) > 100 || Number(form.weight_kg) > 100) {
      return toast.error("Quá số kiện hoặc khối lượng cho phép. Vui lòng liên hệ với chúng tôi để tạo đơn hàng lớn!", {
        id: "limit-toast",
        style: { background: "#fee2e2", color: "#b91c1c", fontWeight: "bold", border: "1px solid #ef4444" },
        icon: "🚫"
      });
    }

    const itemNameLower = form.item_name.toLowerCase();
    const hasForbiddenWord = FORBIDDEN_WORDS.some(word => itemNameLower.includes(word));
    if (hasForbiddenWord) {
      return toast.error("Tên hàng hóa chứa từ khóa cấm (vũ khí, chất cháy nổ, ma túy...). Vui lòng kiểm tra lại!", {
        id: "forbidden-toast",
        style: { background: "#fee2e2", color: "#b91c1c", fontWeight: "bold", border: "1px solid #ef4444" },
        icon: "⚠️"
      });
    }

    setShowReview(true);
  };

  const confirmSubmit = async () => {
    setCreating(true);
    setShowReview(false);
    try {
      const payload = {
        ...form,
        customer_id: Number(customerId),
        payment_method: "COD",
        pickup_option: pickupOption,
        shipping_fee: estimatedFee,
        service_type: serviceType,
        status: "pending",
        quantity: Number(form.quantity),
      };
      const res = await API.post("/shipments", payload);
      const newShipmentId =
        res.data.id || res.data.shipmentId || res.data.insertId;

      if (!newShipmentId) {
        toast.success("Tạo đơn thành công");
        return navigate("/customer/history");
      }
      toast.success("🎉 Đang chuyển sang thanh toán...");
      navigate("/customer/payment", {
        state: {
          shipment_id: newShipmentId,
          amount: estimatedFee + Number(form.cod_amount || 0),
          shipping_fee: estimatedFee,
          cod: form.cod_amount || 0,
        },
      });
    } catch (err) {
      toast.error("❌ Không thể tạo đơn hàng.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 pb-20 max-w-6xl mx-auto px-4">
      <style>{`
        @keyframes slideUpFade {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-stagger {
          opacity: 0;
          animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        /* Custom input glow effect */
        .input-glow:focus {
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
        }
        .input-glow-green:focus {
          box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.15);
        }
        .input-glow-orange:focus {
          box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.15);
        }
      `}</style>
      {/* Phần giao diện */}
      <div className="mb-8 text-center pt-6 animate-stagger" style={{ animationDelay: "0s" }}>
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#113e48] to-teal-600 drop-shadow-sm">
          Tạo đơn hàng mới
        </h1>
        <p className="text-gray-500 text-sm mt-3 font-medium">
          Điền thông tin chi tiết để chúng tôi phục vụ bạn tốt nhất.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Phần giao diện */}
        <div className="lg:col-span-2 space-y-6">
          {/* Phần giao diện */}
          <div 
            className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-lg border border-gray-100 relative transition-all duration-300 hover:-translate-y-1 animate-stagger"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-400 to-blue-600 rounded-l-3xl"></div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-[#113e48] flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <User size={20} />
                </div>{" "}
                Thông tin người gửi
              </h3>
              <button
                type="button"
                onClick={() => openAddressBook("pickup")}
                className="text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg flex items-center gap-2"
              >
                <Book size={16} /> Chọn từ sổ địa chỉ
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">
                  Họ tên
                </label>
                <input
                  name="sender_name"
                  value={form.sender_name}
                  onChange={handleChange}
                  placeholder="VD: Trần Thị B"
                  className="w-full p-3.5 border-2 border-gray-100 bg-gray-50 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all duration-300 input-glow"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">
                  Số điện thoại
                </label>
                <input
                  name="sender_phone"
                  value={form.sender_phone}
                  onChange={handleChange}
                  maxLength={10}
                  placeholder="VD: 0987654321"
                  className="w-full p-3.5 border-2 border-gray-100 bg-gray-50 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all duration-300 input-glow"
                  required
                />
              </div>
            </div>
            {/* Phần giao diện */}
            <div className="mb-4 flex gap-4">
              <label
                className={`flex-1 flex justify-center gap-2 p-3 rounded-xl border cursor-pointer ${pickupOption === "sender" ? "border-orange-500 bg-orange-50 font-bold" : "border-gray-200"}`}
              >
                <input
                  type="radio"
                  className="hidden"
                  checked={pickupOption === "sender"}
                  onChange={() => {
                    setPickupOption("sender");

                    setForm((p) => ({
                      ...p,
                      pickup_address: "",
                      pickup_lat: null,
                      pickup_lng: null,
                    }));
                  }}
                />
                <Truck size={18} /> Lấy tận nơi
              </label>
              <label
                className={`flex-1 flex justify-center gap-2 p-3 rounded-xl border cursor-pointer ${pickupOption === "warehouse" ? "border-orange-500 bg-orange-50 font-bold" : "border-gray-200"}`}
              >
                <input
                  type="radio"
                  className="hidden"
                  checked={pickupOption === "warehouse"}
                  onChange={() => {
                    setPickupOption("warehouse");

                    setForm((p) => ({
                      ...p,
                      sender_name: WAREHOUSE.name,
                      sender_phone: WAREHOUSE.phone,
                      pickup_address: WAREHOUSE.address,
                      pickup_lat: WAREHOUSE.lat,
                      pickup_lng: WAREHOUSE.lng,
                    }));
                  }}
                />
                <Package size={18} /> Gửi tại bưu cục
              </label>
            </div>
            {/* Phần giao diện */}
            {form.pickup_address ? (
              <div className="relative group">
                <label className="text-xs font-bold text-gray-500 block mb-1 uppercase">
                  Địa chỉ lấy hàng
                </label>
                <textarea
                  value={form.pickup_address}
                  readOnly
                  className="w-full p-4 pr-14 border-2 border-blue-100 bg-blue-50/30 rounded-2xl outline-none font-bold text-sm"
                  rows={3}
                />
                <button
                  type="button"
                  onClick={() => handleResetAddress("pickup")}
                  className="absolute top-6 right-3 p-2 bg-white hover:bg-red-50 hover:text-red-500 rounded-xl shadow-sm border"
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <div className="relative group">
                <DiaChiSelector
                  label="Địa chỉ lấy hàng"
                  required
                  onOpenMap={() => handleOpenMap("pickup")}
                  onChange={(data) =>
                    setForm((p) => ({
                      ...p,
                      pickup_address: data.address,
                      pickup_lat: data.lat,
                      pickup_lng: data.lng,
                    }))
                  }
                />
                <button
                  type="button"
                  onClick={() => handleOpenMap("pickup")}
                  className="absolute top-12 right-2 px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-black uppercase flex items-center gap-2 shadow-lg"
                >
                  <Map size={16} /> Chọn trên bản đồ
                </button>
              </div>
            )}
          </div>

          {/* Phần giao diện */}
          <div 
            className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-lg border border-gray-100 relative transition-all duration-300 hover:-translate-y-1 animate-stagger"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-green-400 to-green-600 rounded-l-3xl"></div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-[#113e48] flex items-center gap-2">
                <div className="p-2 bg-green-100 rounded-lg text-green-600">
                  <MapPin size={20} />
                </div>{" "}
                Thông tin người nhận
              </h3>
              <button
                type="button"
                onClick={() => openAddressBook("delivery")}
                className="text-sm font-bold text-green-600 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg flex items-center gap-2"
              >
                <Book size={16} /> Chọn từ sổ địa chỉ
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">
                  Họ tên
                </label>
                <input
                  name="receiver_name"
                  value={form.receiver_name}
                  onChange={handleChange}
                  placeholder="VD: Nguyễn Văn A"
                  className="w-full p-3.5 border-2 border-gray-100 bg-gray-50 rounded-xl outline-none focus:border-green-500 focus:bg-white transition-all duration-300 input-glow-green"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">
                  Số điện thoại
                </label>
                <input
                  name="receiver_phone"
                  value={form.receiver_phone}
                  onChange={handleChange}
                  maxLength={10}
                  placeholder="VD: 0901234567"
                  className="w-full p-3.5 border-2 border-gray-100 bg-gray-50 rounded-xl outline-none focus:border-green-500 focus:bg-white transition-all duration-300 input-glow-green"
                  required
                />
              </div>
            </div>
            {/* Phần giao diện */}
            {form.delivery_address ? (
              <div className="relative group">
                <label className="text-xs font-bold text-gray-500 block mb-1 uppercase">
                  Địa chỉ giao hàng
                </label>
                <textarea
                  value={form.delivery_address}
                  readOnly
                  className="w-full p-4 pr-14 border-2 border-green-100 bg-green-50/30 rounded-2xl outline-none font-bold text-sm"
                  rows={3}
                />
                <button
                  type="button"
                  onClick={() => handleResetAddress("delivery")}
                  className="absolute top-6 right-3 p-2 bg-white hover:bg-red-50 hover:text-red-500 rounded-xl shadow-sm border"
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <div className="relative group">
                <DiaChiSelector
                  label="Địa chỉ giao hàng"
                  required
                  onOpenMap={() => handleOpenMap("delivery")}
                  onChange={(data) =>
                    setForm((p) => ({
                      ...p,
                      delivery_address: data.address,
                      delivery_lat: data.lat,
                      delivery_lng: data.lng,
                    }))
                  }
                />
                <button
                  type="button"
                  onClick={() => handleOpenMap("delivery")}
                  className="absolute top-12 right-2 px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-black uppercase flex items-center gap-2 shadow-lg"
                >
                  <Map size={16} /> Chọn trên bản đồ
                </button>
              </div>
            )}
          </div>

          {/* Phần giao diện */}
          <div 
            className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-lg border border-gray-100 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 animate-stagger"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-orange-400 to-orange-600 rounded-l-3xl"></div>
            <h3 className="text-lg font-bold text-[#113e48] mb-4 flex items-center gap-2">
              <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                <Package size={20} />
              </div>{" "}
              Thông tin hàng hóa
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">
                  Tên hàng hóa
                </label>
                <input
                  name="item_name"
                  value={form.item_name}
                  onChange={handleChange}
                  placeholder="VD: Quần áo, mỹ phẩm, sách..."
                  className="w-full p-3.5 border-2 border-gray-100 bg-gray-50 rounded-xl outline-none focus:border-orange-500 focus:bg-white transition-all duration-300 input-glow-orange"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 flex items-center gap-1 mb-1">
                    <Hash size={12} /> Số kiện
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={form.quantity}
                    onChange={handleChange}
                    min="1"
                    className="w-full p-3.5 border-2 border-gray-100 bg-gray-50 rounded-xl outline-none focus:border-orange-500 focus:bg-white transition-all duration-300 input-glow-orange text-center font-bold"
                    required
                  />
                </div>
                <div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 flex items-center gap-1 mb-1">
                      <Scale size={12} /> Khối lượng (kg)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="weight_kg"
                        value={form.weight_kg}
                        onChange={handleChange}
                        placeholder="VD: 10"
                        step="0.1"
                        min="0"
                        className="w-full p-3 pr-10 border border-gray-200 rounded-xl outline-none focus:border-orange-500 text-right font-bold text-orange-600"
                        required
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm pointer-events-none">
                        kg
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 flex items-center gap-1 mb-1">
                    <DollarSign size={12} /> Thu hộ (COD)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      name="cod_amount"
                      value={
                        form.cod_amount
                          ? Number(form.cod_amount).toLocaleString("vi-VN")
                          : ""
                      }
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/\D/g, "");
                        handleChange({
                          target: {
                            name: "cod_amount",
                            value: rawValue,
                          },
                        });
                      }}
                      placeholder="VD: 150,000"
                      className="w-full p-3 pr-12 border border-gray-200 rounded-xl outline-none focus:border-orange-500 text-right font-bold text-orange-600"
                      required
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm pointer-events-none">
                      VNĐ
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Phần giao diện */}
        <OrderSummarySidebar
          serviceType={serviceType}
          setServiceType={setServiceType}
          creating={creating}
          loading={loadingFee}
          shippingData={shippingData}
          codAmount={parseFloat(form.cod_amount) || 0}
        />
      </form>

      {/* Phần giao diện */}
      <LocationMapModal
        isOpen={activeMap !== null}
        onClose={() => setActiveMap(null)}
        defaultPos={
          activeMap === "pickup" && form.pickup_lat
            ? [form.pickup_lat, form.pickup_lng]
            : activeMap === "delivery" && form.delivery_lat
              ? [form.delivery_lat, form.delivery_lng]
              : null
        }
        onConfirm={({ lat, lng, address }) => {
          const isPickup = activeMap === "pickup";
          setForm((p) => ({
            ...p,
            [isPickup ? "pickup_lat" : "delivery_lat"]: lat,
            [isPickup ? "pickup_lng" : "delivery_lng"]: lng,
            [isPickup ? "pickup_address" : "delivery_address"]: address,
          }));
          setActiveMap(null);
        }}
      />

      {/* Phần giao diện */}
      <AddressBookModal
        show={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        target={addressTarget}
        loading={loadingAddresses}
        addresses={savedAddresses}
        onSelect={handleSelectAddress}
      />
      {/* Review Modal */}
      {showReview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <CheckCircle className="text-green-500" size={20} />
                Xác nhận thông tin đơn hàng
              </h3>
              <button
                onClick={() => setShowReview(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wider">
                    <MapPin size={16} className="text-orange-500" /> Người gửi
                  </div>
                  <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 text-sm space-y-1.5">
                    <p><span className="text-gray-500">Tên:</span> <span className="font-semibold text-gray-800">{form.sender_name}</span></p>
                    <p><span className="text-gray-500">SĐT:</span> <span className="font-semibold text-gray-800">{form.sender_phone}</span></p>
                    <p><span className="text-gray-500">Địa chỉ:</span> <span className="font-medium text-gray-700">{form.pickup_address}</span></p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wider">
                    <MapPin size={16} className="text-blue-500" /> Người nhận
                  </div>
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-sm space-y-1.5">
                    <p><span className="text-gray-500">Tên:</span> <span className="font-semibold text-gray-800">{form.receiver_name}</span></p>
                    <p><span className="text-gray-500">SĐT:</span> <span className="font-semibold text-gray-800">{form.receiver_phone}</span></p>
                    <p><span className="text-gray-500">Địa chỉ:</span> <span className="font-medium text-gray-700">{form.delivery_address}</span></p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wider">
                  <Package size={16} className="text-indigo-500" /> Thông tin kiện hàng
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm flex flex-wrap gap-x-8 gap-y-3">
                  <p><span className="text-gray-500">Tên hàng:</span> <span className="font-semibold text-gray-800">{form.item_name}</span></p>
                  <p><span className="text-gray-500">Số lượng:</span> <span className="font-semibold text-gray-800">{form.quantity} kiện</span></p>
                  <p><span className="text-gray-500">Khối lượng:</span> <span className="font-semibold text-gray-800">{form.weight_kg} kg</span></p>
                  <p><span className="text-gray-500">Dịch vụ:</span> <span className={`font-bold ${serviceType === 'economy' ? 'text-emerald-600' : serviceType === 'express' ? 'text-blue-600' : 'text-red-600'}`}>{serviceType === 'economy' ? 'Tiết kiệm' : serviceType === 'express' ? 'Giao Nhanh' : 'Hỏa Tốc'}</span></p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wider">
                  <Wallet size={16} className="text-emerald-500" /> Cước phí & Thu hộ
                </div>
                <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phí vận chuyển:</span>
                    <span className="font-semibold text-gray-800">{(estimatedFee || 0).toLocaleString('vi-VN')}₫</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tiền thu hộ (COD):</span>
                    <span className="font-semibold text-gray-800">{(Number(form.cod_amount) || 0).toLocaleString('vi-VN')}₫</span>
                  </div>
                  <div className="h-px bg-emerald-200/50 my-1"></div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-emerald-800">Tổng thanh toán:</span>
                    <span className="text-lg font-black text-emerald-600">{(estimatedFee + Number(form.cod_amount || 0)).toLocaleString('vi-VN')}₫</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
              <button
                onClick={() => setShowReview(false)}
                className="px-5 py-2.5 rounded-xl font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Quay lại sửa
              </button>
              <button
                onClick={confirmSubmit}
                className="px-6 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-md transition-colors flex items-center gap-2"
              >
                {creating ? "Đang tạo đơn..." : "Tạo đơn & Thanh toán"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}