const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    admin_name: { type: String, required: true, unique: true },
    admin_pass: { type: String, required: true }
});

module.exports = mongoose.model('Admin', adminSchema);