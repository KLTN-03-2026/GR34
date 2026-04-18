import { Book, X, Phone, MapPin, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AddressBookModal({
  show,
  onClose,
  target,
  loading,
  addresses,
  onSelect,
}) {
  const navigate = useNavigate();

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-[#113e48] flex items-center gap-2">
            <Book size={18} /> Chọn địa chỉ{" "}
            {target === "pickup" ? "gửi" : "nhận"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-full transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <p className="text-center text-gray-500 py-8">
              Đang tải danh sách...
            </p>
          ) : addresses.length > 0 ? (
            addresses.map((addr) => (
              <div
                key={addr.id}
                onClick={() => onSelect(addr)}
                className="p-4 border border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 cursor-pointer transition-all group"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-[#113e48] group-hover:text-orange-700">
                    {addr.name}
                  </span>
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded uppercase font-bold">
                    {addr.type}
                  </span>
                </div>
                <div className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                  <Phone size={14} /> {addr.phone}
                </div>
                <div className="text-sm text-gray-500 flex items-start gap-2">
                  <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">{addr.address}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Home size={40} className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500">Bạn chưa lưu địa chỉ nào.</p>
              <button
                onClick={() => navigate("/customer/addresses")}
                className="text-blue-600 font-bold hover:underline mt-2"
              >
                Thêm địa chỉ mới
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
