const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");

// Import cấu hình và Models
const connectDB = require("./config/db");
const Setting = require("./models/setting");
const Admin = require("./models/admin");

// Import Routes
const settingRoutes = require("./routes/settingRoutes");
const contactRoutes = require("./routes/contactRoutes");
const carRoutes = require("./routes/carRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require('./routes/userRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');

// 1. Cấu hình môi trường (Luôn để đầu tiên)
dotenv.config();

const app = express();

// 2. Middlewares cơ bản
app.use(cors());
app.use(express.json());

// 3. Hàm tạo Admin mặc định (Định nghĩa trực tiếp để tránh lỗi file seed)
const createAdminIfNotExists = async () => {
    try {
        const adminExists = await Admin.findOne({ admin_name: "admin" });
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash("12345", 10);
            const newAdmin = new Admin({
                admin_name: "admin",
                admin_pass: hashedPassword
            });
            await newAdmin.save();
            console.log("✅ Default Admin account created: admin / 12345");
        } else {
            console.log("ℹ️ Admin account already exists.");
        }
    } catch (error) {
        console.error("❌ Seed Admin error:", error);
    }
};

// 4. Middleware kiểm tra Shutdown (Nên đặt trước các route của User)
const checkShutdown = async (req, res, next) => {
    // 1. Kiểm tra xem request có đến từ phía Admin không (dựa vào URL)
    const isAdminRequest = req.path.startsWith("/api/admin") || 
                           req.path.startsWith("/api/setting") ||
                           req.headers.referer?.includes("/admin"); // Kiểm tra nếu gọi từ trang admin

    if (isAdminRequest) {
        return next(); // Nếu là admin thì cho đi tiếp luôn, không check shutdown
    }
    
    try {
        const setting = await Setting.findOne({ key: "general_settings" });
        if (setting && setting.value.shutdown) {
            return res.status(503).json({ 
                message: "Website is under maintenance.",
                isShutdown: true 
            });
        }
        next();
    } catch (err) {
        next();
    }
};

// 5. Đăng ký các Routes
// Lưu ý: checkShutdown sẽ chạy trước khi vào các route car/contact của User
app.use("/api/setting", settingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/car", carRoutes);
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);

// 6. Khởi động Server theo thứ tự chuẩn
const startServer = async () => {
    try {
        // Đợi kết nối DB thành công trước
        await connectDB(); 

        // Sau đó mới tạo Admin (đảm bảo không bị Timeout)
        await createAdminIfNotExists(); 

        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
};

startServer();
