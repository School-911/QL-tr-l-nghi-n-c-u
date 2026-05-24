# School Research

School Research là web trợ lý nghiên cứu dùng AI để phân tích tài liệu hoặc URL, tạo báo cáo tổng hợp, lưu lịch sử theo tài khoản/workspace và hỗ trợ làm việc nhóm.

## Tính năng chính

- Đăng ký, đăng nhập và quên mật khẩu bằng mã xác nhận email.
- Tải file hoặc nhập URL để AI phân tích và tạo báo cáo nghiên cứu.
- Lưu lịch sử nghiên cứu trong MongoDB, có tìm kiếm, lọc ngày, phân trang, xem chi tiết và tải lại file gốc.
- Dashboard biểu đồ thống kê theo workspace.
- Quản lý nhóm/workspace: mời thành viên, phân quyền, cài đặt quyền hiển thị, tham gia bằng link.
- Trung tâm thông báo cho lời mời, yêu cầu tham gia, thông báo hệ thống.
- Hỗ trợ nhiều provider AI: Llama API/Groq/Together/OpenRouter, Ollama local, Gemini, OpenAI.

## Cấu trúc thư mục chi tiết

```text
tro_ly_nghien_cuu/
├── frontend/                         # Ứng dụng giao diện React + Vite + TailwindCSS
│   ├── src/
│   │   ├── App.jsx                   # Component gốc, quản lý state chính và điều hướng trang
│   │   ├── main.jsx                  # Điểm khởi chạy React
│   │   ├── index.css                 # TailwindCSS và style toàn cục
│   │   ├── components/               # Component dùng chung
│   │   │   ├── AppHeader.jsx         # Thanh điều hướng, logo, theme, thông báo
│   │   │   ├── AuthScreen.jsx        # Giao diện đăng nhập, đăng ký, quên mật khẩu
│   │   │   ├── DateFilter.jsx        # Bộ lọc ngày dùng cho lịch sử và biểu đồ
│   │   │   └── charts.jsx            # Stat cards, biểu đồ cột, biểu đồ donut
│   │   ├── pages/                    # Các trang chức năng chính
│   │   │   ├── HomePage.jsx          # Trang chủ: thiết lập câu hỏi, upload file/URL, kết quả
│   │   │   ├── HistoryPage.jsx       # Trang lịch sử: tìm kiếm, lọc ngày, phân trang, chi tiết
│   │   │   ├── AnalyticsPage.jsx     # Trang biểu đồ và thống kê
│   │   │   ├── TeamPage.jsx          # Trang quản lý nhóm/workspace
│   │   │   └── NotificationsPage.jsx # Trang thông báo hệ thống và lời mời
│   │   ├── lib/
│   │   │   ├── constants.js          # Hằng số dùng chung
│   │   │   └── helpers.js            # Hàm tiện ích: ngày tháng, workspace, mật khẩu
│   │   └── services/
│   │       └── api.js                # Hàm gọi API dùng chung cho frontend
│   ├── package.json                  # Scripts và dependencies frontend
│   ├── vite.config.js                # Cấu hình Vite
│   └── tailwind.config.js            # Cấu hình TailwindCSS
│
├── backend/                          # API trung gian Node.js + Express
│   ├── src/
│   │   ├── server.js                 # Điểm khởi chạy Express server
│   │   ├── config/
│   │   │   ├── db.js                 # Kết nối MongoDB
│   │   │   └── mailer.js             # Cấu hình gửi email quên mật khẩu
│   │   ├── controllers/
│   │   │   ├── auth.controller.js    # Đăng ký, đăng nhập, quên/đặt lại mật khẩu
│   │   │   ├── file.controller.js    # Upload file và chuyển request sang AI Core
│   │   │   ├── health.controller.js  # Endpoint kiểm tra trạng thái backend
│   │   │   └── research.controller.js# Controller liên quan nghiên cứu
│   │   ├── middlewares/
│   │   │   └── auth.middleware.js    # Middleware xác thực JWT
│   │   ├── models/
│   │   │   ├── user.model.js         # Schema người dùng
│   │   │   ├── file.model.js         # Schema file
│   │   │   └── researchHistory.model.js # Schema lịch sử nghiên cứu phía backend
│   │   ├── routes/
│   │   │   └── api.routes.js         # Khai báo route API chính
│   │   └── utils/
│   │       └── password.js           # Kiểm tra độ mạnh mật khẩu
│   ├── package.json                  # Scripts và dependencies backend
│   └── uploads/                      # File upload runtime, không commit lên Git
│
├── ai_core/                          # Dịch vụ FastAPI xử lý AI, lịch sử, workspace
│   ├── app.py                        # Điểm khởi chạy FastAPI, CORS, include router
│   ├── schemas.py                    # Pydantic schema cho request/response
│   ├── requirements.txt              # Dependencies Python
│   ├── core/
│   │   ├── settings.py               # Đọc biến môi trường, cấu hình AI/MongoDB
│   │   ├── database.py               # Kết nối MongoDB, serialize, lưu lịch sử
│   │   └── __init__.py
│   ├── routers/
│   │   ├── system.py                 # Health check và route hệ thống
│   │   ├── research.py               # Xử lý nghiên cứu, lịch sử, tải file gốc
│   │   ├── workspaces.py             # Workspace, thành viên, thông báo, hoạt động nhóm
│   │   └── __init__.py
│   └── services/
│       ├── ai_providers.py           # Gọi Llama/Groq/Ollama/Gemini/OpenAI
│       ├── extractors.py             # Trích xuất nội dung từ file hoặc URL
│       └── workspaces.py             # Logic tiện ích cho workspace và notification
│
├── README.md                         # Tài liệu giới thiệu và hướng dẫn chạy dự án
└── .gitignore                        # Chặn .env, node_modules, dist, venv, uploads...
```

