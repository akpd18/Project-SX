import React, { useState, useEffect } from "react";
import axios from "axios";

function Users({ showAlert }) {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // States cho Form
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [country, setCountry] = useState("");
  const [address, setAddress] = useState("");
  const [role, setRole] = useState("Standard");
  const [status, setStatus] = useState("Active");

  const [showPassword, setShowPassword] = useState(false);

  const [editingUser, setEditingUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // 1. TẢI DỮ LIỆU TỪ MONGODB
  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users");
      setUsers(res.data);
    } catch (error) {
      console.error("Lỗi tải danh sách khách hàng:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. XỬ LÝ LƯU (THÊM/SỬA)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const userData = {
      name: userName, email, password, phone, dob, 
      nationalId, country, address, status, role
    };

    try {
      if (editingUser) {
        const res = await axios.put(`http://localhost:5000/api/users/${editingUser._id}`, userData);
        setUsers(users.map((u) => (u._id === editingUser._id ? res.data : u)));
        showAlert("success", "Cập nhật thông tin khách hàng thành công!");
      } else {
        const res = await axios.post("http://localhost:5000/api/users/register", userData);
        setUsers([res.data, ...users]);
        showAlert("success", "Thêm khách hàng mới thành công!");
      }
      setShowModal(false);
      resetForm();
    } catch (err) {
      showAlert("danger", err.response?.data?.message || "Đã xảy ra lỗi hệ thống!");
    } finally {
      setLoading(false);
    }
  };

  // 3. ĐỔ DỮ LIỆU VÀO FORM KHI EDIT
  const handleEdit = (user) => {
    setEditingUser(user);
    setUserName(user.name);
    setEmail(user.email);
    setPassword(user.password);
    setDob(user.dob);
    setPhone(user.phone);
    setNationalId(user.nationalId);
    setCountry(user.country);
    setAddress(user.address);
    setStatus(user.status);
    setRole(user.role);
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingUser(null);
    setUserName(""); setEmail(""); setPassword(""); setPhone("");
    setDob(""); setNationalId(""); setCountry(""); setAddress("");
    setStatus("Active"); setRole("Standard");
  };

  // 4. XÓA KHÁCH HÀNG
  const confirmDelete = (id) => {
    setUserToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/users/${userToDelete}`);
      setUsers(users.filter((u) => u._id !== userToDelete));
      setShowDeleteModal(false);
      showAlert("success", "Đã xóa khách hàng khỏi hệ thống!");
    } catch (err) {
      showAlert("danger", "Xóa thất bại!");
    }
  };

  return (
    <div style={{ padding: "15px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <h2>Quản lý Khách hàng</h2>
        <button className="add-btn" onClick={() => setShowModal(true)}>
          Thêm Khách Hàng
        </button>
      </div>

      {/* Table */}
      <div className="table-responsive" style={{ overflowX: "auto" }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Họ & Tên</th>
              <th>Hạng</th>
              <th>Email</th>
              <th>SĐT</th>
              <th>Ngày Sinh</th>
              <th>Địa chỉ</th>
              <th>Trạng thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan="9"
                  style={{
                    textAlign: "center",
                    padding: "20px",
                    color: "#666",
                  }}
                >
                  Chưa có khách hàng nào
                </td>
              </tr>
            ) : (
              users.map((user, index) => (
                <tr key={user._id}>
                  <td>{index + 1}</td>
                  <td>
                    <strong>{user.name}</strong>
                  </td>
                  <td>
                    <span className={`role-badge ${user.role?.toLowerCase()}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>{user.dob}</td>
                  <td className="text-truncate" style={{ maxWidth: "150px" }}>
                    {user.address}
                  </td>
                  <td>
                    <span
                      className={`badge ${user.status === "Active" ? "green" : "red"}`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(user)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => confirmDelete(user._id)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <form onSubmit={handleSubmit} className="modal-form">
              <h3>
                {editingUser ? "Update Customer Info" : "Add New Customer"}
              </h3>

              {/* Row 1: Full Name & Email & Password */}
              <div className="form-row">
                <div className="form-group">
                  <label>Họ & Tên</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Password</label>
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
                </div>
              </div>

              {/* Row 2: DOB & Phone & National ID */}
              <div className="form-row">
                <div className="form-group">
                  <label>Ngày Sinh</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>SĐT</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>CMND/CCCD</label>
                  <input
                    type="text"
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                  />
                </div>
              </div>

              {/* Row 3: Country & Role & Status */}
              <div className="form-row">
                <div className="form-group">
                  <label>Quốc gia</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Hạng</label>
                  <select
                    className="custom-select"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                  >
                    <option value="Standard">Standard</option>
                    <option value="VIP">V.I.P</option>
                    <option value="S-VIP">S-VIP</option>
                    <option value="Potential">Potential</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Trạng thái</label>
                  <div className="toggle-switch-wrapper">
                    <span
                      className={`status-text ${status === "Locked" ? "active" : ""}`}
                    >
                      Locked
                    </span>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={status === "Active"}
                        onChange={(e) =>
                          setStatus(e.target.checked ? "Active" : "Locked")
                        }
                      />
                      <span className="slider round"></span>
                    </label>
                    <span
                      className={`status-text ${status === "Active" ? "active" : ""}`}
                    >
                      Active
                    </span>
                  </div>
                </div>
              </div>

              {/* Row 5: Address */}
              <div className="form-group">
                <label>Địa chỉ</label>
                <textarea
                  rows="2"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="custom-textarea"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="cancel-btn"
                >
                  Hủy
                </button>
                <button type="submit" className="submit-btn">
                  {editingUser ? "Cập nhật" : "Thêm Khách hàng"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-box confirm-box">
            <div className="confirm-icon">⚠️</div>
            <h3>Xác nhận xóa?</h3>
            <p>
              Bạn có chắc chắn muốn xóa khách hàng này không? <br /> Hành động
              này không thể hoàn tác.
            </p>
            <div className="modal-actions confirm-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowDeleteModal(false)}
              >
                Hủy
              </button>
              <button className="delete-confirm-btn" onClick={handleDelete}>
                Xác nhận, xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;