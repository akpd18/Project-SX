// --- Services.jsx ---
import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import axios from "axios";
import '../index.css'; 

function Services() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    setServices([
        { id: 1, icon: 'wrench.svg', name: 'Bảo dưỡng', description: 'Duy trì phong độ đỉnh cao với quy trình chăm sóc định kỳ chuyên biệt cho từng dòng siêu xe.' },
        { id: 2, icon: 'wash-clean-sponge.svg', name: 'Rửa xe', description: 'Làm sạch chuyên sâu với công nghệ không chạm, bảo vệ tuyệt đối lớp sơn nguyên bản của xe.' },
        { id: 3, icon: 'repair.svg', name: 'Sửa chữa', description: 'Khắc phục mọi sự cố kỹ thuật bằng thiết bị hiện đại và đội ngũ chuyên gia giàu kinh nghiệm.' },
        { id: 4, icon: 'care.svg', name: 'Chăm sóc xe', description: 'Tôn vinh vẻ đẹp đẳng cấp với các gói Detailing, phủ Ceramic và dán PPF bảo vệ toàn diện.' },
        { id: 5, icon: 'monitoring.svg', name: 'Kiểm tra hiệu năng', description: 'Tối ưu hóa sức mạnh động cơ và hệ thống vận hành, đảm bảo trải nghiệm lái hoàn hảo nhất.' },
        { id: 6, icon: 'door.svg', name: 'Trang trí ngoại thất', description: 'Trải nghiệm cảm giác lái phấn khích trên những hành trình xa hoa cùng bộ sưu tập siêu xe hàng đầu.' },
         { id: 7, icon: 'seat.svg', name: 'Nâng cấp nội thất', description: 'Kiến tạo không gian khoang lái độc bản với chất liệu da cao cấp và sợi carbon, mang lại sự sang trọng và cá tính riêng biệt cho chủ sở hữu.' },
        { id: 8, icon: 'type.svg', name: 'Quản lý & Kí gửi xe', description: 'Giải pháp lưu trữ an toàn tuyệt đối trong môi trường tiêu chuẩn và hỗ trợ kết nối giao dịch nhanh chóng với giá trị tốt nhất thị trường.' },
        { id: 9, icon: 'money-check.svg', name: 'Hỗ trợ tài chính', description: 'Cung cấp các gói bảo hiểm đặc quyền và giải pháp tài chính linh hoạt, giúp bạn dễ dàng sở hữu mẫu siêu xe mơ ước một cách tối ưu.' }
    ]);
  }, []);

  return (
    <div className="services-page-bg">
      <div className="breadcrumb">
        <Link to="/home" className="breadcrumb-text1">Trang chủ</Link>
        <span className="breadcrumb-separator"> &gt; </span>
        <b className="breadcrumb-text4">Dịch vụ</b>       
      </div>
      <div className="services-intro-section">
        <h2 className="services-main-title">KHÁM PHÁ DỊCH VỤ</h2>
        <div className="services-title-line"></div>
      </div>

      <div className="services-grid-container">
        <div className="services-flex-row">
          {services.map((service) => (
            <div key={service.id} className="service-column-item">
              <div className="service-card-box pop">
                <div className="service-card-header">
                  {/* Sửa lại src ở đây */}
                  <img 
                    src={`/images/${service.icon}`} 
                    alt={service.name} 
                    className="service-icon-img" 
                    style={{ width: '40px' }}
                  />
                  <h5 className="service-item-name">{service.name}</h5>
                </div>
                <p className="service-item-desc">{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Services;