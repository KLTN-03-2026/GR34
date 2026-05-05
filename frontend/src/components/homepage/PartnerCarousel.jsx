import React from "react";
import { motion } from "framer-motion";


const partners = [
  {
    name: "Shopee",
    src: "https://upload.wikimedia.org/wikipedia/commons/f/fe/Shopee.svg",
  },
  {
    name: "Lazada",
    src: "https://upload.wikimedia.org/wikipedia/commons/4/4d/Lazada_%282019%29.svg",
  },
  {
    name: "TikTok",
    src: "https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg",
  },
  {
    name: "Amazon",
    src: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
  },
  {
    name: "Nike",
    src: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg",
  },
  {
    name: "Adidas",
    src: "https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg",
  },
  {
    name: "Samsung",
    src: "https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg",
  },
  {
    name: "Apple",
    src: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
  },
];


export default function PartnerCarousel({
  className = "",
  logoSize = "w-14 h-8",
}) {
  return (
    <div
      className={`w-full overflow-hidden select-none border-t border-gray-100 ${className}`}
    >
      <p className="text-[10px] font-bold text-gray-400 text-center uppercase tracking-widest mb-4 pt-4">
        Đối tác tin cậy
      </p>

      {}
      <div className="relative w-full overflow-hidden">
        {}
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
            {}
            {[...partners, ...partners, ...partners].map((logo, index) => (
              <div
                key={index}
                className={`${logoSize} flex justify-center items-center cursor-pointer group transition-all`}
              >
                <img
                  src={logo.src}
                  alt={logo.name}
                  className="max-w-full max-h-full object-contain grayscale opacity-40 transition-all duration-300 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110"
                />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
