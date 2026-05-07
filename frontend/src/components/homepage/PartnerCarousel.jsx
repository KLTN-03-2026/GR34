import React from "react";
import { motion } from "framer-motion";

const partners = [
  {
    name: "Shopee",
    src: "/assets/logo/shopee-com-logo.png",
  },
  {
    name: "Lazada",
    src: "/assets/logo/lazada-sg-logo.png",
  },
  {
    name: "TikTok",
    src: "/assets/logo/tiktok-com-logo.png",
  },
  {
    name: "Amazon",
    src: "/assets/logo/amazonaws-com-logo.png",
  },
  {
    name: "H&M",
    src: "/assets/logo/hm-com-logo.png",
  },
  {
    name: "Puma",
    src: "/assets/logo/puma-com-logo.png",
  },
  {
    name: "Samsung",
    src: "/assets/logo/samsung-com-logo.png",
  },
  {
    name: "Apple",
    src: "/assets/logo/apple-com-logo.png",
  },
  {
    name: "Oppo",
    src: "/assets/logo/oppo-com-logo.png",
  },
  {
    name: "Vivo",
    src: "/assets/logo/vivo-com-logo.png",
  },
  {
    name: "Red Bull",
    src: "/assets/logo/redbull-com-logo.png",
  },
];

export default function PartnerCarousel({
  className = "",
  logoSize = "w-16 h-16",
}) {
  return (
    <div
      className={`w-full overflow-hidden select-none border-t border-gray-100 ${className}`}
    >
      <p className="text-[10px] font-bold text-gray-400 text-center uppercase tracking-widest mb-4 pt-4">
        Đối tác tin cậy
      </p>

      {/* Phần giao diện */}
      <div className="relative w-full overflow-hidden">
        {/* Phần giao diện */}
        <div className="absolute top-0 left-0 w-8 h-full bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-8 h-full bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

        <div className="flex">
          <motion.div
            className="flex items-center gap-6 pr-6 w-max"
            animate={{ x: "-50%" }}
            transition={{
              duration: 25,
              ease: "linear",
              repeat: Infinity,
            }}
          >
            {/* Danh sách render động */}
            {[...partners, ...partners, ...partners].map((logo, index) => (
              <div
                key={index}
                className={`${logoSize} flex justify-center items-center cursor-pointer group transition-all`}
              >
                <img
                  src={logo.src}
                  alt={logo.name}
                  className="max-w-full max-h-full object-contain grayscale opacity-40 transition-all duration-300 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 rounded-md bg-white p-1 shadow-md hover:shadow-lg"
                />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
