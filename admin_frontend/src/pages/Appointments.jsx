import React, { useState, useEffect } from "react";
import axios from "axios";

function Appointments({ showAlert }) {
  const [appointments, setAppointments] = useState([]);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedApt, setSelectedApt] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/appointments");
      setAppointments(res.data);
    } catch (error) {
      console.error("Lỗi lấy danh sách lịch hẹn:", error);
      showAlert("danger", "Không thể tải dữ liệu lịch hẹn từ máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const openDetails = (apt) => {
    setSelectedApt(apt);
    setShowDetails(true);
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/appointments/${id}/status`, { status: newStatus });
      const updatedList = appointments.map((a) => (a._id === id ? res.data : a));
      setAppointments(updatedList);
      setSelectedApt(res.data);
      showAlert("success", `Đã chuyển trạng thái thành: ${newStatus}`);
    } catch (error) {
      console.error(error);
      showAlert("danger", "Lỗi cập nhật trạng thái!");
    }
  };

  return (
    <div style={{ padding: "15px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        <h2>Quản lý Lịch hẹn</h2>
        <button className="add-btn" onClick={fetchAppointments}>
          ↻ Làm mới dữ liệu
        </button>
      </div>

      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Khách hàng</th>
              <th>SĐT</th>
              <th>Ngày hẹn</th>
              <th>Chi nhánh</th>
              <th>Trạng thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>Đang tải dữ liệu...</td>
              </tr>
            ) : appointments.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "20px", color: "#666" }}>
                  Chưa có lịch hẹn nào trên hệ thống
                </td>
              </tr>
            ) : (
              appointments.map((apt) => (
                <tr key={apt._id}>
                  <td><strong>#{apt.bookingCode}</strong></td>
                  <td>{apt.fullName}<br /><small>{apt.email}</small></td>
                  <td>{apt.phone}</td>
                  
                  {/* FIX LỖI SẬP WEB: Thêm điều kiện kiểm tra apt.date có tồn tại không */}
                  <td style={{ color: "#118C4F", fontWeight: "600" }}>
                    {apt.date ? apt.date.split('-').reverse().join('/') : "Chưa xác định"}
                  </td>

                  <td>{apt.location}</td>
                  <td>
                    <span className={`badge ${
                        apt.status === "Hoàn thành" ? "green" 
                      : apt.status === "Đã hủy" ? "red" 
                      : apt.status === "Đã xác nhận" ? "blue" 
                      : "orange"}`}
                    >
                      {apt.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn-view" onClick={() => openDetails(apt)}>Chi tiết</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showDetails && selectedApt && (
        <div className="modal-overlay">
          <div className="modal-box order-details-box" style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h3>Chi tiết Lịch hẹn: #{selectedApt.bookingCode}</h3>
            </div>
            
            <div className="order-grid">
              <div className="info-section">
                <h4>Thông tin Khách hàng</h4>
                <p><strong>Họ Tên:</strong> {selectedApt.fullName}</p>
                <p><strong>SĐT:</strong> {selectedApt.phone}</p>
                <p><strong>Email:</strong> {selectedApt.email}</p>
                <p><strong>Ghi chú:</strong> <br/> <i style={{ color: '#555' }}>"{selectedApt.notes || "Không có ghi chú"}"</i></p>
              </div>

              <div className="info-section">
                <h4>Thông tin Lịch hẹn</h4>
                <p><strong>Ngày hẹn:</strong> {selectedApt.date ? selectedApt.date.split('-').reverse().join('/') : "N/A"}</p>
                <p><strong>Chi nhánh:</strong> {selectedApt.location}</p>
                <p><strong>Dịch vụ yêu cầu:</strong></p>
                <ul style={{ margin: "5px 0 15px 20px" }}>
                  {selectedApt.services && selectedApt.services.length > 0 ? (
                    selectedApt.services.map((srv, idx) => <li key={idx}>{srv}</li>)
                  ) : (
                    <li>Không chọn dịch vụ</li>
                  )}
                </ul>
              </div>
            </div>

            <div className="status-update-section" style={{ marginTop: "15px" }}>
               <h4>Danh sách xe quan tâm ({selectedApt.cars?.length || 0} xe)</h4>
               {selectedApt.cars && selectedApt.cars.length > 0 ? (
                 <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', padding: '10px 0' }}>
                   {selectedApt.cars.map((car, idx) => (
                     <div key={idx} style={{ minWidth: '120px', textAlign: 'center', border: '1px solid #eee', borderRadius: '8px', padding: '8px' }}>
                       <img src={car.image} alt={car.name} style={{ width: '100%', height: '60px', objectFit: 'cover', borderRadius: '4px' }}/>
                       <p style={{ margin: '5px 0 0', fontSize: '13px', fontWeight: 'bold' }}>{car.name}</p>
                     </div>
                   ))}
                 </div>
               ) : (
                 <p style={{ color: '#888', fontStyle: 'italic' }}>Khách hàng chưa chọn mẫu xe nào.</p>
               )}
            </div>

            <div className="status-update-section">
              <h4 style={{ paddingTop: "25px" }}>Cập nhật Trạng thái</h4>
              <div className="status-buttons">
                {["Chờ xác nhận", "Đã xác nhận", "Hoàn thành", "Đã hủy"].map((status) => (
                  <button
                    key={status}
                    className={`status-btn ${status === "Đã hủy" ? "red" : "blue"} ${selectedApt.status === status ? "active" : ""}`}
                    onClick={() => updateStatus(selectedApt._id, status)}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowDetails(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Appointments;