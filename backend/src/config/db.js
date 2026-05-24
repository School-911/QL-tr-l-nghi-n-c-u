const mongoose = require('mongoose');

/**
 * Hàm khởi tạo kết nối tới MongoDB Atlas Cloud.
 * Đọc chuỗi kết nối từ biến môi trường MONGO_URI hoặc MONGODB_URI.
 * Nếu gặp lỗi mạng hoặc thiếu cấu hình, in ra hướng dẫn rõ ràng
 * mà KHÔNG làm sập server Backend Express.
 */
const connectDB = async () => {
  // Hỗ trợ cả hai tên biến môi trường để tránh xung đột cấu hình
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

  // ── Kiểm tra biến môi trường ──────────────────────────────────────
  if (!mongoUri || mongoUri.includes('<username>') || mongoUri.includes('<password>')) {
    console.error('\n══════════════════════════════════════════════════════');
    console.error('⚠️  CẢNH BÁO: Chưa cấu hình chuỗi kết nối MongoDB Atlas!');
    console.error('══════════════════════════════════════════════════════');
    console.error('👉 Hướng dẫn lấy chuỗi kết nối MongoDB Atlas Cloud:');
    console.error('   1. Truy cập https://cloud.mongodb.com và đăng nhập.');
    console.error('   2. Chọn Cluster của bạn → Nhấn nút "Connect".');
    console.error('   3. Chọn "Connect your application" → Driver: Node.js.');
    console.error('   4. Sao chép chuỗi kết nối dạng: mongodb+srv://...');
    console.error('   5. Mở file backend/.env và điền vào biến MONGO_URI=');
    console.error('──────────────────────────────────────────────────────');
    console.error('⚡ Server Backend vẫn khởi động nhưng các tính năng');
    console.error('   cần Database (Auth, lưu file) sẽ không hoạt động.\n');
    return; // Không làm sập server, chỉ thoát hàm kết nối
  }

  // ── Thử kết nối tới MongoDB Atlas ────────────────────────────────
  try {
    console.log('🔗 Đang kết nối tới MongoDB Atlas Cloud...');

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000, // Chờ tối đa 10 giây trước khi báo lỗi
      socketTimeoutMS: 45000,
    });

    console.log(`✅ Kết nối MongoDB Atlas thành công: ${conn.connection.host}`);

    // Lắng nghe sự kiện mất kết nối để thông báo rõ ràng
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  Mất kết nối MongoDB Atlas. Đang thử kết nối lại...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ Đã kết nối lại MongoDB Atlas thành công.');
    });

  } catch (error) {
    // ── Bắt lỗi mạng / sai credentials Atlas ──────────────────────
    console.error('\n══════════════════════════════════════════════════════');
    console.error('❌ Lỗi kết nối MongoDB Atlas Cloud!');
    console.error('══════════════════════════════════════════════════════');
    console.error(`   Chi tiết lỗi: ${error.message}`);
    console.error('');
    console.error('   Nguyên nhân thường gặp:');
    console.error('   • Sai <username> hoặc <password> trong MONGO_URI');
    console.error('   • IP máy hiện tại chưa được thêm vào Atlas IP Whitelist');
    console.error('     (Vào Atlas → Network Access → Add IP Address → Allow from Anywhere)');
    console.error('   • Không có kết nối Internet ổn định');
    console.error('──────────────────────────────────────────────────────');
    console.error('⚡ Server Backend vẫn khởi động để phục vụ Frontend.\n');
    // Không gọi process.exit() - server tiếp tục chạy bình thường
  }
};

module.exports = connectDB;
