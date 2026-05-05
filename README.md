# SpeedyShip - Hệ Thống Quản Lý Vận Chuyển Logistics

Website quản lý logistics toàn diện tích hợp AI, hỗ trợ quản lý đơn hàng, điều phối tài xế, thanh toán trực tuyến và giao tiếp qua chat theo thời gian thực. Hệ thống được thiết kế với 4 cổng thông tin (Portal) chuyên biệt nhằm đáp ứng nhu cầu của từng nhóm người dùng trong quy trình vận hành.

---

## Tính Năng Nổi Bật

- Portal Khách hàng: Cho phép khách hàng tra cứu, tạo đơn hàng mới thông qua bản đồ tương tác, theo dõi lộ trình đơn hàng theo thời gian thực, quản lý sổ địa chỉ, thực hiện thanh toán trực tuyến qua MoMo, và nhận hỗ trợ nhanh chóng thông qua tính năng chat tích hợp.
- Portal Tài xế: Giao diện tối ưu giúp tài xế nhận thông báo đơn hàng mới, cập nhật trạng thái giao hàng, chia sẻ vị trí hiện tại và xem chi tiết lịch sử các chuyến xe đã hoàn thành.
- Portal Điều phối viên: Công cụ mạnh mẽ để giám sát các khu vực vận hành, tự động hoặc thủ công phân công đơn hàng cho tài xế gần nhất, theo dõi trạng thái di chuyển và hỗ trợ khách hàng khi có sự cố phát sinh.
- Portal Quản trị viên (Admin): Bảng điều khiển trung tâm với các biểu đồ thống kê trực quan. Cho phép quản lý toàn bộ dữ liệu hệ thống bao gồm người dùng, đội ngũ tài xế, phương tiện, doanh thu thanh toán và tin tức sự kiện.

---

## Công Nghệ Sử Dụng

Phần mềm được xây dựng trên các công nghệ hiện đại nhằm đảm bảo hiệu suất và trải nghiệm người dùng:

- Frontend: React 19, Vite (Rolldown), TailwindCSS 3, Mapbox GL (bản đồ), Recharts (biểu đồ), Socket.IO Client.
- Backend: Node.js, Express.js, MySQL 8.x, Socket.IO (Real-time WebSockets), JWT (Xác thực).
- Tiện ích & Dịch vụ: Tích hợp thanh toán MoMo Sandbox, AI Groq (LLM), Nodemailer (gửi mã OTP qua email), Multer (xử lý hình ảnh).

---

## Hướng Dẫn Cài Đặt Và Khởi Chạy

### Bước 1: Chuẩn bị Cơ sở dữ liệu
1. Mở phpMyAdmin (hoặc công cụ quản lý MySQL của bạn).
2. Tạo database mới với tên là `speedyship` (encoding: utf8mb4_unicode_ci).
3. Import file `speedyship.sql` nằm ở thư mục gốc của dự án vào database vừa tạo.

### Bước 2: Cấu hình và chạy Backend
Mở terminal và di chuyển vào thư mục backend:
```bash
cd backend
npm install
```
Tạo file `.env` dựa trên `.env.example` hoặc cấu hình các biến cơ bản sau:
- Thông tin Database: `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`
- Thông tin Authentication: `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- Thông tin API bên thứ ba: `GROQ_API_KEY`, Các key của `MOMO`, `EMAIL_USER`, `EMAIL_PASS`
Khởi chạy Server:
```bash
npm run dev
```

### Bước 3: Cấu hình và chạy Frontend
Mở một terminal mới và di chuyển vào thư mục frontend:
```bash
cd frontend
npm install
```
Tạo file `.env` và cung cấp token cho bản đồ:
- `VITE_MAPBOX_TOKEN=your_mapbox_token_here`
Khởi chạy giao diện người dùng:
```bash
npm run dev
```
Sau đó, bạn có thể truy cập hệ thống tại: http://localhost:5173

---

## Tài Khoản Đăng Nhập Mẫu

Để thuận tiện cho việc đánh giá và kiểm thử, bạn có thể sử dụng các tài khoản có sẵn dưới đây:

| Vai trò            | Email                    | Mật khẩu   |
| ------------------ | ------------------------ | ---------- |
| Admin              | admin2@speedyship.vn     | admin123   |
| Điều phối viên     | dieuphoi@speedyship.vn   | 123456     |
| Tài xế             | driver@speedyship.vn     | 123456     |
| Khách hàng         | truongkh@speedyship.vn   | 123456     |

---

## Tác Giả Group34_KLTN_2026

SpeedyShip Team - Đồ án tốt nghiệp

- Mang Chí Ngọc Trường
- Nguyễn Đắc Bảo
- Nguyễn Bảo Minh
- Hồ Thái Tuấn Khanh
- Hồ Quốc Khanh

Bản quyền thuộc về SpeedyShip KLTN DTU 03/2026 Group34 GitHub!
