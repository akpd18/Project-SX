import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import Loading from "../components/Loading";
import Error from "../components/Error";

import axios from "axios";

function Home() {
  // KHAI BÁO ĐẦY ĐỦ CÁC STATE Ở ĐÂY (Đây là phần bạn bị thiếu)
  const [cars, setCars] = useState([]);
  const [generalSettings, setGeneralSettings] = useState({});
  const [contactSettings, setContactSettings] = useState({});
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Gọi song song 2 API: Lấy danh sách xe và Lấy cài đặt hệ thống
        const [carsRes, settingsRes] = await Promise.all([
          axios.get("http://localhost:5000/api/car"),
          axios.get("http://localhost:5000/api/setting/")
        ]);

        setCars(carsRes.data);
        
        if (settingsRes.data.general_settings) {
          const general = settingsRes.data.general_settings;
          setGeneralSettings(general);
          
          // ĐỒNG BỘ SITE TITLE RA FRONTEND (Đổi tên tab trình duyệt)
          if (general.site_title) {
            document.title = general.site_title;
          }
        }
        
        if (settingsRes.data.contact_details) {
          setContactSettings(settingsRes.data.contact_details);
        }
      } catch (error) {
        console.error("Lỗi API chi tiết:", error);
        setError("Lỗi tải dữ liệu. Vui lòng thử lại sau!");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // LOGIC TỰ ĐỘNG CHUYỂN ẢNH (SLIDER / CAROUSEL)
  const banners = generalSettings.hero_banners && generalSettings.hero_banners.length > 0
    ? generalSettings.hero_banners
    : ["/images/dashboard-banner.png"]; // Ảnh mặc định nếu admin chưa nhập gì

  useEffect(() => {
    // Chuyển ảnh mỗi 3.5 giây
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % banners.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [banners.length]);

  

  /* ================= STATES ================= */  
  if (loading) return <Loading message="LOADING..." />;
  if (error) return <Error message={error} />;

  return (
  <>
      {/* Hero Banner */}
      <section className="hero-banner-slider">
        {banners.map((imgUrl, index) => (
          <img 
            key={index}
            src={imgUrl} 
            alt={`PitGo Banner ${index + 1}`} 
            className={`slide-img ${index === currentSlide ? "active" : ""}`} 
          />
        ))}
        {/* Nút chấm bi nhỏ hiển thị số lượng slide bên dưới (Tùy chọn) */}
        <div className="slide-dots">
          {banners.map((_, index) => (
            <span 
              key={index} 
              className={`dot ${index === currentSlide ? "active" : ""}`}
              onClick={() => setCurrentSlide(index)}
            ></span>
          ))}
        </div>
      </section>

  <div className="home-container">
      {/* Car Grid Section */}
      <section className="cars-section">
        <div className="section-pill-btn">
          <span>Siêu xe mới về</span>
          <div className="home-title-line1"></div>
        </div>
        
        <div className="cars-grid">
          {cars.slice(0, 8).map((car) => (
              <Link 
                to={`/car/${car._id}`} 
                className="car-card" 
                key={car._id}
              >
              <div className="car-image-box">
                <img src={car.image} alt={car.carName} className="img-fill" />
              </div>

              <div className="car-info">
                <p className="car-price">{car.price.toLocaleString()}.000.000.000 VNĐ</p>
                <h3 className="car-name">{car.carName}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* About & Contact Section */}
      <section className="about-section">
        <div className="section-pill-btn">
          <span>Vì sao chọn chúng tôi</span>
          <div className="home-title-line2"></div>
        </div>

        <div className="about-box text-box">
          <p>PitGo là đơn vị chuyên hoạt động trong lĩnh vực kinh doanh và phân phối các dòng siêu xe cao cấp, hướng đến việc mang lại những sản phẩm chất lượng cùng trải nghiệm dịch vụ tốt nhất cho khách hàng. Chúng tôi không chỉ cung cấp xe, mà còn chú trọng xây dựng uy tín và sự tin cậy lâu dài trong từng giao dịch.</p>
          <br/>
          <p>PitGo tập trung lựa chọn những mẫu xe có tình trạng kỹ thuật tốt nhất, lịch sử sử dụng rõ ràng, ODO thấp, còn giá trị sử dụng cao và đáp ứng đầy đủ các tiêu chuẩn về chất lượng. Bên cạnh đó, chúng tôi luôn xây dựng và áp dụng các chính sách hỗ trợ hợp lý, nhằm tối ưu quyền lợi và mang lại sự an tâm tối đa cho khách hàng trong quá trình mua bán.</p>
          <br/>
          <p>Toàn bộ các xe được phân phối đều phải trải qua quy trình kiểm tra nghiêm ngặt, từ ngoại thất, nội thất cho đến hệ thống vận hành và an toàn, nhằm đảm bảo mỗi sản phẩm đến tay khách hàng đều đạt chất lượng cao và sẵn sàng sử dụng.</p>
          <br/>
          <p>Ngoài ra, công ty sẽ ký văn bản cam kết để bảo đảm sự minh bạch, trung thực với khách hàng, giúp khách hàng tăng thêm sự yên tâm và tin tưởng vào sản phẩm dịch vụ của chúng tôi.</p>
        </div>

        <div className="about-box contact-box">
          <div className="contact-logo">
            <Link 
              to="/" 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <img src="/images/logo2.png" alt="PitGo Logo" style={{ maxWidth: '250px' }} />
            </Link>
          </div>
          <div className="contact-info">
            <h3>THÔNG TIN LIÊN HỆ</h3>
            <div className="info-icons-bottom">
            <div className="icon-group">
              <img src="/images/address.png" alt="Address" />
              <p>{contactSettings?.address || "Đang cập nhật địa chỉ..."}</p>
            </div>

            <div className="icon-group">
              <img src="/images/email.png" alt="Email" />
              <p>{contactSettings?.email || "Đang cập nhật email..."}</p>
            </div>

            <div className="icon-group">
              <img src="/images/phone.svg" alt="Phone" />
              <p className="phone-bold">
                {contactSettings?.pn1 || "Đang cập nhật..."} 
                {contactSettings?.pn2 ? ` - ${contactSettings.pn2}` : ""}
              </p>
            </div>

            <div className="icon-group">
              <img src="/images/fb2.svg" alt="Facebook" />
              <p>
                {contactSettings?.fb ? (
                  <a 
                    href={contactSettings.fb} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    PitGo - Facebook
                  </a>
                ) : (
                  "Đang cập nhật..."
                )}
              </p>
            </div>

            {/* Link Instagram có thể click */}
            <div className="icon-group">
              <img src="/images/ig2.svg" alt="Instagram" />
              <p>
                {contactSettings?.insta ? (
                  <a 
                    href={contactSettings.insta} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    PitGo - Instagram
                  </a>
                ) : (
                  "Đang cập nhật..."
                )}
              </p>
            </div>
          </div>
          </div>
        </div>
      </section>
    </div>
  </>
  );
};

export default Home;