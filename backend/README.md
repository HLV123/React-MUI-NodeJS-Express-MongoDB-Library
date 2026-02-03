- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- Node.js >= 18.0.0
- MongoDB (local hoặc Atlas)

```bash
# 1. Di chuyển vào thư mục backend
cd backend

# 2. Cài đặt dependencies
npm install

# 3. Tạo file .env (copy từ .env.example)
cp .env.example .env

# 4. Chỉnh sửa .env theo cấu hình của bạn
# Đặc biệt là MONGODB_URI

# 5. Seed dữ liệu mẫu (chạy 1 lần)
npm run seed:fresh

# 6. Chạy server
npm run dev
```

```bash
npm run dev        # Chạy development với nodemon
npm start          # Chạy production
npm run seed       # Import dữ liệu mẫu (nếu DB trống)
npm run seed:fresh # Xóa DB và import lại từ đầu
```

**Lưu ý về Seed:**
- `npm run seed` - Chỉ thêm dữ liệu nếu DB trống
- `npm run seed:fresh` - Xóa toàn bộ DB và seed lại từ đầu
- Hoặc dùng: `node src/seeds/index.js --fresh`

```
backend/
├── src/
│   ├── config/         # Cấu hình (database, env)
│   ├── controllers/    # Xử lý logic
│   │   ├── authController.js
│   │   ├── bookController.js
│   │   ├── borrowController.js
│   │   ├── cartController.js
│   │   ├── categoryController.js
│   │   ├── notificationController.js
│   │   ├── reviewController.js
│   │   ├── statsController.js
│   │   └── userController.js
│   ├── middleware/     # Auth, error handling, validation
│   ├── models/         # Mongoose schemas
│   │   ├── User.js
│   │   ├── Book.js
│   │   ├── Borrow.js
│   │   ├── Cart.js
│   │   ├── Category.js
│   │   ├── Notification.js
│   │   └── Review.js
│   ├── routes/         # API routes
│   ├── seeds/          # Seed data
│   │   ├── data/       # JSON data files
│   │   │   ├── users.json
│   │   │   ├── categories.json
│   │   │   └── books.json
│   │   └── index.js
│   ├── utils/          # Helper functions
│   └── app.js          # Express app setup
├── server.js           # Entry point
├── .env                # Environment variables
└── package.json
```
Sau khi chạy seed, bạn có thể sử dụng các tài khoản sau:

| Role  | Email                   | Password     |
|-------|-------------------------|--------------|
| Admin | admin@saparethere.com   | admin123456  |
| User  | bons@gmail.com          | user123456   |
| User  | mai.tran@gmail.com      | user123456   |
| User  | tuan.le@gmail.com       | user123456   |
| User  | huong.pham@gmail.com    | user123456   |

Sau khi seed:
- **8 users** (1 admin, 7 users)
- **8 categories** (Văn học, Khoa học, Công nghệ, Kinh tế, Lịch sử, Tâm lý học, Thiếu nhi, Ngoại ngữ)
- **40 books** (sách tiếng Việt và tiếng Anh)
- **8 borrow records** (mượn sách mẫu)
- **8 reviews** (đánh giá sách)
- **4 notifications** (thông báo mẫu)

| Method | Endpoint                | Description      | Auth Required |
|--------|-------------------------|------------------|---------------|
| POST   | /api/auth/register      | Đăng ký          | No            |
| POST   | /api/auth/login         | Đăng nhập        | No            |
| GET    | /api/auth/me            | Lấy thông tin user | Yes         |
| POST   | /api/auth/refresh-token | Refresh token    | Yes           |
| PUT    | /api/auth/change-password | Đổi mật khẩu   | Yes           |

### Books

| Method | Endpoint                | Description           | Auth Required |
|--------|-------------------------|-----------------------|---------------|
| GET    | /api/books              | Danh sách sách        | No            |
| GET    | /api/books/featured     | Sách nổi bật          | No            |
| GET    | /api/books/new-arrivals | Sách mới              | No            |
| GET    | /api/books/popular      | Sách phổ biến         | No            |
| GET    | /api/books/search?q=    | Tìm kiếm              | No            |
| GET    | /api/books/:id          | Chi tiết sách         | No            |
| POST   | /api/books              | [Admin] Thêm sách     | Admin         |
| PUT    | /api/books/:id          | [Admin] Sửa sách      | Admin         |
| DELETE | /api/books/:id          | [Admin] Xóa sách      | Admin         |

### Categories

| Method | Endpoint                     | Description            | Auth Required |
|--------|------------------------------|------------------------|---------------|
| GET    | /api/categories              | Danh sách danh mục     | No            |
| GET    | /api/categories/:slug        | Chi tiết danh mục      | No            |
| GET    | /api/categories/:slug/books  | Sách theo danh mục     | No            |
| POST   | /api/categories              | [Admin] Thêm danh mục  | Admin         |
| PUT    | /api/categories/:id          | [Admin] Sửa danh mục   | Admin         |
| DELETE | /api/categories/:id          | [Admin] Xóa danh mục   | Admin         |

