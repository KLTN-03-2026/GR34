import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

// --- ICONS ---
const Icons = {
  Box: () => (
    <svg
      className="w-8 h-8 text-orange-500 text-xl"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
  ),
  Target: () => (
    <svg
      className="w-8 h-8 text-orange-400 mb-3"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
      />
    </svg>
  ),
  Vision: () => (
    <svg
      className="w-6 h-6 text-white"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  ),
  Check: () => (
    <svg
      className="w-5 h-5 text-teal-600 mr-2"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={3}
        d="M5 13l4 4L19 7"
      />
    </svg>
  ),
  ArrowRight: () => (
    <svg
      className="w-4 h-4 ml-2"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M14 5l7 7m0 0l-7 7m7-7H3"
      />
    </svg>
  ),
};

export default function AboutSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section className="py-16 md:py-24 bg-white overflow-hidden relative">
      {/* Background Map */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <img
          src="https://img.freepik.com/free-vector/world-map-background-template_1017-31327.jpg"
          alt="World Map"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Background decoration */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 left-0 w-64 h-64 bg-orange-50 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 opacity-50"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* ===== LEFT COLUMN: IMAGES ===== */}
          <div className="relative">
            {/* Main Image */}
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border-4 border-white"
            >
              <img
                src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Logistics Warehouse"
                className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700"
              />
            </motion.div>

            {/* Secondary Image */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="absolute -bottom-10 -left-10 w-2/3 rounded-2xl overflow-hidden shadow-xl border-4 border-white z-20 hidden md:block"
            >
              <motion.img
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
                alt="Delivery Truck"
                className="w-full h-auto object-cover"
              />
            </motion.div>

            {/* BADGE */}
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.6,
              }}
              className="absolute -top-6 -right-6 md:right-10 bg-orange-500 text-white py-6 px-3 rounded-full shadow-lg z-30 flex flex-col items-center justify-center text-center"
            >
              <span className="text-3xl md:text-4xl font-extrabold leading-none">
                10+
              </span>
              {/* Sửa 'writing-mode-vertical' thành 'vertical-rl' chuẩn Tailwind */}
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest mt-1 opacity-90 vertical-rl">
                Năm kinh nghiệm
              </span>
            </motion.div>

            {/* Shape decoration */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.1 }}
              transition={{ duration: 1 }}
              className="absolute -bottom-12 -right-12 text-teal-900 z-0"
            >
              <svg
                width="150"
                height="150"
                viewBox="0 0 200 200"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="currentColor"
                  d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.1,-19.2,95.8,-5.3C93.5,8.6,82.2,21.5,70.6,32.3C59,43.1,47.1,51.8,34.8,58.3C22.5,64.8,9.8,69.1,-1.8,72.2C-13.4,75.3,-23.9,77.2,-34.2,72.3C-44.5,67.4,-54.6,55.7,-64.1,43.2C-73.6,30.7,-82.5,17.4,-82.8,4.1C-83.1,-9.2,-74.8,-22.5,-64.5,-33.4C-54.2,-44.3,-41.9,-52.8,-29.7,-61.2C-17.5,-69.6,-5.4,-77.9,8.2,-92.1L44.7,-76.4Z"
                  transform="translate(100 100)"
                />
              </svg>
            </motion.div>
          </div>

          {/* ===== RIGHT COLUMN: CONTENT ===== */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="pl-0 lg:pl-6"
          >
            {/* Tag */}
            <motion.div
              variants={itemVariants}
              className="inline-flex font-bold text-xl uppercase tracking-wider items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 text-orange-500 mb-4 border border-orange-200"
            >
              <Icons.Box /> Giới thiệu
            </motion.div>

            {/* Heading */}
            <motion.h2
              variants={itemVariants}
              className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-6 leading-tight"
            >
              VỀ CHÚNG TÔI
            </motion.h2>

            {/* Description */}
            <motion.p
              variants={itemVariants}
              className="text-slate-600 mb-8 leading-relaxed"
            >
              Chúng tôi là một đội ngũ chuyên nghiệp trong lĩnh vực logistic,
              cam kết mang đến cho bạn những giải pháp vận chuyển toàn diện và
              hiệu quả. Với nền tảng kỹ thuật tiên tiến và đội ngũ nhân viên
              giàu kinh nghiệm, chúng tôi tự tin rằng sẽ đáp ứng tất cả các nhu
              cầu vận chuyển của bạn.
            </motion.p>

            {/* Feature Boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              {/* Box 1 */}
              <motion.div
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="bg-[#1a4a5a] text-white p-6 rounded-xl shadow-lg relative overflow-hidden group cursor-default"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-125 duration-500">
                  <Icons.Target />
                </div>
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                  Mục tiêu
                </h3>
                <p className="text-sm text-gray-300">
                  Cung cấp dịch vụ logistics chất lượng cao, tối ưu hóa chi phí
                  cho khách hàng.
                </p>
              </motion.div>

              {/* Box 2 */}
              <motion.div
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="bg-white border border-gray-100 p-6 rounded-xl shadow-md hover:shadow-lg transition-all cursor-default"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center shadow-lg">
                    <Icons.Vision />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">Tầm nhìn</h3>
                </div>
                <p className="text-sm text-slate-600">
                  Trở thành một đối tác logistics hàng đầu, tin cậy nhất thị
                  trường.
                </p>
              </motion.div>
            </div>

            {/* Check list */}
            <ul className="space-y-3 mb-8">
              <motion.li
                variants={itemVariants}
                className="flex items-center text-slate-700 font-medium"
              >
                <span className="bg-teal-50 rounded-full p-1 mr-3">
                  <Icons.Check />
                </span>
                Vận chuyển nhanh chóng, an toàn
              </motion.li>
              <motion.li
                variants={itemVariants}
                className="flex items-center text-slate-700 font-medium"
              >
                <span className="bg-teal-50 rounded-full p-1 mr-3">
                  <Icons.Check />
                </span>
                Bảo mật thông tin tuyệt đối
              </motion.li>
            </ul>

            {/* Button */}
            <motion.div variants={itemVariants}>
              <Link to="/about">
                <button className="relative overflow-hidden group bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-orange-500/30 transition-all flex items-center">
                  <span className="relative z-10 flex items-center">
                    XEM THÊM <Icons.ArrowRight />
                  </span>
                  {/* Hiệu ứng lướt sáng */}
                  <div className="absolute top-0 -left-[100%] w-full h-full bg-white/20 skew-x-[45deg] group-hover:left-[100%] transition-all duration-700 ease-in-out"></div>
                </button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
