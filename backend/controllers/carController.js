const Car = require("../models/car");
const cloudinary = require("../config/cloudinary");

// ================= CREATE =================
exports.createCar = async (req, res) => {
  try {
    let imageUrls = [];
    let publicIds = [];

    // ĐÃ SỬA: Kiểm tra mảng req.files thay vì req.file
    if (req.files && req.files.length > 0) {
      // Dùng Promise.all để upload nhiều ảnh cùng lúc
      const uploadPromises = req.files.map((file) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "cars" },
            (error, result) => {
              if (error) reject(error);
              resolve(result);
            }
          );
          stream.end(file.buffer);
        });
      });

      const results = await Promise.all(uploadPromises);
      
      // Tách kết quả trả về thành 2 mảng riêng biệt
      imageUrls = results.map(result => result.secure_url);
      publicIds = results.map(result => result.public_id);
    }

    const car = await Car.create({
      ...req.body,
      images: imageUrls,       // Lưu mảng link ảnh
      public_ids: publicIds,   // Lưu mảng id ảnh
      price: Number(req.body.price),
      year: Number(req.body.year),
      horsePower: Number(req.body.horsePower),
      isTrackOnly: req.body.isTrackOnly === 'true'
    });
    res.status(201).json(car);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ================= UPDATE =================
exports.updateCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: "Không tìm thấy xe" });

    let updateData = { ...req.body };

    // ĐÃ SỬA: Nếu người dùng upload ảnh mới lên
    if (req.files && req.files.length > 0) {
      // 1. Xóa TẤT CẢ ảnh cũ trên Cloudinary
      if (car.public_ids && car.public_ids.length > 0) {
        const destroyPromises = car.public_ids.map(id => cloudinary.uploader.destroy(id));
        await Promise.all(destroyPromises);
      }
      
      // 2. Upload TẤT CẢ ảnh mới
      const uploadPromises = req.files.map((file) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "cars" },
            (error, result) => {
              if (error) reject(error);
              resolve(result);
            }
          );
          stream.end(file.buffer);
        });
      });

      const results = await Promise.all(uploadPromises);
      updateData.images = results.map(result => result.secure_url);
      updateData.public_ids = results.map(result => result.public_id);
    }

    if (req.body.price) updateData.price = Number(req.body.price);
    if (req.body.isTrackOnly !== undefined) updateData.isTrackOnly = req.body.isTrackOnly === 'true';

    const updated = await Car.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ================= CÁC HÀM KHÁC =================
exports.getAllCars = async (req, res) => {
  try {
    const cars = await Car.find().sort({ createdAt: -1 });
    res.json(cars);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    
    // ĐÃ SỬA: Xóa tất cả ảnh trên Cloudinary trước khi xóa xe trong DB
    if (car?.public_ids && car.public_ids.length > 0) {
      const destroyPromises = car.public_ids.map(id => cloudinary.uploader.destroy(id));
      await Promise.all(destroyPromises);
    }
    
    await Car.findByIdAndDelete(req.params.id);
    res.json({ message: "Xóa thành công" });
  } catch (err) {
    res.status(500).json({ message: "Xóa thất bại" });
  }
};

exports.getCars = async (req, res) => {
    try {
        const cars = await Car.find();
        res.json(cars);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getCarById = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) return res.status(404).json({ message: "Không tìm thấy xe" });
        res.json(car);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};