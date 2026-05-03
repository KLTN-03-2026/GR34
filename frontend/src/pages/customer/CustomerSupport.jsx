import { useState } from "react";
import {
  Headphones,
  MessageSquarePlus,
  FileText,
  ChevronDown,
  Send,
} from "lucide-react";

export default function CustomerSupport() {
  const [activeTab, setActiveTab] = useState("new"); // new | history | faq

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 rounded-2xl text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Headphones /> Trung tâm hỗ trợ
          </h1>
          <p className="text-blue-100 text-sm max-w-lg">
            Chúng tôi luôn sẵn sàng lắng nghe và giải quyết mọi vấn đề của bạn
            24/7.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-20">
          <Headphones size={120} />
        </div>
      </div>

      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("new")}
          className={`pb-3 px-2 text-sm font-bold transition-all border-b-2 ${
            activeTab === "new"
              ? "border-orange-500 text-orange-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Gửi yêu cầu mới
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`pb-3 px-2 text-sm font-bold transition-all border-b-2 ${
            activeTab === "history"
              ? "border-orange-500 text-orange-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Lịch sử hỗ trợ
        </button>
        <button
          onClick={() => setActiveTab("faq")}
          className={`pb-3 px-2 text-sm font-bold transition-all border-b-2 ${
            activeTab === "faq"
              ? "border-orange-500 text-orange-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Câu hỏi thường gặp
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[400px]">
        {activeTab === "new" && (
          <div className="max-w-2xl mx-auto space-y-5">
            <h3 className="text-lg font-bold text-[#113e48] mb-4 text-center">
              Bạn đang gặp vấn đề gì?
            </h3>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">
                Chủ đề cần hỗ trợ
              </label>
              <select className="w-full p-3 border rounded-xl bg-gray-50 outline-none focus:border-blue-500">
                <option>Vấn đề về đơn hàng / Vận chuyển</option>
                <option>Vấn đề về thanh toán / Ví</option>
                <option>Tài khoản & Đăng nhập</option>
                <option>Khiếu nại thái độ nhân viên</option>
                <option>Khác</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">
                Mã vận đơn (Nếu có)
              </label>
              <input
                placeholder="VD: GHN123456"
                className="w-full p-3 border rounded-xl bg-gray-50 outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">
                Chi tiết vấn đề
              </label>
              <textarea
                rows={5}
                placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải..."
                className="w-full p-3 border rounded-xl bg-gray-50 outline-none focus:border-blue-500"
              />
            </div>

            <button className="w-full bg-[#113e48] hover:bg-[#0d2f36] text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all">
              <Send size={18} /> Gửi yêu cầu
            </button>
          </div>
        )}

        {activeTab === "history" && (
          <div className="text-center py-10">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-500">Bạn chưa gửi yêu cầu hỗ trợ nào.</p>
          </div>
        )}

        {activeTab === "faq" && (
          <div className="space-y-3">
            {[
              "Làm thế nào để tạo đơn hàng mới?",
              "Quy định về hàng hóa cấm vận chuyển?",
              "Thời gian giao hàng dự kiến là bao lâu?",
              "Tôi có thể thay đổi địa chỉ nhận hàng sau khi gửi không?",
            ].map((q, i) => (
              <div
                key={i}
                className="border border-gray-200 rounded-xl p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                <span className="font-medium text-[#113e48]">{q}</span>
                <ChevronDown size={16} className="text-gray-400" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
