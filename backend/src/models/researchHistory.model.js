const mongoose = require('mongoose');

/**
 * Schema lưu trữ lịch sử phiên phân tích/nghiên cứu
 * Tuân thủ quy tắc: Lưu trữ toàn bộ metadata và kết quả của mỗi yêu cầu
 */
const researchHistorySchema = new mongoose.Schema(
  {
    // Câu hỏi/yêu cầu gốc từ người dùng
    user_query: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
      description: "Câu hỏi hoặc yêu cầu gốc của người dùng"
    },

    // Đường dẫn URL hoặc tên tệp người dùng cung cấp
    target_url: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
      description: "Đường dẫn URL hoặc tên tệp nguồn"
    },

    // Mục tiêu nghiên cứu phân tích được
    research_objective: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
      description: "Mục tiêu nghiên cứu phân tích được từ query"
    },

    // Trạng thái: success (thành công) hoặc failed (lỗi)
    status: {
      type: String,
      enum: ['success', 'failed'],
      default: 'pending',
      description: "Trạng thái thực thi: success hoặc failed"
    },

    // Toàn bộ nội dung báo cáo kết quả hoặc thông báo lỗi
    response_content: {
      type: String,
      required: true,
      maxlength: 50000,
      description: "Nội dung báo cáo kết quả HOẶC thông báo lỗi"
    },

    // Mã lỗi (nếu có)
    error_code: {
      type: String,
      default: null,
      description: "Mã lỗi nếu status là 'failed'"
    },

    // Chi tiết lỗi (nếu có)
    error_details: {
      type: String,
      default: null,
      maxlength: 2000,
      description: "Chi tiết lỗi chi tiết nếu xảy ra"
    },

    // Thủ dung (User ID - nếu có hệ thống xác thực)
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      description: "ID của người dùng thực hiện yêu cầu"
    },

    // Session ID từ AI Core
    session_id: {
      type: String,
      default: null,
      maxlength: 500,
      description: "Session ID từ AI Core xử lý yêu cầu"
    },

    // Thời gian xử lý (ms)
    processing_time_ms: {
      type: Number,
      default: 0,
      description: "Thời gian xử lý yêu cầu (milliseconds)"
    },

    // Metadata bổ sung
    metadata: {
      type: Object,
      default: {},
      description: "Metadata bổ sung như số trang PDF, số lượng từ khóa, v.v."
    }
  },
  {
    timestamps: true,
    collection: 'research_histories'
  }
);

// Index để tối ưu tìm kiếm
researchHistorySchema.index({ user_query: 'text', research_objective: 'text' });
researchHistorySchema.index({ user_id: 1, createdAt: -1 });
researchHistorySchema.index({ status: 1, createdAt: -1 });
researchHistorySchema.index({ createdAt: -1 });

// Model
const ResearchHistory = mongoose.model('ResearchHistory', researchHistorySchema);

module.exports = ResearchHistory;
