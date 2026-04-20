import React, { useState } from "react";
import axios from "axios";

function Login({ onLoginSuccess, showAlert }) {
  const [formData, setFormData] = useState({ admin_name: "", admin_pass: "" });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/admin/login", {
        admin_name: formData.admin_name,
        admin_pass: formData.admin_pass,
      });

      if (res.data.success) {
        localStorage.setItem("isAdminLoggedIn", "true");
        onLoginSuccess();
        showAlert("success", "Đăng nhập thành công!");
      }
    } catch (err) {
      showAlert("danger", "Tài khoản hoặc mật khẩu không chính xác!");
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h3 style={{ marginBottom: "20px" }}>ADMIN LOGIN</h3>
        <input
          style={{ marginBottom: "20px" }}
          type="text"
          placeholder="Username"
          onChange={(e) =>
            setFormData({ ...formData, admin_name: e.target.value })
          }
        />
        <input
          style={{ marginBottom: "20px" }}
          type="password"
          placeholder="Password"
          onChange={(e) =>
            setFormData({ ...formData, admin_pass: e.target.value })
          }
        />
        <button className="submit-btn" type="submit">
          LOGIN
        </button>
      </form>
    </div>
  );
}

export default Login;