import React, { useState, useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import "../index.css";
import Loading from "../components/Loading";
import Error from "../components/Error";

const AllCar = () => {
  const { brandName } = useParams();
  const [searchParams] = useSearchParams();
  const brandQuery = searchParams.get("brand");

  const [selectedBrand, setSelectedBrand] = useState("Tất cả");
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/api/car");
        setCars(response.data);
      } catch (error) {
        setError("Lỗi lấy dữ liệu sản phẩm.");
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  useEffect(() => {
    const currentBrand = brandQuery || brandName;
    if (currentBrand) {
      const formatted = currentBrand.charAt(0).toUpperCase() + currentBrand.slice(1).toLowerCase();
      setSelectedBrand(formatted);
    } else {
      setSelectedBrand("Tất cả");
    }
  }, [brandQuery, brandName]);

  const handleBrandChange = (brand) => {
    setSelectedBrand(brand);
    setSearchTerm(""); // Reset tìm kiếm khi đổi thương hiệu để tránh nhầm lẫn
  };

  // 1. Lọc danh sách xe theo thương hiệu trước
  const carsByBrand = cars.filter((car) => {
    return selectedBrand === "Tất cả" || car.brand.toLowerCase() === selectedBrand.toLowerCase();
  });

  // 2. Sau đó mới lọc theo từ khóa tìm kiếm
  const filteredCars = carsByBrand.filter((car) => {
    return car.carName.toLowerCase().includes(searchTerm.toLowerCase().trim());
  });

  if (loading) return <Loading message="ĐANG TẢI DỮ LIỆU..." />;
  if (error) return <Error message={error} />;

  return (
    <div className="allcar-container">
      <div className="breadcrumb">
        <Link to="/home" className="breadcrumb-text1">Trang chủ</Link>
        <span className="breadcrumb-separator"> &gt; </span>
        <b className="breadcrumb-text4">Sản phẩm</b>       
        <span className="breadcrumb-separator"> &gt; </span>
        <b className="breadcrumb-text4">{selectedBrand}</b>
      </div>

      <div className="allcar-intro-section">
        <h1 className="allcar-title">
          {selectedBrand === "Tất cả" ? "Tất cả dòng xe" : `Dòng xe ${selectedBrand}`}
        </h1>
        
        <div className="allcar-search">
          <input 
            type="text" 
            placeholder="Nhập từ khóa tìm kiếm..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="search-icon">
            <img src="/images/search.svg" alt="Search Icon" />
          </div>
        </div>

        <div className="allcar-title-line"></div>
      </div>

      <div className="allcar-content">
        <aside className="filter-sidebar">
          <h3><img src="/images/logo-car.png" alt="Car Icon" className="car-icon"/>Bộ lọc - Dòng xe</h3>
          <ul className="brand-filter-list">
            {["Tất cả", "Ferrari", "Porsche", "Mercedes", "McLaren", "Lamborghini", "Bugatti"].map((brand) => (
              <li key={brand}>
                <label className="custom-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedBrand === brand}
                    onChange={() => handleBrandChange(brand)}
                  />
                  <span className="checkmark"></span>
                  <span className="brand-name">{brand}</span>
                </label>
              </li>
            ))}
          </ul>
        </aside>

        <main className="car-display-grid">
          {/* TRƯỜNG HỢP 1: Có kết quả lọc cuối cùng */}
          {filteredCars.length > 0 ? (
            filteredCars.map((car) => (
              <Link to={`/car/${car._id}`} key={car._id} className="car-item-link">
                <div className="car-item-card">
                  <h3 className="car-name">{car.carName}</h3>
                  <div className="car-image-wrapper">
                    <img src={car.image} alt={car.carName} />
                  </div>
                  <p className="car-price">{car.price?.toLocaleString()}.000.000.000 VNĐ</p>
                </div>
              </Link>
            ))
          ) : (
            <div className="no-results">
              {/* TRƯỜNG HỢP 2: Thương hiệu đó chưa có xe nào trong cơ sở dữ liệu */}
              {carsByBrand.length === 0 ? (
                <div className="empty-brand-message">
                   <p>Dữ liệu xe {selectedBrand} đang được cập nhật</p>
                </div>
              ) : (
                /* TRƯỜNG HỢP 3: Có xe nhưng tìm kiếm không khớp */
                <div className="search-fail-message">
                   <p>Không tìm thấy kết quả phù hợp cho từ khóa: "<strong>{searchTerm}</strong>"</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AllCar;