import React, { useState, useEffect } from "react";
// Đã thêm useNavigate vào import
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../index.css";

function CarDetail({ showAlert }) {
  const { id } = useParams();
  const navigate = useNavigate(); // Dùng để chuyển hướng sang Login trong Modal

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- THÊM STATE CHO KIỂM TRA ĐĂNG NHẬP ---
  const [currentUser, setCurrentUser] = useState(null);
  const [showLoginPromptModal, setShowLoginPromptModal] = useState(false);

  // --- EFFECT KIỂM TRA ĐĂNG NHẬP ---
  useEffect(() => {
    const checkUser = () => {
      const savedUser = localStorage.getItem("pitgo_user");
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      } else {
        setCurrentUser(null);
      }
    };
    checkUser();

    // Lắng nghe sự kiện để đồng bộ nếu User đăng nhập/đăng xuất ở tab khác
    window.addEventListener('userUpdated', checkUser); 
    return () => {
      window.removeEventListener('userUpdated', checkUser);
    };
  }, []);

  // --- EFFECT FETCH CHI TIẾT XE ---
  useEffect(() => {
    const fetchCarDetail = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/car/${id}`);
        setCar(response.data);
      } catch (error) {
        console.error("Lỗi lấy chi tiết xe:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCarDetail();
    }
    window.scrollTo(0, 0);
  }, [id]);

  if (loading)
    return <div className="loading-screen">Đang tải dữ liệu từ server...</div>;

  if (!car)
    return (
      <div className="not-found-container">
        <h2>Không tìm thấy mẫu xe này!</h2>
        <Link to="/all-cars" className="back-btn">
          Quay lại danh sách
        </Link>
      </div>
    );

  // --- HÀM XỬ LÝ THÊM XE VÀO GIỎ ---
  const handleAppointment = (e) => {
    // KIỂM TRA ĐĂNG NHẬP: Bắt buộc
    if (!currentUser) {
      e.preventDefault(); // Ngăn chặn Link chuyển sang trang /appointment
      setShowLoginPromptModal(true); // Hiển thị Modal yêu cầu đăng nhập
      return;
    }

    const savedAppointment = localStorage.getItem('pitgo_appointment');
    const currentAppointment = savedAppointment ? JSON.parse(savedAppointment) : [];

    // Kiểm tra xem xe đã có trong giỏ chưa
    const isExist = currentAppointment.find(item => item.id === car._id);
    if (isExist) {
      e.preventDefault(); // Ngăn chuyển trang nếu xe đã tồn tại
      showAlert("danger", "Xe này đã có trong danh sách quan tâm của bạn!");
      return;
    }

    const newItem = {
      id: car._id,
      name: car.carName,
      brand: car.brand,
      year: car.year,
      origin: car.origin,
      type: car.isTrackOnly ? "Xe đua" : "Xe đường phố",
      image: car.image
    };

    const updatedAppointment = [...currentAppointment, newItem];
    
    localStorage.setItem('pitgo_appointment', JSON.stringify(updatedAppointment));
    window.dispatchEvent(new Event('appointmentUpdated'));
    
    showAlert("success", "Thêm vào danh sách lịch hẹn thành công!");
    // Không dùng e.preventDefault() ở đây để thẻ <Link> tự động nhảy sang trang đặt lịch
  };

  return (
    <div className="car-detail-wrapper">
      <div className="breadcrumb">
        <Link to="/home" className="breadcrumb-text1">
          Trang chủ
        </Link>

        <span className="breadcrumb-separator"> &gt; </span>
        <Link to="/all-cars" className="breadcrumb-text2">
          Sản phẩm
        </Link>

        <span className="breadcrumb-separator"> &gt; </span>
        <Link to={`/all-cars?brand=${car.brand}`} className="breadcrumb-text3">
          {car.brand}
        </Link>

        <span className="breadcrumb-separator"> &gt; </span>
        <b className="breadcrumb-text4">{car.carName}</b>
      </div>

      <div className="car-detail-main-content">
        <div className="image-column">
          <div className="main-image-frame">
            <img src={car.image} alt={car.carName} />
          </div>
          <div className="car-full-description-section">
            <h2 className="section-tab-title">THÔNG TIN MÔ TẢ SẢN PHẨM</h2>
            <div className="description-content">
              {car.description ||
                "Đang cập nhật nội dung mô tả cho mẫu xe này..."}
            </div>
          </div>
        </div>

        <div className="info-column">
          <div className="title-row">
            <h1 className="car-title-display">{car.carName?.toUpperCase()}</h1>
            <div
              className={`status-badge ${car.status === "Có sẵn" ? "in-stock" : "out-of-stock"}`}
            >
              {car.status}
            </div>
          </div>
          <p className="car-price-display">
            {car.price?.toLocaleString()}.000.000.000 VNĐ
          </p>

          <div className="specs-list">
            <div className="spec-line">
              <img
                src="/images/speed.png"
                alt="Speed"
                className="spec-icon-img"
              />
              <span>Tốc độ: {car.top_speed}</span>
            </div>
            <div className="spec-line">
              <img
                src="/images/fuel-type.svg"
                alt="Fuel"
                className="spec-icon-img"
              />
              <span>Nhiên liệu: {car.fuel_type}</span>
            </div>
            <div className="spec-line">
              <img
                src="/images/engine.png"
                alt="Engine"
                className="spec-icon-img"
              />
              <span>Động cơ: {car.engine}</span>
            </div>
            <div className="spec-line">
              <img
                src="/images/accel.svg"
                alt="Acceleration"
                className="spec-icon-img"
              />
              <span>Gia tốc: {car.acceleration}</span>
            </div>
            <div className="spec-line">
              <img
                src="/images/time.svg"
                alt="Year"
                className="spec-icon-img"
              />
              <span>Năm: {car.year}</span>
            </div>
            <div className="spec-line">
              <img
                src="/images/origin.svg"
                alt="Origin"
                className="spec-icon-img"
              />
              <span>Xuất xứ: {car.origin}</span>
            </div>
            <div className="spec-line">
              <img src="/images/hp.svg" alt="Hp" className="spec-icon-img" />
              <span>Công suất: {car.horsePower} HP</span>
            </div>
            <div className="spec-line">
              <img
                src="/images/type.svg"
                alt="Type"
                className="spec-icon-img"
              />
              <span>
                Loại: {car.isTrackOnly ? "Xe đua" : "Xe đường phố"}
              </span>
            </div>
          </div>

          <div className="promotion-section">
            <div className="promotion-box">
              <h3 className="promo-title">KHUYẾN MÃI</h3>
              <ul className="promo-items">
                <li>- Tặng phụ kiện chính hãng trị giá 30.000.000đ</li>
                <li>- Bảo hành chính hãng không giới hạn km</li>
              </ul>
            </div>
          </div>

          <div className="action-button-group centered">
            <Link to="/contact" className="btn-contact">
              LIÊN HỆ TƯ VẤN
            </Link>
            
            {/* Truyền biến e vào hàm onClick */}
            <Link to="/appointment" className="btn-add-appointment" onClick={(e) => handleAppointment(e)}>
              ĐẶT LỊCH HẸN
            </Link>
          </div>
        </div>
      </div>

      {/* ================= MODAL BẮT BUỘC ĐĂNG NHẬP ================= */}
      {showLoginPromptModal && (
        <div className="modal-overlay">
          <div className="modal-box confirm-box">
            <div className="confirm-icon">⚠️</div>
            <h3>Yêu cầu Đăng nhập</h3>
            <p style={{ marginTop: "10px", lineHeight: "1.5" }}>
              Bạn cần đăng nhập bằng tài khoản PitGo để có thể đưa xe vào danh sách quan tâm và tiến hành đặt lịch hẹn.
            </p>
            <div className="modal-actions confirm-actions" style={{ marginTop: "20px" }}>
              <button
                className="cancel-btn"
                onClick={() => setShowLoginPromptModal(false)}
              >
                Trở lại xem xe
              </button>
              <button 
                className="delete-confirm-btn" 
                style={{ backgroundColor: "#0d6efd" }} // Màu xanh cho thân thiện
                onClick={() => {
                  setShowLoginPromptModal(false);
                  navigate("/login");
                }}
              >
                Đăng nhập ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarDetail;