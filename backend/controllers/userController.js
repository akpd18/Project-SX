const User = require('../models/user');

// 1. ĐĂNG KÝ TÀI KHOẢN
exports.registerUser = async (req, res) => {
  try {
    const { email } = req.body;

    // Kiểm tra xem email đã tồn tại trong hệ thống chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email này đã được đăng ký!" });
    }

    // Tạo User mới với dữ liệu từ Frontend gửi lên
    const newUser = new User(req.body);
    const savedUser = await newUser.save();

    res.status(201).json(savedUser);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi đăng ký", error: error.message });
  }
};

// 2. ĐĂNG NHẬP
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Tìm user theo email
    const user = await User.findOne({ email });
    
    // Nếu không tìm thấy email -> Trả về lỗi 404 (để Frontend báo "Bạn chưa tạo tài khoản")
    if (!user) {
      return res.status(404).json({ message: "Tài khoản không tồn tại" });
    }

    // Nếu có email nhưng sai mật khẩu -> Trả về lỗi 401
    if (user.password !== password) {
      return res.status(401).json({ message: "Sai mật khẩu" });
    }

    // Nếu tài khoản bị khóa
    if (user.status === 'Locked') {
      return res.status(403).json({ message: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin." });
    }

    // Đăng nhập thành công, trả về thông tin user
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi đăng nhập", error: error.message });
  }
};

// 3. LẤY DANH SÁCH USERS (DÀNH CHO TRANG ADMIN / CUSTOMERS)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }); // Lấy danh sách mới nhất lên đầu
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi lấy danh sách user", error: error.message });
  }
};
// 4. CẬP NHẬT THÔNG TIN KHÁCH HÀNG (ADMIN)
exports.updateUser = async (req, res) => {
  try {
    // MongoDB dùng _id (có dấu gạch dưới)
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    if (!updatedUser) {
        return res.status(404).json({ message: "Không tìm thấy người dùng để cập nhật" });
    }
    
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: "Lỗi cập nhật", error: error.message });
  }
};

// 5. XÓA KHÁCH HÀNG (ADMIN)
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Xóa thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa", error: error.message });
  }
};