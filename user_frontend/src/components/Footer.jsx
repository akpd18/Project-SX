import React from "react";
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="public-footer">
      <div className="footer-container">
        <div className="footer-links-container">
          {/* Cột 1: Thương hiệu siêu xe */}
          <div className="footer-column">
            <h4>Các dòng xe</h4>
            <div className="brand-list">
              <Link to="/ferrari" className="footer-link-item">Ferrari</Link>
              <Link to="/porsche" className="footer-link-item">Porsche</Link>
              <Link to="/mercedes" className="footer-link-item">Mercedes</Link>
              <Link to="/mclaren" className="footer-link-item">Mclaren</Link>
              <Link to="/lamborghini" className="footer-link-item">Lamborghini</Link>
              <Link to="/bugatti" className="footer-link-item">Bugatti</Link>
            </div>
          </div>

          {/* Cột 2: Dịch vụ */}
          <div className="footer-column">
            <h4>Dịch vụ</h4>
            <Link to="/services" className="footer-link-item">Khám phá dịch vụ</Link>
          </div>

          {/* Cột 3: Liên hệ */}
          <div className="footer-column">
            <h4>Liên hệ</h4>
            <Link to="/contact" className="footer-link-item">Liên hệ với chúng tôi</Link>
          </div>

          {/* Cột 4: Giới thiệu */}
          <div className="footer-column">
            <h4>Giới thiệu</h4>
            <Link to="/about-us" className="footer-link-item">Về chúng tôi</Link>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>Copyright © 2026 PitGo</p>
        <div className="social-icons">
          <a href="#fb"><img src="/images/fb.svg" alt="Facebook" /></a>
          <a href="#yt"><img src="/images/yt.svg" alt="YouTube" /></a>
          <a href="#ig"><img src="/images/ig.svg" alt="Instagram" /></a>
          <a href="#in"><img src="/images/in.svg" alt="LinkedIn" /></a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;