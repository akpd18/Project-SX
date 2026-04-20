import React, { useState, useEffect } from "react";
import axios from "axios";

import starFilled from "../assets/icons/important-filled.png";
import starOutline from "../assets/icons/important-outline.png";
import copy from "../assets/copy.svg";

import Loading from "../components/Loading";
import Error from "../components/Error";

function Contacts({ showAlert }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState("messages");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [mgToDelete, setMgToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

/* ================= FILTER DATA SEARCH ================= */
  const filteredData = contacts.filter((item) => {
    const matchesTab = activeTab === "messages" ? !item.isDeleted : item.isDeleted;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  /* ================= LOGIC PHÂN TRANG ================= */
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Tự động quay về trang 1 nếu người dùng chuyển tab hoặc gõ tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  // Tính toán vị trí cắt mảng
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  
  // Dữ liệu thực tế sẽ được hiển thị trên bảng
  const currentContacts = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const API = "http://localhost:5000/api/contact";

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await axios.get(API);
        setContacts(response.data);
        setError(null);
      } catch (err) {
        setError("Lỗi tải dữ liệu. Vui lòng thử lại!");
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, []);

  // Các hàm chức năng
  const handleView = async (msg) => {
    setSelectedMsg(msg);
    if (msg.status === "Chưa đọc") {
      try {
        const response = await axios.patch(`${API}/${msg._id}`, {
          status: "Đã đọc",
        });
        setContacts(
          contacts.map((m) => (m._id === msg._id ? response.data : m)),
        );
        showAlert("success", "Cập nhật trạng thái thành công!");
      } catch (error) {
        showAlert("danger", "Không thể cập nhật trạng thái!");
      }
    }
  };

const toggleStatus = async (id, newStatus) => {
    try {
      // 1. Gọi API lưu trạng thái mới xuống Database
      const response = await axios.patch(`${API}/${id}`, {
        status: newStatus,
      });

      // 2. Cập nhật lại giao diện bảng bên ngoài
      setContacts(
        contacts.map((m) => (m._id === id ? response.data : m)),
      );

      // 3. Cập nhật lại trạng thái trong Modal (nếu đang mở)
      if (selectedMsg?._id === id) {
        setSelectedMsg({ ...selectedMsg, status: response.data.status });
      }

      showAlert("success", `Đã cập nhật trạng thái thành: ${newStatus}`);
    } catch (error) {
      showAlert("danger", "Không thể cập nhật trạng thái!");
    }
  };

const toggleImportant = async (id, currentStatus) => {
    try {
      // Đảo ngược trạng thái hiện tại để gửi lên server
      const response = await axios.patch(`${API}/${id}`, {
        isImportant: !currentStatus,
      });
      
      // Cập nhật lại mảng contacts ngoài danh sách
      setContacts(contacts.map((m) => (m._id === id ? response.data : m)));
      
      // THÊM DÒNG NÀY: Cập nhật luôn cho Modal nếu nó đang mở
      if (selectedMsg?._id === id) {
        setSelectedMsg({ ...selectedMsg, isImportant: response.data.isImportant });
      }

      // Thông báo theo đúng ý bạn
      if (response.data.isImportant) {
        showAlert("success", "Đánh dấu quan trọng thành công!");
      } else {
        showAlert("success", "Đã bỏ dấu quan trọng!");
      }
    } catch (error) {
      showAlert("danger", "Không thể cập nhật trạng thái!");
    }
  };

  /* ================= DELETE ================= */
  const confirmDelete = (id) => {
    setMgToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (mgToDelete) {
      try {
        if (activeTab === "messages") {
          // Xóa mềm: Chuyển vào thùng rác
          await axios.patch(`${API}/${mgToDelete}`, {
            isDeleted: true,
          });
          setContacts(
            contacts.map((m) =>
              m._id === mgToDelete ? { ...m, isDeleted: true } : m,
            ),
          );
          showAlert("success", "Đã chuyển tin nhắn vào thùng rác!");
        } else if (activeTab === "trash") {
          // Xóa vĩnh viễn: Gọi API DELETE
          await axios.delete(`${API}/${mgToDelete}`);
          // Lọc bỏ tin nhắn này khỏi mảng state
          setContacts(contacts.filter((m) => m._id !== mgToDelete));
          showAlert("success", "Đã xóa vĩnh viễn tin nhắn!");
        }
        
        setShowDeleteModal(false);
        setMgToDelete(null);
      } catch (error) {
        showAlert("danger", "Không thể xóa tin nhắn. Vui lòng thử lại!");
      }
    }
  };

  /* ================= COPY EMAIL ================= */
  const copyEmail = (email) => {
    navigator.clipboard.writeText(email);
    showAlert("success", "Đã sao chép email!");
  };

  /* ================= UNDO DELETE ================= */
  const handleUndo = async (id) => {
    try {
      const response = await axios.patch(`${API}/${id}`, {
        isDeleted: false,
      });
      // Cập nhật state bằng dữ liệu thật từ Server trả về
      setContacts(contacts.map((m) => (m._id === id ? response.data : m)));
      showAlert("success", "Tin nhắn đã được khôi phục!");
    } catch (error) {
      showAlert("danger", "Không thể khôi phục tin nhắn!");
    }
  };

  /* ================= STATES ================= */
  if (error) return <Error message={error} />;
  if (loading) return <Loading message="LOADING..." />;

  /* ================= UI ================= */
  return (
    <div style={{ padding: "15px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>Quản lý Tin nhắn</h2>
        <div className="search-container">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email, chủ đề..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="clear-search-btn"
              onClick={() => setSearchTerm("")}
              type="button"
            >
              X
            </button>
          )}
        </div>
      </div>

      {/* Tabs Header */}
      <div className="tabs-container">
        <button
          className={`tab-btn ${activeTab === "messages" ? "active" : ""}`}
          onClick={() => setActiveTab("messages")}
        >
          Hộp thư (
          {
            contacts.filter((m) => !m.isDeleted && m.status === "Chưa đọc")
              .length
          }
          )
        </button>
        <button
          className={`tab-btn ${activeTab === "trash" ? "active" : ""}`}
          onClick={() => setActiveTab("trash")}
        >
          Thùng rác
        </button>
      </div>

      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>
                <img src={starFilled} alt="important" width={18} />
              </th>
              <th>Tên</th>
              <th>Chủ đề</th>
              <th>Ngày</th>
              <th>Trạng thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {currentContacts.length > 0 ? (
              currentContacts.map((msg) => (
                <tr
                  key={msg._id}
                  className={msg.status === "Chưa đọc" ? "unread-row" : ""}
                  style={{ fontWeight: msg.isImportant ? "bold" : "normal" }}
                >
                  <td 
                    onClick={() => toggleImportant(msg._id, msg.isImportant)} 
                    style={{ cursor: "pointer" }}
                  >
                    <img
                      src={msg.isImportant ? starFilled : starOutline}
                      alt="important"
                      className="important-icon"
                    />
                  </td>
                  <td>{msg.name}</td>
                  <td>{msg.subject}</td>
                  <td>{msg.date}</td>
                  <td>
                    <span
                      className={`badge-contact-status ${msg.status.toLowerCase()}`}
                    >
                      {msg.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-view"
                      onClick={() => handleView(msg)}
                      style={{ marginRight: "5px" }}
                    >
                      Xem
                    </button>
                    {activeTab === "messages" ? (
                      <button
                        className="btn-delete"
                        onClick={() => confirmDelete(msg._id)}
                      >
                        Xóa
                      </button>
                    ) : (
                      <>
                        <button
                          className="btn-undo"
                          onClick={() => handleUndo(msg._id)}
                          style={{ marginRight: "5px" }}
                        >
                          Khôi phục
                        </button>
                        {/* Nút xóa vĩnh viễn trong tab Thùng rác */}
                        <button
                          className="btn-delete"
                          onClick={() => confirmDelete(msg._id)}
                        >
                          Xóa vĩnh viễn
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  style={{
                    textAlign: "center",
                    padding: "20px",
                    color: "#666",
                  }}
                >
                  {searchTerm.trim() !== ""
                    ? `Không tìm thấy tin nhắn khớp với "${searchTerm}"`
                    : "Chưa có tin nhắn nào"}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* CHỈ HIỆN PHÂN TRANG KHI CÓ NHIỀU HƠN 0 TRANG */}
      {totalPages > 0 && (
        <div className="pagination-container" style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', gap: '8px' }}>
          <button
            className="page-btn"
            disabled={currentPage === 1}
            onClick={() => paginate(currentPage - 1)}
          >
            Previous
          </button>

          {/* Chỉ tạo số nút bấm tương ứng với kết quả sau khi lọc */}
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => paginate(i + 1)}
              className={`page-btn ${currentPage === i + 1 ? "active" : ""}`}
            >
              {i + 1}
            </button>
          ))}
          
          <button
            className="page-btn"
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => paginate(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}
      </div>

      {/* Modal chi tiết */}
      {selectedMsg && (
        <div className="modal-overlay">
          <div className="modal-box contact-detail-box">
            <div className="modal-header">
              <h3>Chi tiết tin nhắn</h3>
              <br />
              <h4>Chủ đề: {selectedMsg.subject}</h4>
            </div>

            <div className="order-grid">
              <div className="info-section">
                <p>
                  <strong>From:</strong> {selectedMsg.name}
                </p>
                <p>
                  <strong>Email:</strong> {selectedMsg.email}
                  <button
                    className="copy-btn"
                    onClick={() => copyEmail(selectedMsg.email)}
                    style={{ marginLeft: "5px" }}
                  >
                    <img src={copy} alt="important" width={18} />
                  </button>
                </p>
                <p>
                  <strong>Ngày:</strong> {selectedMsg.date}
                </p>
              </div>
              <div className="info-section">
                <p>
                  <strong>Trạng thái:</strong>
                  <select
                    className="custom-select-status"
                    value={selectedMsg.status}
                    onChange={(e) =>
                      toggleStatus(selectedMsg._id, e.target.value)
                    }
                    style={{ marginLeft: "10px" }}
                  >
                    <option value="Chưa đọc">Chưa đọc</option>
                    <option value="Đã đọc">Đã đọc</option>
                    <option value="Đã trả lời">Đã trả lời</option>
                  </select>
                </p>
                <label className="important-toggle">
                  <input
                    className="checkbox-important"
                    type="checkbox"
                    checked={selectedMsg.isImportant}
                    onChange={() => toggleImportant(selectedMsg._id, selectedMsg.isImportant)}
                  />
                  <span className="slider-contact"></span>
                  <span className="label-text">Important</span>
                </label>
              </div>
            </div>

            <div className="message-content-box">
              <p className="msg-text">{selectedMsg.message}</p>
            </div>

            <div className="modal-actions">
              <a
                href="https://mail.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="submit-btn"
                style={{ textDecoration: "none", textAlign: "center" }}
                onClick={() => {
                  toggleStatus(selectedMsg._id, "Đã trả lời");
                }}
              >
                Trả lời Email (Gmail)
              </a>
              <button
                className="cancel-btn"
                onClick={() => setSelectedMsg(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-box confirm-box">
            <div className="confirm-icon">⚠️</div>
            {/* Đổi tiêu đề dựa theo tab */}
            <h3>{activeTab === "trash" ? "Xóa vĩnh viễn?" : "Xác nhận xóa?"}</h3>
            
            <p>
              {activeTab === "trash" 
                ? "Hành động này sẽ xóa vĩnh viễn tin nhắn khỏi hệ thống và không thể hoàn tác. Bạn có chắc chắn không?" 
                : "Bạn chắc chắn muốn chuyển tin nhắn này vào thùng rác không?"}
            </p>
            
            <div className="modal-actions confirm-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowDeleteModal(false)}
              >
                Hủy
              </button>
              <button className="delete-confirm-btn" onClick={handleDelete}>
                {activeTab === "trash" ? "Xóa vĩnh viễn" : "Xác nhận, xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Contacts;