Các thư mục/file runtime không nên commit lên Git:

- `frontend/node_modules/`, `frontend/dist/`
- `backend/node_modules/`, `backend/uploads/`
- `ai_core/venv/`, `ai_core/__pycache__/`
- Tất cả file `.env`

Luồng xử lý chính:

1. Frontend chạy ở `http://localhost:3000`.
2. Backend Express chạy ở `http://localhost:5000`.
3. AI Core FastAPI chạy ở `http://localhost:8000`.
4. MongoDB lưu user, lịch sử, workspace, thành viên và thông báo.

## Yêu cầu cài đặt

- Node.js 18 trở lên.
- Python 3.10 trở lên.
- MongoDB Atlas hoặc MongoDB local.
- Ít nhất một AI provider được cấu hình, khuyến nghị `GROQ_API_KEY` hoặc `LLAMA_API_KEY`.

## 1. Clone project

```bash
git clone <repo-url>
cd tro_ly_nghien_cuu
```

## 2. Cấu hình biến môi trường

Không commit file `.env` lên Git. Hãy tự tạo file `.env` theo mẫu dưới đây.

### `backend/.env`

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<database>?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret
AI_CORE_URL=http://localhost:8000

# Dùng cho quên mật khẩu qua Gmail app password
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-gmail-app-password
MAIL_FROM=School Research <your-email@gmail.com>
```

Nếu dùng SMTP khác Gmail:

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-user
SMTP_PASS=your-password
MAIL_FROM=School Research <your-user@example.com>
```

### `ai_core/.env`

```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<database>?retryWrites=true&w=majority
MONGO_DB=research_db
MONGO_COLLECTION=research_history

# Khuyến nghị dùng Groq/Llama
GROQ_API_KEY=your_groq_key
LLAMA_MODEL=llama-3.1-8b-instant

# Tùy chọn
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1
```

### `frontend/.env`

Khi chạy local:

```env
VITE_BACKEND_API_URL=http://localhost:5000
VITE_AI_CORE_API_URL=http://localhost:8000
```

Khi deploy lên Vercel, đặt 2 biến môi trường này trong **Project Settings -> Environment Variables**:

```env
VITE_BACKEND_API_URL=https://<backend-render-service>.onrender.com
VITE_AI_CORE_API_URL=https://<ai-core-render-service>.onrender.com
```

Lưu ý: không dùng `localhost` trên Vercel. Trên điện thoại, `localhost` là chính điện thoại nên sẽ gây lỗi `Failed to fetch`.

## 3. Cài dependencies

### Frontend

```bash
cd frontend
npm install
```

