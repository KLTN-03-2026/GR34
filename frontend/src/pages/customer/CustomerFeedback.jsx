import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import API from "../../services/api";
import toast from "react-hot-toast";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  Star,
  Send,
  ArrowLeft,
  MessageSquare,
  Package,
  ThumbsUp,
} from "lucide-react";

export default function CustomerFeedback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const shipmentId = params.get("shipment_id");
  const customerId =
    localStorage.getItem("customer_id") || localStorage.getItem("userId");

  // State
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0); // State để xử lý hiệu ứng hover sao
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 500, easing: "ease-out-cubic", once: true });
    if (!shipmentId) {
      toast.error("Không tìm thấy mã đơn hàng!");
      navigate("/customer/history");
    }
  }, [shipmentId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error("Vui lòng nhập nội dung đánh giá!");
      return;
    }

    setLoading(true);
    try {
      await API.post("/feedbacks", {
        customer_id: Number(customerId),
        shipment_id: Number(shipmentId),
        content: content.trim(),
        rating: Number(rating),
      });

      toast.success("🎉 Cảm ơn bạn đã đánh giá!");
      // Chờ xíu rồi chuyển trang
      setTimeout(() => navigate("/customer/history"), 1500);
    } catch (err) {
      console.error(err);
      toast.error("❌ Lỗi khi gửi đánh giá, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  // Mảng text hiển thị theo số sao
  const ratingLabels = {
    1: "Rất tệ",
    2: "Không hài lòng",
    3: "Bình thường",
    4: "Hài lòng",
    5: "Tuyệt vời",
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 font-sans">
      <div
        className="bg-white w-full max-w-lg rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative"
        data-aos="zoom-in"
      >
        {/* Background Decor */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 to-orange-600"></div>

        <div className="p-8">
          {/* Header */}
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-[#113e48] flex items-center gap-1 text-sm font-bold mb-6 transition-colors"
          >
            <ArrowLeft size={16} /> Quay lại
          </button>

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
              <MessageSquare size={32} />
            </div>
            <h2 className="text-2xl font-extrabold text-[#113e48]">
              Đánh giá dịch vụ
            </h2>
            <div className="flex items-center justify-center gap-2 mt-2 text-sm text-gray-500 bg-gray-50 py-1 px-3 rounded-full w-fit mx-auto">
              <Package size={14} />
              Đơn hàng:{" "}
              <span className="font-mono font-bold text-[#113e48]">
                #{shipmentId}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Star Rating */}
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wide">
                Mức độ hài lòng
              </p>

              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="transition-transform hover:scale-110 focus:outline-none"
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(star)}
                  >
                    <Star
                      size={36}
                      className={`transition-colors duration-200 ${
                        star <= (hover || rating)
                          ? "fill-orange-400 text-orange-400 drop-shadow-md"
                          : "text-gray-200"
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Rating Label Animation */}
              <div className="h-6 mt-1">
                <span
                  className={`text-sm font-bold px-3 py-1 rounded-full transition-all duration-300 ${
                    (hover || rating) >= 4
                      ? "bg-green-100 text-green-700"
                      : (hover || rating) === 3
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                  }`}
                >
                  {ratingLabels[hover || rating]}
                </span>
              </div>
            </div>

            {/* 2. Text Area */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#113e48] ml-1">
                Nhận xét của bạn
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Hãy chia sẻ trải nghiệm của bạn về tốc độ giao hàng, thái độ tài xế..."
                className="w-full p-4 border border-gray-200 rounded-2xl bg-gray-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm min-h-[120px] resize-none"
                required
              />
            </div>

            {/* 3. Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all transform hover:-translate-y-1
                        ${
                          loading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-[#113e48] hover:bg-[#0d2f36] shadow-blue-900/20"
                        }`}
            >
              {loading ? (
                "Đang gửi..."
              ) : (
                <>
                  <Send size={18} /> Gửi đánh giá
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer decoration */}
        <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
          <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
            <ThumbsUp size={12} /> Ý kiến của bạn giúp SpeedyShip tốt hơn mỗi
            ngày!
          </p>
        </div>
      </div>
    </div>
  );
}
