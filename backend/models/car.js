const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
    // Thông tin cơ bản
    carName: { type: String, required: true },
    brand: { type: String, required: true },
    price: { type: String, required: true },
    
    // ĐÃ SỬA: Chuyển thành mảng (Array) để chứa nhiều link ảnh và nhiều ID từ Cloudinary
    images: [{ type: String }], 
    public_ids: [{ type: String }], 
    
    // Thông số kỹ thuật
    year: { type: String },
    top_speed: { type: String },
    acceleration: { type: String },
    engine: { type: String },
    horsePower: { type: String },
    fuel_type: { type: String },
    origin: { type: String },
    
    // Phân loại và trạng thái
    isTrackOnly: { type: Boolean, default: true },
    description: { type: String },
    status: { 
        type: String, 
        enum: ['Có sẵn', 'Hết Hàng'], 
        default: 'Có sẵn' 
    }
}, { 
    timestamps: true
});

const Car = mongoose.model('Car', carSchema);
module.exports = Car;