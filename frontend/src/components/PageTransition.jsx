import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

// Các biến thể chuyển động cho hiệu ứng chuyển trang - mờ dần đơn giản
const pageVariants = {
  initial: { opacity: 0 },
  enter: {
    opacity: 1,
    transition: { duration: 0.25, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

// Bộ bao cho hiệu ứng chuyển trang
export function PageTransition({ children }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="enter"
        exit="exit"
        className="w-full min-h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
