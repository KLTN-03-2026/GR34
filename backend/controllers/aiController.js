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
        reply: `## 🌐 Website SpeedyShip

Truy cập ngay: **https://speedyship.vn**

### 🚀 Tính Năng Website:
- 📦 Tạo & theo dõi đơn hàng
- 💳 Quản lý ví & COD
- 📊 Thống kê chi tiết
- 📱 Tải ứng dụng di động

---

👉 [Truy cập ngay](https://speedyship.vn)`,
      });
    }

    // Hotline
    if (/hotline|sdt|số điện thoại|gọi điện|tư vấn|liên hệ/.test(msg)) {
      return res.json({
        reply: `## 📞 Hotline SpeedyShip

### ☎️ **1900 888 999**

---

### ⏰ Giờ Hỗ Trợ:
| Ngày | Giờ |
|---|---|
| Thứ 2 - Thứ 6 | 7:00 - 22:00 |
| Thứ 7 - CN | 8:00 - 20:00 |

---

### 💬 Các Kênh Khác:
- 📧 Email: **support@speedyship.vn**
- 💬 Zalo: **SpeedyShip**
- 📘 Fanpage: **facebook.com/speedyship.vn**

---

*Gọi ngay để được hỗ trợ nhanh nhất!*`,
      });
    }

    // Email
    if (/email|mail|gửi mail|hỗ trợ mail|support/.test(msg)) {
      return res.json({
        reply: `## 📧 Email Hỗ Trợ SpeedyShip

### ✉️ **support@speedyship.vn**

---

### 📋 Các Trường Hợp Gửi Email:

| Loại | Mô tả |
|---|---|
| 💼 Hợp tác kinh doanh | Đăng ký đại lý, API |
| 🔧 Hỗ trợ kỹ thuật | Lỗi hệ thống, tích hợp |
| 📝 Khiếu nại | Phản ánh dịch vụ |
| 💰 Tài chính | Xác nhận thanh toán |

---

*Phản hồi trong vòng 24 giờ làm việc*`,
      });
    }

    // Mạng xã hội
    if (/facebook|fanpage|page|fb|zalo/.test(msg)) {
      return res.json({
        reply: `## 📱 Kết Nối Với SpeedyShip

### Facebook
🔗 **facebook.com/speedyship.vn**

### Zalo
🔗 **zalo.me/speedyship**

---

💬 Nhắn tin trực tiếp để được hỗ trợ nhanh chóng!

📢 Theo dõi để cập nhật **khuyến mãi** và **tin tức** mới nhất!`,
      });
    }

    // Địa chỉ
    if (/địa chỉ|văn phòng|ở đâu|tới đâu|headquarter/.test(msg)) {
      return res.json({
        reply: `## 🏢 Trụ Sở SpeedyShip

### 📍 **55 Nguyễn Văn Linh**
Phường Hải Châu 1, Quận Hải Châu
Thành phố Đà Nẵng, Việt Nam

---

### ⏰ Giờ Làm Việc

| Ngày | Giờ |
|---|---|
| Thứ 2 - Thứ 6 | 7:00 - 22:00 |
| Thứ 7 | 8:00 - 20:00 |
| Chủ nhật | 9:00 - 18:00 |

---

🗺️ [Xem trên Google Maps](https://maps.google.com/?q=55+Nguyen+Van+Linh+Da+Nang)

---

*Ghé thăm văn phòng hoặc liên hệ hotline 1900 888 999 để được hỗ trợ!*`,
      });
    }

    // Giờ làm việc
    if (/giờ mở cửa|giờ làm việc|làm lúc nào|open.*hour/.test(msg)) {
      return res.json({
        reply: `## ⏰ Giờ Làm Việc SpeedyShip

### 🏢 Văn Phòng
| Ngày | Giờ |
|---|---|
| Thứ 2 - Thứ 6 | **7:00 - 22:00** |
| Thứ 7 | **8:00 - 20:00** |
| Chủ nhật | **9:00 - 18:00** |

---

### 📞 Hotline
**1900 888 999**: 7:00 - 22:00 mỗi ngày

---

### 🚚 Dịch Vụ Giao Hàng
Giao hàng **24/7** - Không giới hạn thời gian!

| Dịch vụ | Thời gian |
|---|---|
| Nhanh | 1-2 giờ |
| Tiết kiệm | 1-2 ngày |
| Hỏa tốc | 30-60 phút |

---

*Chúng tôi luôn sẵn sàng phục vụ bạn!*`,
      });
    }

    // Bảng giá
    if (/bảng giá|giá cước|phí ship|chi phí|price|fee/.test(msg)) {
      return res.json({
        reply: `## 💰 Bảng Giá SpeedyShip

### 📦 Phí Vận Chuyển

| Dịch vụ | Nội thành | Liên tỉnh |
|---|---|---|
| 🚀 **Giao nhanh** | 15.000đ | 25.000đ - 35.000đ |
| 💚 **Giao tiết kiệm** | 10.000đ | 18.000đ - 25.000đ |
| ⚡ **Hỏa tốc** | 30.000đ | 50.000đ - 70.000đ |

---

### ⏱️ Thời Gian Giao

| Dịch vụ | Nội thành | Liên tỉnh |
|---|---|---|
| Giao nhanh | 1-2 giờ | 1-2 ngày |
| Giao tiết kiệm | 2-4 giờ | 2-3 ngày |
| Hỏa tốc | 30-60 phút | 1-2 giờ |

---

### 💰 Thu Hộ COD

| Mức COD | Phí thu hộ |
|---|---|
| Dưới 5 triệu | Miễn phí |
| 5-20 triệu | 5.000đ |
| Trên 20 triệu | 10.000đ |

---

📊 [Xem chi tiết đầy đủ](https://speedyship.vn/pricing)`,
      });
    }

    // Tạo đơn hàng
    if (/tạo đơn|đặt hàng|ship hàng|gửi hàng|create.*order|order.*new/.test(msg)) {
      return res.json({
        reply: `## 📦 Cách Tạo Đơn Hàng Trên SpeedyShip

### 📱 **Hướng Dẫn 5 Bước:**

**Bước 1:** Đăng nhập/Đăng ký tài khoản
→ Truy cập https://speedyship.vn hoặc ứng dụng

**Bước 2:** Chọn dịch vụ vận chuyển
→ Nhanh / Tiết kiệm / Hỏa tốc

**Bước 3:** Nhập thông tin gửi & nhận
→ Địa chỉ, tên, số điện thoại

**Bước 4:** Xác nhận đơn hàng
→ Kiểm tra thông tin, thanh toán phí

**Bước 5:** Nhận mã vận đơn
→ Theo dõi trực tiếp trên website

---

### 💡 Mẹo:
- 📸 Chụp ảnh hàng hóa trước khi gửi
- 📝 Ghi chú rõ yêu cầu đặc biệt
- 📦 Đóng gói cẩn thận để tránh hư hỏng

---

👉 [Tạo đơn ngay](https://speedyship.vn/create-order)`,
      });
    }

    // Giao thất bại
    if (/giao thất bại|failed.*delivery|không.*giao.*được/.test(msg)) {
      return res.json({
        reply: `## ❌ Xử Lý Khi Giao Thất Bại

### 🔄 Quy Trình Xử Lý:

**1️⃣ Tài xế liên hệ người nhận**
→ Gọi điện, nhắn tin thông báo

**2️⃣ Chờ người nhận phản hồi**
→ Thời gian chờ: 15-30 phút

**3️⃣ Thử giao lại**
→ Tối đa 3 lần trong 24 giờ

**4️⃣ Nếu vẫn thất bại:**
| Tình trạng | Xử lý |
|---|---|
| Người nhận không có | Hoàn hàng về người gửi |
| Địa chỉ sai | Cập nhật, giao lại (phí phát sinh) |
| Từ chối nhận | Hoàn hàng, phí không hoàn |
| Không liên lạc được | Lưu kho 3 ngày, sau đó hoàn |

---

### 💰 Phí Phát Sinh:

| Trường hợp | Phí |
|---|---|
| Giao lại lần 2 | Miễn phí |
| Giao lại lần 3 | 5.000đ |
| Hoàn hàng | 50% phí vận chuyển |

---

📞 Liên hệ **1900 888 999** để được hỗ trợ nhanh nhất!`,
      });
    }

    // COD
    if (/cod|thu hộ|tiền thu|thu tiền/.test(msg)) {
      return res.json({
        reply: `## 💰 Dịch Vụ Thu Hộ COD

### ✨ Ưu Điểm:

- ✅ Thu hộ tối đa **50 triệu đồng/đơn**
- ✅ Miễn phí phí thu hộ (dưới 5 triệu)
- ✅ Chuyển khoản trong **24 giờ**
- ✅ Xác nhận qua ảnh giao hàng

---

### 📋 Phí Thu Hộ:

| Mức COD | Phí |
|---|---|
| Dưới 5 triệu | **Miễn phí** |
| 5 - 20 triệu | 5.000đ |
| Trên 20 triệu | 10.000đ |

---

### 💳 Nhận Tiền COD:

**Cách 1:** Chuyển vào ví SpeedyShip
→ Nhận ngay trong 24 giờ

**Cách 2:** Chuyển khoản ngân hàng
→ Phí 3.000đ / giao dịch

**Cách 3:** Rút tiền mặt tại văn phòng
→ Miễn phí, cần CMND/CCCD

---

📞 Hotline: **1900 888 999**`,
      });
    }

    // Bảo hiểm
    if (/bảo hiểm|đền bù|bồi thường|compensation|insurance/.test(msg)) {
      return res.json({
        reply: `## 🛡️ Chính Sách Bảo Hiểm & Đền Bù

### ✅ Cam Kết SpeedyShip:

| Tình Trạng | Mức Đền Bù |
|---|---|
| 🔴 Hàng mất | 100% giá trị (tối đa 10 triệu) |
| 🟡 Hàng hư hỏng | 50-100% tùy mức độ |
| 🟠 Giao trễ | Hoàn 50% phí vận chuyển |
| 🔵 Sai địa chỉ | Giao lại miễn phí |

---

### 📝 Điều Kiện Đền Bù:

1. ✅ Hàng hóa đã khai báo đầy đủ
2. ✅ Đóng gói đạt chuẩn
3. ✅ Có hình ảnh trước khi gửi
4. ✅ Yêu cầu trong 24 giờ sau khi nhận

---

### ⚠️ Lưu Ý:

- 📦 Đóng gói cẩn thận, chống sốc
- 📸 Chụp ảnh hàng hóa rõ ràng
- 💰 Khai báo giá trị chính xác

---

📞 **Khiếu nại:** 1900 888 999 (7:00 - 22:00)`,
      });
    }

    // Ví điện tử
    if (/ví|wallet|nạp tiền|rút tiền|deposit|withdraw/.test(msg)) {
      return res.json({
        reply: `## 💳 Ví SpeedyShip

### ✨ Tính Năng:

- 💰 **Nạp tiền**: Chuyển khoản, thẻ cào, ví điện tử
- 💸 **Rút tiền**: Ngân hàng, ví điện tử
- 🛒 **Thanh toán**: Phí ship, COD
- 📥 **Nhận tiền**: COD từ đơn hàng

---

### 💵 Nạp Tiền:

| Phương thức | Phí | Thời gian |
|---|---|---|
| Chuyển khoản | Miễn phí | 1-5 phút |
| Thẻ cào | 10-20% | Ngay |
| Ví Momo/ZaloPay | Miễn phí | Ngay |

---

### 💸 Rút Tiền:

| Phương thức | Phí | Thời gian |
|---|---|---|
| Ngân hàng | 1% (min 3.000đ) | 24 giờ |
| Ví Momo | Miễn phí | 1-2 giờ |
| Tiền mặt (văn phòng) | Miễn phí | Ngay |

---

### 🔒 Bảo Mật:
- Mã PIN bảo vệ
- Xác thực SMS
- Giới hạn giao dịch

---

💳 Truy cập: **https://speedyship.vn/wallet**`,
      });
    }

    // Đổi địa chỉ
    if (/đổi địa chỉ|thay đổi địa chỉ|change.*address|sửa địa chỉ/.test(msg)) {
      return res.json({
        reply: `## ✏️ Thay Đổi Địa Chỉ Nhận Hàng

### ⚠️ Lưu Ý Quan Trọng:

Bạn **có thể** thay đổi địa chỉ nhận trong các trường hợp:

| Trạng thái đơn | Đổi địa chỉ |
|---|---|
| ⏳ Chờ lấy hàng | ✅ Miễn phí |
| 📦 Đang lấy hàng | ✅ Phí 5.000đ |
| 🚚 Đang giao | ⚠️ Tùy trường hợp |
| ✅ Đã giao | ❌ Không thể |

---

### 📋 Cách Thay Đổi:

**Qua App/Web:**
1. Vào "Theo dõi đơn hàng"
2. Chọn đơn cần sửa
3. Nhấn "Sửa thông tin"
4. Cập nhật địa chỉ mới

**Qua Hotline:**
📞 Gọi **1900 888 999** với mã vận đơn

---

### 💰 Phí Phát Sinh:

| Thay đổi | Phí |
|---|---|
| Cùng khu vực | Miễn phí |
| Khác khu vực nội thành | 5.000đ |
| Khác tỉnh/thành | Phí vận chuyển mới |

---

*Liên hệ ngay để được hỗ trợ kịp thời!*`,
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
        reply: `## 👋 Chào Bạn!

Rất vui được gặp bạn tại **SpeedyShip**! 🚀

Tôi là **SpeedyAI** - trợ lý ảo luôn sẵn sàng hỗ trợ bạn 24/7.

### 🎯 Tôi Có Thể Giúp Bạn:

| | |
|---|---|
| 📦 | Tra cứu đơn hàng |
| 💰 | Tư vấn bảng giá |
| ❓ | Giải đáp thắc mắc |
| 📋 | Hướng dẫn sử dụng |
| 🛡️ | Chính sách bảo hiểm |

---

### 🚀 Bắt Đầu Ngay:

1️⃣ Tra cứu đơn hàng với mã vận đơn
2️⃣ Xem bảng giá dịch vụ
3️⃣ Tạo đơn hàng mới

---

💬 **Bạn cần hỗ trợ gì hôm nay?**`,
      });
    }

    // Câu cảm ơn
    if (/cảm ơn|thank|cám ơn|thanks/.test(msg)) {
      return res.json({
        reply: `## 💙 Cảm Ơn Bạn!

Cảm ơn bạn đã tin dùng **SpeedyShip**! 🙏

### 🔗 Liên Kết Nhanh:

| | |
|---|---|
| 🌐 | [speedyship.vn](https://speedyship.vn) |
| 📞 | **1900 888 999** |
| 📧 | support@speedyship.vn |
| 📘 | facebook.com/speedyship.vn |

---

✈️ **SpeedyShip** - Vận chuyển nhanh chóng, an tâm trọn vẹn!

---

💬 Nếu cần thêm hỗ trợ, đừng ngần ngại hỏi tôi nhé!`,
      });
    }

    // Gọi AI Groq cho các câu hỏi khác
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
      return res.json({
        reply: `## 🤔 Tôi Chưa Hiểu Câu Hỏi Của Bạn

Xin lỗi, tôi chưa thể trả lời câu hỏi này ngay lúc này.

### 💡 Gợi Ý:

| Câu hỏi phổ biến | |
|---|---|
| Tra cứu đơn hàng | Cần mã vận đơn |
| Bảng giá | 15.000đ - 35.000đ |
| Hotline | **1900 888 999** |
| Tạo đơn hàng | Website/App |

---

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
- Thân thiện, chuyên nghiệp
- Sử dụng emoji phù hợp
- Trả lời bằng tiếng Việt
- Markdown format đẹp mắt
- Cung cấp thông tin đầy đủ, có ví dụ`,
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
