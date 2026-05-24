/**
 * Controller xử lý các yêu cầu nghiên cứu và giao tiếp với lõi AI Agent.
 * POST /api/research
 */
const startResearch = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({
        status: 'error',
        message: 'Trường dữ liệu "query" (câu hỏi nghiên cứu) là bắt buộc.'
      });
    }

    const aiCoreUrl = process.env.AI_CORE_URL || 'http://localhost:8000';
    console.log(`Đang chuyển tiếp câu hỏi nghiên cứu tới AI Core tại: ${aiCoreUrl}/agent/research...`);

    // Sử dụng fetch tích hợp sẵn của Node.js (từ Node v18+) để gọi sang AI Core (FastAPI)
    const response = await fetch(`${aiCoreUrl}/agent/research`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      throw new Error(`AI Core trả về mã lỗi: ${response.status}`);
    }

    const data = await response.json();

    return res.status(200).json({
      status: 'success',
      message: 'Nhận kết quả nghiên cứu thành công từ AI Core.',
      data: data
    });
  } catch (error) {
    console.error(`Lỗi giao tiếp với AI Core: ${error.message}`);
    return res.status(502).json({
      status: 'error',
      message: 'Không thể kết nối hoặc nhận phản hồi đúng từ AI Core.',
      error: error.message
    });
  }
};

module.exports = {
  startResearch
};
