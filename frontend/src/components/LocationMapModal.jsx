import toast from "../lib/toast";
import MapPicker from "./MapPicker.jsx";

export default function LocationMapModal({ isOpen, onClose, defaultPos, onConfirm }) {
  const stripAddress = (raw) => {
    const parts = raw.split(",").map((p) => p.trim()).filter(Boolean);
    const filtered = parts.filter((p) => {
      const low = p.toLowerCase();
      if (low === "việt nam" || low === "vietnam") return false;
      if (/^\d{4,6}$/.test(p)) return false;
      return true;
    });
    return filtered.join(", ");
  };

  if (!isOpen) return null;

  const handleConfirm = async (pos) => {
    toast.loading("Đang dịch địa chỉ...", { id: "geo" });
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.lat}&lon=${pos.lng}&accept-language=vi`,
        { headers: { "User-Agent": "SpeedyShip/1.0" } },
      );
      const data = await res.json();
      toast.success("Đã xác nhận vị trí!", { id: "geo" });
      onConfirm({ address: stripAddress(data?.display_name || ""), lat: pos.lat, lng: pos.lng });
    } catch {
      toast.error("Không dịch được địa chỉ", { id: "geo" });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl overflow-hidden w-full max-w-4xl h-[600px] shadow-2xl relative zoom-in-95 animate-in">
        <MapPicker
          defaultPos={defaultPos}
          onConfirm={handleConfirm}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}
