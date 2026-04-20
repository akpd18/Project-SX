const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    customId: { type: String, unique: true },
    date: { type: String },
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String },
    message: { type: String, required: true },
    status: { type: String, enum: ['Chưa đọc', 'Đã đọc', 'Đã trả lời'], default: 'Chưa đọc' },
    isImportant: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Contact', contactSchema);