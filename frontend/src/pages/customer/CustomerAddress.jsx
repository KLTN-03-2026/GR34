import { useState, useEffect } from "react";
import API from "../../services/api";
import toast from "react-hot-toast";
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Home,
  Briefcase,
  X,
  Save,
  Check,
  Map as MapIcon,
} from "lucide-react";

import DiaChiSelector from "../../components/DiaChiSelector.jsx";
import LocationMapModal from "../../components/LocationMapModal.jsx";

// Quản lý địa chỉ giao nhận
export default function CustomerAddress() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    type: "home",
    is_default: false,
  });

  const [street, setStreet] = useState("");
  const [region, setRegion] = useState("");
  const [geo, setGeo] = useState({ lat: null, lng: null });

  const customerId =
    localStorage.getItem("customer_id") || localStorage.getItem("userId");

  // Tải danh sách địa chỉ
  const fetchAddresses = async () => {
    try {
      const res = await API.get(`/addresses/${customerId}`);
      setAddresses(res.data);
    } catch (err) {
      toast.error("Không thể tải danh sách địa chỉ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) fetchAddresses();
  }, [customerId]);

  const openModal = (address = null) => {
    if (address) {
      setEditingId(address.id);
      setFormData({
        name: address.name,
        phone: address.phone,
        type: address.type,
        is_default: address.is_default === 1 || address.is_default === true,
      });
      setStreet(address.address);
      setRegion("");
      setGeo({ lat: address.lat, lng: address.lng });
    } else {
      setEditingId(null);
      setFormData({ name: "", phone: "", type: "home", is_default: false });
      setStreet("");
      setRegion("");
      setGeo({ lat: null, lng: null });
    }
    setShowModal(true);
  };

  // Xử lý xóa dữ liệu
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) return;
    try {
      await API.delete(`/addresses/${id}`);
      toast.success("Đã xóa địa chỉ");
      fetchAddresses();
    } catch (err) {
      toast.error("Lỗi khi xóa địa chỉ");
    }
  };

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let finalAddress = street;
      if (region) {
        finalAddress = street ? `${street}, ${region}` : region;
      }

      if (!finalAddress) {
        toast.error("Vui lòng chọn hoặc nhập địa chỉ đầy đủ!");
        setSubmitting(false);
        return;
      }

      const payload = {
        ...formData,
        address: finalAddress,
        customer_id: customerId,
        lat: geo.lat,
        lng: geo.lng,
      };

      if (editingId) {
        await API.put(`/addresses/${editingId}`, payload);
        toast.success("Cập nhật thành công!");
      } else {
        await API.post("/addresses", payload);
        toast.success("Thêm mới thành công!");
      }
      setShowModal(false);
      fetchAddresses();
    } catch (err) {
      toast.error("Có lỗi xảy ra, vui lòng kiểm tra lại thông tin!");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-xl font-bold text-[#113e48] flex items-center gap-2">
            <MapPin className="text-orange-500" /> Sổ địa chỉ
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý địa điểm nhận hàng của bạn.
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg transition-all transform hover:-translate-y-1"
        >
          <Plus size={18} /> Thêm địa chỉ mới
        </button>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className={`group bg-white p-6 rounded-2xl shadow-sm border transition-all relative ${addr.is_default ? "border-orange-300 ring-1 ring-orange-100" : "border-gray-100 hover:shadow-md hover:border-orange-200"}`}
          >
            {addr.is_default && (
              <span className="absolute top-4 right-4 bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-1 rounded-full border border-orange-200 flex items-center gap-1">
                <Check size={10} /> Mặc định
              </span>
            )}
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-100 transition-colors">
              {addr.type === "home" ? (
                <Home size={24} />
              ) : addr.type === "office" ? (
                <Briefcase size={24} />
              ) : (
                <MapPin size={24} />
              )}
            </div>
            <h3 className="font-bold text-[#113e48] text-lg mb-1 truncate pr-16">
              {addr.name}
            </h3>
            <p className="text-sm text-gray-500 mb-4 font-mono">{addr.phone}</p>
            <div className="p-3 bg-gray-50 rounded-xl text-sm text-gray-700 leading-relaxed border border-gray-100 min-h-[80px]">
              {addr.address}
            </div>
            <div className="flex gap-2 mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={() => openModal(addr)}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Edit2 size={16} /> Sửa
              </button>
              <div className="w-[1px] bg-gray-200 h-6 my-auto"></div>
              <button
                onClick={() => handleDelete(addr.id)}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={16} /> Xóa
              </button>
            </div>
          </div>
        ))}
        <div
          onClick={() => openModal()}
          className="border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center p-6 text-gray-400 hover:border-orange-400 hover:bg-orange-50/10 hover:text-orange-500 cursor-pointer transition-all min-h-[300px]"
        >
          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-3 group-hover:bg-white transition-colors">
            <Plus size={32} />
          </div>
          <p className="font-medium">Thêm địa chỉ khác</p>
        </div>
      </div>

      {}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 sticky top-0 z-10">
              <h3 className="font-bold text-lg text-[#113e48]">
                {editingId ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-5 overflow-y-auto"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Tên người nhận
                  </label>
                  <input
                    type="text"
                    placeholder="Nguyễn Văn A"
                    className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-orange-500"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    placeholder="0901234567"
                    maxLength={10}
                    className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-orange-500"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              {}
              <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-[#113e48] flex items-center gap-2">
                    <MapPin size={18} className="text-blue-500" /> Vị trí địa
                    chỉ
                  </label>
                  {}
                  <button
                    type="button"
                    onClick={() => setShowMap(true)}
                    className="text-xs font-bold text-blue-600 bg-white border border-blue-200 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                  >
                    <MapIcon size={14} /> Chọn trên bản đồ
                  </button>
                </div>

                <DiaChiSelector
                  required={false}
                  onChange={(data) => {
                    setRegion(data.address);
                    setGeo({ lat: data.lat, lng: data.lng });
                  }}
                />

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1">
                    Số nhà, Tên đường, Kiệt...
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: K62/23 Nguyễn Huy Tưởng..."
                    className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 bg-white shadow-inner"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    required={!region && !editingId}
                  />
                </div>

                {}
                {geo.lat && (
                  <div className="flex items-center gap-1 text-[11px] text-green-600 font-bold px-1">
                    <Check size={14} /> Đã xác định tọa độ ({geo.lat.toFixed(4)}
                    , {geo.lng.toFixed(4)})
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Loại địa chỉ
                  </label>
                  <select
                    className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-orange-500 bg-white"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                  >
                    <option value="home">🏠 Nhà riêng</option>
                    <option value="office">🏢 Văn phòng</option>
                    <option value="other">📍 Khác</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-xl w-full hover:bg-gray-50 transition-colors h-[46px]">
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                      checked={formData.is_default}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_default: e.target.checked,
                        })
                      }
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Đặt làm mặc định
                    </span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl bg-[#113e48] hover:bg-[#0d2f36] text-white font-bold shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 transition-all"
                >
                  {submitting ? (
                    "Đang lưu..."
                  ) : (
                    <>
                      <Save size={18} /> Lưu địa chỉ
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {}
      <LocationMapModal
        isOpen={showMap}
        onClose={() => setShowMap(false)}
        onConfirm={(data) => {
          setStreet(data.address);
          setRegion("");
          setGeo({ lat: data.lat, lng: data.lng });
          setShowMap(false);
          toast.success("Đã lấy vị trí từ bản đồ!");
        }}
      />
    </div>
  );
}
