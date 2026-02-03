- **React 18** - UI Library
- **Vite** - Build tool
- **Material UI (MUI) v5** - Component library
- **React Router v6** - Routing
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **React Hot Toast** - Notifications

```bash
# 1. Di chuyển vào thư mục frontend
cd frontend

# 2. Cài đặt dependencies
npm install

# 3. Chạy development server
npm run dev

# Server sẽ chạy tại http://localhost:5173
```

```
frontend/
├── public/
├── src/
│   ├── assets/           # Static files (images, fonts)
│   ├── components/       # Reusable components
│   │   ├── common/       # Loading, EmptyState, SearchBar
│   │   ├── layout/       # Header, Footer, MainLayout
│   │   └── books/        # BookCard, BookGrid, CategoryCard
│   ├── config/           # App configuration
│   ├── context/          # React Context (Auth, Cart)
│   ├── hooks/            # Custom hooks
│   ├── pages/            # Page components
│   │   ├── public/       # Home, Books, BookDetail
│   │   ├── auth/         # Login, Register
│   │   ├── user/         # Dashboard, Profile
│   │   └── errors/       # 404, 500
│   ├── routes/           # Route configuration
│   ├── services/         # API services
│   ├── theme/            # MUI theme customization
│   ├── utils/            # Helper functions
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env
├── vite.config.js
└── package.json
```

```bash
npm run dev      # Chạy development server
npm run build    # Build production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

Frontend kết nối với Backend API tại `http://localhost:5000/api`

Để thay đổi API URL, sửa file `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

## 📱 Các trang chính

| Route | Trang | Mô tả |
|-------|-------|-------|
| `/` | Home | Trang chủ với featured books, categories |
| `/books` | Books | Danh sách sách với filter, search |
| `/books/:id` | Book Detail | Chi tiết sách |
| `/categories` | Categories | Danh sách danh mục |
| `/login` | Login | Đăng nhập |
| `/register` | Register | Đăng ký |
| `/cart` | Cart | Giỏ sách (protected) |
| `/dashboard` | Dashboard | Tổng quan user (protected) |
| `/my-books` | My Books | Sách đang mượn (protected) |
| `/favorites` | Favorites | Sách yêu thích (protected) |
| `/profile` | Profile | Hồ sơ cá nhân (protected) |
| `/admin` | Admin | Quản trị (admin only) |

## 🔐 Authentication

- JWT token được lưu trong localStorage
- Auto redirect về login nếu token hết hạn
- Protected routes yêu cầu đăng nhập

## 📝 Development Notes

1. **Proxy**: Vite được cấu hình proxy `/api` tới backend
2. **Context**: AuthContext và CartContext cho global state
3. **Services**: Tất cả API calls được tổ chức trong `/services`
4. **Components**: Reusable components trong `/components`

