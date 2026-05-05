import { useEffect, useState, useMemo } from "react";
import API from "../../services/api";
import {
  PhoneCall,
  CheckCircle,
  RefreshCcw,
  X,
  Search,
  Mail,
  User,
  Copy,
  MessageSquare,
  Filter,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";

export default function DispatcherContactsPro() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);


  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");


  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [note, setNote] = useState("");

  const dispatcherId = localStorage.getItem("userId");


  const fetchMyContacts = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/contact/dispatcher/${dispatcherId}`);
      setContacts(res.data);
    } catch {
      toast.error("❌ Lỗi khi tải danh sách liên hệ!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyContacts();
  }, []);


  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      const matchSearch =
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone?.includes(searchTerm) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus =
        filterStatus === "all"
          ? true
          : filterStatus === "resolved"
          ? c.status === "resolved"
          : c.status !== "resolved";

      return matchSearch && matchStatus;
    });
  }, [contacts, searchTerm, filterStatus]);


  const openNoteModal = (id) => {
    setSelectedId(id);
    setShowNoteModal(true);
  };

  const closeNoteModal = () => {
    setShowNoteModal(false);
    setSelectedId(null);
    setNote("");
  };

  const submitNote = async () => {
    if (!note.trim()) return toast.error("Vui lòng nhập nội dung xử lý!");

    const toastId = toast.loading("Đang cập nhật...");
    try {
      await API.patch(`/contact/${selectedId}/status`, {
        status: "resolved",
        note,
      });
      toast.success("Đã xử lý xong!", { id: toastId });
      closeNoteModal();
      fetchMyContacts();
    } catch (err) {
      toast.error("Lỗi cập nhật!", { id: toastId });
    }
  };


  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Đã sao chép: " + text);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 font-sans pb-32">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Phần giao diện */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
              <span className="bg-blue-600 text-white p-2 rounded-lg">
                <PhoneCall size={20} />
              </span>
              Hỗ Trợ Khách Hàng
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Quản lý các yêu cầu liên hệ được phân công
            </p>
          </div>
          <button
            onClick={fetchMyContacts}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:text-blue-600 transition shadow-sm font-medium"
          >
            <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />{" "}
            Tải lại
          </button>
        </div>

        {/* Phần giao diện */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center">
          {/* Phần giao diện */}
          <div className="relative w-full md:w-96 group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Tìm tên, số điện thoại, email..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-0 ring-1 ring-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Phần giao diện */}
          <div className="flex p-1 bg-slate-100 rounded-xl w-full md:w-auto">
            {[
              { id: "all", label: "Tất cả" },
              { id: "assigned", label: "Chờ xử lý" },
              { id: "resolved", label: "Đã xong" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                  filterStatus === tab.id
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Phần giao diện */}
        <div className="grid grid-cols-1 gap-4">
          {loading ? (
            <div className="text-center py-12 text-slate-400">
              Đang tải dữ liệu...
            </div>
          ) : filteredContacts.length > 0 ? (
            filteredContacts.map((c) => (
              <div
                key={c.id}
                className={`bg-white rounded-2xl p-5 border transition-all hover:shadow-md ${
                  c.status === "resolved"
                    ? "border-slate-100 opacity-80"
                    : "border-blue-100 ring-1 ring-blue-50"
                }`}
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Phần giao diện */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            c.status === "resolved"
                              ? "bg-slate-100 text-slate-400"
                              : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          <User size={20} />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-lg">
                            {c.name}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                            <Clock size={12} /> Tạo lúc:{" "}
                            {new Date(
                              c.created_at || Date.now()
                            ).toLocaleDateString("vi-VN")}
                          </div>
                        </div>
                      </div>

                      {/* Phần giao diện */}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 ${
                          c.status === "resolved"
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700 animate-pulse"
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            c.status === "resolved"
                              ? "bg-green-500"
                              : "bg-orange-500"
                          }`}
                        ></span>
                        {c.status === "resolved" ? "Đã xong" : "Chờ xử lý"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      <div
                        className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded-lg group cursor-pointer hover:bg-slate-100"
                        onClick={() => copyToClipboard(c.phone)}
                      >
                        <PhoneCall size={16} className="text-slate-400" />
                        <span className="font-mono font-bold">{c.phone}</span>
                        <Copy
                          size={12}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500 ml-auto"
                        />
                      </div>
                      <div
                        className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded-lg group cursor-pointer hover:bg-slate-100"
                        onClick={() => copyToClipboard(c.email)}
                      >
                        <Mail size={16} className="text-slate-400" />
                        <span className="truncate">{c.email}</span>
                        <Copy
                          size={12}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500 ml-auto"
                        />
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="flex items-start gap-2">
                        <MessageSquare
                          size={16}
                          className="text-slate-400 mt-0.5 flex-shrink-0"
                        />
                        <p className="text-sm text-slate-700 italic">
                          "{c.message}"
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Phần giao diện */}
                  <div className="flex md:flex-col justify-end gap-3 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 min-w-[140px]">
                    {c.status !== "resolved" ? (
                      <>
                        <a
                          href={`tel:${c.phone}`}
                          className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 font-bold text-sm transition"
                        >
                          <PhoneCall size={18} /> Gọi ngay
                        </a>
                        <button
                          onClick={() => openNoteModal(c.id)}
                          className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl shadow-lg shadow-green-200 font-bold text-sm transition transform active:scale-95"
                        >
                          <CheckCircle size={18} /> Hoàn tất
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-green-600 gap-1 opacity-70">
                        <CheckCircle size={32} />
                        <span className="text-xs font-bold uppercase">
                          Đã xử lý
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                <Filter size={24} />
              </div>
              <p>Không tìm thấy liên hệ nào phù hợp.</p>
            </div>
          )}
        </div>
      </div>

      {/* Render điều kiện */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 animate-in fade-in duration-200">
          <div className="bg-white p-0 rounded-2xl shadow-2xl w-[90%] max-w-md relative overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Phần giao diện */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-5 text-white flex justify-between items-center">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <CheckCircle className="text-green-300" /> Xác nhận xử lý
              </h2>
              <button
                onClick={closeNoteModal}
                className="text-white/80 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Phần giao diện */}
            <div className="p-6">
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Ghi chú kết quả:
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                className="w-full border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 text-sm bg-slate-50 resize-none"
                placeholder="VD: Khách hàng đồng ý dời lịch giao hàng..."
                autoFocus
              ></textarea>
              <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                <Mail size={12} /> Một email xác nhận sẽ được gửi tự động cho
                khách.
              </p>
            </div>

            {/* Phần giao diện */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={closeNoteModal}
                className="px-5 py-2.5 bg-white border border-slate-300 text-slate-600 rounded-xl hover:bg-slate-100 font-bold text-sm transition"
              >
                Hủy bỏ
              </button>
              <button
                onClick={submitNote}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 font-bold text-sm transition"
              >
                Lưu & Hoàn tất
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}