import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Header() {
  const navigate = useNavigate();
  const [isProductMenuOpen, setIsProductMenuOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState("Tất cả");

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- State quản lý số lượng sản phẩm trong giỏ ---
  const [appointmentCount, setAppointmentCount] = useState(0);

  // --- THÊM STATE CHO ĐĂNG NHẬP / ĐĂNG XUẤT ---
  const [currentUser, setCurrentUser] = useState(null);
  const [userName, setUserName] = useState("");

  const [showLoginPromptModal, setShowLoginPromptModal] = useState(false);
  const [showLogoutConfirmModal, setShowLogoutConfirmModal] = useState(false);

  useEffect(() => {
    // 1. Kiểm tra User đã đăng nhập chưa
    const checkUser = () => {
      const savedUser = localStorage.getItem("pitgo_user");
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      } else {
        setCurrentUser(null);
      }
    };
    checkUser();

    // 2. Cập nhật số lượng giỏ hàng Đặt lịch
    const updateAppointmentCount = () => {
      const savedAppointment = localStorage.getItem('pitgo_appointment');
      if (savedAppointment) {
        const appointmentItems = JSON.parse(savedAppointment);
        setAppointmentCount(appointmentItems.length);
      } else {
        setAppointmentCount(0);
      }
    };
    updateAppointmentCount();

    // Lắng nghe sự kiện để cập nhật đồng bộ
    window.addEventListener('storage', updateAppointmentCount);
    window.addEventListener('storage', checkUser); 
    window.addEventListener('appointmentUpdated', updateAppointmentCount);
    window.addEventListener('userUpdated', checkUser); 

    return () => {
      window.removeEventListener('storage', updateAppointmentCount);
      window.removeEventListener('storage', checkUser);
      window.removeEventListener('appointmentUpdated', updateAppointmentCount);
      window.removeEventListener('userUpdated', checkUser);
    };
  }, []);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/api/car");
        setCars(response.data);
      } catch (error) {
        console.error("Lỗi lấy dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  const brands = ["Tất cả", "Ferrari", "Porsche", "Mercedes", "McLaren", "Lamborghini", "Bugatti"];

  const filteredCars =
    selectedBrand === "Tất cả"
      ? cars
      : cars.filter((car) => car.brand === selectedBrand);

  const handleDoubleClick = (brand) => {
    setIsProductMenuOpen(false);
    if (brand === "Tất cả") {
      navigate("/all-cars");
    } else {
      navigate(`/${brand.toLowerCase()}`);
    }
  };

  // --- XỬ LÝ ĐĂNG XUẤT ---
  const handleLogout = () => {
    localStorage.removeItem("pitgo_user");
    setCurrentUser(null);
    setShowLogoutConfirmModal(false);
    window.dispatchEvent(new Event('userUpdated')); 
    navigate("/");
  };

  return (
    <>
      <header className="public-header">
        <div className="header-top">
          <div className="header-logo">
            <Link to="/home">
              <img src="/images/logo.png" alt="PitGo Logo" style={{ height: "74px", display: "block" }} />
            </Link>
          </div>

          <div className="header-actions">
            {/* Logic: Nếu có User thì hiện Lời chào + Đặt Lịch + Đăng xuất. Nếu chưa có thì CHỈ hiện Đăng nhập */}
            {currentUser ? (
              <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                <span style={{ fontWeight: "bold" }}>
                  Chào, {currentUser?.name || currentUser?.email?.split('@')[0] || "Bạn"} !
                </span>
                
                {/* Nút Đặt lịch ĐÃ ĐƯỢC CHUYỂN VÀO ĐÂY (Chỉ hiện khi đăng nhập) */}
                <button className="action-btn" onClick={() => navigate("/appointment")}>
                  <img src="/images/schedule-calendar.svg" alt="Appointment Icon" className="action-icon" />
                  Đặt lịch {appointmentCount > 0 && `(${appointmentCount})`}
                </button>

                <button className="action-btn" onClick={() => setShowLogoutConfirmModal(true)}>
                  <img src="/images/user.svg" alt="User Icon" className="action-icon" />
                  Đăng xuất
                </button>
              </div>
            ) : (
              <button className="action-btn" onClick={() => navigate("/login")}>
                <img src="/images/user.svg" alt="User Icon" className="action-icon" />
                Đăng nhập
              </button>
            )}
          </div>
        </div>

        <nav className="header-nav">
          <ul>
            <li className="nav-item-container">
              <div className="nav-title">
                <Link to="/home">Trang chủ</Link>
              </div>
            </li>

            <li
              className="nav-item-container"
              onMouseEnter={() => setIsProductMenuOpen(true)}
              onMouseLeave={() => setIsProductMenuOpen(false)}
            >
              <div className="nav-title">
                Sản phẩm
                <img src="/images/arr1.png" alt="Arrow" className={`nav-arrow ${isProductMenuOpen ? "open" : ""}`} />
              </div>

              {isProductMenuOpen && (
                <div className="mega-menu" onClick={(e) => e.stopPropagation()}>
                  <ul className="brand-tabs">
                    {brands.map((brand) => (
                      <li
                        key={brand}
                        className={`brand-tab ${selectedBrand === brand ? "active" : ""}`}
                        onMouseEnter={() => setSelectedBrand(brand)}
                        onDoubleClick={() => handleDoubleClick(brand)}
                        style={{ userSelect: "none", cursor: "pointer" }}
                      >
                        {brand}
                      </li>
                    ))}
                  </ul>

                  <div className="car-grid">
                    {filteredCars.slice(0, 4).map((car) => (
                      <Link
                        to={`/car/${car._id}`}
                        key={car._id}
                        className="car-card"
                        onClick={() => setIsProductMenuOpen(false)}
                      >
                        <img src={car.image} alt={car.carName} />
                        <h4 className="car-name" title={car.carName}>{car.carName}</h4>
                        <p>{car.price.toLocaleString()}.000.000.000 VNĐ</p>
                      </Link>
                    ))}
                    {filteredCars.length === 0 && (
                      <div style={{ gridColumn: "1 / -1" }}> 
                        <p style={{ color: "#888", marginTop: "20px", textAlign: "center" }}>
                          Đang cập nhật dòng xe này...
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </li>

            <li className="nav-item-container">
              <div className="nav-title">
                <Link to="/services">Dịch vụ</Link>
              </div>
            </li>

            <li className="nav-item-container">
              <div className="nav-title">
                <Link to="/contact">Liên hệ</Link>
              </div>
            </li>

            <li className="nav-item-container">
              <div className="nav-title">
                <Link to="/about-us">Giới thiệu</Link>
              </div>
            </li>
          </ul>
        </nav>
      </header>

      {/* ================= MODALS ================= */}
      {/* Modal Xác nhận Đăng xuất */}
      {showLogoutConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-box confirm-box">
            <div className="confirm-icon">⚠️</div>
            <h3>Xác nhận Đăng xuất?</h3>
            <p>Bạn có chắc chắn muốn đăng xuất khỏi tài khoản hiện tại không?</p>
            <div className="modal-actions confirm-actions" style={{ marginTop: "20px" }}>
              <button
                className="cancel-btn"
                onClick={() => setShowLogoutConfirmModal(false)}
              >
                Hủy
              </button>
              <button className="delete-confirm-btn" onClick={handleLogout}>
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;