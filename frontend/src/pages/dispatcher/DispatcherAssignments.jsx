import { useEffect, useState, useMemo, useCallback, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import toast from "../../lib/toast";
import API from "../../services/api";
import Pagination from "../../components/Pagination";
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
  Rocket,
  Navigation,
  Loader2,
  Zap,
  ChevronDown,
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


  const [pageUnassigned, setPageUnassigned] = useState(1);
  const [pageAssigned, setPageAssigned] = useState(1);


  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedDriverBulk, setSelectedDriverBulk] = useState("");


  const [nearbyDrivers, setNearbyDrivers] = useState([]);
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [hasExpressSelected, setHasExpressSelected] = useState(false);


  // Tải đồng thời đơn chưa phân công, đã phân công và danh sách tài xế
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [resUnassigned, resAssigned, resDrivers] = await Promise.all([
        API.get("/dispatcher/shipments/unassigned"),
        API.get("/dispatcher/assignments"),
        API.get("/dispatcher/drivers"),
      ]);
      setUnassigned(resUnassigned.data || []);
      setAssignments(resAssigned.data.data || []);
      setDrivers(resDrivers.data);
      setSelectedIds([]);
    } catch (err) {
      toast.error("Không thể tải dữ liệu mới nhất.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);


  // Lấy danh sách tài xế gần vị trí giao hàng của đơn được chọn
  const fetchNearbyDrivers = useCallback(async (shipmentId) => {
    setLoadingNearby(true);
    try {
      const res = await API.get(`/dispatcher/drivers/nearby?shipment_id=${shipmentId}`);
      setNearbyDrivers(res.data);
    } catch (err) {
      setNearbyDrivers([]);
    } finally {
      setLoadingNearby(false);
    }
  }, []);


  // Khi chọn đơn hàng: kiểm tra loại dịch vụ hỏa tốc và tải tài xế gần nhất
  useEffect(() => {
    if (selectedIds.length >= 1) {
      const selectedShipment = unassigned.find((s) => s.id === selectedIds[0]);
      if (selectedShipment) {
        setHasExpressSelected(selectedShipment.service_type === "fast");
        fetchNearbyDrivers(selectedShipment.id);
        return;
      }
    }
    setHasExpressSelected(false);
    setNearbyDrivers([]);
  }, [selectedIds, unassigned, fetchNearbyDrivers]);


  // Trích xuất tên quận/huyện từ chuỗi địa chỉ để lọc theo khu vực
  const getDistrict = (address) => {
    if (!address) return "Khác";
    const parts = address.split(",").map((p) => p.trim());


    const districtKeywords = ["Quận", "Huyện", "Thị xã", "Thị trấn", "Phường"];
    for (const part of parts) {
      if (districtKeywords.some((kw) => part.startsWith(kw))) {
        return part;
      }
    }


    const ignoreParts = new Set(["Việt Nam", "Đà Nẵng", "Hà Nội", "TP.HCM", "Ho à Chí Minh", "Thành phố Hồ Chí Minh", "Hải Phòng", "Cần Thơ"]);
    const filtered = parts.filter((p) => {
      if (/^\d+$/.test(p)) return false;
      if (/^\d{5,6}$/.test(p)) return false;
      if (ignoreParts.has(p)) return false;
      if (p.startsWith("Thành phố")) return false;
      return true;
    });


    return filtered.length >= 1 ? filtered[filtered.length - 1] : "Khác";
  };


  // Tổng hợp danh sách quận/huyện duy nhất từ các đơn chưa phân công
  const uniqueZones = useMemo(() => {
    const districts = new Set(
      unassigned.map((item) => getDistrict(item.delivery_address))
    );
    return ["All", ...Array.from(districts).sort()];
  }, [unassigned]);


  const REGION_LABELS = {
    HN: "Hà Nội",
    HCM: "TP. Hồ Chí Minh",
    DN: "Đà Nẵng",
    CT: "Cần Thơ",
    HP: "Hải Phòng",
  };


  // Lọc đơn chưa phân công theo từ khóa tìm kiếm và bộ lọc quận/huyện
  const filteredUnassigned = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return unassigned.filter((item) => {
      const matchesSearch =
        item.tracking_code?.toLowerCase().includes(searchLower) ||
        item.receiver_name?.toLowerCase().includes(searchLower) ||
        item.delivery_address?.toLowerCase().includes(searchLower);
      const matchesZone =
        filterZone === "All" || getDistrict(item.delivery_address) === filterZone;
      return matchesSearch && matchesZone;
    });
  }, [unassigned, searchTerm, filterZone]);

  // --- Nhóm phân công theo tài xế cho tab "Đang vận hành" ---
  const [expandedDriverId, setExpandedDriverId] = useState(null);

  const driverGroups = useMemo(() => {
    // Chỉ lấy các phân công đang hoạt động: assigned, picking, delivering
    const active = assignments.filter((a) =>
      ["assigned", "picking", "delivering"].includes(a.assignment_status)
    );

    const map = {};
    for (const a of active) {
      const did = a.driver_id;
      if (!map[did]) {
        map[did] = {
          driver_id: did,
          driver_name: a.driver_name,
          driver_phone: a.driver_phone,
          driver_avatar: a.driver_avatar,
          vehicle_type: a.vehicle_type,
          assignments: [],
          statusCounts: { assigned: 0, picking: 0, delivering: 0, completed: 0, failed: 0 },
        };
      }
      map[did].assignments.push(a);
      if (map[did].statusCounts[a.assignment_status] !== undefined) {
        map[did].statusCounts[a.assignment_status]++;
      }
    }

    // Sắp xếp: tài xế có nhiều việc đang hoạt động nhất lên trước, sau đó theo tên tài xế
    return Object.values(map).sort((a, b) => {
      const aActive = a.assignments.length;
      const bActive = b.assignments.length;
      if (bActive !== aActive) return bActive - aActive;
      return (a.driver_name || "").localeCompare(b.driver_name || "");
    });
  }, [assignments]);

  const STATUS_STATS_CONFIG = {
    assigned:   { label: "Đã gán",   color: "bg-blue-50 text-blue-700 ring-blue-600/20",    dot: "fill-blue-500" },
    picking:    { label: "Đang lấy",  color: "bg-purple-50 text-purple-700 ring-purple-600/20","dot": "fill-purple-500" },
    delivering: { label: "Đang giao", color: "bg-orange-50 text-orange-700 ring-orange-600/20","dot": "fill-orange-500" },
    completed:  { label: "Hoàn tất",  color: "bg-green-50 text-green-700 ring-green-600/20",   dot: "fill-green-500" },
    failed:     { label: "Thất bại",  color: "bg-red-50 text-red-700 ring-red-600/20",        dot: "fill-red-500" },
  };

  const STATUS_ROW_CONFIG = {
    picking:    { label: "Đang lấy hàng",  bg: "bg-purple-50 border-purple-200",   badge: "bg-purple-100 text-purple-700" },
    delivering: { label: "Đang giao hàng", bg: "bg-orange-50 border-orange-200",   badge: "bg-orange-100 text-orange-700" },
    assigned:   { label: "Chờ lấy hàng",   bg: "bg-blue-50 border-blue-200",        badge: "bg-blue-100 text-blue-700" },
    completed:  { label: "Hoàn tất",       bg: "bg-green-50 border-green-200",      badge: "bg-green-100 text-green-700" },
    failed:     { label: "Giao thất bại",  bg: "bg-red-50 border-red-200",         badge: "bg-red-100 text-red-700" },
  };

  const toggleDriver = (driverId) =>
    setExpandedDriverId((prev) => (prev === driverId ? null : driverId));

  // Đặt lại trang khi chuyển sang tab đã phân công
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === "assigned") setPageAssigned(1);
  };

  // --- Phân trang cho tab "Chờ phân công" ---
  const PAGE_SIZE = 15;
  const totalPagesUnassigned = Math.ceil(filteredUnassigned.length / PAGE_SIZE);
  const pagedUnassigned = filteredUnassigned.slice(
    (pageUnassigned - 1) * PAGE_SIZE, pageUnassigned * PAGE_SIZE
  );

  // --- Thống kê cho tab đã phân công ---
  const assignedTabStats = useMemo(() => {
    const byStatus = { assigned: 0, picking: 0, delivering: 0, completed: 0, failed: 0 };
    const active = assignments.filter((a) => ["assigned","picking","delivering"].includes(a.assignment_status));
    for (const a of active) byStatus[a.assignment_status]++;
    return byStatus;
  }, [assignments]);


  // Chọn/bỏ chọn tất cả đơn trong danh sách hiện tại
  const handleSelectAll = (e) => {
    setSelectedIds(e.target.checked ? filteredUnassigned.map((s) => s.id) : []);
  };

  // Chọn/bỏ chọn một đơn hàng theo id
  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };


  // Phân công hàng loạt các đơn đã chọn cho một tài xế
  const handleBulkAssign = async () => {
    if (selectedIds.length === 0) return toast.error("Chưa chọn đơn hàng nào!");
    if (!selectedDriverBulk) return toast.error("Vui lòng chọn tài xế!");

    const driverInfo = drivers.find((d) => d.id == selectedDriverBulk);
    if (
      !window.confirm(
        `Giao ${selectedIds.length} đơn cho tài xế ${driverInfo?.name}?`
      )
    )
      return;

    const toastId = toast.loading("Đang xử lý...");
    try {
      await API.post("/shipments/assign-bulk", {
        shipment_ids: selectedIds,
        driver_id: selectedDriverBulk,
      });
      toast.success(`Đã phân công thành công!`, { id: toastId });
      fetchAll();
      setSelectedDriverBulk("");
    } catch (err) {
      const msg = err.response?.data?.message || "Lỗi hệ thống!";
      toast.error(`${msg}`, { id: toastId });
    }
  };


  // Component hiển thị nhãn trạng thái đơn hàng với màu sắc phân biệt
  const StatusPill = ({ status }) => {
    const styles = {
      assigned:   "bg-blue-50 text-blue-700 ring-blue-600/20",
      picking:    "bg-purple-50 text-purple-700 ring-purple-600/20",
      delivering: "bg-orange-50 text-orange-700 ring-orange-600/20",
      completed:  "bg-green-50 text-green-700 ring-green-600/20",
      failed:     "bg-red-50 text-red-700 ring-red-600/20",
      canceled:  "bg-gray-50 text-gray-600 ring-gray-500/10",
      pending:    "bg-yellow-50 text-yellow-700 ring-yellow-600/20",
    };
    const statusText = {
      pending:    "Chờ xử lý",
      assigned:   "Đã gán",
      picking:    "Đang lấy",
      delivering: "Đang giao",
      completed:  "Hoàn tất",
      failed:     "Thất bại",
      canceled:  "Đã hủy",
    };
    return (
      <span
        className={`inline-flex items-center justify-center min-w-[130px] whitespace-nowrap rounded-full px-2.5 py-1.5 text-xs font-bold ring-1 ring-inset ${
          styles[status] || "bg-gray-50 text-gray-600 ring-gray-500/10"
        }`}
      >
        <svg
          className={`mr-1.5 h-2 w-2 flex-shrink-0 ${
            status === "completed" ? "fill-green-500"
            : status === "delivering" ? "fill-orange-500"
            : status === "failed" ? "fill-red-500"
            : status === "pending" ? "fill-yellow-500"
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
        {/* Phần đầu: tiêu đề trang và tab chuyển đổi */}
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

          {/* Tab chuyển đổi: Chờ phân công / Đang vận hành */}
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
                count: driverGroups.reduce((sum, d) => sum + d.assignments.filter(a => ["assigned","picking","delivering"].includes(a.assignment_status)).length, 0),
                activeColor:
                  "bg-green-50 text-green-700 shadow-sm ring-1 ring-green-200",
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
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

        {/* Bảng dữ liệu chính */}
        <div className="bg-white rounded-[24px] shadow-xl shadow-slate-200/40 ring-1 ring-slate-100 overflow-hidden">
          {/* Thanh tìm kiếm và bộ lọc quận/huyện — chỉ hiện ở tab Chờ phân công */}
        {activeTab === "unassigned" && (
          <>
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

            <div className="flex items-center gap-3 bg-white py-2 px-4 rounded-2xl ring-1 ring-slate-200 shadow-sm hover:ring-slate-300 transition-all">
              <Filter size={18} className="text-slate-500" />
              <span className="text-sm font-semibold text-slate-600 whitespace-nowrap">
                Quận/Huyện:
              </span>
              <select
                className="bg-transparent text-sm outline-none cursor-pointer font-bold text-blue-700 pl-1 pr-8 py-1"
                value={filterZone}
                onChange={(e) => { setFilterZone(e.target.value); setPageUnassigned(1); }}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%231d4ed8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: `right center`,
                  backgroundRepeat: `no-repeat`,
                  backgroundSize: `1.5em 1.5em`,
                  appearance: "none",
                }}
              >
                <option value="All">Tất cả quận/huyện</option>
                {uniqueZones.filter((z) => z !== "All").map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>
            </div>
            <div className="ml-auto text-sm font-medium text-slate-500">
              Hiển thị{" "}
              <span className="font-bold text-slate-800">
                {filteredUnassigned.length}
              </span>{" "}
              kết quả
            </div>
          </div>
          </>
        )}

          {/* Bảng danh sách đơn hàng */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50/70 text-slate-600 font-bold uppercase text-[11px] tracking-wider leading-normal border-b border-slate-100">
                <tr>
                  {activeTab === "unassigned" && (
                    <th className="px-5 py-3 w-[48px] text-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded-[6px] border-2 border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer transition-all checked:border-blue-600"
                        onChange={handleSelectAll}
                        checked={
                          filteredUnassigned.length > 0 &&
                          selectedIds.length === filteredUnassigned.length
                        }
                      />
                    </th>
                  )}
                  {activeTab === "assigned" && (
                    <th className="px-6 py-4 w-[60px] text-center">
                      <Truck size={16} className="text-slate-400 mx-auto" />
                    </th>
                  )}
                  {activeTab === "unassigned" && (
                    <th className="px-5 py-3">Đơn hàng</th>
                  )}
                  <th className="px-5 py-3">Địa điểm & Thời gian</th>
                  <th className="px-5 py-3 text-center">Giá trị</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {/* Dòng dữ liệu tab Chờ phân công */}
                {activeTab === "unassigned" &&
                  pagedUnassigned.map((s) => {
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
                        <td className="px-5 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            className="w-4 h-4 rounded-[6px] border-2 border-slate-300 text-blue-600 pointer-events-none transition-all checked:border-blue-600"
                          />
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-lg shrink-0 ${
                                s.service_type === 'fast'
                                  ? isSelected
                                    ? "bg-red-100 text-red-600"
                                    : "bg-red-50 text-red-500 group-hover:bg-white group-hover:shadow-sm transition-all"
                                  : isSelected
                                    ? "bg-blue-100 text-blue-600"
                                    : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:shadow-sm transition-all"
                              }`}
                            >
                              {s.service_type === 'fast' ? (
                                <Rocket size={16} strokeWidth={2} />
                              ) : (
                                <Package size={16} strokeWidth={2} />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-slate-800 text-sm tracking-tight hover:text-blue-600 transition-colors">
                                  #{s.tracking_code}
                                </span>
                                {s.service_type === 'fast' && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-500 text-white shadow-sm animate-pulse">
                                    <Rocket size={8} />
                                    HỎA TỐC
                                  </span>
                                )}
                                {s.service_type === 'express' && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-orange-100 text-orange-700 ring-1 ring-orange-200">
                                    <Zap size={8} />
                                    NHANH
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                <User size={12} className="text-slate-400 shrink-0" />
                                {s.sender_name}{" "}
                                <span className="text-slate-300">→</span>{" "}
                                <b>{s.receiver_name}</b>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex flex-col gap-2">
                            {/* Pickup */}
                            <div className="flex items-start gap-1.5">
                              <Package
                                size={13}
                                className="text-green-500 mt-0.5 flex-shrink-0"
                              />
                              <div className="min-w-0">
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20 mb-0.5">
                                  Lấy hàng
                                </span>
                                <p
                                  className="text-slate-600 text-[11px] leading-relaxed line-clamp-1 font-medium"
                                  title={s.pickup_address}
                                >
                                  {s.pickup_address}
                                </p>
                              </div>
                            </div>
                            {/* Delivery */}
                            <div className="flex items-start gap-1.5">
                              <MapPin
                                size={13}
                                className="text-orange-500 mt-0.5 flex-shrink-0"
                              />
                              <div className="min-w-0">
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-600/20 mb-0.5">
                                  {getDistrict(s.delivery_address)}
                                </span>
                                <p
                                  className="text-slate-600 text-[11px] leading-relaxed line-clamp-1 font-medium"
                                  title={s.delivery_address}
                                >
                                  {s.delivery_address}
                                </p>
                              </div>
                            </div>
                            {/* Time */}
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium ml-[22px]">
                              <CalendarClock size={11} />
                              {new Date(s.created_at).toLocaleDateString(
                                "vi-VN",
                                { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-center">
                          {s.cod_payer === "customer" ? (
                            <div className="inline-flex flex-col items-end">
                              <span className="font-mono font-extrabold text-base text-emerald-600 tracking-tight">
                                0<span className="text-[10px] ml-0.5 font-bold">đ</span>
                              </span>
                              <span className="text-[9px] uppercase font-bold text-emerald-700 bg-emerald-100 px-1 rounded ring-1 ring-emerald-200">
                                Khách đã trả
                              </span>
                            </div>
                          ) : (
                            <div className="inline-flex flex-col items-end">
                              <span className="font-mono font-extrabold text-base text-slate-700 tracking-tight">
                                {Number(s.cod_amount || 0).toLocaleString()}
                                <span className="text-[10px] text-slate-400 ml-0.5 font-bold">đ</span>
                              </span>
                              <span className="text-[9px] uppercase font-bold text-slate-400 bg-slate-100 px-1 rounded">
                                {s.payment_method === "WALLET" ? "Ví nội bộ" : s.payment_method === "MOMO" ? "MoMo" : "Tiền mặt"}
                              </span>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                {/* ── Tab Đang vận hành: thống kê & danh sách theo tài xế ── */}
                {activeTab === "assigned" && (
                  <>
                    {/* Stats summary bar */}
                    <tr>
                      <td colSpan="3" className="px-6 py-4 bg-gradient-to-r from-slate-50 to-blue-50/30">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng đơn đang chạy:</span>
                          {Object.entries(STATUS_STATS_CONFIG).map(([key, cfg]) => {
                            const count = assignedTabStats[key] || 0;
                            return (
                              <div key={key} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ring-1 ring-inset ${cfg.color}`}>
                                <svg className={"w-2 h-2 flex-shrink-0 " + cfg.dot} viewBox="0 0 8 8"><circle cx="4" cy="4" r="3"/></svg>
                                {cfg.label}: <span className="font-black text-base leading-none">{count}</span>
                              </div>
                            );
                          })}
                          <span className="ml-auto text-xs font-semibold text-slate-500">
                            {driverGroups.length} tài xế đang hoạt động
                          </span>
                        </div>
                      </td>
                    </tr>

                    {/* Driver cards */}
                    {driverGroups.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="px-6 py-20 text-center">
                          <div className="flex flex-col items-center">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 shadow-inner">
                              <Truck size={40} className="text-slate-300" strokeWidth={1.5} />
                            </div>
                            <p className="text-slate-500 font-medium text-lg">Không có tài xế nào đang hoạt động.</p>
                            <p className="text-slate-400 text-sm mt-1">Phân công đơn hàng cho tài xế ở tab "Chờ phân công".</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      driverGroups.map((driver) => {
                        const isOpen = expandedDriverId === driver.driver_id;
                        const totalActive = driver.assignments.filter(a =>
                          ["assigned","picking","delivering"].includes(a.assignment_status)
                        ).length;

                        return (
                          <Fragment key={`driver-${driver.driver_id}`}>
                            {/* Driver summary row */}
                            <tr
                              onClick={() => toggleDriver(driver.driver_id)}
                              className={`cursor-pointer transition-all duration-200 hover:bg-slate-50 border-l-[4px] ${
                                isOpen ? "bg-blue-50/40 border-blue-400" : "border-transparent"
                              }`}
                            >
                              <td colSpan="3" className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                  {driver.driver_avatar ? (
                                    <img src={driver.driver_avatar} alt={driver.driver_name} className="w-12 h-12 rounded-full object-cover shadow-sm shrink-0" />
                                  ) : (
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-black shadow-sm shrink-0 leading-none select-none ${
                                      isOpen
                                        ? "bg-gradient-to-br from-blue-500 to-blue-700"
                                        : "bg-gradient-to-br from-slate-400 to-slate-600"
                                    }`}>
                                      TX
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-extrabold text-slate-800 text-base">
                                        {driver.driver_name || "Không rõ"}
                                      </span>
                                      {driver.driver_phone && (
                                        <span className="text-xs text-slate-400 font-medium">
                                          {driver.driver_phone}
                                        </span>
                                      )}
                                      <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full ring-1 ring-slate-200">
                                        {driver.vehicle_type || "—"}
                                      </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 mt-2">
                                      {["assigned","picking","delivering"].map((st) => {
                                        const cnt = driver.statusCounts[st] || 0;
                                        if (cnt === 0) return null;
                                        const cfg = STATUS_STATS_CONFIG[st];
                                        return (
                                          <div key={st} className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ring-1 ring-inset ${cfg.color}`}>
                                            <svg className={"w-1.5 h-1.5 flex-shrink-0 " + cfg.dot} viewBox="0 0 8 8"><circle cx="4" cy="4" r="3"/></svg>
                                            {cfg.label}: <span className="font-black">{cnt}</span>
                                          </div>
                                        );
                                      })}
                                      <span className="ml-1 text-xs font-semibold text-slate-400">
                                        Tổng: <span className="font-bold text-slate-700">{totalActive}</span> đơn
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3 shrink-0">
                                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all duration-200 ${
                                      isOpen
                                        ? "bg-blue-500 text-white shadow-sm"
                                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                    }`}>
                                      {isOpen ? "Thu gọn" : `Xem ${totalActive} đơn`}
                                    </span>
                                    <ChevronDown
                                      size={18}
                                      className={`text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                                    />
                                  </div>
                                </div>
                              </td>
                            </tr>

                            {/* Expanded order list */}
                            {isOpen && driver.assignments.map((a) => {
                              const rowCfg = STATUS_ROW_CONFIG[a.assignment_status] || STATUS_ROW_CONFIG.assigned;
                              return (
                                <tr
                                  key={`order-${a.id}`}
                                  className={`border-l-[4px] border-transparent hover:bg-slate-50 transition-colors ${rowCfg.bg}`}
                                >
                                  {/* Col 1: Tracking + service */}
                                  <td className="px-6 py-3 pl-[72px]">
                                    <div className="flex flex-col gap-1">
                                      <div className="flex items-center gap-1.5">
                                        <span
                                          className="font-extrabold text-slate-800 text-sm hover:text-blue-600 transition-colors cursor-pointer"
                                          onClick={(e) => { e.stopPropagation(); navigate(`/dispatcher/tracking/${a.id}`); }}
                                        >
                                          #{a.tracking_code}
                                        </span>
                                        {a.service_type === "fast" && (
                                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-red-500 text-white animate-pulse shrink-0">
                                            <Rocket size={8} /> HỎA TỐC
                                          </span>
                                        )}
                                        {a.service_type === "express" && (
                                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-orange-100 text-orange-700 ring-1 ring-orange-200 shrink-0">
                                            <Zap size={8} /> NHANH
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-1 text-xs text-slate-400">
                                        <span>{a.sender_name}</span>
                                        <span className="text-slate-300">→</span>
                                        <span className="font-medium text-slate-600">{a.receiver_name}</span>
                                      </div>
                                    </div>
                                  </td>

                                  {/* Col 2: Pickup → Delivery */}
                                  <td className="px-6 py-3">
                                    <div className="flex items-center gap-3">
                                      <div className="flex items-start gap-1 min-w-0 flex-1">
                                        <Package size={12} className="text-green-500 mt-0.5 shrink-0" />
                                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                                          {a.pickup_address || "—"}
                                        </p>
                                      </div>
                                      <span className="text-slate-300 shrink-0">→</span>
                                      <div className="flex items-start gap-1 min-w-0 flex-1">
                                        <MapPin size={12} className="text-orange-500 mt-0.5 shrink-0" />
                                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                                          {a.delivery_address || "—"}
                                        </p>
                                      </div>
                                    </div>
                                  </td>

                                  {/* Col 3: Status + time */}
                                  <td className="px-6 py-3 text-center">
                                    <div className="flex flex-col items-center gap-1">
                                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ring-1 ring-inset ${rowCfg.badge}`}>
                                        {rowCfg.label}
                                      </span>
                                      <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                                        {a.assigned_at
                                          ? `${new Date(a.assigned_at).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })} · ${new Date(a.assigned_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`
                                          : "—"}
                                      </span>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </Fragment>
                        );
                      })
                    )}
                  </>
                )}

                {/* Thông báo khi không có dữ liệu */}
                {activeTab === "unassigned" && filteredUnassigned.length === 0 && (
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

          {/* Phân trang */}
          {activeTab === "unassigned" && (
            <Pagination
              currentPage={pageUnassigned}
              totalPages={totalPagesUnassigned}
              onPageChange={setPageUnassigned}
            />
          )}
        </div>
      </div>


      {/* Action bar cố định dưới cùng khi có đơn được chọn */}
      {activeTab === "unassigned" && selectedIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 w-[95%] md:w-auto animate-in slide-in-from-bottom-6 duration-300">
          <div className="bg-white rounded-2xl shadow-2xl shadow-blue-900/20 ring-1 ring-slate-200/80 p-3 backdrop-blur-xl bg-white/95">
            
            {/* Khung gợi ý tài xế gần nhất cho đơn hỏa tốc */}
            {hasExpressSelected && (
              <div className="mb-3 p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl ring-1 ring-red-200/60">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-red-500 rounded-lg text-white">
                    <Navigation size={14} />
                  </div>
                  <span className="text-xs font-bold text-red-700 uppercase tracking-wider">
                    🚀 Tài xế gần nhất — Gợi ý cho đơn Hỏa Tốc
                  </span>
                </div>

                {loadingNearby ? (
                  <div className="flex items-center justify-center py-4 gap-2">
                    <Loader2 className="animate-spin text-red-500" size={18} />
                    <span className="text-sm text-slate-500 font-medium">Đang tìm tài xế gần nhất...</span>
                  </div>
                ) : nearbyDrivers.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {nearbyDrivers.slice(0, 6).map((d, idx) => (
                      <button
                        key={d.id}
                        onClick={() => setSelectedDriverBulk(String(d.id))}
                        className={`flex items-center gap-3 p-2.5 rounded-xl text-left transition-all duration-200 group ${
                          String(selectedDriverBulk) === String(d.id)
                            ? "bg-white shadow-md ring-2 ring-red-400 scale-[1.02]"
                            : "bg-white/60 hover:bg-white hover:shadow-sm ring-1 ring-slate-200/60"
                        }`}
                      >
                        {/* Nhãn thứ hạng tài xế gần nhất */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                          idx === 0 ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-sm" :
                          idx === 1 ? "bg-gradient-to-br from-slate-300 to-slate-400 text-white" :
                          idx === 2 ? "bg-gradient-to-br from-orange-300 to-orange-400 text-white" :
                          "bg-slate-100 text-slate-500"
                        }`}>
                          {idx + 1}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate">
                            {d.name}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-slate-400 font-medium truncate">
                              {d.vehicle_type || "N/A"}
                            </span>
                          </div>
                        </div>

                        {/* Khoảng cách tài xế đến điểm giao */}
                        <div className="flex flex-col items-end shrink-0">
                          <span className={`text-xs font-extrabold tabular-nums ${
                            d.distance_km !== null && d.distance_km <= 3 ? "text-green-600" :
                            d.distance_km !== null && d.distance_km <= 10 ? "text-orange-600" :
                            "text-slate-600"
                          }`}>
                            {d.distance_km !== null ? `${d.distance_km} km` : "—"}
                          </span>
                          <span className="text-[9px] text-slate-400 font-medium">
                            {d.distance_km !== null && d.distance_km <= 3 ? "Rất gần" :
                             d.distance_km !== null && d.distance_km <= 10 ? "Gần" :
                             d.distance_km !== null ? "Xa" : "N/A"}
                          </span>
                        </div>

                        {/* Biểu tượng dấu chọn khi tài xế được chọn */}
                        {String(selectedDriverBulk) === String(d.id) && (
                          <CheckCircle size={18} className="text-red-500 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-3">
                    <p className="text-sm text-slate-400 font-medium">Không tìm thấy tài xế khả dụng gần đây</p>
                  </div>
                )}
              </div>
            )}

            {/* Row: số đơn đã chọn + dropdown tài xế + nút phân công */}
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
              {/* Hiển thị số lượng đơn đã chọn */}
              <div className="flex items-center gap-4 pl-4 pr-6 border-r border-slate-100 py-2">
                <div className="relative">
                  <div className={`absolute inset-0 ${hasExpressSelected ? 'bg-red-500' : 'bg-blue-500'} blur-lg opacity-20 rounded-full`}></div>
                  <div className={`${hasExpressSelected ? 'bg-gradient-to-br from-red-500 to-red-600' : 'bg-gradient-to-br from-blue-500 to-blue-600'} p-2.5 rounded-xl text-white relative shadow-sm`}>
                    {hasExpressSelected ? <Rocket size={22} strokeWidth={2.5} /> : <CheckSquare size={22} strokeWidth={2.5} />}
                  </div>
                </div>
                <div>
                  <span className="font-extrabold text-2xl block leading-none text-slate-800">
                    {selectedIds.length}
                  </span>
                  <span className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">
                    {hasExpressSelected ? "Đơn hỏa tốc" : "Đơn đã chọn"}
                  </span>
                </div>
              </div>

              {/* Dropdown chọn tài xế phân công */}
              <div className="flex-1 w-full sm:w-auto px-2 py-1">
                <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">
                  {hasExpressSelected ? "Tài xế phụ trách (chọn từ gợi ý hoặc thủ công):" : "Gán tài xế phụ trách:"}
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    size={18}
                  />
                  <select
                    className={`w-full sm:w-72 pl-10 pr-10 py-3 bg-slate-50 hover:bg-slate-100 border-0 ring-1 rounded-xl focus:ring-2 text-sm font-bold text-slate-700 outline-none cursor-pointer transition-all appearance-none ${
                      hasExpressSelected && selectedDriverBulk 
                        ? "ring-red-300 focus:ring-red-500" 
                        : "ring-slate-200 focus:ring-blue-500"
                    }`}
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

                    {/* Trạng thái đang tải tài xế gần nhất */}
                    {loadingNearby && selectedIds.length > 0 && (
                      <option disabled>⏳ Đang tìm tài xế gần đơn...</option>
                    )}

  // Nhóm tài xế cùng khu vực
                    {drivers.slice(0, 20).length > 0 && (
                      <optgroup label={
                        hasExpressSelected
                          ? `Tài xế khả dụng (${drivers.length})`
                          : `Tài xế khả dụng (${drivers.length})`
                      }>
                        {drivers.slice(0, 50).map((d) => {
                          const nearby = nearbyDrivers.find((n) => n.id === d.id);
                          return (
                            <option key={d.id} value={d.id}>
                              {d.name} — {d.vehicle_type || "N/A"}
                              {nearby?.distance_km != null ? ` — ${nearby.distance_km}km` : ""}
                            </option>
                          );
                        })}
                      </optgroup>
                    )}

                    {/* Thông báo không có tài xế khả dụng */}
                    {!loadingNearby && drivers.length === 0 && (
                      <option disabled>Không có tài xế khả dụng</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Nút xác nhận phân công */}
              <button
                onClick={handleBulkAssign}
                className={`w-full sm:w-auto text-white font-bold py-3.5 px-8 rounded-xl shadow-lg flex items-center justify-center gap-2.5 transition-all transform active:scale-[0.98] ${
                  hasExpressSelected 
                    ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-red-500/30" 
                    : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-orange-500/30"
                }`}
              >
                <Send size={20} strokeWidth={2.5} />
                <span className="text-base">{hasExpressSelected ? "Phân công hỏa tốc" : "Phân công ngay"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
