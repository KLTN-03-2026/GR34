import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../../services/api";
import { Truck, MapPin, Calendar, Activity, ArrowRight } from "lucide-react";

import Pagination from "../../components/Pagination";

export default function DispatcherTracking() {
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const ITEMS_PER_PAGE = 10;
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(assignments.length / ITEMS_PER_PAGE);
  const paginatedAssignments = assignments.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await API.get("/dispatcher/assignments");
      setAssignments(res.data);
    } catch (err) {
      console.error("❌ Lỗi load dữ liệu:", err);
      toast.error("Không thể tải danh sách vận đơn!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusUpdate = async (id, status, e) => {
    e.stopPropagation();
    try {
      await API.patch(`/dispatcher/assignments/${id}/status`, { status });
      toast.success("Cập nhật trạng thái thành công!");
      fetchData();
    } catch (err) {
      console.error("❌ updateStatus error:", err);
      toast.error("Lỗi khi cập nhật!");
    }
  };

  const handleRowClick = (shipmentId) => {
    navigate(`/dispatcher/tracking/${shipmentId}`);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#113e48] flex items-center gap-2">
            <Truck className="text-blue-600" /> Theo dõi vận chuyển
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Giám sát trạng thái các đơn hàng đang được tài xế thực hiện
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <span className="text-sm font-semibold text-gray-600">
            Tổng đơn đang chạy:{" "}
          </span>
          <span className="text-blue-600 font-bold text-lg ml-1">
            {assignments.length}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-600 font-bold uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Mã đơn / Thông tin</th>
                <th className="px-6 py-4">Tài xế & Xe</th>
                <th className="px-6 py-4">Lộ trình</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
                <th className="px-6 py-4 text-center">Cập nhật nhanh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : paginatedAssignments.length > 0 ? (
                paginatedAssignments.map((a) => (
                  <tr
                    key={a.id}
                    onClick={() => handleRowClick(a.shipment_id)}
                    className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#113e48] text-base mb-1">
                        {a.tracking_code}
                      </div>
                      <div className="text-xs text-gray-500">
                        <span className="font-medium text-gray-700">
                          {a.sender_name}
                        </span>
                        <span className="mx-1 text-gray-400">➜</span>
                        <span className="font-medium text-gray-700">
                          {a.receiver_name}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">
                        {a.driver_name}
                      </div>
                      <div className="text-xs text-gray-500 bg-gray-100 inline-block px-2 py-0.5 rounded mt-1">
                        {a.vehicle_type}
                      </div>
                    </td>

                    <td className="px-6 py-4 max-w-[250px]">
                      <div className="flex items-start gap-2">
                        <MapPin
                          size={14}
                          className="text-orange-500 mt-0.5 flex-shrink-0"
                        />
                        <p
                          className="text-gray-600 text-xs line-clamp-2"
                          title={a.delivery_address}
                        >
                          {a.delivery_address || "Chưa cập nhật địa chỉ"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-400 ml-5">
                        <Calendar size={12} />{" "}
                        {new Date(
                          a.assigned_at || Date.now(),
                        ).toLocaleDateString("vi-VN")}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                          a.assignment_status === "completed"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : a.assignment_status === "delivering"
                              ? "bg-orange-50 text-orange-700 border-orange-200"
                              : a.assignment_status === "failed"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}
                      >
                        {a.assignment_status === "assigned"
                          ? "Đã gán"
                          : a.assignment_status === "picking"
                            ? "Đang lấy"
                            : a.assignment_status === "delivering"
                              ? "Đang giao"
                              : a.assignment_status === "completed"
                                ? "Hoàn tất"
                                : a.assignment_status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div
                        className="relative inline-block"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <select
                          onChange={(e) =>
                            handleStatusUpdate(a.id, e.target.value, e)
                          }
                          defaultValue=""
                          className="appearance-none bg-white border border-gray-300 text-gray-700 py-1 pl-3 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-blue-500 text-xs font-medium cursor-pointer hover:border-gray-400 transition-colors"
                        >
                          <option value="" disabled className="text-gray-400">
                            Cập nhật...
                          </option>
                          <option value="picking">Đang lấy hàng</option>
                          <option value="delivering">Đang giao hàng</option>
                          <option value="completed">Hoàn tất</option>
                          <option value="failed">Thất bại</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                          <Activity size={12} />
                        </div>
                      </div>
                      <div className="mt-2 md:hidden text-xs text-blue-500 flex justify-center items-center gap-1 group-hover:underline">
                        Xem chi tiết <ArrowRight size={10} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-12 text-gray-400 italic"
                  >
                    <div className="flex flex-col items-center">
                      <Truck size={48} className="text-gray-200 mb-2" />
                      Không có đơn hàng nào đang vận chuyển.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
