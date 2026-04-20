const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Lưu ID của khách hàng
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  location: { type: String, required: true },
  date: { type: String, required: true },
  services: [{ type: String }], // Mảng chứa các dịch vụ (Rửa xe, Lái thử...)
  notes: { type: String },
  cars: { type: Array, default: [] }, // Mảng chứa các xe khách muốn xem
  status: { 
    type: String, 
    enum: ['Chờ xác nhận', 'Đã xác nhận', 'Hoàn thành', 'Đã hủy'], 
    default: 'Chờ xác nhận' 
  },
  bookingCode: { type: String, unique: true } // Mã lịch hẹn (VD: LHKH-001)
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Appointments', appointmentSchema);