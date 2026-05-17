import React, { useState } from "react";
import { motion } from "framer-motion";

const PARTNER_LOGOS = [
  { name: "Shopee",    src: "/assets/logo/shopee-com-logo.png" },
  { name: "Lazada",    src: "/assets/logo/lazada-sg-logo.png" },
  { name: "TikTok",    src: "/assets/logo/tiktok-com-logo.png" },
  { name: "Amazon",    src: "/assets/logo/amazonaws-com-logo.png" },
  { name: "H&M",       src: "/assets/logo/hm-com-logo.png" },
  { name: "Puma",      src: "/assets/logo/puma-com-logo.png" },
  { name: "Samsung",    src: "/assets/logo/samsung-com-logo.png" },
  { name: "Apple",     src: "/assets/logo/apple-com-logo.png" },
  { name: "Oppo",      src: "/assets/logo/oppo-com-logo.png" },
  { name: "Vivo",      src: "/assets/logo/vivo-com-logo.png" },
  { name: "Red Bull",  src: "/assets/logo/redbull-com-logo.png" },
];

export default function PartnerCarousel({
  className = "",
  logoSize = "w-16 h-16",
}) {
  const [failedLogos, setFailedLogos] = useState({});

  const handleLogoError = (name) => {
    setFailedLogos((prev) => ({ ...prev, [name]: true }));
  };

  const partners = PARTNER_LOGOS.map((p) => ({
    ...p,
    valid: !failedLogos[p.name],
  }));

  // Luôn render 3 lần để lấp đầy hiệu ứng cuộn vô hạn
  const items = [...partners, ...partners, ...partners];

  return (
    <div className={`w-full overflow-hidden select-none bg-white ${className}`}>
      <p className="text-[10px] font-bold text-gray-400 text-center uppercase tracking-widest mb-4 pt-4">
        Đối tác tin cậy
      </p>
      <div className="relative w-full overflow-hidden">
        <div className="absolute top-0 left-0 w-8 h-full bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-8 h-full bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
        <div className="flex">
          <motion.div
            className="flex items-center gap-6 pr-6 w-max"
            animate={{ x: "-33.333%" }}
            transition={{ duration: 22, ease: "linear", repeat: Infinity }}
          >
            {items.map((logo, index) => (
              <div
                key={index}
                className={`${logoSize} flex justify-center items-center cursor-pointer group transition-all`}
              >
                {logo.valid ? (
                  <img
                    src={logo.src}
                    alt={logo.name}
                    onError={() => handleLogoError(logo.name)}
                    className="max-w-full max-h-full object-contain grayscale opacity-40 transition-all duration-300 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 rounded-md bg-white p-1 shadow-md hover:shadow-lg"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-md text-xs font-bold text-gray-400 group-hover:text-gray-600 transition-colors">
                    {logo.name}
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
