const mongoose = require('mongoose');

/**
 * Controller kiểm tra trạng thái hoạt động của hệ thống (Server Health Check).
 * GET /api/health
 */
const getHealth = async (req, res) => {
  // Trạng thái kết nối MongoDB: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const dbStatus = mongoose.connection.readyState;
  let dbStatusText = 'Mất kết nối';

  switch (dbStatus) {
    case 1:
      dbStatusText = 'Đã kết nối';
      break;
    case 2:
      dbStatusText = 'Đang kết nối';
      break;
    case 3:
      dbStatusText = 'Đang ngắt kết nối';
      break;
    default:
      dbStatusText = 'Mất kết nối';
  }

  return res.status(200).json({
    status: 'success',
    message: 'Backend server hoạt động bình thường.',
    timestamp: new Date(),
    uptime: `${process.uptime().toFixed(2)} giây`,
    services: {
      database: {
        status: dbStatus === 1 ? 'OK' : 'ERROR',
        details: dbStatusText
      },
      aiCore: {
        status: 'PENDING',
        details: 'Đang kiểm tra kết nối với AI Core'
      }
    }
  });
};

module.exports = {
  getHealth
};
