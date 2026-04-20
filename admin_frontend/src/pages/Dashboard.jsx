import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../index.css"; 

function Dashboard({ showAlert }) {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalCars: 0,
    pendingAppointments: 0,
    unreadMessages: 0,
    carsByBrand: {},
    availableCars: 0,   
    outOfStockCars: 0,  
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [usersRes, carsRes, aptsRes, contactsRes] = await Promise.all([
          axios.get("http://localhost:5000/api/users"),
          axios.get("http://localhost:5000/api/car"),
          axios.get("http://localhost:5000/api/appointments"),
          axios.get("http://localhost:5000/api/contact"),
        ]);

        const users = usersRes.data;
        const cars = carsRes.data;
        const appointments = aptsRes.data;
        const contacts = contactsRes.data;

        // 1. Thống kê khách hàng
        const totalCustomers = users.length;

        // 2. Thống kê xe & phân loại theo Hãng + Trạng thái kho
        const totalCars = cars.length;
        let availableCars = 0;
        let outOfStockCars = 0;
        
        const defaultBrands = ["Ferrari", "Porsche", "Mercedes", "McLaren", "Lamborghini", "Bugatti"];
        const brandCounts = {};
        
        defaultBrands.forEach(brand => {
          brandCounts[brand] = 0;
        });

        cars.forEach((car) => {
          // --- Phân loại theo Hãng ---
          const brandName = car.brand;
          if (defaultBrands.includes(brandName)) {
            brandCounts[brandName] += 1;
          } else {
            brandCounts["Khác"] = (brandCounts["Khác"] || 0) + 1;
          }

          // --- Phân loại theo Trạng thái (Có sẵn / Hết hàng) ---
          if (car.status === "Có sẵn") {
            availableCars += 1;
          } else {
            outOfStockCars += 1;
          }
        });

        // 3. Thống kê Lịch hẹn chờ xác nhận
        const pendingApts = appointments.filter((a) => a.status === "Chờ xác nhận").length;

        // 4. Thống kê Tin nhắn chưa đọc
        const unreadMsgs = contacts.filter((c) => c.status === "Chưa đọc" && !c.isDeleted).length;

        setStats({
          totalCustomers,
          totalCars,
          pendingAppointments: pendingApts,
          unreadMessages: unreadMsgs,
          carsByBrand: brandCounts,
          availableCars,
          outOfStockCars,
        });
      } catch (error) {
        console.error("Lỗi tải dữ liệu Dashboard:", error);
        if (showAlert) showAlert("danger", "Không thể tải dữ liệu tổng quan.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [showAlert]);

  if (loading) {
    return (
      <div style={{ padding: "30px", fontSize: "18px", color: "#666" }}>
        Đang tải bảng điều khiển...
      </div>
    );
  }

  // Tính phần trăm cho biểu đồ tròn
  const availablePercentage = stats.totalCars > 0 ? Math.round((stats.availableCars / stats.totalCars) * 100) : 0;
  const outOfStockPercentage = stats.totalCars > 0 ? 100 - availablePercentage : 0;

  return (
    <div style={{ padding: "15px" }}>
      <h2 style={{ marginBottom: "5px", paddingLeft: "25px" }}>Tổng quan hệ thống</h2>

      {/* DÒNG 1: SỬ DỤNG CSS CỦA BẠN CHO CÁC THẺ CARD */}
      <section className="content">
        <div className="card">
          <div className="card-column">
          <h3>Khách hàng</h3>
          <p>{stats.totalCustomers}</p>  
          </div>
          <Link to="/customers" className="btn-view" style={{ textDecoration:"none"}}>
            Chi tiết
          </Link>
        </div>

        <div className="card">
          <div className="card-column">
          <h3>Tổng số xe</h3>
          <p>{stats.totalCars}</p>
          </div>
          <Link to="/cars" className="btn-view" style={{ textDecoration:"none"}}>
            Chi tiết
          </Link>
        </div>

        <div className="card">
          <div className="card-column">
            <h3>Lịch hẹn chờ duyệt</h3>
            <p style={{ color: "#d97706" }}>{stats.pendingAppointments}</p>
          </div>
          <Link to="/appointments" className="btn-view" style={{ textDecoration:"none"}}>
            Chi tiết
          </Link>
        </div>

        <div className="card">
          <div className="card-column">
            <h3>Tin nhắn chưa đọc</h3>
            <p style={{ color: "#b91c1c" }}>{stats.unreadMessages}</p>
          </div>
          <Link to="/contacts" className="btn-view" style={{ textDecoration:"none"}}>
            Chi tiết
          </Link>
        </div>
      </section>

      {/* DÒNG 2: BẢNG THỐNG KÊ CHIA ĐÔI */}
      <div style={{ padding: "0 25px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", alignItems: "start" }}>
        
        {/* === BÊN TRÁI: DANH SÁCH HÃNG XE === */}
        <div className="settings-card" style={{ margin: 0, padding: 0, overflow: "hidden" }}>
          <div className="card-header" style={{ padding: "20px", backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
            <h3 style={{ margin: 0, fontSize: "16px", color: "#374151" }}>Số lượng xe theo Hãng</h3>
            <Link to="/cars" className="btn-view" style={{ textDecoration:"none"}}>
              Chi tiết
            </Link>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column" }}>
            {Object.entries(stats.carsByBrand)
              .sort((a, b) => b[1] - a[1])
              .map(([brand, count]) => (
                <div key={brand} style={{ display: "flex", justifyContent: "space-between", padding: "15px 20px", borderBottom: "1px solid #f3f4f6", alignItems: "center" }}>              
                    <span style={{ color: count === 0 ? "#6b7280" : "#4b5563", fontWeight: "500" }}>{brand}</span>
                  <div style={{ fontWeight: "bold", color: count === 0 ? "#9ca3af" : "#111827", marginRight: "15px" }}>
                    {count} chiếc
                  </div>
                </div>
            ))}
          </div>
        </div>

        {/* === BÊN PHẢI: BIỂU ĐỒ TRÒN TRẠNG THÁI KHO XE === */}
        <div className="settings-card" style={{ margin: 0, display: "flex", flexDirection: "column", height: "100%" }}>
          <div className="card-header">
            <h3 style={{ margin: 0, fontSize: "16px", color: "#374151" }}>Trạng thái Kho xe</h3>
          </div>
          
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
            <div style={{
              width: "200px",
              height: "200px",
              borderRadius: "50%",
              background: `conic-gradient(#22c55e 0% ${availablePercentage}%, #ef4444 ${availablePercentage}% 100%)`,
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              marginBottom: "10px",
              position: "relative"
            }}>
              <div style={{
                position: "absolute",
                top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
                width: "100px", height: "100px",
                backgroundColor: "#fff",
                borderRadius: "50%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center"
              }}>
                <span style={{ fontSize: "24px", fontWeight: "bold", color: "#111827" }}>{stats.totalCars}</span>
                <span style={{ fontSize: "12px", color: "#6b7280" }}>Tổng xe</span>
              </div>
            </div>

            <div style={{ width: "100%", padding: "0 20px", display: "flex", flexDirection: "column", gap: "15px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "16px", height: "16px", backgroundColor: "#22c55e", borderRadius: "4px" }}></div>
                  <span style={{ color: "#374151", fontWeight: "500" }}>Có sẵn</span>
                </div>
                <div style={{ fontWeight: "bold" }}>{stats.availableCars} chiếc ({availablePercentage}%)</div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "16px", height: "16px", backgroundColor: "#ef4444", borderRadius: "4px" }}></div>
                  <span style={{ color: "#374151", fontWeight: "500" }}>Hết hàng</span>
                </div>
                <div style={{ fontWeight: "bold" }}>{stats.outOfStockCars} chiếc ({outOfStockPercentage}%)</div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;