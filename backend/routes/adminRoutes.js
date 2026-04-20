const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Admin = require('../models/admin');

router.post('/change-password', async (req, res) => {
    const { old_pass, new_pass } = req.body;

    try {
        // 1. Tìm tài khoản admin (hiện tại giả định bạn chỉ có 1 admin duy nhất)
        const admin = await Admin.findOne({ admin_name: 'admin' });

        // 2. Kiểm tra mật khẩu cũ có đúng không
        const isMatch = await bcrypt.compare(old_pass, admin.admin_pass);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Current password is incorrect!" });
        }

        // 3. Mã hóa mật khẩu mới và lưu lại
        const salt = await bcrypt.genSalt(10);
        admin.admin_pass = await bcrypt.hash(new_pass, salt);
        await admin.save();

        res.json({ success: true, message: "Password changed successfully!" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error!" });
    }
});

const jwt = require('jsonwebtoken');

// API Đăng nhập Admin
router.post('/login', async (req, res) => {
    const { admin_name, admin_pass } = req.body;

    try {
        // 1. Tìm Admin trong DB
        const admin = await Admin.findOne({ admin_name });
        if (!admin) {
            return res.status(401).json({ success: false, message: "Tài khoản không tồn tại!" });
        }

        // 2. Kiểm tra mật khẩu
        const isMatch = await bcrypt.compare(admin_pass, admin.admin_pass);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Mật khẩu không chính xác!" });
        }

        // 3. Tạo Token (Thẻ thông hành)
        // Lưu ý: 'ADMIN_SECRET_KEY' nên để trong file .env
        const token = jwt.sign(
            { id: admin._id, name: admin.admin_name },
            process.env.JWT_SECRET || 'SECRET_KEY_123',
            { expiresIn: '1d' } // Thẻ có tác dụng trong 1 ngày
        );

        res.json({ success: true, token, message: "Đăng nhập thành công!" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Lỗi hệ thống!" });
    }
});

module.exports = router;