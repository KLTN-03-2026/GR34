# SpeedyShip - Hệ Thống Quản Lý Vận Chuyển Logistics

> Website quản lý logistics tích hợp AI, hỗ trợ quản lý đơn hàng, tài xế, thanh toán trực tuyến và chat thời gian thực.

---

## Giới Thiệu

**SpeedyShip** là hệ thống quản lý vận chuyển logistics toàn diện, bao gồm:

- **Website công khai**: Trang chủ, dịch vụ, tra cứu đơn hàng, tin tức, liên hệ
- **Portal Khách hàng**: Tạo đơn, theo dõi đơn hàng, lịch sử, chat hỗ trợ
- **Portal Tài xế**: Nhận đơn, cập nhật trạng thái, vị trí GPS
- **Portal Điều phối viên**: Phân công tài xế, quản lý đơn hàng, chat hỗ trợ
- **Portal Quản trị viên (Admin)**: Dashboard thống kê, quản lý người dùng, tài xế, phương tiện, thanh toán, tin tức

---

## Công Nghệ Sử Dụng

### Backend

| Công nghệ      | Mô tả                                   |
| -------------- | --------------------------------------- |
| **Node.js**    | Runtime JavaScript                      |
| **Express.js** | Web framework                           |
| **MySQL 8.x**  | Cơ sở dữ liệu quan hệ                   |
| **Socket.IO**  | Chat & thông báo thời gian thực         |
| **JWT**        | Xác thực (Access Token + Refresh Token) |
| **Bcrypt**     | Mã hóa mật khẩu                         |
| **Multer**     | Upload file/ảnh                         |
| **Nodemailer** | Gửi email OTP                           |
| **Axios**      | Gọi API bên thứ ba (MoMo, AI)           |

### Frontend

| Công nghệ               | Mô tả                       |
| ----------------------- | --------------------------- |
| **React 19**            | UI Library                  |
| **Vite (Rolldown)**     | Build tool                  |
| **React Router v7**     | Điều hướng SPA              |
| **TailwindCSS 3**       | CSS Framework               |
| **Chart.js / Recharts** | Biểu đồ thống kê            |
| **Mapbox GL**           | Bản đồ tương tác            |
| **Socket.IO Client**    | Kết nối realtime            |
| **Framer Motion**       | Animation                   |
| **React Quill**         | Soạn thảo văn bản (tin tức) |
| **Swiper**              | Carousel/Slider             |
| **jsPDF**               | Xuất PDF                    |

### Dịch vụ bên thứ ba

| Dịch vụ           | Mô tả                                   |
| ----------------- | --------------------------------------- |
| **MoMo Sandbox**  | Thanh toán trực tuyến (môi trường test) |
| **Groq AI (LLM)** | Tích hợp AI hỗ trợ                      |
| **Mapbox**        | Hiển thị bản đồ & vị trí                |
| **Gmail SMTP**    | Gửi mã OTP xác thực                     |

---

## Cài Đặt Và Chạy Dự Án

### Bước 1: Clone dự án

```bash
git clone <repository-url>
cd KLTN_GR34_03-26
```

---

### Bước 2: Cài đặt Cơ sở dữ liệu MySQL

#### Dùng phpMyAdmin (XAMPP)

