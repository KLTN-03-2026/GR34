import axios from "axios";

const DEFAULT_FAQ_SUGGESTIONS = [
  "Cách tạo đơn hàng nhanh trên SpeedyShip?",
  "Tôi muốn tra cứu vận đơn thì làm thế nào?",
  "Phí vận chuyển nội thành và liên tỉnh bao nhiêu?",
  "Khi giao thất bại thì xử lý ra sao?",
  "Có hỗ trợ thu hộ COD không?",
  "Làm sao nạp/rút tiền trong ví SpeedyShip?",
  "Tôi có thể đổi địa chỉ nhận sau khi tạo đơn không?",
  "Chính sách đền bù khi hàng hư hỏng như thế nào?",
];

const SPEEDY_INFO = `
## 🚚 VỀ SPEEDYSHIP

**SpeedyShip** là nền tảng vận chuyển hàng đầu Việt Nam, cung cấp giải pháp giao hàng nhanh chóng, an toàn và tiện lợi cho cá nhân và doanh nghiệp.

### 📍 Thông Tin Liên Hệ

| | |
|---|---|
| 🌐 **Website** | https://speedyship.vn |
| 📞 **Hotline** | 1900 888 999 (7:00 - 22:00) |
| 📧 **Email** | support@speedyship.vn |
| 📍 **Trụ sở** | 55 Nguyễn Văn Linh, Hải Châu, Đà Nẵng |
| 💬 **Fanpage** | facebook.com/speedyship.vn |

---

## 💰 Bảng Giá Dịch Vụ

| Dịch Vụ | Nội Thành | Liên Tỉnh |
|---|---|---|
| **Giao hàng nhanh** | 15.000đ | 25.000đ - 35.000đ |
| **Giao hàng tiết kiệm** | 10.000đ | 18.000đ - 25.000đ |
| **Giao hàng hỏa tốc** | 30.000đ | 50.000đ - 70.000đ |

### ⏱️ Thời Gian Giao Hàng

- 🏙️ **Nội thành**: 1-2 giờ
- 🚛 **Liên tỉnh**: 1-2 ngày
- ⚡ **Hỏa tốc**: 30-60 phút

---

## 📦 Các Dịch Vụ Của SpeedyShip

### 1. Giao Hàng Nhanh
- Giao trong ngày cho đơn nội thành
- Theo dõi GPS trực tiếp
- Xác nhận giao hàng qua ảnh

### 2. Thu Hộ COD
- Hỗ trợ thu COD lên đến 50 triệu đồng/đơn
- Chuyển khoản trong 24 giờ
- Miễn phí phí thu hộ

### 3. Giao Hàng Tiết Kiệm
- Chi phí thấp hơn 30%
- Thời gian giao linh hoạt
- Phù hợp hàng không cần gấp

### 4. Dịch Vụ Hỏa Tốc
- Giao trong 30-60 phút
- Phù hợp tài liệu, quà tặng
- Phí cao hơn nhưng nhanh nhất

---

## 🛡️ Chính Sách Bảo Hiểm & Đền Bù

| Tình Trạng | Mức Đền Bù |
|---|---|
| Hàng mất | 100% giá trị khai báo (tối đa 10 triệu) |
| Hàng hư hỏng | 50-100% tùy mức độ |
| Giao trễ | Hoàn 50% phí vận chuyển |
| Sai địa chỉ | Giao lại miễn phí |

### ⚠️ Lưu Ý:
- Đóng gói cẩn thận để tránh hư hỏng
- Khai báo giá trị hàng hóa chính xác
- Chụp ảnh hàng hóa trước khi gửi

---

## 📋 Cách Tạo Đơn Hàng

1. **Đăng ký/Đăng nhập** tài khoản SpeedyShip
2. **Chọn dịch vụ** phù hợp (nhanh/tiết kiệm/hỏa tốc)
3. **Nhập thông tin** người gửi, người nhận
4. **Xác nhận** và thanh toán phí vận chuyển
5. **Theo dõi** đơn hàng qua mã vận đơn

---

## 💳 Ví Điện Tử SpeedyShip

- **Nạp tiền**: Chuyển khoản ngân hàng, thẻ cào
- **Rút tiền**: Phí 1%, trong 24 giờ
- **Mua dịch vụ**: Thanh toán phí ship trực tiếp
- **Nhận COD**: Tiền thu hộ chuyển vào ví

---

## ❓ Xử Lý Khi Giao Thất Bại

1. **Người nhận không có mặt**: Tài xế sẽ gọi điện, gửi tin nhắn
2. **Địa chỉ sai**: Cập nhật lại, giao lại (phí phát sinh)
3. **Từ chối nhận hàng**: Hoàn hàng về người gửi
4. **Giao 3 lần không thành công**: Hoàn hàng, phí không hoàn

---

Bạn cần hỗ trợ thêm về dịch vụ nào? Tôi sẵn sàng giúp bạn! 😊
`;

