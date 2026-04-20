const Appointment = require('../models/appointment');

// TẠO LỊCH HẸN MỚI
exports.createAppointment = async (req, res) => {
  try {
    // Đếm số lượng lịch hẹn hiện có để tạo mã Booking Code tự động
    const count = await Appointment.countDocuments();
    const bookingCode = `LHKH-${String(count + 1).padStart(3, '0')}`; // VD: LHKH-001, LHKH-002

    const newAppointment = new Appointment({
      ...req.body,
      bookingCode
    });

    const savedAppointment = await newAppointment.save();
    res.status(201).json(savedAppointment);
  } catch (error) {
    res.status(500).json({ message: "Lỗi tạo lịch hẹn", error: error.message });
  }
};

// LẤY DANH SÁCH LỊCH HẸN (Cho Admin)
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 });
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách", error: error.message });
  }
};

// CẬP NHẬT TRẠNG THÁI (Cho Admin)
exports.updateStatus = async (req, res) => {
  try {
    const updated = await Appointment.findByIdAndUpdate(
      req.params.id, 
      { status: req.body.status }, 
      { new: true }
    );
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật", error: error.message });
  }
};