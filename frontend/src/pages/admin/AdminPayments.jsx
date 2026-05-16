import { useEffect, useState } from "react";
import API from "../../services/api";
import toast from "../../lib/toast";
import { CreditCard, Search, Trash2, DollarSign, Wallet, Smartphone, Clock3, CircleCheck, CircleX } from "lucide-react";
import Pagination from "../../components/Pagination";

// Quản lý thanh toán
export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");


  const [page, setPage] = useState(1);
  const perPage = 8;


  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await API.get("/payments");
      setPayments(res.data);
      setFiltered(res.data);
    } catch {
      toast.error("Lỗi khi tải danh sách thanh toán");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);


  useEffect(() => {
    const keyword = search.toLowerCase();
    const result = payments.filter(
      (p) =>
        p.tracking_code?.toLowerCase().includes(keyword) ||
        p.customer_name?.toLowerCase().includes(keyword)
    );
    setFiltered(result);
    setPage(1);
  }, [search, payments]);


  const handleUpdate = async (id, status) => {
    try {
      await API.put(`/payments/${id}`, { status });
      toast.success("Đã cập nhật trạng thái");
      fetchPayments();
    } catch {
      toast.error("Cập nhật thất bại");
    }
  };


// Xử lý xóa dữ liệu
  const handleDelete = async (id) => {
    if (confirm("Bạn có chắc muốn xóa lịch sử thanh toán này không?")) {
      try {
        await API.delete(`/payments/${id}`);
        toast.success("Đã xóa thanh toán");
        fetchPayments();
      } catch {
        toast.error("Lỗi khi xóa thanh toán");
      }
    }
  };


  const totalPages = Math.ceil(filtered.length / perPage);
  const startIndex = (page - 1) * perPage;
  const currentPayments = filtered.slice(startIndex, startIndex + perPage);


  const getMethodBadge = (method) => {
    const m = method?.toLowerCase();
    if (m === "momo")
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border bg-pink-50 text-pink-700 border-pink-200">
          <span className="w-5 h-5 rounded-md flex items-center justify-center bg-pink-100 text-pink-600 shadow-sm">
            <Smartphone size={11} />
          </span>
          MoMo
        </span>
      );
    if (m === "ewallet" || m === "vi" || m === "wallet")
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border bg-violet-50 text-violet-700 border-violet-200">
          <span className="w-5 h-5 rounded-md flex items-center justify-center bg-violet-100 text-violet-600 shadow-sm">
            <Wallet size={11} />
          </span>
          Ví điện tử
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border bg-green-50 text-green-700 border-green-200">
        <span className="w-5 h-5 rounded-md flex items-center justify-center bg-green-100 text-green-600 shadow-sm">
          <DollarSign size={11} />
        </span>
        Tiền mặt
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans">
      {/* Phần giao diện */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#113e48] flex items-center gap-2">
            <CreditCard className="text-orange-500" size={24} /> Quản lý thanh
            toán
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Tổng cộng:{" "}
            <span className="font-bold text-[#113e48]">{filtered.length}</span>{" "}
            giao dịch
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Tìm mã vận đơn, khách hàng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
          />
        </div>
      </div>

      {/* Phần giao diện */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Mã vận đơn</th>
                <th className="px-6 py-4">Khách hàng</th>
                <th className="px-6 py-4">Số tiền</th>
                <th className="px-6 py-4">Phương thức</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
                <th className="px-6 py-4 text-center">Ngày tạo</th>
                <th className="px-6 py-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan="7" className="px-6 py-4">
                      <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
                    </td>
                  </tr>
                ))
              ) : currentPayments.length > 0 ? (
                currentPayments.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-[#113e48]">
                      #{p.tracking_code || "---"}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-700">
                      {p.customer_name || "Khách lẻ"}
                    </td>
                    <td className="px-6 py-4 text-green-600 font-bold text-base">
                      {Number(p.amount).toLocaleString("vi-VN")} ₫
                    </td>
                    <td className="px-6 py-4">{getMethodBadge(p.method)}</td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border min-w-[120px] justify-center ${
                          p.status === "completed"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : p.status === "pending"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 shadow-sm ${
                          p.status === "completed"
                            ? "bg-emerald-100 text-emerald-600"
                            : p.status === "pending"
                            ? "bg-amber-100 text-amber-600"
                            : "bg-red-100 text-red-600"
                        }`}>
                          {p.status === "completed"
                            ? <CircleCheck size={11} />
                            : p.status === "pending"
                            ? <Clock3 size={11} />
                            : <CircleX size={11} />
                          }
                        </span>
                        {p.status === "completed"
                          ? "Hoàn tất"
                          : p.status === "pending"
                          ? "Đang xử lý"
                          : "Thất bại"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-500 text-xs">
                      {new Date(p.created_at).toLocaleString("vi-VN")}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa giao dịch"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-12 text-center text-gray-400 italic"
                  >
                    Không tìm thấy dữ liệu thanh toán.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Phần giao diện */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}