### Backend

```bash
cd ../backend
npm install
```

### AI Core

```bash
cd ../ai_core
python -m venv venv
```

Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

macOS/Linux:

```bash
source venv/bin/activate
pip install -r requirements.txt
```

Nếu thiếu thư viện đọc PDF/DOCX, cài thêm:

```bash
pip install pymupdf beautifulsoup4 requests python-dotenv
```

## 4. Chạy dự án

Mở 3 terminal riêng.

### Terminal 1: AI Core

```bash
cd ai_core
python -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

Kiểm tra:

```text
http://localhost:8000/health
```

### Terminal 2: Backend

```bash
cd backend
npm run dev
```

Nếu không dùng nodemon:

```bash
npm start
```

Kiểm tra:

```text
http://localhost:5000/api/health
```

### Terminal 3: Frontend

```bash
cd frontend
npm run dev
```

Mở trình duyệt:

```text
http://localhost:3000
```

## 5. Build frontend

```bash
cd frontend
npm run build
```

File build nằm trong `frontend/dist`.

## Ghi chú về MongoDB Atlas

Nếu backend hoặc AI Core không kết nối được MongoDB:

- Kiểm tra `MONGO_URI` đúng username/password.
- Vào MongoDB Atlas -> Network Access -> Add IP Address.
- Khi phát triển nhanh có thể chọn Allow Access From Anywhere, nhưng production nên giới hạn IP.
- Đảm bảo database name trong `MONGO_DB` khớp với project.

## Ghi chú về AI provider

Thứ tự fallback trong AI Core:

1. Llama API/Groq/Together/OpenRouter nếu có key.
2. Ollama local nếu đang chạy.
3. Gemini nếu có key.
4. OpenAI nếu có key.
5. Báo cáo fallback tạm thời nếu tất cả provider lỗi.

Nếu muốn dùng Ollama local:

```bash
ollama pull llama3.1
ollama serve
```

## Lưu ý bảo mật

- Không commit `.env`.
- Không commit `node_modules`, `dist`, `venv`, `uploads`.
- Nếu API key từng bị commit lên GitHub, hãy đổi key ngay.
- Nên tạo file `.env.example` riêng nếu muốn chia sẻ cấu hình mẫu.

## Lỗi thường gặp

### Frontend báo CORS khi gọi AI Core

Thường nguyên nhân thật là AI Core trả lỗi `500`. Hãy kiểm tra terminal chạy AI Core hoặc gọi:

```text
http://localhost:8000/health
```

### Deploy Vercel/Render bị `Failed to fetch` khi đăng nhập hoặc đăng ký

Nguyên nhân thường gặp là frontend production vẫn gọi `localhost`, URL Render sai, hoặc Vercel chưa redeploy sau khi đổi biến môi trường.

Kiểm tra nhanh:

- Trên trang đăng nhập bấm **Kiểm tra kết nối API** để xem frontend đang gọi backend URL nào.
- Mở trực tiếp URL health của backend Render:

```text
https://<backend-render-service>.onrender.com/api/health
```

- Trong Vercel phải có biến:

```env
VITE_BACKEND_API_URL=https://<backend-render-service>.onrender.com
VITE_AI_CORE_API_URL=https://<ai-core-render-service>.onrender.com
```

- Sau khi thêm/sửa biến môi trường trên Vercel, cần **Redeploy** frontend.
- Không dùng `http://` cho Render khi frontend chạy `https://`, vì trình duyệt có thể chặn mixed content.
- Bản production sẽ không fallback về `localhost`; nếu thiếu env, màn hình sẽ báo `Frontend production chưa cấu hình VITE_BACKEND_API_URL`.

### Không gửi được email quên mật khẩu

Kiểm tra `backend/.env` có `GMAIL_USER` và `GMAIL_APP_PASSWORD`, hoặc cấu hình SMTP đầy đủ. Với Gmail cần dùng App Password, không dùng mật khẩu đăng nhập Gmail thường.

### Upload file lỗi

Kiểm tra:

- Backend đang chạy port `5000`.
- AI Core đang chạy port `8000`.
- `backend/.env` có `AI_CORE_URL=http://localhost:8000`.
- File không vượt quá 50MB.
