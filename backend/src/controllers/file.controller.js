const multer = require('multer');
const path = require('path');
const axios = require('axios');
const fs = require('fs');

const uploadPath = path.join(__dirname, '../../uploads');

// ======================================================
// CREATE UPLOAD FOLDER
// ======================================================

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// ======================================================
// MULTER CONFIG
// ======================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + '-' + file.originalname.replace(/\s+/g, '_');

    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,

  limits: {
    fileSize: 50 * 1024 * 1024
  }
});

// ======================================================
// MAIN CONTROLLER
// ======================================================

const uploadAndResearch = async (req, res) => {

  try {

    const webUrl = req.body.webUrl || '';
    const researchQuery = req.body.researchQuery || '';
    const workspaceId =
      req.body.workspaceId ||
      req.body.workspace_id ||
      (req.user?._id ? `user-${req.user._id}` : 'default-workspace');

    // ======================================================
    // VALIDATION
    // ======================================================

    if (!req.file && !webUrl.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Vui lòng upload file hoặc nhập URL.'
      });
    }

    if (!researchQuery.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Thiếu researchQuery.'
      });
    }

    // ======================================================
    // FILE PATH
    // ======================================================

    const filePath = req.file ? path.resolve(req.file.path) : null;

    console.log('==============================');
    console.log('FILE PATH:', filePath);
    console.log('WEB URL:', webUrl);
    console.log('QUERY:', researchQuery);
    console.log('==============================');

    // ======================================================
    // CALL AI CORE
    // ======================================================

    const aiCoreUrl =
      process.env.AI_CORE_URL || 'http://localhost:8000';

    const aiResponse = await axios.post(
      `${aiCoreUrl}/process`,
      {
        file_path: filePath,
        web_url: webUrl.trim(),
        query: researchQuery,
        workspace_id: workspaceId,
        user_id: req.user?._id?.toString(),
        user_email: req.user?.email,
        user_name: req.user?.fullName,
        original_file_name: req.file?.originalname || null
      },
      {
        timeout: 1000 * 60 * 10
      }
    );

    return res.status(200).json(aiResponse.data);

  } catch (error) {

    const upstreamError = error.response?.data || error.message;
    const readableMessage =
      upstreamError?.detail ||
      upstreamError?.message ||
      upstreamError?.error ||
      error.message;

    console.error('AI RESEARCH ERROR:', upstreamError);

    return res.status(500).json({
      status: 'error',
      message: readableMessage || 'Lỗi xử lý AI Research.',
      error: upstreamError
    });

  }
};

module.exports = {
  upload,
  uploadAndResearch
};
