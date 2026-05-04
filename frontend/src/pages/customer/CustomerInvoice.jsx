import { useEffect, useState, useRef } from "react";
import API from "../../services/api";
import Pagination from "../../components/Pagination";
import toast, { Toaster } from "react-hot-toast";
import AOS from "aos";
import "aos/dist/aos.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import JsBarcode from "jsbarcode";
import {
  FileText,
  Download,
  Search,
  Filter,
  Eye,
  Loader2,
  Phone,
  Package,
  PackageOpen,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Ban,
  Receipt,
  ChevronDown,
  ClipboardList,
  AlertTriangle,
} from "lucide-react";

const STATUS_OPTIONS = [
  {
    value: "all",
    label: "Tất cả",
    icon: Filter,
    color: "text-gray-500",
    bg: "bg-gray-100",
  },
  {
    value: "pending",
    label: "Chờ xử lý",
    icon: Clock,
    color: "text-yellow-600",
    bg: "bg-yellow-100",
  },
  {
    value: "assigned",
    label: "Đã phân công",
    icon: ClipboardList,
    color: "text-gray-600",
    bg: "bg-gray-100",
  },
  {
    value: "picking",
    label: "Đang lấy hàng",
    icon: PackageOpen,
    color: "text-orange-600",
    bg: "bg-orange-100",
  },
  {
    value: "delivering",
    label: "Đang giao hàng",
    icon: Truck,
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  {
    value: "delivered",
    label: "Đã giao",
    icon: Package,
    color: "text-green-600",
    bg: "bg-green-100",
  },
  {
    value: "completed",
    label: "Hoàn thành",
    icon: CheckCircle,
    color: "text-green-600",
    bg: "bg-green-100",
  },
  {
    value: "failed",
    label: "Giao thất bại",
    icon: AlertTriangle,
    color: "text-red-600",
    bg: "bg-red-100",
  },
  {
    value: "canceled",
    label: "Đã hủy",
    icon: Ban,
    color: "text-gray-500",
    bg: "bg-gray-100",
  },
];

function StatusFilterDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected =
    STATUS_OPTIONS.find((o) => o.value === value) || STATUS_OPTIONS[0];
  const SelectedIcon = selected.icon;

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 rounded-xl bg-white hover:border-orange-400 hover:ring-2 hover:ring-orange-500/10 transition-all text-sm font-medium text-gray-700 min-w-[160px] justify-between shadow-sm"
      >
        <div className="flex items-center gap-2">
          <span className={`p-1 rounded-lg ${selected.bg} ${selected.color}`}>
            <SelectedIcon size={13} />
          </span>
          <span>{selected.label}</span>
        </div>
        <ChevronDown
          size={14}
          className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl z-[120] overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-150">
          {STATUS_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isActive = opt.value === value;
            return (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-orange-50 ${isActive ? "bg-orange-50/60 font-semibold" : ""}`}
              >
                <span
                  className={`p-1.5 rounded-lg ${opt.bg} ${opt.color} flex-shrink-0`}
                >
                  <Icon size={13} />
                </span>
                <span
                  className={isActive ? "text-orange-700" : "text-gray-700"}
                >
                  {opt.label}
                </span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Xuất phiếu giao hàng PDF
export default function CustomerInvoice() {
  const [shipments, setShipments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);
  const [previewData, setPreviewData] = useState(null);

  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  const customerId =
    localStorage.getItem("customer_id") || localStorage.getItem("userId");
  const username = localStorage.getItem("username") || "Khách hàng";

  useEffect(() => {
    AOS.init({ duration: 500, easing: "ease-out-cubic", once: true });
    if (!customerId) return;

    setLoading(true);
    API.get(`/customers/shipments/${customerId}`)
      .then((res) => {
        setShipments(res.data);
        setFiltered(res.data);
      })
      .catch(() => toast.error("Không thể tải danh sách đơn hàng!"))
      .finally(() => setLoading(false));
  }, [customerId]);

  useEffect(() => {
    let result = shipments;
    if (filterStatus !== "all") {
      result = result.filter((s) => s.status === filterStatus);
    }
    if (search) {
      const keyword = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.tracking_code?.toLowerCase().includes(keyword) ||
          s.receiver_name?.toLowerCase().includes(keyword),
      );
    }
    setFiltered(result);
    setPage(1);
  }, [filterStatus, search, shipments]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const currentItems = filtered.slice(startIndex, startIndex + itemsPerPage);

  // Định dạng số tiền theo chuẩn Việt Nam
  const fmt = (num) => Number(num || 0).toLocaleString("vi-VN");

  // Lấy nhãn tên trạng thái tiếng Việt
  const getStatusLabel = (status) => {
    const map = {
      pending: "Chờ xử lý",
      assigned: "Đã phân công",
      picking: "Đang lấy hàng",
      delivering: "Đang giao",
      delivered: "Đã giao",
      completed: "Hoàn thành",
      failed: "Giao thất bại",
      canceled: "Đã hủy",
      express: "Hỏa tốc",
      standard: "Thường",
      fast: "Hỏa tốc",
      normal: "Thường",
    };
    return map[status] || status;
  };

  const getPaymentMethodLabel = (method) => {
    const key = String(method || "COD")
      .trim()
      .toUpperCase();
    const map = {
      COD: "Thu hộ khi giao (COD)",
      CASH: "Tiền mặt",
      WALLET: "Ví trong hệ thống",
      MOMO: "Ví MoMo",
      VNPAY: "VNPay",
      ZALOPAY: "ZaloPay",
      BANK_TRANSFER: "Chuyển khoản ngân hàng",
      CARD: "Thẻ ngân hàng",
      PP_PM: "Đã thanh toán trước",
      PAID: "Đã thanh toán",
    };
    if (map[key]) return map[key];
    if (!method) return map.COD;
    return method;
  };

  const getImageFitSizeMM = (dataUrl, maxW, maxH) =>
    new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const iw = img.naturalWidth || 1;
        const ih = img.naturalHeight || 1;
        const scale = Math.min(maxW / iw, maxH / ih);
        resolve({ w: iw * scale, h: ih * scale });
      };
      img.onerror = () => resolve({ w: maxW, h: maxH * 0.35 });
      img.src = dataUrl;
    });

  // Tạo badge hiển thị trạng thái
  const getStatusBadge = (status) => {
    const config = {
      pending: {
        color: "bg-yellow-100 text-yellow-700 border-yellow-200",
        icon: <Clock size={12} />,
      },
      assigned: {
        color: "bg-gray-100 text-gray-600 border-gray-200",
        icon: <Package size={12} />,
      },
      picking: {
        color: "bg-orange-100 text-orange-700 border-orange-200",
        icon: <Package size={12} />,
      },
      delivering: {
        color: "bg-blue-100 text-blue-700 border-blue-200",
        icon: <Truck size={12} />,
      },
      delivered: {
        color: "bg-green-100 text-green-700 border-green-200",
        icon: <CheckCircle size={12} />,
      },
      completed: {
        color: "bg-green-100 text-green-700 border-green-200",
        icon: <CheckCircle size={12} />,
      },
      failed: {
        color: "bg-red-100 text-red-700 border-red-200",
        icon: <XCircle size={12} />,
      },
      canceled: {
        color: "bg-gray-100 text-gray-600 border-gray-200",
        icon: <XCircle size={12} />,
      },
    };
    const s = config[status] || {
      color: "bg-gray-100 text-gray-600",
      icon: null,
    };
    return (
      <span
        className={`inline-flex items-center justify-center min-w-[130px] gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold border whitespace-nowrap ${s.color}`}
      >
        {s.icon} {getStatusLabel(status)}
      </span>
    );
  };

  // Tải font tiếng Việt cho PDF
  const loadVietnameseFont = async (doc) => {
    const toBase64 = (buffer) => {
      const bytes = new Uint8Array(buffer);
      let binary = "";
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    };

    const resRegular = await fetch("/fonts/Roboto-Regular.ttf");
    const bufRegular = await resRegular.arrayBuffer();
    doc.addFileToVFS("Roboto-Regular.ttf", toBase64(bufRegular));
    doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");

    const resBold = await fetch("/fonts/Roboto-Bold.ttf");
    const bufBold = await resBold.arrayBuffer();
    doc.addFileToVFS("Roboto-Bold.ttf", toBase64(bufBold));
    doc.addFont("Roboto-Bold.ttf", "Roboto", "bold");
  };

  // Tạo ảnh mã vạch từ mã vận đơn để chèn vào PDF
  const generateBarcodeDataURL = (value, compact = false) => {
    const canvas = document.createElement("canvas");
    JsBarcode(canvas, String(value || "UNKNOWN"), {
      format: "CODE128",
      width: compact ? 1.35 : 2,
      height: compact ? 38 : 48,
      displayValue: true,
      fontSize: compact ? 9 : 11,
      textMargin: 2,
      margin: 2,
      background: "#ffffff",
      lineColor: "#111827",
    });
    return canvas.toDataURL("image/png");
  };

  const loadLogoDataURL = async () => {
    try {
      const base = typeof window !== "undefined" ? window.location.origin : "";
      const res = await fetch(`${base}/assets/logo/logoSpeedyShip.png`);
      if (!res.ok) return null;
      const blob = await res.blob();
      return await new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result);
        r.onerror = reject;
        r.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  };

  /** PNG có nền ô bàn cờ “giả trong suốt” gắn sẵn → gần xám trung tính → đổi thành trắng (không thay PNG gốc). */
  const scrubLogoCheckerboardBackground = (dataUrl) =>
    new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        if (!w || !h) {
          resolve(dataUrl);
          return;
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, w, h);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i];
          const g = d[i + 1];
          const b = d[i + 2];
          const spread = Math.max(r, g, b) - Math.min(r, g);
          const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          const checkerLike = spread < 38 && lum >= 100 && lum <= 246;
          const warmSkinTint = r > b + 22 && r > g - 8;
          if (checkerLike && !warmSkinTint) {
            d[i] = 255;
            d[i + 1] = 255;
            d[i + 2] = 255;
            d[i + 3] = 255;
          }
        }
        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });

  const BORDER = [17, 62, 72];
  const BORDER_W = 0.35;

  const strokeFrame = (doc, x, y, w, h) => {
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(BORDER_W);
    doc.rect(x, y, w, h, "S");
  };

  // Tạo và xuất file PDF phiếu giao hàng (khung đầy đủ + logo SpeedyShip)
  const generatePDF = async (shipment) => {
    setDownloading(shipment.id);

    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 12;
      const innerW = pageWidth - margin * 2;
      const rawLogo = await loadLogoDataURL();
      const logoDataUrl = rawLogo
        ? await scrubLogoCheckerboardBackground(rawLogo)
        : null;

      await loadVietnameseFont(doc);
      doc.setFont("Roboto", "normal");

      let y = margin;
      const contentTop = y;

      const sideColW = 52;
      const centerColW = innerW - sideColW * 2;
      const headerH = 40;
      const leftX = margin;
      const centerX = margin + sideColW;
      const rightX = margin + sideColW + centerColW;

      strokeFrame(doc, margin, y, innerW, headerH);
      doc.setFillColor(255, 255, 255);
      doc.rect(leftX, y, sideColW, headerH, "F");
      doc.setFillColor(235, 238, 239);
      doc.rect(centerX, y, centerColW, headerH, "F");
      doc.setFillColor(255, 255, 255);
      doc.rect(rightX, y, sideColW, headerH, "F");
      doc.setDrawColor(...BORDER);
      doc.setLineWidth(BORDER_W);
      doc.rect(margin, y, innerW, headerH, "S");
      doc.line(centerX, y, centerX, y + headerH);
      doc.line(rightX, y, rightX, y + headerH);

      const midCx = centerX + centerColW / 2;
      doc.setTextColor(17, 62, 72);
      doc.setFont("Roboto", "bold");
      doc.setFontSize(12.5);
      doc.text("PHIẾU GIAO HÀNG", midCx, y + 12, { align: "center" });
      doc.setFont("Roboto", "normal");
      doc.setFontSize(9);
      doc.setTextColor(45, 45, 45);
      doc.text(`Mã đơn: ${shipment.tracking_code}`, midCx, y + 20, {
        align: "center",
      });
      doc.text(
        `Ngày tạo: ${new Date(shipment.created_at).toLocaleDateString("vi-VN")}`,
        midCx,
        y + 26,
        { align: "center" },
      );
      doc.setFontSize(7);
      doc.setTextColor(70, 88, 90);
      doc.text(
        "Hotline: 1900 888 999 | support@speedyship.com",
        midCx,
        y + 33.5,
        {
          align: "center",
        },
      );

      if (logoDataUrl) {
        const maxLW = sideColW - 8;
        const maxLH = headerH - 10;
        const { w: lw, h: lh } = await getImageFitSizeMM(
          logoDataUrl,
          maxLW,
          maxLH,
        );
        doc.addImage(
          logoDataUrl,
          "PNG",
          leftX + (sideColW - lw) / 2,
          y + (headerH - lh) / 2,
          lw,
          lh,
        );
      } else {
        doc.setTextColor(17, 62, 72);
        doc.setFont("Roboto", "bold");
        doc.setFontSize(11);
        doc.text("SPEEDYSHIP", leftX + sideColW / 2, y + headerH / 2 + 3, {
          align: "center",
        });
      }

      const barcodeDataURL = generateBarcodeDataURL(
        shipment.tracking_code,
        true,
      );
      const { w: bw, h: bh } = await getImageFitSizeMM(
        barcodeDataURL,
        sideColW - 6,
        headerH - 8,
      );
      doc.addImage(
        barcodeDataURL,
        "PNG",
        rightX + (sideColW - bw) / 2,
        y + (headerH - bh) / 2,
        bw,
        bh,
      );

      doc.setFont("Roboto", "normal");
      y += headerH;

      const routeH = 10;
      strokeFrame(doc, margin, y, innerW, routeH);
      doc.setFillColor(245, 245, 245);
      doc.rect(margin, y, innerW, routeH, "F");
      strokeFrame(doc, margin, y, innerW, routeH);
      doc.setTextColor(17, 62, 72);
      doc.setFont("Roboto", "bold");
      doc.setFontSize(13);
      doc.text(
        String(shipment.tracking_code || ""),
        margin + innerW / 2,
        y + 7,
        {
          align: "center",
        },
      );
      y += routeH;

      const colW = innerW / 2;
      const pickupLines = doc.splitTextToSize(
        shipment.pickup_address || "---",
        colW - 6,
      );
      const deliveryLines = doc.splitTextToSize(
        shipment.delivery_address || "---",
        colW - 6,
      );
      const lineAddr = 5.3;
      const topPad = 7;
      const leftBlock = topPad + 6 + 6 + 6 + pickupLines.length * lineAddr;
      const rightBlock = topPad + 6 + 6 + 6 + deliveryLines.length * lineAddr;
      const addrH = Math.max(40, leftBlock, rightBlock) + 5;
      strokeFrame(doc, margin, y, innerW, addrH);
      doc.line(margin + colW, y, margin + colW, y + addrH);

      let ay = y + topPad;
      doc.setTextColor(17, 62, 72);
      doc.setFontSize(11);
      doc.setFont("Roboto", "bold");
      doc.text("NGƯỜI GỬI", margin + 3, ay);
      ay += 6;
      doc.setFont("Roboto", "normal");
      doc.setFontSize(10);
      doc.setTextColor(30, 30, 30);
      doc.text(`${shipment.sender_name || "---"}`, margin + 3, ay);
      ay += 6;
      doc.setFontSize(9.5);
      doc.setTextColor(55, 55, 55);
      doc.text(`SĐT: ${shipment.sender_phone || "---"}`, margin + 3, ay);
      ay += 6;
      doc.text(pickupLines, margin + 3, ay);

      ay = y + topPad;
      doc.setTextColor(17, 62, 72);
      doc.setFont("Roboto", "bold");
      doc.setFontSize(11);
      doc.text("NGƯỜI NHẬN", margin + colW + 3, ay);
      ay += 6;
      doc.setFont("Roboto", "normal");
      doc.setFontSize(10);
      doc.setTextColor(30, 30, 30);
      doc.text(`${shipment.receiver_name || "---"}`, margin + colW + 3, ay);
      ay += 6;
      doc.setFontSize(9.5);
      doc.setTextColor(55, 55, 55);
      doc.text(
        `SĐT: ${shipment.receiver_phone || "---"}`,
        margin + colW + 3,
        ay,
      );
      ay += 6;
      doc.text(deliveryLines, margin + colW + 3, ay);

      y += addrH;

      const codAmount = Number(shipment.cod_amount) || 0;
      const shippingFee = Number(shipment.shipping_fee) || 0;
      const totalCollect = codAmount + shippingFee;

      const sectionBarH = 6;
      strokeFrame(doc, margin, y, innerW, sectionBarH);
      doc.setFillColor(235, 238, 239);
      doc.rect(margin, y, innerW, sectionBarH, "F");
      strokeFrame(doc, margin, y, innerW, sectionBarH);
      doc.setTextColor(17, 62, 72);
      doc.setFont("Roboto", "bold");
      doc.setFontSize(9);
      doc.text("CHI TIẾT HÀNG HÓA", margin + 3, y + 4.5);
      y += sectionBarH;

      autoTable(doc, {
        startY: y,
        margin: { left: margin, right: margin },
        tableWidth: innerW,
        theme: "grid",
        head: [["Hàng hóa", "Số lượng", "Trọng lượng", "Dịch vụ"]],
        body: [
          [
            shipment.item_name || "Hàng hóa",
            `${shipment.quantity || 1} kiện`,
            `${shipment.weight_kg ?? "---"} kg`,
            getStatusLabel(shipment.service_type || "express"),
          ],
        ],
        styles: {
          font: "Roboto",
          fontSize: 8.5,
          cellPadding: 3.5,
          textColor: [45, 45, 45],
          lineColor: BORDER,
          lineWidth: BORDER_W,
        },
        headStyles: {
          fillColor: [235, 238, 239],
          textColor: [17, 62, 72],
          fontStyle: "bold",
          lineColor: BORDER,
          lineWidth: BORDER_W,
        },
      });

      let payStartY = doc.lastAutoTable.finalY;
      strokeFrame(doc, margin, payStartY, innerW, sectionBarH);
      doc.setFillColor(235, 238, 239);
      doc.rect(margin, payStartY, innerW, sectionBarH, "F");
      strokeFrame(doc, margin, payStartY, innerW, sectionBarH);
      doc.setTextColor(17, 62, 72);
      doc.setFont("Roboto", "bold");
      doc.setFontSize(9);
      doc.text("THANH TOÁN", margin + 3, payStartY + 4.5);
      payStartY += sectionBarH;

      autoTable(doc, {
        startY: payStartY,
        margin: { left: margin, right: margin },
        tableWidth: innerW,
        theme: "grid",
        head: [["Khoản mục", "Số tiền"]],
        body: [
          ["Phí vận chuyển", `${fmt(shippingFee)} VNĐ`],
          ["Thu hộ COD", `${fmt(codAmount)} VNĐ`],
          [
            "Hình thức thanh toán",
            getPaymentMethodLabel(shipment.payment_method),
          ],
        ],
        foot: [["TỔNG THU NGƯỜI NHẬN", `${fmt(totalCollect)} VNĐ`]],
        styles: {
          font: "Roboto",
          fontSize: 8.5,
          cellPadding: 3.5,
          textColor: [45, 45, 45],
          lineColor: BORDER,
          lineWidth: BORDER_W,
        },
        headStyles: {
          fillColor: [235, 238, 239],
          textColor: [17, 62, 72],
          fontStyle: "bold",
          lineColor: BORDER,
          lineWidth: BORDER_W,
        },
        footStyles: {
          fillColor: [17, 62, 72],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 9,
          lineColor: BORDER,
          lineWidth: BORDER_W,
        },
        columnStyles: {
          1: { halign: "right" },
        },
      });

      const afterPayY = doc.lastAutoTable.finalY + 2;
      const statusH = 16;
      strokeFrame(doc, margin, afterPayY, innerW, statusH);
      doc.setFillColor(245, 245, 245);
      doc.rect(margin, afterPayY, innerW, statusH, "F");
      strokeFrame(doc, margin, afterPayY, innerW, statusH);
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(8.5);
      doc.setFont("Roboto", "normal");
      doc.text(
        `Trạng thái đơn hàng: ${getStatusLabel(shipment.status).toUpperCase()}`,
        margin + 3,
        afterPayY + 6,
      );
      doc.text(
        `Cập nhật: ${new Date(shipment.updated_at || shipment.created_at).toLocaleString("vi-VN")}`,
        margin + 3,
        afterPayY + 12,
      );

      const signatureY = afterPayY + statusH + 2;
      const signatureH = 32;
      strokeFrame(doc, margin, signatureY, innerW, signatureH);
      doc.setFillColor(255, 255, 255);
      doc.rect(margin, signatureY, innerW, signatureH, "F");
      strokeFrame(doc, margin, signatureY, innerW, signatureH);
      doc.setTextColor(30, 30, 30);
      doc.setFont("Roboto", "bold");
      doc.setFontSize(10);
      doc.text("Chữ ký người nhận", margin + innerW / 2, signatureY + 8, {
        align: "center",
      });
      doc.setFont("Roboto", "normal");
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      doc.text(
        "Xác nhận hàng nguyên vẹn, không móp/méo, bể/vỡ",
        margin + innerW / 2,
        signatureY + 14,
        { align: "center" },
      );
      doc.setDrawColor(...BORDER);
      doc.setLineWidth(0.2);
      doc.line(
        margin + 12,
        signatureY + signatureH - 8,
        margin + innerW - 12,
        signatureY + signatureH - 8,
      );

      const footerH = 16;
      let footerY = signatureY + signatureH + 4;
      if (footerY + footerH > pageHeight - margin) {
        footerY = Math.max(
          signatureY + signatureH + 2,
          pageHeight - margin - footerH,
        );
      }
      strokeFrame(doc, margin, footerY, innerW, footerH);
      doc.setFillColor(252, 252, 252);
      doc.rect(margin, footerY, innerW, footerH, "F");
      strokeFrame(doc, margin, footerY, innerW, footerH);
      doc.setTextColor(110, 110, 110);
      doc.setFontSize(7.5);
      doc.setFont("Roboto", "normal");
      doc.text(
        "SpeedyShip — 55 Nguyễn Văn Linh, Quận Hải Châu, TP. Đà Nẵng | www.speedyship.vn",
        pageWidth / 2,
        footerY + 5.5,
        { align: "center" },
      );
      doc.text(
        `Phiếu giao hàng xuất tự động: ${new Date().toLocaleString("vi-VN")}`,
        pageWidth / 2,
        footerY + 11,
        { align: "center" },
      );

      const contentBottom = footerY + footerH;
      doc.setDrawColor(...BORDER);
      doc.setLineWidth(0.55);
      doc.rect(margin, contentTop, innerW, contentBottom - contentTop, "S");

      doc.save(`PhieuGiaoHang_${shipment.tracking_code}.pdf`);
      toast.success(`Đã tải phiếu giao hàng ${shipment.tracking_code}`);
    } catch (error) {
      toast.error("Lỗi khi tạo PDF!");
    } finally {
      setDownloading(null);
    }
  };

  // Xuất tất cả phiếu giao hàng
  const exportAll = () => {
    if (filtered.length === 0) return toast.error("Không có đơn nào để xuất!");
    filtered.forEach((s, i) => {
      setTimeout(() => generatePDF(s), i * 500);
    });
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-6 pb-10">
      <Toaster position="top-right" />

      {}
      <div
        className="relative z-30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100"
        data-aos="fade-up"
      >
        <div>
          <h1 className="text-xl font-extrabold text-[#113e48] flex items-center gap-2">
            <Receipt className="text-orange-500" size={24} /> Xuất phiếu giao
            hàng PDF
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Chọn đơn hàng và tải xuống phiếu giao hàng dạng PDF.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {}
          <div className="relative group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors"
              size={16}
            />
            <input
              type="text"
              placeholder="Tìm mã vận đơn..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 w-full sm:w-56 transition-all"
            />
          </div>

          {}
          <StatusFilterDropdown
            value={filterStatus}
            onChange={(v) => {
              setFilterStatus(v);
              setPage(1);
            }}
          />

          {}
          <button
            onClick={exportAll}
            className="flex items-center gap-2 bg-[#113e48] hover:bg-[#1a5c6a] text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm"
          >
            <Download size={16} /> Xuất tất cả ({filtered.length})
          </button>
        </div>
      </div>

      {}
      <div
        className="relative z-10 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
        data-aos="fade-up"
        data-aos-delay="100"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Mã vận đơn</th>
                <th className="px-6 py-4">Người nhận</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
                <th className="px-6 py-4 text-right">Phí ship</th>
                <th className="px-6 py-4 text-right">COD</th>
                <th className="px-6 py-4 text-center">Ngày tạo</th>
                <th className="px-6 py-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan="7" className="px-6 py-4">
                      <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-12 text-center text-gray-400 italic"
                  >
                    Không tìm thấy đơn hàng nào.
                  </td>
                </tr>
              ) : (
                currentItems.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4 font-bold text-[#113e48] font-mono">
                      {s.tracking_code}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {s.receiver_name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {s.receiver_phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(s.status)}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-gray-600">
                      {fmt(s.shipping_fee)}₫
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-gray-600">
                      {fmt(s.cod_amount)}₫
                    </td>
                    <td className="px-6 py-4 text-center text-xs text-gray-400">
                      {new Date(s.created_at).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-start gap-2 w-[72px] mx-auto">
                        {}
                        <button
                          onClick={() =>
                            setPreviewData(previewData?.id === s.id ? null : s)
                          }
                          className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Xem trước"
                        >
                          <Eye size={16} />
                        </button>
                        {}
                        <button
                          onClick={() => generatePDF(s)}
                          disabled={downloading === s.id}
                          className="p-2 text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1"
                          title="Tải PDF"
                        >
                          {downloading === s.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Download size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>

      {}
      {previewData && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6">
          <button
            aria-label="Đóng xem trước"
            onClick={() => setPreviewData(null)}
            className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
          />
          <div className="relative z-10 w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-5 py-3 bg-[#113e48] text-white">
              <h3 className="font-bold flex items-center gap-2 text-sm">
                <FileText size={16} className="text-orange-400" />
                Xem trước — {previewData.tracking_code}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => generatePDF(previewData)}
                  className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                >
                  <Download size={13} /> Tải PDF
                </button>
                <button
                  onClick={() => setPreviewData(null)}
                  className="text-white/70 hover:text-white transition-colors p-1"
                >
                  <XCircle size={18} />
                </button>
              </div>
            </div>

            {}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {}
                <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                  <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">
                    Người gửi
                  </p>
                  <p className="font-bold text-[#113e48] text-sm">
                    {previewData.sender_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {previewData.sender_phone}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                    {previewData.pickup_address}
                  </p>
                </div>
                {}
                <div className="bg-green-50 p-3 rounded-xl border border-green-100">
                  <p className="text-[10px] font-bold text-green-600 uppercase mb-1">
                    Người nhận
                  </p>
                  <p className="font-bold text-[#113e48] text-sm">
                    {previewData.receiver_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {previewData.receiver_phone}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                    {previewData.delivery_address}
                  </p>
                </div>
              </div>

              {}
              {previewData.driver_name ? (
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-orange-200 flex items-center justify-center text-orange-700 font-bold text-xl">
                    {previewData.driver_name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-orange-600 uppercase mb-0.5">
                      Tài xế phụ trách
                    </p>
                    <p className="font-bold text-[#113e48]">
                      {previewData.driver_name}
                    </p>
                    <div className="flex flex-col gap-1 mt-1">
                      <p className="text-[11px] text-gray-600 flex items-center gap-1.5">
                        <Phone size={12} className="text-orange-500" />{" "}
                        {previewData.driver_phone || "Đang cập nhật SĐT"}
                      </p>
                      <p className="text-[11px] text-gray-600 flex items-center gap-1.5">
                        <Truck size={12} className="text-orange-500" /> Biển số:{" "}
                        <span className="font-semibold text-gray-800 tracking-wider">
                          {previewData.plate_number || "Đang cập nhật"}
                        </span>
                      </p>
                    </div>
                  </div>
                  {previewData.driver_phone && (
                    <a
                      href={"tel:" + previewData.driver_phone}
                      className="bg-white p-2 rounded-full shadow-sm text-green-600 hover:bg-green-50 transition-colors"
                    >
                      <Phone size={20} />
                    </a>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                    <Truck size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-gray-500 uppercase mb-0.5">
                      Tài xế phụ trách
                    </p>
                    <p className="font-bold text-gray-400 italic">
                      Chưa phân công tài xế
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">
                    Thanh toán
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Phí vận chuyển</span>
                      <span className="font-bold text-[#113e48]">
                        {fmt(previewData.shipping_fee)}₫
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Thu hộ COD</span>
                      <span className="font-bold text-[#113e48]">
                        {fmt(previewData.cod_amount)}₫
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm">
                      <span className="text-slate-500">Trạng thái</span>
                      <span className="font-bold text-blue-600">
                        {getStatusLabel(previewData.status)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#113e48] text-white p-4 rounded-xl border border-[#113e48] flex flex-col justify-center">
                  <p className="text-[10px] text-orange-300 uppercase font-bold tracking-wider text-center mb-1">
                    Tổng thu
                  </p>
                  <p className="text-3xl font-black text-center leading-tight">
                    {fmt(
                      Number(previewData.cod_amount) +
                        Number(previewData.shipping_fee),
                    )}
                    ₫
                  </p>
                  <p className="text-center text-xs text-white/70 mt-2">
                    Người nhận thanh toán khi giao hàng
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
