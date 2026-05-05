import { useNavigate } from "react-router-dom";

export default function ServicePlans({ onCreate }) {
  const navigate = useNavigate();

  const handleCreateShipment = () => {

    if (onCreate) return onCreate();

    const role = localStorage.getItem("role");
    if (!role || role !== "customer") return navigate("/login");
    return navigate("/customer/create");
  };
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <h3 className="text-3xl font-bold text-center mb-4" data-aos="fade-up">
          📦 Chọn gói dịch vụ phù hợp
        </h3>
        <p
          className="text-center text-gray-600 mb-10"
          data-aos="fade-up"
          data-aos-delay="100"
        >
          Từ cá nhân đến doanh nghiệp – chúng tôi luôn có gói giao phù hợp.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              name: "Chuẩn",
              time: "16–72h",
              price: "Từ 15.000đ",
              perks: ["Theo dõi GPS", "COD tận nơi", "Phù hợp shop nhỏ"],
              color: "border-gray-200",
            },
            {
              name: "Nhanh",
              time: "4–12h",
              price: "Từ 35.000đ",
              perks: [
                "Ưu tiên tuyến",
                "Thông báo realtime",
                "Phù hợp sàn TMĐT",
              ],
              color: "border-blue-500 shadow-blue-100 shadow-lg",
              highlight: true,
            },
            {
              name: "Hỏa tốc",
              time: "2–4h",
              price: "Từ 65.000đ",
              perks: [
                "Tài xế chuyên trách",
                "Hỗ trợ tối đa giờ cao điểm",
                "Có bảo hiểm hàng hóa",
              ],
              color: "border-red-500",
            },
          ].map((plan, i) => (
            <div
              key={plan.name}
              className={`p-8 rounded-2xl border-2 bg-white transition hover:-translate-y-1 hover:shadow-xl ${plan.color}`}
              data-aos="zoom-in"
              data-aos-delay={i * 100}
            >
              {plan.highlight && (
                <p className="inline-block px-3 py-1 mb-4 text-xs font-semibold rounded-full bg-blue-50 text-blue-600">
                  Được chọn nhiều nhất
                </p>
              )}
              <h4 className="text-2xl font-bold mb-1">{plan.name}</h4>
              <p className="text-sm text-gray-500 mb-3">
                Thời gian dự kiến: {plan.time}
              </p>
              <p className="text-3xl font-extrabold mb-4 text-blue-600">
                {plan.price}
              </p>
              <ul className="space-y-2 text-sm text-gray-700 mb-6">
                {plan.perks.map((p) => (
                  <li key={p}>• {p}</li>
                ))}
              </ul>
              <button
                onClick={handleCreateShipment}
                className={`block w-full text-center py-3 rounded-xl font-semibold ${
                  plan.highlight
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                }`}
              >
                Tạo đơn với gói này
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