1. Mở **XAMPP Control Panel**, khởi động **Apache** và **MySQL**
2. Truy cập [http://localhost/phpmyadmin](http://localhost/phpmyadmin)
3. Tạo database mới với tên: `speedyship`
   - Encoding: `utf8mb4_unicode_ci`
4. Chọn database `speedyship` → Tab **Import**
5. Chọn file `speedyship.sql` trong thư mục gốc dự án
6. Nhấn **Go** để import

### Bước 3: Cấu hình Backend

#### 3.1. Di chuyển vào thư mục backend

```bash
cd backend
```

#### 3.2. Cài đặt dependencies

```bash
npm install
```

#### 3.3. Cấu hình file `.env`

Tạo file `.env` trong thư mục `backend/` (hoặc chỉnh sửa file có sẵn):

```env
# ===== Server =====
PORT=5000

# ===== MySQL Database =====
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=speedyship
# DB_PORT=3306

# ===== JWT Authentication =====
JWT_ACCESS_SECRET=super_access_secret_please_change
JWT_REFRESH_SECRET=super_refresh_secret_please_change
ACCESS_TOKEN_EXPIRES=15m
REFRESH_TOKEN_EXPIRES=2h

# ===== Groq AI =====
GROQ_API_KEY=your_groq_api_key_here

# ===== MoMo Payment (Sandbox) =====
MOMO_PARTNER_CODE=MOMO
MOMO_ACCESS_KEY=F8BBA842ECF85
MOMO_SECRET_KEY=K951B6PE1waDMi640xX08PD3vg6EkVlz
MOMO_REDIRECT_URL=http://localhost:5173/payment-success
MOMO_IPN_URL=http://localhost:5000/api/payments/momo/ipn

# ===== Gmail OTP =====
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# ===== Client URL =====
CLIENT_URL=http://localhost:5173

# ===== Mapbox =====
VITE_MAPBOX_TOKEN=your_mapbox_token_here
```

> **Lưu ý quan trọng về Gmail OTP:**
>
> - `EMAIL_PASS` **không phải** mật khẩu Gmail thông thường
> - Bạn cần tạo **App Password** tại: [Google Account → Security → App Passwords](https://myaccount.google.com/apppasswords)
> - Bật **2-Step Verification** trước khi tạo App Password

> **Lưu ý về Database:**
>
> - `DB_PASS` để trống nếu MySQL không đặt mật khẩu (mặc định XAMPP)
> - Nếu MySQL chạy port khác 3306, thêm `DB_PORT=<port>` vào file `.env`

---

### Bước 4: Cấu hình Frontend

#### 4.1. Di chuyển vào thư mục frontend

```bash
cd ../frontend
```

#### 4.2. Cài đặt dependencies

```bash
npm install
```

#### 4.3. Cấu hình file `.env`

Tạo file `.env` trong thư mục `frontend/`:

```env
VITE_MAPBOX_TOKEN=your_mapbox_token_here
```

> Lấy Mapbox Token miễn phí tại: [mapbox.com](https://www.mapbox.com/) → Account → Access Tokens

---

### Bước 5: Chạy dự án

Mở **2 terminal riêng biệt**:

#### Terminal 1 - Chạy Backend:

```bash
cd backend
npm run dev
```

Kết quả thành công:

```
Server đang chạy tại: http://localhost:5000
MySQL đã kết nối CSDL thành công!
```

#### Terminal 2 - Chạy Frontend:

```bash
cd frontend
npm run dev
```

Kết quả thành công:

```
VITE v7.x.x ready in xxx ms

➜  Local:   http://localhost:5173/
```

---

### Bước 6: Truy cập ứng dụng

Mở trình duyệt và truy cập: **[http://localhost:5173](http://localhost:5173)**

---

## Tài Khoản Đăng Nhập Mẫu

Sau khi import `speedyship.sql`, có thể đăng nhập với các tài khoản sau:

| Vai trò            | Email                    | Mật khẩu   |
| ------------------ | ------------------------ | ---------- |
| **Admin**          | `admin2@speedyship.vn`   | `admin123` |
| **Điều phối viên** | `dieuphoi@speedyship.vn` | `123456`   |
| **Tài xế**         | `driver@speedyship.vn`   | `123456`   |
| **Khách hàng**     | `truongkh@speedyship.vn` | `123456`   |

> Mật khẩu đã được hash bằng bcrypt trong database. Các mật khẩu trên là mật khẩu gốc trước khi hash. Nếu không đăng nhập được, hãy tạo tài khoản mới qua trang Đăng ký.

---

## Tác Giả Group34_KLTN_2026

**SpeedyShip Team** - Đồ án tốt nghiệp

- Mang Chí Ngọc Trường
- Nguyễn Đắc Bảo
- Nguyễn Bảo Minh
- Hồ Thái Tuấn Khanh
- Hồ Quốc Khanh

---

_Bản quyền thuộc về SpeedyShip KLTN DTU 03/2026 Group34 GitHub!_
