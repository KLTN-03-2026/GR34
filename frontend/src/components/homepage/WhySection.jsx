export default function WhySection() {
  const items = [
    { value: "2–4h", label: "Giao nội thành hỏa tốc" },
    { value: "12–36h", label: "Liên tỉnh Bắc–Nam" },
    { value: "98.7%", label: "Đơn giao đúng hẹn" },
    { value: "24/7", label: "Theo dõi & hỗ trợ" },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <h3 className="text-3xl font-bold text-center mb-10" data-aos="fade-up">
          Tại sao nên chọn <span className="text-blue-600">SpeedyShip?</span>
        </h3>

        <div className="grid md:grid-cols-4 gap-6">
          {[
            {
              value: "2–4h",
              label: "Giao nội thành hỏa tốc",
            },
            {
              value: "12–36h",
              label: "Liên tỉnh Bắc–Nam",
            },
            {
              value: "98.7%",
              label: "Đơn giao đúng hẹn",
            },
            {
              value: "24/7",
              label: "Theo dõi & hỗ trợ",
            },
          ].map((item, i) => (
            <div
              key={item.label}
              className="bg-white rounded-2xl shadow-sm p-6 text-center"
              data-aos="zoom-in"
              data-aos-delay={i * 80}
            >
              <p className="text-3xl font-extrabold text-blue-600 mb-2">
                {item.value}
              </p>
              <p className="text-sm text-gray-600">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
