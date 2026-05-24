require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const connectDB = async () => {
  const connDB = require('./config/db');
  await connDB();
};

const app = express();
const PORT = process.env.PORT || 5000;

// Khởi chạy kết nối Database MongoDB
connectDB();

// ==========================================
// Tự động khởi tạo thư mục uploads
// ==========================================
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`📁 Thư mục lưu trữ tạm thời tệp tải lên đã được khởi tạo: ${uploadDir}`);
}

// ==========================================
// Cấu hình Middleware
// ==========================================

// Xử lý CORS - Cho phép Frontend React/Vercel truy cập
const corsOptions = {
  origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',').map((item) => item.trim()) : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Middleware phân tích cú pháp dữ liệu JSON đầu vào
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cấu hình static folder phục vụ các tệp tin tải lên (nếu có nhu cầu xem tệp)
app.use('/uploads', express.static(uploadDir));

// ==========================================
// Cấu hình Routes
// ==========================================

const apiRoutes = require('./routes/api.routes');

// Đăng ký toàn bộ các route của ứng dụng với tiền tố /api
app.use('/api', apiRoutes);

// Fallback Route xử lý lỗi 404
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint không tồn tại. Vui lòng kiểm tra lại đường dẫn.'
  });
});

// Middleware xử lý lỗi hệ thống toàn cục (Global Error Handler)
app.use((err, req, res, next) => {
  // Bắt lỗi giới hạn dung lượng tệp tin từ Multer
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      status: 'error',
      message: 'Tải tệp tin thất bại. Tệp tin vượt quá dung lượng cho phép tối đa 50MB.'
    });
  }

  // Bắt lỗi bộ lọc định dạng tệp từ Multer
  if (err.message && err.message.includes('không được hỗ trợ')) {
    return res.status(400).json({
      status: 'error',
      message: err.message
    });
  }

  console.error(`Lỗi hệ thống: ${err.message}`);
  res.status(err.status || 500).json({
    status: 'error',
    message: 'Đã xảy ra lỗi hệ thống nghiêm trọng trong quá trình xử lý.',
    error: err.message
  });
});

// Khởi động server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Server Backend Express đang chạy trên cổng: ${PORT}`);
  console.log(`🔗 Địa chỉ Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});
