import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'; // BẮT BUỘC IMPORT AXIOS
import '../index.css'; 

function Appointment() {
  const [step, setStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookingCode, setBookingCode] = useState("");

  const [appointmentItems, setAppointmentItems] = useState(() => {
    const savedAppointment = localStorage.getItem('pitgo_appointment');
    return savedAppointment ? JSON.parse(savedAppointment) : [];
  });
  
  const [apt, setApt] = useState({
    location: "Cơ sở 1",
    date: "",
    userName: "",
    phone: "",
    email: "",
    technicalAdvice: false,
    testDrive: false,
    carMaintenance: false,
    carWash: false,
    carRepair: false,
    carCare: false,
    carPerformance: false,
    carInterior: false,
    carExterior: false,
    carManagement: false,
    financialSupport: false,
    notes: ""
  });

  // ================= TÍNH NĂNG AUTO-FILL THÔNG TIN KHÁCH HÀNG =================
  useEffect(() => {
    const savedUser = localStorage.getItem('pitgo_user');
    if (savedUser) {
      try {
        const currentUser = JSON.parse(savedUser);
        // Cập nhật state apt với thông tin user (giữ nguyên các trường khác)
        setApt(prevApt => ({
          ...prevApt,
          userName: currentUser.name || "",
          phone: currentUser.phone || "",
          email: currentUser.email || ""
        }));
      } catch (error) {
        console.error("Lỗi khi đọc dữ liệu User:", error);
      }
    }
  }, []); // Mảng rỗng [] giúp hook này chỉ chạy 1 lần duy nhất khi mở trang
  // ============================================================================

  useEffect(() => {
    localStorage.setItem('pitgo_appointment', JSON.stringify(appointmentItems));
  }, [appointmentItems]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setApt({
      ...apt,
      [name]: type === 'checkbox' ? checked : value
    });
    if (errorMessage) setErrorMessage("");
  };

  const handleRemoveItem = (id) => {
    const updatedAppointment = appointmentItems.filter(item => item.id !== id);
    setAppointmentItems(updatedAppointment);
    localStorage.setItem('pitgo_appointment', JSON.stringify(updatedAppointment));
    window.dispatchEvent(new Event('appointmentUpdated'));
  };

  // --- LOGIC XỬ LÝ KHI NHẤN XÁC NHẬN ---
  const handleConfirm = async () => {
    // 1. Kiểm tra Validate (Đã bọc thêm String() để chống sập khi dữ liệu là dạng Số)
    if (!apt.date) return setErrorMessage("Vui lòng chọn ngày hẹn xem xe!");
    if (!String(apt.userName || "").trim()) return setErrorMessage("Vui lòng nhập họ tên của bạn!");
    if (!String(apt.phone || "").trim()) return setErrorMessage("Vui lòng nhập số điện thoại!");
    if (!String(apt.email || "").trim()) return setErrorMessage("Vui lòng nhập địa chỉ email!");

    const hasSelectedService = apt.technicalAdvice || apt.testDrive || apt.carMaintenance || apt.carWash || apt.carRepair || apt.carCare || apt.carPerformance || apt.carInterior || apt.carExterior || apt.carManagement || apt.financialSupport;    
    if (!hasSelectedService) return setErrorMessage("Vui lòng chọn ít nhất một dịch vụ");

    try {
      setLoading(true);
      
      // 2. Lấy thông tin User đang đăng nhập
      const currentUser = JSON.parse(localStorage.getItem('pitgo_user') || '{}');

      // 3. Gom các dịch vụ được tích vào 1 mảng
      const selectedServices = [];
      if (apt.technicalAdvice) selectedServices.push("Tư vấn");
      if (apt.testDrive) selectedServices.push("Lái thử");
      if (apt.carMaintenance) selectedServices.push("Bảo dưỡng");
      if (apt.carWash) selectedServices.push("Rửa xe");
      if (apt.carRepair) selectedServices.push("Sửa chữa");
      if (apt.carCare) selectedServices.push("Chăm sóc xe");
      if (apt.carPerformance) selectedServices.push("Kiểm tra hiệu năng");
      if (apt.carInterior) selectedServices.push("Trang trí nội thất");
      if (apt.carExterior) selectedServices.push("Nâng cấp ngoại thất");
      if (apt.carManagement) selectedServices.push("Quản lý & Ký gửi xe");
      if (apt.financialSupport) selectedServices.push("Hỗ trợ tài chính");

      // 4. Gói dữ liệu gửi lên Backend
      const payload = {
        userId: currentUser._id || currentUser.id || "guest",
        fullName: apt.userName,
        phone: apt.phone,
        email: apt.email,
        location: apt.location,
        date: apt.date,
        services: selectedServices,
        notes: apt.notes,
        cars: appointmentItems
      };

      const response = await axios.post("http://localhost:5000/api/appointments", payload);

      // 5. Thành công: Lưu mã Booking Code, Xóa LocalStorage và chuyển Bước 3
      setBookingCode(response.data.bookingCode); // Lưu mã để hiển thị
      
      localStorage.removeItem('pitgo_appointment'); // Dọn dẹp giỏ hàng
      setAppointmentItems([]);
      window.dispatchEvent(new Event('appointmentUpdated')); // Báo Header reset số lượng

      setErrorMessage("");
      setStep(3);
    } catch (error) {
      console.error(error);
      setErrorMessage("Lỗi kết nối máy chủ, vui lòng thử lại sau!");
    } finally {
      setLoading(false);
    }
  };
  
  const nextStep = () => setStep(step + 1); 
  const prevStep = () => setStep(step - 1);

  // ==========================================
  // Giao diện Bước 1: Danh sách xe
  // ==========================================
  const renderStep1 = () => (
    <div className="appointment-step-content">
      <h2 className="step-title">DANH SÁCH XE BẠN QUAN TÂM</h2>
      {appointmentItems.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '20px' }}>Giỏ hàng của bạn đang trống.</p>
      ) : (
        <div className="appointment-items-wrapper">
          {appointmentItems.map(item => (
            <div key={item.id} className="appointment-item">
              <img src={item.image} alt={item.name} className="appointment-item-img" />
              <div className="appointment-item-info">
                <h3>{item.name}</h3>
                <p>Hãng: {item.brand}</p>
                <p>Năm: {item.year}</p>
                <p>Xuất xứ: {item.origin}</p>
                <p>Loại: {item.type}</p>
              </div>
              <div className="appointment-item-actions">
                <button className="remove-btn" onClick={() => handleRemoveItem(item.id)}>-</button>
                <Link to={`/car/${item.id}`} className="view-detail-btn">
                  <img src="/images/eye-icon.svg" alt="Xem" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="appointment-actions">
        <Link to="/all-cars" className="btn-secondary">QUAY LẠI TÌM XE</Link>
        <button className="btn-primary" onClick={nextStep} disabled={appointmentItems.length === 0}>TIẾP TỤC</button>
      </div>
    </div>
  );

  // ==========================================
  // Giao diện Bước 2: Điền thông tin
  // ==========================================
  const renderStep2 = () => (
    <div className="appointment-step-content">
      <h2 className="step-title">THÔNG TIN LỊCH HẸN</h2>
      <div className="booking-form">
        <div className="form-row">
          <select name="location" value={apt.location} onChange={handleInputChange}>
            <option value="Cơ sở 1">Cơ sở 1: 45 Nguyễn Khắc Nhu, HCM</option>
            <option value="Cơ sở 2">Cơ sở 2: 233A Phan Văn Trị, HCM</option>
            <option value="Cơ sở 3">Cơ sở 3: 69/68 Đặng Thùy Trâm, HCM</option>
          </select>
          <input type="date" name="date" value={apt.date} onChange={handleInputChange} />
        </div>
        
        <div className="form-row">
          <input type="text" name="userName" placeholder="Nhập họ tên *" value={apt.userName} onChange={handleInputChange} />
          <input type="tel" name="phone" placeholder="Nhập số điện thoại *" value={apt.phone} onChange={handleInputChange} />
          <input type="email" name="email" placeholder="Nhập email *" value={apt.email} onChange={handleInputChange} />
        </div>

        <div className="services-container">
          <span className="services-title">Dịch vụ:</span>
          <div className="checkbox-group">      
            <label><input type="checkbox" name="technicalAdvice" checked={apt.technicalAdvice} onChange={handleInputChange} /> Tư vấn</label>
            <label><input type="checkbox" name="testDrive" checked={apt.testDrive} onChange={handleInputChange} /> Lái thử</label>
            <label><input type="checkbox" name="carMaintenance" checked={apt.carMaintenance} onChange={handleInputChange} />Bảo dưỡng</label>
            <label><input type="checkbox" name="carWash" checked={apt.carWash} onChange={handleInputChange} />Rửa xe</label>
            <label><input type="checkbox" name="carRepair" checked={apt.carRepair} onChange={handleInputChange} />Sửa chữa</label>
            <label><input type="checkbox" name="carCare" checked={apt.carCare} onChange={handleInputChange} />Chăm sóc xe</label>
            <label><input type="checkbox" name="carPerformance" checked={apt.carPerformance} onChange={handleInputChange} />Kiểm tra hiệu năng</label>
            <label><input type="checkbox" name="carInterior" checked={apt.carInterior} onChange={handleInputChange} />Trang trí nội thất</label>
            <label><input type="checkbox" name="carExterior" checked={apt.carExterior} onChange={handleInputChange} />Nâng cấp ngoại thất</label>
            <label><input type="checkbox" name="carManagement" checked={apt.carManagement} onChange={handleInputChange} />Quản lý & Ký gửi xe</label>
            <label><input type="checkbox" name="financialSupport" checked={apt.financialSupport} onChange={handleInputChange} />Hỗ trợ tài chính</label>
          </div>
        </div>
        <textarea name="notes" rows="4" placeholder="Ghi chú" value={apt.notes} onChange={handleInputChange}></textarea>
        
        {errorMessage && (
          <div style={{ 
            color: '#d93025', backgroundColor: '#fce8e6', padding: '10px', 
            borderRadius: '4px', marginTop: '10px', fontSize: '14px',
            border: '1px solid #f5c2c7', display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <span>⚠️</span> {errorMessage}
          </div>
        )}
      </div>

      <div className="appointment-actions">
        <button className="btn-secondary" onClick={prevStep} disabled={loading}>QUAY LẠI</button>
        <button className="btn-primary" onClick={handleConfirm} disabled={loading}>
          {loading ? "ĐANG XỬ LÝ..." : "XÁC NHẬN"}
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="appointment-step-content success-step">
      <h2 className="success-title">BẠN ĐÃ ĐẶT LỊCH HẸN THÀNH CÔNG</h2>
      <p className="booking-code">Mã lịch hẹn: <strong>{bookingCode}</strong></p>
      <div className="appointment-actions center-actions">
        <Link to="/" className="btn-secondary">VỀ TRANG CHỦ</Link>
        <Link to="/contact" className="btn-primary">LIÊN HỆ</Link>
      </div>
    </div>
  );

  return (
    <div className="appointment-page-container">
      <div className="breadcrumb">
        <Link to="/home" className="breadcrumb-text1">Trang chủ</Link>
        <span className="breadcrumb-separator"> &gt; </span>
        <b className="breadcrumb-text4">Đặt lịch</b>      
      </div>
      <h1 className="page-main-title">ĐẶT LỊCH HẸN XEM XE</h1>
      <div className="stepper-container">
        <div className={`step ${step >= 1 ? 'active' : ''}`}>[1] Danh sách xe</div>
        <div className="step-line">--------</div>
        <div className={`step ${step >= 2 ? 'active' : ''}`}>[2] Thông tin lịch hẹn</div>
        <div className="step-line">--------</div>
        <div className={`step ${step >= 3 ? 'active' : ''}`}>[3] Hoàn tất</div>
      </div>
      <div className="step-wrapper">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>
    </div>
  );
};

export default Appointment;