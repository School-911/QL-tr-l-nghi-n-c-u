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

## Kiến trúc thư mục

```text
tro_ly_nghien_cuu/
├── frontend/   # React + Vite + TailwindCSS
├── backend/    # Node.js + Express, auth, upload file
├── ai_core/    # FastAPI, xử lý AI, MongoDB history/workspace
└── .gitignore
```

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

Frontend hiện đang gọi API theo địa chỉ cố định `localhost:5000` và `localhost:8000` trong code.

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

### Không gửi được email quên mật khẩu

Kiểm tra `backend/.env` có `GMAIL_USER` và `GMAIL_APP_PASSWORD`, hoặc cấu hình SMTP đầy đủ. Với Gmail cần dùng App Password, không dùng mật khẩu đăng nhập Gmail thường.

### Upload file lỗi

Kiểm tra:

- Backend đang chạy port `5000`.
- AI Core đang chạy port `8000`.
- `backend/.env` có `AI_CORE_URL=http://localhost:8000`.
- File không vượt quá 50MB.

