import { useState, useEffect } from "react";
import {
  Search,
  MapPin,
  ChevronDown,
  ChevronUp,
  Map,
  Navigation,
  Loader2,
} from "lucide-react";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// Bộ chọn địa chỉ Việt Nam
export default function DiaChiSelector({
  label,
  onChange,
  onOpenMap,
  required,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showManual, setShowManual] = useState(false);
  const [loading, setLoading] = useState(false);

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [manualData, setManualData] = useState({ p: "", d: "", w: "" });

  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/?depth=1")
      .then((res) => res.json())
      .then(setProvinces)
      .catch((err) => console.error("Lỗi tải tỉnh thành:", err));
  }, []);

// Xử lý tìm kiếm
  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&country=vn&language=vi&types=address,poi,place,locality&limit=10`;
      const res = await fetch(url);
      const data = await res.json();
      setSuggestions(data.features || []);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const handleProvinceChange = async (code) => {
    const res = await fetch(
      `https://provinces.open-api.vn/api/p/${code}?depth=2`,
    );
    const data = await res.json();
    setDistricts(data.districts || []);
    setWards([]);
    setManualData({ p: code, d: "", w: "" });
  };

  const handleDistrictChange = async (code) => {
    const res = await fetch(
      `https://provinces.open-api.vn/api/d/${code}?depth=2`,
    );
    const data = await res.json();
    setWards(data.wards || []);
    setManualData((prev) => ({ ...prev, d: code, w: "" }));
  };

  const handleWardChange = (code) => {
    const pName = provinces.find((x) => x.code == manualData.p)?.name;
    const dName = districts.find((x) => x.code == manualData.d)?.name;
    const wName = wards.find((x) => x.code == code)?.name;

    const fullAddr = `${wName}, ${dName}, ${pName}`;
    setSearchQuery(fullAddr);
    setManualData((prev) => ({ ...prev, w: code }));
    setSuggestions([]);
    onChange({ address: fullAddr, lat: null, lng: null });
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="text-xs font-bold text-gray-400 uppercase ml-1">
          {label}
        </label>
      )}

      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          {loading ? (
            <Loader2 size={18} className="animate-spin text-orange-500" />
          ) : (
            <Search size={18} className="text-gray-400" />
          )}
        </div>

        <input
          type="text"
          placeholder="Số nhà, tên đường, phường xã..."
          className="w-full pl-11 pr-40 py-4 bg-gray-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-2xl outline-none shadow-sm transition-all text-[15px]"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          required={required}
        />

        {/* Phần giao diện */}

        {suggestions.length > 0 && (
          <div className="absolute z-[100] w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl max-h-80 overflow-y-auto animate-in fade-in zoom-in-95">
            {suggestions.map((s) => (
              <div
                key={s.id}
                onClick={() => {
                  setSearchQuery(s.place_name);
                  setSuggestions([]);
                  onChange({
                    address: s.place_name,
                    lat: s.center[1],
                    lng: s.center[0],
                  });
                }}
                className="p-4 hover:bg-orange-50 cursor-pointer flex items-start gap-4 border-b border-gray-50 last:border-0 transition-all group"
              >
                <div className="mt-1 p-2 bg-gray-100 text-gray-400 rounded-full group-hover:bg-orange-100 group-hover:text-orange-600">
                  <MapPin size={16} />
                </div>
                <div>
                  <div className="text-[14px] font-bold text-gray-800">
                    {s.place_name.split(",")[0]}
                  </div>
                  <div className="text-[11px] text-gray-500 line-clamp-1">
                    {s.place_name.split(",").slice(1).join(",")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Nút hành động */}
      <button
        type="button"
        onClick={() => setShowManual(!showManual)}
        className="ml-2 text-[10px] font-black text-gray-400 hover:text-orange-500 flex items-center gap-1 uppercase tracking-tighter transition-all"
      >
        {showManual ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        Không tìm thấy địa chỉ? Nhập thủ công
      </button>

      {showManual && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 animate-in slide-in-from-top-2 duration-300">
          <select
            className="p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-500"
            onChange={(e) => handleProvinceChange(e.target.value)}
            value={manualData.p}
          >
            <option value="">-- Tỉnh/TP --</option>
            {provinces.map((p) => (
              <option key={p.code} value={p.code}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            className="p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-500 disabled:opacity-50"
            disabled={!districts.length}
            onChange={(e) => handleDistrictChange(e.target.value)}
            value={manualData.d}
          >
            <option value="">-- Quận/Huyện --</option>
            {districts.map((d) => (
              <option key={d.code} value={d.code}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            className="p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-500 disabled:opacity-50"
            disabled={!wards.length}
            onChange={(e) => handleWardChange(e.target.value)}
            value={manualData.w}
          >
            <option value="">-- Phường/Xã --</option>
            {wards.map((w) => (
              <option key={w.code} value={w.code}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}