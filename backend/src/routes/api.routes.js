const express = require('express');
const router = express.Router();
const healthController = require('../controllers/health.controller');
const researchController = require('../controllers/research.controller');
const authController = require('../controllers/auth.controller');
const fileController = require('../controllers/file.controller');
const { protect } = require('../middlewares/auth.middleware');

// ==========================================
// 1. PUBLIC ROUTES (Routes công khai)
// ==========================================

// Định tuyến kiểm tra sức khỏe hệ thống
router.get('/health', healthController.getHealth);

// Định tuyến xác thực tài khoản người dùng
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/forgot-password', authController.requestPasswordReset);
router.post('/auth/reset-password', authController.resetPassword);

// ==========================================
// 2. PROTECTED ROUTES (Routes yêu cầu bảo mật JWT)
// ==========================================

// Route xử lý câu hỏi nghiên cứu không tệp tin (Được bảo vệ bằng protect middleware)
router.post('/research', protect, researchController.startResearch);

// Route xử lý tải tệp lớn & nghiên cứu tổng hợp (Tối đa 50MB, được bảo vệ bằng JWT)
router.post(
  '/research/upload', 
  protect, 
  fileController.upload.single('file'), 
  fileController.uploadAndResearch
);

module.exports = router;
