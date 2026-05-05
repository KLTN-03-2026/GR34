import toast from "react-hot-toast";
import MapPicker from "./MapPicker.jsx";

// Modal bản đồ chọn vị trí
export default function LocationMapModal({
  isOpen,
  onClose,
  defaultPos,
  onConfirm,
}) {
  if (!isOpen) return null;


  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      );
      return (await res.json())?.display_name || "";
    } catch {
      return "";
    }
  };

  const handleConfirm = async (pos) => {
    toast.loading("Đang dịch địa chỉ...", { id: "geo" });
    const address = await reverseGeocode(pos.lat, pos.lng);
    toast.success("Đã xác nhận vị trí!", { id: "geo" });


    onConfirm({ lat: pos.lat, lng: pos.lng, address });
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl overflow-hidden w-full max-w-3xl h-[500px] shadow-2xl relative zoom-in-95 animate-in">
        <MapPicker
          defaultPos={defaultPos}
          onConfirm={handleConfirm}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}
