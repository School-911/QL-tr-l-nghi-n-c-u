import axios from 'axios';
import { BACKEND_API } from '../lib/constants';

// Khởi tạo instance axios theo URL backend của môi trường hiện tại.
const api = axios.create({
  baseURL: `${BACKEND_API}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Gọi API kiểm tra sức khỏe của Backend và DB
 */
export const checkBackendHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Lỗi khi gọi API health check:', error.message);
    throw error;
  }
};

/**
 * Gửi yêu cầu câu hỏi nghiên cứu sang Backend (để Backend chuyển tiếp tới AI Core)
 * @param {string} query - Câu hỏi hoặc chủ đề nghiên cứu
 */
export const requestResearch = async (query) => {
  try {
    const response = await api.post('/research', { query });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi gửi yêu cầu nghiên cứu:', error.message);
    throw error;
  }
};

export default api;
