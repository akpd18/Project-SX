const Contact = require('../models/contact');

// 1. Lấy danh sách tin nhắn
exports.getContacts = async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.json(contacts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 2. Tạo tin nhắn mới (Có logic Custom ID và Thời gian)
exports.createContact = async (req, res) => {
    try {
        const now = new Date();
        
        // Format Ngày/Tháng/Năm: DDMMYYYY
        const dd = String(now.getDate()).padStart(2, '0');
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const yyyy = now.getFullYear();
        const datePrefix = `${dd}${mm}${yyyy}`; // VD: 19032025

        // Format Giờ/Ngày/Tháng/Năm
        const hh = String(now.getHours()).padStart(2, '0');
        const min = String(now.getMinutes()).padStart(2, '0');
        const formattedDate = `${hh}:${min} ${dd}/${mm}/${yyyy}`; // VD: 09:30 19/03/2025

        // Tìm tin nhắn cuối cùng được tạo trong ngày hôm nay
        const lastContact = await Contact.findOne({ 
            customId: new RegExp(`^${datePrefix}`) 
        }).sort({ createdAt: -1 });

        // Tạo số thứ tự (001 -> 999)
        let sequence = 1;
        if (lastContact && lastContact.customId) {
            const lastSequence = parseInt(lastContact.customId.split(' - ')[1], 10);
            if (!isNaN(lastSequence)) {
                sequence = lastSequence + 1;
            }
        }
        
        // Ghép chuỗi tạo customId (VD: 19032025 - 001)
        const newCustomId = `${datePrefix} - ${String(sequence).padStart(3, '0')}`;

        // Lưu vào database
        const newContact = new Contact({
            ...req.body,
            customId: newCustomId,
            date: formattedDate
        });

        const savedContact = await newContact.save();
        res.status(201).json(savedContact);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// 3. Cập nhật trạng thái tin nhắn
exports.updateContact = async (req, res) => {
    try {
        const updatedContact = await Contact.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true }
        );
        if (!updatedContact) return res.status(404).json({ message: "Không tìm thấy" });
        res.json(updatedContact);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// 4. Xóa vĩnh viễn (Nếu cần)
exports.deleteContact = async (req, res) => {
    try {
        await Contact.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted permanently" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};