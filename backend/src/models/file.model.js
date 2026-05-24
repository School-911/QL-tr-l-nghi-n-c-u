const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Tệp tin phải thuộc về một tài khoản người dùng cụ thể.']
  }
}, {
  timestamps: true
});

const FileMetadata = mongoose.model('FileMetadata', fileSchema);

module.exports = FileMetadata;
