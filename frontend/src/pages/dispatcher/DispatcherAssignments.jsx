import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../../services/api";
import {
  Truck,
  User,
  Search,
  Filter,
  CheckSquare,
  Send,
  AlertCircle,
  CheckCircle,
  Package,
  MapPin,
  CalendarClock,
} from "lucide-react";

export default function DispatcherAssignmentsUIPro() {
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [unassigned, setUnassigned] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("unassigned");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterZone, setFilterZone] = useState("All");

  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedDriverBulk, setSelectedDriverBulk] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [resShipments, resDrivers] = await Promise.all([
        API.get("/shipments"),
        API.get("/drivers"),
      ]);

      const allShipments = resShipments.data;
      setUnassigned(allShipments.filter((s) => s.status === "pending"));
      setAssignments(allShipments.filter((s) => s.status !== "pending"));
      setDrivers(resDrivers.data);
      setSelectedIds([]);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải dữ liệu mới nhất.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // --- HELPERS ---
  const getZoneInfo = (address) => {
    if (!address) return "Khác";
    const parts = address.split(",").map((p) => p.trim());
    return parts.length >= 2
      ? `${parts[parts.length - 2]} - ${parts[parts.length - 1]}`
      : parts[parts.length - 1] || "Khác";
  };

  const uniqueZones = useMemo(() => {
    const zones = new Set(
      unassigned.map((item) => getZoneInfo(item.delivery_address)),
    );
    return ["All", ...Array.from(zones).sort()];
  }, [unassigned]);

  const filteredUnassigned = unassigned.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      item.tracking_code?.toLowerCase().includes(searchLower) ||
      item.receiver_name?.toLowerCase().includes(searchLower) ||
      item.delivery_address?.toLowerCase().includes(searchLower);
    const currentZone = getZoneInfo(item.delivery_address);
    const matchesZone = filterZone === "All" || currentZone === filterZone;
    return matchesSearch && matchesZone;
  });

  const filteredAssigned = assignments.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.tracking_code?.toLowerCase().includes(searchLower) ||
      item.delivery_address?.toLowerCase().includes(searchLower)
    );
  });

  const handleSelectAll = (e) => {
    setSelectedIds(e.target.checked ? filteredUnassigned.map((s) => s.id) : []);
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id],
    );
  };

  const handleBulkAssign = async () => {
    if (selectedIds.length === 0) return toast.error("Chưa chọn đơn hàng nào!");
    if (!selectedDriverBulk) return toast.error("Vui lòng chọn tài xế!");

    const driverInfo = drivers.find((d) => d.id == selectedDriverBulk);
    if (
      !window.confirm(
        `Giao ${selectedIds.length} đơn cho tài xế ${driverInfo?.name}?`,
      )
    )
      return;

    const toastId = toast.loading("Đang xử lý...");
    try {
      await API.post("/shipments/assign-bulk", {
        shipment_ids: selectedIds,
        driver_id: selectedDriverBulk,
      });
      toast.success(`✅ Đã phân công thành công!`, { id: toastId });
      fetchAll();
      setSelectedDriverBulk("");
    } catch (err) {
      const msg = err.response?.data?.message || "Lỗi hệ thống!";
      toast.error(`❌ ${msg}`, { id: toastId });
    }
  };

  const StatusPill = ({ status }) => {
    const styles = {
      assigned: "bg-blue-50 text-blue-700 ring-blue-600/20",
      picking: "bg-purple-50 text-purple-700 ring-purple-600/20",
      delivering: "bg-orange-50 text-orange-700 ring-orange-600/20",
      completed: "bg-green-50 text-green-700 ring-green-600/20",
      cancelled: "bg-red-50 text-red-700 ring-red-600/20",
    };
    const statusText = {
      assigned: "Đã gán",
      picking: "Đang lấy",
      delivering: "Đang giao",
      completed: "Hoàn tất",
      cancelled: "Đã hủy",
    };
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
          styles[status] || "bg-gray-50 text-gray-600 ring-gray-500/10"
        }`}
      >
        <svg
          className={`mr-1.5 h-2 w-2 ${
            status === "completed"
              ? "fill-green-500"
              : status === "delivering"
                ? "fill-orange-500"
                : "fill-current"
          }`}
          viewBox="0 0 8 8"
        >
          <circle cx="4" cy="4" r="3" />
        </svg>
        {statusText[status] || status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 sm:p-8 font-sans pb-40">
      <div className="max-w-[1400px] mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-3 tracking-tight">
              <div className="p-2 bg-white rounded-xl shadow-sm ring-1 ring-slate-200/50">
                <Truck className="text-blue-600" size={28} strokeWidth={2} />
              </div>
              Trung Tâm Điều Phối
            </h1>
            <p className="text-slate-500 mt-2 text-sm font-medium ml-1">
              {new Date().toLocaleDateString("vi-VN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-1.5 rounded-2xl shadow-sm ring-1 ring-slate-200/60 inline-flex">
            {[
              {
                id: "unassigned",
                icon: AlertCircle,
                label: "Chờ phân công",
                count: unassigned.length,
                activeColor:
                  "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200",
              },
              {
                id: "assigned",
                icon: CheckCircle,
                label: "Đang vận hành",
                count: assignments.length,
                activeColor:
                  "bg-green-50 text-green-700 shadow-sm ring-1 ring-green-200",
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2.5 transition-all duration-200 ${
                  activeTab === tab.id
                    ? tab.activeColor
                    : "text-slate-500 hover:bg-slate-100/70 hover:text-slate-700"
                }`}
              >
                <tab.icon size={18} strokeWidth={2.5} />
                {tab.label}
                <span
                  className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id ? "bg-white/60" : "bg-slate-100"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[24px] shadow-xl shadow-slate-200/40 ring-1 ring-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/30 flex flex-wrap items-center gap-4 sticky top-0 z-10 backdrop-blur-md">
            <div className="relative flex-1 min-w-[280px] group">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
                size={20}
              />
              <input
                type="text"
                placeholder="Tìm kiếm theo mã đơn, tên, địa chỉ..."
                className="w-full pl-12 pr-4 py-3 bg-white border-0 ring-1 ring-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all shadow-sm text-sm font-medium text-slate-700 placeholder:text-slate-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {activeTab === "unassigned" && (
              <div className="flex items-center gap-3 bg-white py-2 px-4 rounded-2xl ring-1 ring-slate-200 shadow-sm hover:ring-slate-300 transition-all">
                <Filter size={18} className="text-slate-500" />
                <span className="text-sm font-semibold text-slate-600 whitespace-nowrap">
                  Khu vực:
                </span>
                <select
                  className="bg-transparent text-sm outline-none cursor-pointer font-bold text-blue-700 pl-1 pr-8 py-1 "
                  value={filterZone}
                  onChange={(e) => setFilterZone(e.target.value)}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%231d4ed8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: `right center`,
                    backgroundRepeat: `no-repeat`,
                    backgroundSize: `1.5em 1.5em`,
                    appearance: "none",
                  }}
                >
                  <option value="All">Tất cả</option>
                  {uniqueZones.map(
                    (z) =>
                      z !== "All" && (
                        <option key={z} value={z}>
                          {z}
                        </option>
                      ),
                  )}
                </select>
              </div>
            )}
            <div className="ml-auto text-sm font-medium text-slate-500">
              Hiển thị{" "}
              <span className="font-bold text-slate-800">
                {activeTab === "unassigned"
                  ? filteredUnassigned.length
                  : filteredAssigned.length}
              </span>{" "}
              kết quả
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50/70 text-slate-600 font-bold uppercase text-[11px] tracking-wider leading-normal border-b border-slate-100">
                <tr>
                  {activeTab === "unassigned" && (
                    <th className="px-6 py-4 w-[60px] text-center">
                      <input
                        type="checkbox"
                        className="w-5 h-5 rounded-[6px] border-2 border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer transition-all checked:border-blue-600"
                        onChange={handleSelectAll}
                        checked={
                          filteredUnassigned.length > 0 &&
                          selectedIds.length === filteredUnassigned.length
                        }
                      />
                    </th>
                  )}
                  <th className="px-6 py-4">Đơn hàng</th>
                  <th className="px-6 py-4">Địa điểm & Thời gian</th>
                  <th className="px-6 py-4 text-center">
                    {activeTab === "unassigned" ? "Thu hộ (COD)" : "Trạng thái"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {activeTab === "unassigned" &&
                  filteredUnassigned.map((s) => {
                    const isSelected = selectedIds.includes(s.id);
                    return (
                      <tr
                        key={s.id}
                        onClick={() => handleSelectOne(s.id)}
                        className={`group transition-all duration-200 cursor-pointer border-l-[4px] ${
                          isSelected
                            ? "bg-blue-50/60 border-blue-500"
                            : "hover:bg-slate-50 border-transparent hover:border-slate-300"
                        }`}
                      >
                        <td className="px-6 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            className="w-5 h-5 rounded-[6px] border-2 border-slate-300 text-blue-600 pointer-events-none transition-all checked:border-blue-600"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-4">
                            <div
                              className={`p-2.5 rounded-xl ${
                                isSelected
                                  ? "bg-blue-100 text-blue-600"
                                  : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:shadow-sm transition-all"
                              }`}
                            >
                              <Package size={20} strokeWidth={2} />
                            </div>
                            <div>
                              <span className="font-extrabold text-slate-800 text-base tracking-tight hover:text-blue-600 transition-colors">
                                {s.tracking_code}
                              </span>
                              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1.5 font-medium">
                                <User size={14} className="text-slate-400" />
                                {s.sender_name}{" "}
                                <span className="text-slate-300">Is</span>{" "}
                                <b>{s.receiver_name}</b>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-2 mb-2">
                            <MapPin
                              size={16}
                              className="text-orange-500 mt-0.5 flex-shrink-0"
                            />
                            <div>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-600/20 mb-1.5">
                                {getZoneInfo(s.delivery_address)}
                              </span>
                              <p
                                className="text-slate-600 text-xs leading-relaxed line-clamp-2 font-medium"
                                title={s.delivery_address}
                              >
                                {s.delivery_address}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium ml-6">
                            <CalendarClock size={14} />
                            Tạo lúc:{" "}
                            {new Date(s.created_at).toLocaleDateString(
                              "vi-VN",
                              { hour: "2-digit", minute: "2-digit" },
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="inline-flex flex-col items-end">
                            <span className="font-mono font-extrabold text-lg text-slate-700 tracking-tight">
                              {Number(s.cod_amount).toLocaleString()}
                              <span className="text-xs text-slate-400 ml-0.5 font-bold">
                                đ
                              </span>
                            </span>
                            <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-1.5 rounded-md">
                              Tiền mặt
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                {activeTab === "assigned" &&
                  filteredAssigned.map((a) => (
                    <tr
                      key={a.id}
                      className="group hover:bg-slate-50 transition-all duration-200"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-4">
                          <div className="p-2.5 rounded-xl bg-green-50 text-green-600 group-hover:bg-white group-hover:shadow-sm transition-all">
                            <Truck size={20} strokeWidth={2} />
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-800 text-base tracking-tight">
                              {a.tracking_code}
                            </span>
                            <div className="text-xs text-slate-500 mt-1.5 font-medium flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center">
                                <User size={12} className="text-slate-500" />
                              </div>
                              Tài xế:{" "}
                              <span className="font-bold text-slate-700">
                                {a.driver_name || "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-2">
                          <MapPin
                            size={16}
                            className="text-slate-400 mt-0.5 flex-shrink-0"
                          />
                          <p className="text-slate-600 text-xs leading-relaxed line-clamp-2 font-medium">
                            {a.delivery_address}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <StatusPill status={a.status} />
                      </td>
                    </tr>
                  ))}

                {/* EMPTY STATE */}
                {((activeTab === "unassigned" &&
                  filteredUnassigned.length === 0) ||
                  (activeTab === "assigned" &&
                    filteredAssigned.length === 0)) && (
                  <tr>
                    <td colSpan="4" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 shadow-inner">
                          <Package
                            size={40}
                            className="text-slate-300"
                            strokeWidth={1.5}
                          />
                        </div>
                        <p className="text-slate-500 font-medium text-lg">
                          Không tìm thấy dữ liệu phù hợp.
                        </p>
                        <p className="text-slate-400 text-sm mt-1">
                          Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {activeTab === "unassigned" && selectedIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 w-[95%] md:w-auto animate-in slide-in-from-bottom-6 duration-300">
          <div className="bg-white rounded-2xl shadow-2xl shadow-blue-900/20 ring-1 ring-slate-200/80 p-2 pr-3 flex flex-col sm:flex-row items-center gap-3 sm:gap-6 backdrop-blur-xl bg-white/95">
            {/* Counter Box */}
            <div className="flex items-center gap-4 pl-4 pr-6 border-r border-slate-100 py-2">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 blur-lg opacity-20 rounded-full"></div>
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-xl text-white relative shadow-sm">
                  <CheckSquare size={22} strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <span className="font-extrabold text-2xl block leading-none text-slate-800">
                  {selectedIds.length}
                </span>
                <span className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">
                  Đơn đã chọn
                </span>
              </div>
            </div>

            <div className="flex-1 w-full sm:w-auto px-2 py-1">
              <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">
                Gán tài xế phụ trách:
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  size={18}
                />
                <select
                  className="w-full sm:w-72 pl-10 pr-10 py-3 bg-slate-50 hover:bg-slate-100 border-0 ring-1 ring-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-bold text-slate-700 outline-none cursor-pointer transition-all appearance-none"
                  value={selectedDriverBulk}
                  onChange={(e) => setSelectedDriverBulk(e.target.value)}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: `right 1rem center`,
                    backgroundRepeat: `no-repeat`,
                    backgroundSize: `1.5em 1.5em`,
                  }}
                >
                  <option value="" className="text-slate-400">
                    -- Chọn tài xế --
                  </option>
                  {drivers.map((d) => (
                    <option
                      key={d.id}
                      value={d.id}
                      className="text-slate-800 font-bold py-2"
                    >
                      {d.name || d.full_name} — {d.vehicle_type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleBulkAssign}
              className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2.5 transition-all transform active:scale-[0.98]"
            >
              <Send size={20} strokeWidth={2.5} />
              <span className="text-base">Phân công ngay</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
