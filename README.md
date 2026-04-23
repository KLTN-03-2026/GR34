# SpeedyShip - Hệ Thống Quản Lý Vận Chuyển Logistics

> Website quản lý logistics tích hợp AI, hỗ trợ quản lý đơn hàng, tài xế, thanh toán trực tuyến và chat thời gian thực.

---

## Mục Lục

- [Giới thiệu](#-giới-thiệu)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)
- [Cài đặt và chạy dự án](#-cài-đặt-và-chạy-dự-án)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Tài khoản đăng nhập mẫu](#-tài-khoản-đăng-nhập-mẫu)
- [Tính năng chính](#-tính-năng-chính)
- [API Endpoints](#-api-endpoints)
- [Cơ sở dữ liệu](#-cơ-sở-dữ-liệu)

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

## Yêu Cầu Hệ Thống

Trước khi bắt đầu, hãy đảm bảo máy tính đã cài đặt:

| Phần mềm             | Phiên bản tối thiểu | Link tải                                            |
| -------------------- | ------------------- | --------------------------------------------------- |
| **Node.js**          | v18.x trở lên       | [nodejs.org](https://nodejs.org/)                   |
| **npm**              | v9.x trở lên        | (đi kèm Node.js)                                    |
| **MySQL**            | 8.x                 | [mysql.com](https://dev.mysql.com/downloads/)       |
| **XAMPP** (tùy chọn) | 8.x                 | [apachefriends.org](https://www.apachefriends.org/) |
| **Git**              | Bất kỳ              | [git-scm.com](https://git-scm.com/)                 |

> **Gợi ý**: Nếu dùng XAMPP, MySQL và phpMyAdmin đã được tích hợp sẵn, rất thuận tiện cho việc import database.

---

## Cài Đặt Và Chạy Dự Án

### Bước 1: Clone dự án

```bash
git clone <repository-url>
cd MyProject
```

---

### Bước 2: Cài đặt Cơ sở dữ liệu MySQL

#### Cách 1: Dùng phpMyAdmin (XAMPP)

1. Mở **XAMPP Control Panel**, khởi động **Apache** và **MySQL**
2. Truy cập [http://localhost/phpmyadmin](http://localhost/phpmyadmin)
3. Tạo database mới với tên: `speedyship`
   - Encoding: `utf8mb4_unicode_ci`
4. Chọn database `speedyship` → Tab **Import**
5. Chọn file `speedyship.sql` trong thư mục gốc dự án
6. Nhấn **Go** để import

#### Cách 2: Dùng Command Line

```bash
# Đăng nhập MySQL
mysql -u root -p

# Tạo database
CREATE DATABASE speedyship CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Thoát MySQL
exit

# Import dữ liệu
mysql -u root -p speedyship < speedyship.sql
```

---

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
# DB_PORT=3306   (mặc định, thêm nếu MySQL chạy port khác)

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

## Cấu Trúc Thư Mục

```
KLTN_GR34_03-26/
├──  backend/                  # Server-side (Node.js + Express)
│   ├──  config/               # Cấu hình database (db.js)
│   ├──  controllers/          # Xử lý logic nghiệp vụ
│   │   ├── authController.js        # Đăng nhập, đăng ký, JWT
│   │   ├── shipmentController.js    # Quản lý đơn hàng
│   │   ├── driverController.js      # Quản lý tài xế
│   │   ├── paymentController.js     # Thanh toán (COD, MoMo)
│   │   ├── aiController.js          # Tích hợp AI (Groq)
│   │   ├── chatController.js        # Chat hỗ trợ
│   │   ├── newsController.js        # Quản lý tin tức
│   │   ├── shippingController.js    # Tính phí vận chuyển
│   │   └── ...                      # Các controller khác
│   ├──  middleware/            # Middleware (xác thực JWT, phân quyền)
│   ├──  routes/                # Định tuyến API
│   ├──  socket/                # Socket.IO (chat & notification)
│   ├──  uploads/               # Thư mục lưu ảnh upload
│   ├──  utils/                 # Tiện ích dùng chung
│   ├── .env                      # Biến môi trường
│   ├── package.json
│   └── server.js                 # Entry point backend
│
├──  frontend/                  # Client-side (React + Vite)
│   ├──  public/                # File tĩnh
│   ├──  src/
│   │   ├──  assets/            # Hình ảnh, icon
│   │   ├──  components/        # Component dùng chung
│   │   │   ├── Navbar.jsx            # Thanh điều hướng
│   │   │   ├── Footer.jsx            # Chân trang
│   │   │   ├── ChatBubble.jsx        # Chat popup
│   │   │   ├── MapPicker.jsx         # Bản đồ chọn vị trí
│   │   │   ├── CreateOrder.jsx       # Form tạo đơn
│   │   │   └── ...
│   │   ├──  context/           # React Context (Auth, Socket)
│   │   ├──  hooks/             # Custom hooks
│   │   ├──  layouts/           # Layout chung (Admin, Customer...)
│   │   ├──  pages/             # Các trang
│   │   │   ├── Home.jsx              # Trang chủ
│   │   │   ├── Login.jsx             # Đăng nhập
│   │   │   ├── Register.jsx          # Đăng ký
│   │   │   ├── Tracking.jsx          # Tra cứu đơn hàng
│   │   │   ├──  admin/             # Trang Admin
│   │   │   ├──  customer/          # Trang Khách hàng
│   │   │   ├──  dispatcher/        # Trang Điều phối viên
│   │   │   ├──  driver/            # Trang Tài xế
│   │   │   └── ...
│   │   ├──  routes/            # Cấu hình route
│   │   ├──  services/          # API service (axios)
│   │   ├── App.jsx               # Root component
│   │   └── main.jsx              # Entry point
│   ├── .env                      # Biến môi trường frontend
│   ├── vite.config.js            # Cấu hình Vite
│   ├── tailwind.config.js        # Cấu hình TailwindCSS
│   └── package.json
```

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

## Tính Năng Chính

### Trang Công Khai

- Trang chủ giới thiệu dịch vụ với animation (AOS, Framer Motion)
- Tra cứu đơn hàng theo mã vận đơn (tracking code)
- Trang dịch vụ, giới thiệu, liên hệ
- Tin tức & Blog
- Đăng ký làm tài xế trực tuyến

### Khách Hàng

- Đăng ký / Đăng nhập (OTP Email)
- Tạo đơn hàng mới với bản đồ chọn vị trí (Mapbox)
- Chọn địa chỉ theo Tỉnh/Quận/Phường (API)
- Theo dõi đơn hàng realtime
- Thanh toán COD hoặc MoMo
- Chat hỗ trợ trực tuyến (Socket.IO)
- Quản lý sổ địa chỉ
- Đánh giá phản hồi dịch vụ
- Quên mật khẩu (OTP qua email)

### Tài Xế

- Dashboard đơn hàng được phân công
- Cập nhật trạng thái đơn (picking → delivering → delivered)
- Nhận thông báo realtime khi có đơn mới
- Xem lịch sử giao hàng

### Điều Phối Viên

- Quản lý và phân công đơn hàng cho tài xế
- Theo dõi vị trí tài xế trên bản đồ
- Chat hỗ trợ khách hàng
- Quản lý yêu cầu liên hệ
- Nhận thông báo đơn hàng mới

### Quản Trị Viên (Admin)

- Dashboard thống kê (biểu đồ doanh thu, đơn hàng, tài xế)
- Quản lý người dùng (CRUD)
- Quản lý tài xế & đơn đăng ký tài xế
- Quản lý phương tiện
- Quản lý đơn hàng & thanh toán
- Quản lý tin tức (WYSIWYG Editor)
- Cấu hình hệ thống
- Xuất báo cáo PDF

---

## Cơ Sở Dữ Liệu

Database sử dụng **MySQL 8.x** với charset `utf8mb4_unicode_ci`.

---

- **MoMo Sandbox**: Dự án sử dụng môi trường test của MoMo. Các giao dịch không phải tiền thật.
- **Socket.IO**: Chat và thông báo hoạt động realtime. Cần cả backend và frontend cùng chạy.
- **File upload**: Ảnh được lưu tại `backend/uploads/` và serve tĩnh qua `/uploads/*`.
- **Hot Reload**: Backend dùng `nodemon`, Frontend dùng `Vite HMR` - tự động reload khi thay đổi code.

---

## Tác Giả Group34_KLTN_2026

**SpeedyShip Team** - Đồ án tốt nghiệp

---

_Bản quyền thuộc về SpeedyShip KLTN DTU 03/2026 Group34 GitHub!_
