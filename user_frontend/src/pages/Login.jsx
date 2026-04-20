import { useState } from "react";
import axios from "axios";
import "../index.css";
import { useNavigate } from "react-router-dom";

export default function Login({ showAlert }) {
  const navigate = useNavigate();

  const [mode, setMode] = useState("login"); // login | register | forgot
  
  // States chung
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // States bổ sung cho Đăng ký (Đồng bộ với Admin/Customers)
  const [fullname, setFullname] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [country, setCountry] = useState("");
  const [address, setAddress] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ================= LOGIC ĐĂNG NHẬP =================
      if (mode === "login") {
        const response = await axios.post("http://localhost:5000/api/users/login", {
          email,
          password
        });

        if (response.data) {
          localStorage.setItem("pitgo_user", JSON.stringify(response.data));
          window.dispatchEvent(new Event('userUpdated')); 
          navigate("/home");
          // showAlert("success", "Đăng nhập thành công!"); // Có thể thêm nếu muốn
        }
      }

      // ================= LOGIC ĐĂNG KÝ =================
      if (mode === "register") {
        if (!fullname || !phone) {
          showAlert("danger", "Vui lòng nhập họ tên và số điện thoại!");
          setLoading(false);
          return;
        }

        // Tạo cục dữ liệu chuẩn form Admin
        const newUser = {
          name: fullname,
          email: email,
          password: password,
          phone: phone,
          dob: dob,
          nationalId: nationalId,
          country: country,
          address: address,
          role: "Standard",
          status: "Active"
        };

        // Gửi lên Backend
       await axios.post("http://localhost:5000/api/users/register", newUser);
        showAlert("success", "Đăng ký thành công! Vui lòng đăng nhập.");
        setMode("login");
      }

    } catch (error) {
      console.error("Login/Register Error:", error);

      // KIỂM TRA LỖI TỪ BACKEND TRẢ VỀ
      if (error.response) {
        const status = error.response.status;

        if (mode === "login") {
          if (status === 401) {
            // Sai mật khẩu
            showAlert("danger", "Có thể tài khoản/mật khẩu của bạn không đúng, vui lòng thử lại!");
          } 
          else if (status === 404) {
            // Chưa có tài khoản
            showAlert("danger", "Bạn chưa tạo tài khoản, vui lòng đăng ký để tiếp tục!");
          } 
          // ================= THÊM ĐOẠN NÀY CHO TÀI KHOẢN BỊ KHÓA =================
          else if (status === 403) {
            showAlert("danger", "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ PitGo để được hỗ trợ!");
          }
          // =======================================================================
          else {
            showAlert("danger", "Đã xảy ra lỗi hệ thống, vui lòng thử lại!");
          }
        } else {
          // Lỗi khi đăng ký
          showAlert("danger", error.response.data.message || "Đã xảy ra lỗi hệ thống, vui lòng thử lại!");
        }
      } else {
        showAlert("danger", "Không thể kết nối đến máy chủ, vui lòng thử lại sau!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* LEFT */}
      <div className="login-left">
        <div className="login-box">

          {/* LOGO */}
          <div className="logo">
            <img className="logo-img" src="/images/logo.png" alt="logo" />
          </div>

          {/* TITLE */}
          <h1 className="login-title">
            {mode === "login" && "Chào mừng trở lại!"}
            {mode === "register" && "Tạo tài khoản"}
            {mode === "forgot" && "Khôi phục mật khẩu"}
          </h1>

          <p className="login-desc">
            {mode === "login" && "Nhập thông tin để quản lý bộ sưu tập xe của bạn."}
            {mode === "register" && "Tạo tài khoản để bắt đầu trải nghiệm."}
            {mode === "forgot" && "Nhập email để nhận link đặt lại mật khẩu."}
          </p>

          {/* FORM */}
          <form onSubmit={handleSubmit}>
            
            {/* EMAIL (Dùng chung cho cả 3 chế độ) */}
            <input
              className="form-input"
              type="email"
              placeholder="Email của bạn (example@pitgo.com)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {/* CÁC TRƯỜNG DÀNH RIÊNG CHO ĐĂNG KÝ */}
            {mode === "register" && (
              <>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Họ và tên"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  required
                />
                <input
                  className="form-input"
                  type="tel"
                  placeholder="Số điện thoại"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
                
                <div style={{ display: "flex", gap: "10px" }}>
                  <input
                    className="form-input"
                    type="date"
                    placeholder="Ngày sinh"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <input
                    className="form-input"
                    type="text"
                    placeholder="CMND/CCCD"
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    style={{ flex: 1 }}
                  />
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Quốc gia"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Địa chỉ cụ thể"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    style={{ flex: 2 }}
                  />
                </div>
              </>
            )}

            {/* PASSWORD */}
            {mode !== "forgot" && (
              <div className="password-wrapper">
                <input
                  className="form-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span
                  className="eye-icon"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="12" r="3" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.94 17.94C16.2 19.24 14.2 20 12 20C5 20 1 12 1 12C2.17 9.8 4 7.85 6.1 6.1" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9.88 4.24C10.55 4.08 11.26 4 12 4C19 4 23 12 23 12C22.25 13.43 21.36 14.72 20.35 15.82" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="12" r="3" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M1 1L23 23" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </span>
              </div>
            )}

            {/* OPTIONS */}
            {mode === "login" && (
              <div className="login-options">
                <label>
                  <input className="login-checkbox" type="checkbox" /> Ghi nhớ
                </label>
                <span
                  className="forgot"
                  onClick={() => setMode("forgot")}
                >
                  Quên mật khẩu?
                </span>
              </div>
            )}

            {/* BUTTON */}
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (
                "Đang xử lý..."
              ) : (
                <>
                  {mode === "login"
                    ? "Đăng nhập"
                    : mode === "register"
                    ? "Tạo tài khoản"
                    : "Gửi liên kết"}
                  <span className="arrow">
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <line x1="3" y1="12" x2="17" y2="12"></line>
                      <polyline points="13 8 17 12 13 16"></polyline>
                    </svg>
                  </span>
                </>
              )}
            </button>
          </form>

          {/* TOGGLE */}
          <div className="register">
            {mode === "login" && (
              <>
                Chưa là thành viên?{" "}
                <span className="register-link" onClick={() => setMode("register")}>
                  Đăng ký ngay
                </span>
              </>
            )}

            {mode === "register" && (
              <>
                Đã có tài khoản?{" "}
                <span className="register-link" onClick={() => setMode("login")}>
                  Đăng nhập
                </span>
              </>
            )}

            {mode === "forgot" && (
              <>
                Đã nhớ mật khẩu?{" "}
                <span className="register-link" onClick={() => setMode("login")}>
                  Quay lại đăng nhập
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT (Giữ nguyên giao diện của bạn) */}
      <div className="login-right">
        <div className="overlay"></div>
        <div className="right-overlay"></div>
        <div className="right-content">
          <h2 className="right-title">
            {mode === "register" ? (
              <>
                Khởi đầu <span className="right-highlight">hành trình</span> <br />
                của riêng bạn.
              </>
            ) : (
              <>
                Làm chủ <span className="right-highlight">tốc độ</span>, <br />
                chinh phục đam mê.
              </>
            )}
          </h2>
          <p className="right-desc">
            {mode === "register" 
              ? "Trở thành thành viên của cộng đồng PitGo để nhận đặc quyền riêng biệt."
              : "Kết nối với mạng lưới đại lý xe sang hàng đầu. Trải nghiệm dịch vụ chuẩn 5 sao."}
          </p>
          <div className="member-box">
            <div className="avatars">
              <img className="avatar-img" src="/images/billgate.jpg" alt="" />
              <img className="avatar-img" src="/images/jackma.jpg" alt="" />
              <img className="avatar-img" src="/images/pnvuong.jpg" alt="" />
              <div className="avatar-more">+1k</div>
            </div>
            <div className="member-text">
              <strong className="member-bold">1000+ Thành viên </strong>
              <span className="member-sub">đã tham gia cộng đồng</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}