// Trả về danh sách câu hỏi FAQ gợi ý cho chatbot
export const getFaqSuggestions = async (_req, res) => {
  return res.json({
    suggestions: DEFAULT_FAQ_SUGGESTIONS,
  });
};

// Xử lý tin nhắn chatbot: tra cứu đơn, trả lời FAQ cứng, hoặc chuyển sang Groq AI
export const askBot = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message)
      return res.status(400).json({ error: "Thiếu nội dung message" });

    const msg = message.toLowerCase();

    // Intent: tra cứu đơn hàng
    const askTrackingIntent =
      /(đơn.*đâu|đang ở đâu|tới đâu rồi|đơn hàng của tôi|đơn của tôi|tra cứu|where is my|tracking|status)/i;

    const codeMatch = message.toUpperCase().match(/([A-Z]{2,3}-[0-9]{5,}|SP[0-9]{5,})/);

    // Hỏi tra cứu nhưng chưa có mã
    if (askTrackingIntent.test(msg) && !codeMatch) {
      return res.json({
        reply: `📦 **Tra Cứu Đơn Hàng**

Để tra cứu đơn hàng, bạn cần cung cấp **mã vận đơn**.

📝 **Ví dụ:**
- *Tra cứu đơn DN-123456*
- *Tra cứu SP123456*

💡 **Mẹo:** Mã vận đơn được gửi qua SMS/Email sau khi tạo đơn thành công.

Bạn có mã vận đơn để tra cứu không?`,
      });
    }

    // Có mã nhưng không phải intent tra cứu
    if (codeMatch && !askTrackingIntent.test(msg)) {
      return res.json({
        reply: `📋 **Phát Hiện Mã Vận Đơn: \`${codeMatch[0]}\`**

Bạn có muốn tôi tra cứu thông tin đơn hàng này?

✏️ Gõ: **Tra cứu đơn ${codeMatch[0]}**`,
      });
    }

    // Tra cứu với mã cụ thể
    if (codeMatch && askTrackingIntent.test(msg)) {
      const trackingCode = codeMatch[0];

      try {
        const { data } = await axios.get(
          `http://localhost:5000/api/shipments/code/${trackingCode}`
        );

        const statusConfig = {
          pending: { label: "⏳ Chờ lấy hàng", color: "text-yellow-600", bg: "bg-yellow-50" },
          created: { label: "⏳ Chờ lấy hàng", color: "text-yellow-600", bg: "bg-yellow-50" },
          picking: { label: "📦 Đang lấy hàng", color: "text-orange-600", bg: "bg-orange-50" },
          assigned: { label: "📋 Đã phân công", color: "text-blue-600", bg: "bg-blue-50" },
          delivering: { label: "🚚 Đang giao hàng", color: "text-blue-600", bg: "bg-blue-50" },
          transit: { label: "🚛 Đang vận chuyển", color: "text-blue-600", bg: "bg-blue-50" },
          shipping: { label: "🚚 Đang giao hàng", color: "text-blue-600", bg: "bg-blue-50" },
          delivered: { label: "✅ Giao thành công", color: "text-green-600", bg: "bg-green-50" },
          completed: { label: "✅ Hoàn thành", color: "text-green-600", bg: "bg-green-50" },
          success: { label: "✅ Giao thành công", color: "text-green-600", bg: "bg-green-50" },
          failed: { label: "❌ Giao thất bại", color: "text-red-600", bg: "bg-red-50" },
          returning: { label: "↩️ Đang hoàn hàng", color: "text-purple-600", bg: "bg-purple-50" },
          returned: { label: "↩️ Đã hoàn hàng", color: "text-purple-600", bg: "bg-purple-50" },
          canceled: { label: "🚫 Đã hủy", color: "text-gray-600", bg: "bg-gray-50" },
        };

        const status = statusConfig[data.status?.toLowerCase()] || { label: data.status, color: "text-gray-600", bg: "bg-gray-50" };

        const createdDate = new Date(data.created_at).toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        return res.json({
          reply: `## 📦 THÔNG TIN ĐƠN HÀNG

**Mã vận đơn:** \`${trackingCode}\`

---

### 👤 Người Gửi
- **Tên:** ${data.sender_name}
- **Địa chỉ:** ${data.pickup_address}
- **Điện thoại:** ${data.sender_phone}

### 👤 Người Nhận
- **Tên:** ${data.receiver_name}
- **Địa chỉ:** ${data.delivery_address}
- **Điện thoại:** ${data.receiver_phone}

---

### 📊 Trạng Thái
**${status.label}**

| Thông tin | Chi tiết |
|---|---|
| 📅 Ngày tạo | ${createdDate} |
| 💰 COD | ${Number(data.cod_amount).toLocaleString("vi-VN")}đ |
| ⚖️ Cân nặng | ${data.weight || "N/A"} kg |
| 📝 Ghi chú | ${data.notes || "Không có"} |

---

### 🗺️ Theo Dõi GPS
${(() => {
  const receiverLast4 = data.receiver_phone?.slice(-4) || null;
  const gpsLink = receiverLast4
    ? `[Xem hành trình trực tiếp](http://localhost:5173/tracking?code=${trackingCode}&last4=${receiverLast4})`
    : `[Xem hành trình trực tiếp](http://localhost:5173/tracking?code=${trackingCode})`;
  return gpsLink;
})()}

---

💙 Cảm ơn bạn đã tin dùng **SpeedyShip**!`,
        });
      } catch (err) {
        return res.json({
          reply: `## ❌ Không Tìm Thấy Đơn Hàng

Mã vận đơn **\`${trackingCode}\`** không tồn tại hoặc đã bị xóa.

### 💡 Kiểm Tra Lại:
1. Đảm bảo mã vận đơn chính xác
2. Thử tra cứu với định dạng khác (DN-xxxxx hoặc SPxxxxx)
3. Liên hệ hotline **1900 888 999** để được hỗ trợ

---
📞 **Hotline SpeedyShip:** 1900 888 999 (7:00 - 22:00)`,
        });
      }
    }

    // Website
    if (/website|web|trang web|link web|trang chủ/.test(msg)) {
      return res.json({
        reply: `🌐 **Website SpeedyShip:** https://speedyship.vn

Tại đây bạn có thể tạo đơn, theo dõi vận đơn, quản lý ví & COD, và xem thống kê chi tiết.

📱 Tải ứng dụng di động trên App Store / Google Play để tiện sử dụng mọi lúc!`,
      });
    }

    // Hotline
    if (/hotline|sdt|số điện thoại|gọi điện|tư vấn|liên hệ/.test(msg)) {
      return res.json({
        reply: `☎️ **Hotline SpeedyShip: 1900 888 999**

• Thứ 2 - Thứ 6: 7:00 - 22:00
• Thứ 7 - CN: 8:00 - 20:00

📧 Email: support@speedyship.vn
📘 Fanpage: facebook.com/speedyship.vn`,
      });
    }

    // Email
    if (/email|mail|gửi mail|hỗ trợ mail|support/.test(msg)) {
      return res.json({
        reply: `✉️ **Email hỗ trợ: support@speedyship.vn**

Chúng tôi phản hồi trong vòng **24 giờ làm việc**.

Phù hợp cho: hợp tác kinh doanh, hỗ trợ kỹ thuật, khiếu nại và các vấn đề tài chính.`,
      });
    }

    // Mạng xã hội
    if (/facebook|fanpage|page|fb|zalo/.test(msg)) {
      return res.json({
        reply: `📘 Facebook: facebook.com/speedyship.vn
📱 Zalo: zalo.me/speedyship

Theo dõi để cập nhật khuyến mãi và tin tức mới nhất từ SpeedyShip!`,
      });
    }

    // Địa chỉ
    if (/địa chỉ|văn phòng|ở đâu|tới đâu|headquarter/.test(msg)) {
      return res.json({
        reply: `🏢 **Trụ sở SpeedyShip**

📍 55 Nguyễn Văn Linh, Hải Châu, Đà Nẵng

• Thứ 2 - Thứ 6: 7:00 - 22:00
• Thứ 7: 8:00 - 20:00
• Chủ nhật: 9:00 - 18:00

📞 Hotline: 1900 888 999`,
      });
    }

    // Giờ làm việc
    if (/giờ mở cửa|giờ làm việc|làm lúc nào|open.*hour/.test(msg)) {
      return res.json({
        reply: `⏰ **Giờ làm việc SpeedyShip**

• Thứ 2 - Thứ 6: **7:00 - 22:00**
• Thứ 7: **8:00 - 20:00**
• Chủ nhật: **9:00 - 18:00**

📞 Hotline hỗ trợ 24/7: **1900 888 999**`,
      });
    }
    // Bảng giá
    if (/bảng giá|giá cước|phí ship|chi phí|price|fee/.test(msg)) {
      return res.json({
        reply: `💰 **Bảng Giá SpeedyShip**

**Phí vận chuyển:**
• Giao nhanh: 15.000đ (nội thành) / 25.000đ - 35.000đ (liên tỉnh)
• Giao tiết kiệm: 10.000đ (nội thành) / 18.000đ - 25.000đ (liên tỉnh)
• Hỏa tốc: 30.000đ (nội thành) / 50.000đ - 70.000đ (liên tỉnh)

**Thời gian giao:**
• Giao nhanh: 1-2h (nội thành) / 1-2 ngày (liên tỉnh)
• Giao tiết kiệm: 2-4h (nội thành) / 2-3 ngày (liên tỉnh)
• Hỏa tốc: 30-60 phút (nội thành) / 1-2h (liên tỉnh)

**Phí thu COD:** Miễn phí (dưới 5 triệu) / 5.000đ (5-20 triệu) / 10.000đ (trên 20 triệu)

📊 Xem chi tiết: https://speedyship.vn/pricing`,
      });
    }

    // Tạo đơn hàng
    if (/tạo đơn|đặt hàng|ship hàng|gửi hàng|create.*order|order.*new/.test(msg)) {
      return res.json({
        reply: `📦 **Tạo Đơn Hàng Trên SpeedyShip**

**5 bước đơn giản:**

1️⃣ Đăng nhập tài khoản tại https://speedyship.vn
2️⃣ Chọn dịch vụ: Nhanh / Tiết kiệm / Hỏa tốc
3️⃣ Nhập địa chỉ gửi & nhận, thông tin liên hệ
4️⃣ Xác nhận & thanh toán phí ship
5️⃣ Nhận mã vận đơn và theo dõi trực tiếp

💡 **Mẹo:** Chụp ảnh hàng hóa trước khi gửi và đóng gói cẩn thận để tránh hư hỏng.

👉 Tạo đơn ngay: https://speedyship.vn/create-order`,
      });
    }

    // Giao thất bại
    if (/giao thất bại|failed.*delivery|không.*giao.*được/.test(msg)) {
      return res.json({
        reply: `❌ **Xử Lý Giao Thất Bại**

**Quy trình:**
1. Tài xế liên hệ người nhận (gọi điện, nhắn tin)
2. Chờ phản hồi 15-30 phút
3. Thử giao lại tối đa 3 lần trong 24 giờ
4. Nếu vẫn thất bại → hoàn hàng về người gửi

**Phí phát sinh:**
• Giao lại lần 2: Miễn phí
• Giao lại lần 3: 5.000đ
• Hoàn hàng: 50% phí vận chuyển

📞 Cần hỗ trợ? Gọi **1900 888 999** ngay!`,
      });
    }

    // COD
    if (/cod|thu hộ|tiền thu|thu tiền/.test(msg)) {
      return res.json({
        reply: `💰 **Dịch Vụ Thu Hộ COD**

**Ưu điểm:**
• Thu hộ tối đa 50 triệu đồng/đơn
• Miễn phí phí thu hộ (dưới 5 triệu)
• Chuyển khoản trong 24 giờ

**Phí thu hộ:**
• Dưới 5 triệu: Miễn phí
• 5 - 20 triệu: 5.000đ
• Trên 20 triệu: 10.000đ

**Nhận tiền COD:**
• Chuyển vào ví SpeedyShip (nhận trong 24h)
• Chuyển khoản ngân hàng (phí 3.000đ)
• Rút tiền mặt tại văn phòng (miễn phí)`,
      });
    }

    // Bảo hiểm
    if (/bảo hiểm|đền bù|bồi thường|compensation|insurance/.test(msg)) {
      return res.json({
        reply: `🛡️ **Chính Sách Bảo Hiểm & Đền Bù**

**Mức đền bù:**
• Hàng mất: 100% giá trị (tối đa 10 triệu)
• Hàng hư hỏng: 50-100% tùy mức độ
• Giao trễ: Hoàn 50% phí vận chuyển
• Sai địa chỉ: Giao lại miễn phí

**Điều kiện đền bù:**
✅ Hàng hóa đã khai báo đầy đủ
✅ Đóng gói đạt chuẩn
✅ Có hình ảnh trước khi gửi
✅ Yêu cầu trong 24 giờ sau khi nhận

📞 Khiếu nại: **1900 888 999** (7:00 - 22:00)`,
      });
    }

    // Ví điện tử
    if (/ví|wallet|nạp tiền|rút tiền|deposit|withdraw/.test(msg)) {
      return res.json({
        reply: `💳 **Ví SpeedyShip**

**Nạp tiền:**
• Ví Momo: Miễn phí, nhận ngay

**Rút tiền:**
• Ngân hàng: Phí 1% (min 3.000đ), 24 giờ 
• Ví Momo: Miễn phí, 1-2 giờ
• Tiền mặt (văn phòng): Miễn phí, nhận ngay

**Bảo mật:** Mã PIN + Xác thực SMS

💳 Truy cập: https://speedyship.vn/wallet
**Hiện tại chức năng rút tiền đang được bảo trì để tránh rủi ro ảnh hưởng đến khách hàng.**
**Xin lỗi quý khách hàng vì sự bất tiện này!.**`,
      });
    }

    // Đổi địa chỉ
    if (/đổi địa chỉ|thay đổi địa chỉ|change.*address|sửa địa chỉ/.test(msg)) {
      return res.json({
        reply: `✏️ **Thay Đổi Địa Chỉ Nhận Hàng**

**Tùy trạng thái đơn hàng:**
• ⏳ Chờ lấy hàng: ✅ Miễn phí
• 📦 Đang lấy hàng: ✅ Phí 5.000đ
• 🚚 Đang giao: ⚠️ Tùy trường hợp
• ✅ Đã giao: ❌ Không thể thay đổi

**Cách sửa:**
1. Vào "Theo dõi đơn hàng" trên website/app
2. Chọn đơn cần sửa → nhấn "Sửa thông tin"
3. Cập nhật địa chỉ mới

📞 Hoặc gọi **1900 888 999** kèm mã vận đơn để được hỗ trợ nhanh.`,
      });
    }

    // Thông tin SpeedyShip tổng quan
    if (/speedyship|giới thiệu|about|về.*chúng tôi|who.*are.*you/.test(msg)) {
      return res.json({
        reply: SPEEDY_INFO,
      });
    }

    // Câu chào
    if (/xin chào|chào|hello|hi|hey|namaste/.test(msg)) {
      return res.json({
        reply: `👋 **Chào bạn!**

Mình là **SpeedyAI** - trợ lý ảo của SpeedyShip, luôn sẵn sàng hỗ trợ bạn 24/7.

**Mình có thể giúp bạn:**
• 📦 Tra cứu đơn hàng (cần mã vận đơn)
• 💰 Tư vấn bảng giá dịch vụ
• ❓ Giải đáp thắc mắc về chính sách
• 📋 Hướng dẫn sử dụng dịch vụ

Bạn cần hỗ trợ gì hôm nay?`,
      });
    }

    // Câu cảm ơn
    if (/cảm ơn|thank|cám ơn|thanks/.test(msg)) {
      return res.json({
        reply: `💙 **Cảm ơn bạn đã tin dùng SpeedyShip!**

✈️ Vận chuyển nhanh chóng, an tâm trọn vẹn!

📞 Hotline: **1900 888 999**
🌐 Website: https://speedyship.vn

Nếu cần thêm hỗ trợ, đừng ngần ngại hỏi mình nhé!`,
      });
    }

    // Gọi AI Groq cho các câu hỏi khác
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
      return res.json({
        reply: `🤔 **Mình chưa hiểu câu hỏi này.**

Bạn có thể thử:
• Tra cứu đơn hàng (cần mã vận đơn SPxxxx)
• Hỏi về bảng giá, COD, bảo hiểm
• Hỏi cách tạo đơn hoặc xử lý sự cố

📞 Gọi hotline **1900 888 999** (7:00 - 22:00) để được hỗ trợ trực tiếp!`,
      });
    }

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `Bạn là SpeedyAI - chatbot hỗ trợ khách hàng của SpeedyShip, nền tảng vận chuyển hàng đầu Việt Nam.

**Thông tin SpeedyShip:**
- Hotline: 1900 888 999
- Website: https://speedyship.vn
- Email: support@speedyship.vn
- Địa chỉ: 55 Nguyễn Văn Linh, Đà Nẵng
- Ship nội thành: 15.000đ
- Ship liên tỉnh: 25.000đ - 35.000đ
- Thời gian giao nội thành: 1-2h
- Thời gian giao liên tỉnh: 1-2 ngày
- Hỗ trợ thu COD tối đa 50 triệu

**Phong cách trả lời:**
- Ngắn gọn, dễ hiểu (tối đa 5-7 dòng cho mỗi câu hỏi đơn giản)
- Thân thiện, chuyên nghiệp, dùng emoji vừa phải
- Trả lời bằng tiếng Việt
- Markdown format đơn giản, tránh bảng phức tạp
- Cung cấp thông tin cốt lõi, không lan man`,
          },
          { role: "user", content: message },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.json({
      reply: response.data.choices[0].message.content,
    });
  } catch (err) {
    console.error("AI Chat Error:", err);
    return res.status(500).json({
      reply: `## 😔 Đã Xảy Ra Lỗi

Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại sau!

### 📞 Hỗ Trợ Khẩn Cấp:

**Hotline:** 1900 888 999 (7:00 - 22:00)
**Email:** support@speedyship.vn

---

Cảm ơn bạn đã thông cảm! 🙏`,
    });
  }
};
