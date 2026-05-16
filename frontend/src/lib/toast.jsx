/**
 * Custom toast wrapper — icon SVG hiện đại thay thế icon mặc định của react-hot-toast.
 * Dùng: import toast from "@/lib/toast" thay vì "react-hot-toast"
 */
import { toast as _toast } from "react-hot-toast";

// ── Icon SVG components ──────────────────────────────────────────────────────

const SuccessIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="11" r="11" fill="url(#sg)" />
    <path d="M7 11.5L9.5 14L15 8.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <defs>
      <linearGradient id="sg" x1="0" y1="0" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#4ade80" />
        <stop offset="1" stopColor="#16a34a" />
      </linearGradient>
    </defs>
  </svg>
);

const ErrorIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="11" r="11" fill="url(#er)" />
    <circle cx="11" cy="11" r="7.5" stroke="white" strokeWidth="1.8" strokeOpacity="0.4" />
    <path d="M8.5 8.5L13.5 13.5M13.5 8.5L8.5 13.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
    <defs>
      <linearGradient id="er" x1="0" y1="0" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#f87171" />
        <stop offset="1" stopColor="#dc2626" />
      </linearGradient>
    </defs>
  </svg>
);

const WarningIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="11" r="11" fill="url(#wn)" />
    <path d="M11 6L16.5 17H5.5L11 6Z" stroke="white" strokeWidth="1.8" strokeLinejoin="round" strokeOpacity="0.6" />
    <path d="M11 9.5V13" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
    <circle cx="11" cy="15" r="0.9" fill="white" />
    <defs>
      <linearGradient id="wn" x1="0" y1="0" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#fbbf24" />
        <stop offset="1" stopColor="#d97706" />
      </linearGradient>
    </defs>
  </svg>
);

const InfoIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="11" r="11" fill="url(#in)" />
    <circle cx="11" cy="11" r="7.5" stroke="white" strokeWidth="1.8" strokeOpacity="0.4" />
    <path d="M11 10V15" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
    <circle cx="11" cy="7.5" r="1" fill="white" />
    <defs>
      <linearGradient id="in" x1="0" y1="0" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#818cf8" />
        <stop offset="1" stopColor="#4f46e5" />
      </linearGradient>
    </defs>
  </svg>
);

const LoadingIcon = () => (
  <svg
    width="22" height="22" viewBox="0 0 22 22" fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ animation: "toast-spin 0.8s linear infinite" }}
  >
    <circle cx="11" cy="11" r="9" stroke="#dbeafe" strokeWidth="2.5" />
    <path d="M11 2a9 9 0 0 1 9 9" stroke="url(#ld)" strokeWidth="2.5" strokeLinecap="round" />
    <defs>
      <linearGradient id="ld" x1="11" y1="2" x2="20" y2="11" gradientUnits="userSpaceOnUse">
        <stop stopColor="#60a5fa" />
        <stop offset="1" stopColor="#2563eb" />
      </linearGradient>
    </defs>
  </svg>
);

// ── Style presets ────────────────────────────────────────────────────────────

const baseStyle = {
  borderRadius: "14px",
  padding: "13px 16px",
  fontSize: "14px",
  fontWeight: "500",
  fontFamily: "Inter, system-ui, sans-serif",
  maxWidth: "400px",
  boxShadow: "0 8px 24px -4px rgba(0,0,0,0.12), 0 2px 8px -2px rgba(0,0,0,0.06)",
  border: "1px solid",
  lineHeight: "1.5",
};

const styles = {
  success: { ...baseStyle, background: "#f0fdf4", color: "#14532d", borderColor: "#bbf7d0" },
  error:   { ...baseStyle, background: "#fef2f2", color: "#7f1d1d", borderColor: "#fecaca" },
  warning: { ...baseStyle, background: "#fffbeb", color: "#78350f", borderColor: "#fde68a" },
  info:    { ...baseStyle, background: "#eef2ff", color: "#312e81", borderColor: "#c7d2fe" },
  loading: { ...baseStyle, background: "#eff6ff", color: "#1e3a8a", borderColor: "#bfdbfe" },
  blank:   { ...baseStyle, background: "#ffffff", color: "#1e293b", borderColor: "#e2e8f0" },
};

// ── Wrapper functions ────────────────────────────────────────────────────────

const toast = Object.assign(
  (msg, opts) => _toast(msg, { icon: <InfoIcon />, style: styles.blank, ...opts }),
  {
    success: (msg, opts) =>
      _toast.success(msg, { icon: <SuccessIcon />, style: styles.success, duration: 3500, ...opts }),

    error: (msg, opts) =>
      _toast.error(msg, { icon: <ErrorIcon />, style: styles.error, duration: 5000, ...opts }),

    warning: (msg, opts) =>
      _toast(msg, { icon: <WarningIcon />, style: styles.warning, duration: 4000, ...opts }),

    info: (msg, opts) =>
      _toast(msg, { icon: <InfoIcon />, style: styles.info, duration: 4000, ...opts }),

    loading: (msg, opts) =>
      _toast.loading(msg, { icon: <LoadingIcon />, style: styles.loading, ...opts }),

    promise: _toast.promise,
    dismiss:  _toast.dismiss,
    remove:   _toast.remove,
    custom:   _toast.custom,
  }
);

export default toast;