### Borrows

| Method | Endpoint                  | Description              | Auth Required |
|--------|---------------------------|--------------------------|---------------|
| POST   | /api/borrows              | Mượn sách                | Yes           |
| GET    | /api/borrows/my           | Lịch sử mượn của tôi     | Yes           |
| GET    | /api/borrows/current      | Sách đang mượn           | Yes           |
| GET    | /api/borrows/:id          | Chi tiết phiếu mượn      | Yes           |
| PUT    | /api/borrows/:id/extend   | Gia hạn                  | Yes           |
| GET    | /api/borrows              | [Admin] Tất cả đơn mượn  | Admin         |
| GET    | /api/borrows/stats        | [Admin] Thống kê mượn    | Admin         |
| PUT    | /api/borrows/:id/return   | [Admin] Xác nhận trả     | Admin         |
| PUT    | /api/borrows/:id/cancel   | [Admin] Hủy phiếu mượn   | Admin         |

### Cart

| Method | Endpoint              | Description          | Auth Required |
|--------|-----------------------|----------------------|---------------|
| GET    | /api/cart             | Xem giỏ sách         | Yes           |
| POST   | /api/cart             | Thêm vào giỏ         | Yes           |
| DELETE | /api/cart/:bookId     | Xóa khỏi giỏ         | Yes           |
| DELETE | /api/cart             | Xóa toàn bộ giỏ      | Yes           |

### Users

| Method | Endpoint                  | Description            | Auth Required |
|--------|---------------------------|------------------------|---------------|
| GET    | /api/users/me             | Thông tin cá nhân      | Yes           |
| PUT    | /api/users/me             | Cập nhật thông tin     | Yes           |
| GET    | /api/users/favorites      | Danh sách yêu thích    | Yes           |
| POST   | /api/users/favorites/:id  | Thêm yêu thích         | Yes           |
| DELETE | /api/users/favorites/:id  | Xóa yêu thích          | Yes           |
| GET    | /api/users                | [Admin] Danh sách user | Admin         |
| GET    | /api/users/:id            | [Admin] Chi tiết user  | Admin         |
| PUT    | /api/users/:id            | [Admin] Sửa user       | Admin         |
| DELETE | /api/users/:id            | [Admin] Xóa user       | Admin         |

### Reviews

| Method | Endpoint                       | Description         | Auth Required |
|--------|--------------------------------|---------------------|---------------|
| GET    | /api/reviews/book/:bookId      | Reviews của sách    | No            |
| POST   | /api/reviews                   | Thêm review         | Yes           |
| PUT    | /api/reviews/:id               | Sửa review          | Yes           |
| DELETE | /api/reviews/:id               | Xóa review          | Yes           |

### Notifications

| Method | Endpoint                       | Description         | Auth Required |
|--------|--------------------------------|---------------------|---------------|
| GET    | /api/notifications             | Danh sách thông báo | Yes           |
| PUT    | /api/notifications/:id/read    | Đánh dấu đã đọc     | Yes           |
| PUT    | /api/notifications/read-all    | Đọc tất cả          | Yes           |
| DELETE | /api/notifications/:id         | Xóa thông báo       | Yes           |

### Statistics (Admin)

| Method | Endpoint              | Description          | Auth Required |
|--------|-----------------------|----------------------|---------------|
| GET    | /api/stats/dashboard  | Thống kê dashboard   | Admin         |
| GET    | /api/stats/trends     | Xu hướng mượn sách   | Admin         |


API sử dụng JWT Bearer Token. Gửi token trong header:

```
Authorization: Bearer <your_token>
```

**Token Flow:**
1. Login → nhận `accessToken` và `refreshToken`
2. Mỗi request gửi `accessToken` trong header
3. Khi `accessToken` hết hạn → dùng `refreshToken` để lấy token mới


File `.env` cần có các biến sau:

```env
# Server
NODE_ENV=development
PORT=5000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/saparethere-library

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
JWT_REFRESH_EXPIRE=30d

# Borrow Configuration
BORROW_DURATION_DAYS=14
MAX_EXTENSIONS=2
FINE_PER_DAY=5000

# CORS
CORS_ORIGIN=http://localhost:5173
```

```bash
# Chạy development server với hot reload
npm run dev

# Server sẽ chạy tại http://localhost:5000
```

**Lưu ý:**
- Mỗi lần sửa code, nodemon sẽ tự động restart server
- Kiểm tra MongoDB đã chạy trước khi start server
- Port mặc định là 5000, có thể thay đổi trong `.env`


**Backend Server:** http://localhost:5000
**API Documentation:** http://localhost:5000/api