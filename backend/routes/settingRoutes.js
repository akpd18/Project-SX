const express = require('express');
const router = express.Router();
const Setting = require('../models/setting');
const upload = require('../middleware/upload'); // Thêm multer
const cloudinary = require('../config/cloudinary'); // Thêm cloudinary

// Lấy tất cả cài đặt
router.get('', async (req, res) => { 
    try {
        const setting = await Setting.find();
        const config = setting.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});
        res.json(config);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ROUTE MỚI: Xử lý update General Settings
router.post('/update-general', upload.array('images', 10), async (req, res) => {
    try {
        const { site_title, retained_banners } = req.body;
        
        // 1. Lấy danh sách ảnh cũ mà người dùng muốn GIỮ LẠI
        let finalBanners = retained_banners ? JSON.parse(retained_banners) : [];

        // 2. Nếu có up THÊM ảnh mới -> Upload lên Cloudinary
        if (req.files && req.files.length > 0) {
            const uploadPromises = req.files.map((file) => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { folder: "banners" }, 
                        (error, result) => {
                            if (error) reject(error);
                            resolve(result);
                        }
                    );
                    stream.end(file.buffer);
                });
            });
            const results = await Promise.all(uploadPromises);
            const newImageUrls = results.map(result => result.secure_url);
            
            // Gộp ảnh cũ và ảnh mới vào chung một mảng
            finalBanners = [...finalBanners, ...newImageUrls];
        }

        // 3. Lấy trạng thái shutdown hiện tại
        const oldSetting = await Setting.findOne({ key: "general_settings" });
        let currentShutdown = (oldSetting && oldSetting.value && oldSetting.value.shutdown) ? oldSetting.value.shutdown : false;

        // 4. Lưu dữ liệu đã gộp vào Database
        const value = {
            site_title: site_title || "",
            hero_banners: finalBanners,
            shutdown: currentShutdown
        };

        const updatedSetting = await Setting.findOneAndUpdate(
            { key: "general_settings" }, 
            { value }, 
            { upsert: true, new: true }
        );
        res.json(updatedSetting);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Giữ nguyên route cũ cho Contact và Shutdown
router.post('/update', async (req, res) => {
    try {
        const { key, value } = req.body;
        const updatedSetting = await Setting.findOneAndUpdate(
            { key }, 
            { value }, 
            { upsert: true, new: true }
        );
        res.json(updatedSetting);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;