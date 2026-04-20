import { Routes, Route, Navigate, Outlet } from "react-router-dom"; 
import React, { useEffect, useState } from "react";
import axios from "axios";

// Components & Layout
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import CustomAlert from "./components/CustomAlert";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Cars from "./pages/Cars";
import Customers from "./pages/Customers";
import Appointments from "./pages/Appointments";
import Contacts from "./pages/Contacts";
import Settings from "./pages/Settings";

// --- LAYOUT DÀNH RIÊNG CHO ADMIN ---
const AdminLayout = ({ onLogout }) => {
  return (
    <div className="admin-layout"> 
      <Sidebar />
      <div className="main">
        <Topbar onLogout={onLogout} />
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("isAdminLoggedIn") === "true");
  const [alert, setAlert] = useState(null);

  const showAlert = (type, msg) => {
    setAlert({ type, msg });
  };

  useEffect(() => {
    const fetchGlobalSettings = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/setting/');
        if (response.data.general_settings) {
          document.title = response.data.general_settings.site_title || "Project-SX";
        }
      } catch (error) {
        console.error("Lỗi cấu hình:", error);
      }
    };
    fetchGlobalSettings();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn");
    setIsLoggedIn(false);
  };

 return (
  <>
    {alert && <CustomAlert type={alert.type} msg={alert.msg} onClose={() => setAlert(null)} />}

    <Routes>
      {!isLoggedIn ? (
        <Route path="*" element={<Login onLoginSuccess={() => setIsLoggedIn(true)} showAlert={showAlert} />} />
      ) : (
        <Route element={<AdminLayout onLogout={handleLogout} />}>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard showAlert={showAlert} />} />
          <Route path="/cars" element={<Cars showAlert={showAlert} />} />
          <Route path="/customers" element={<Customers showAlert={showAlert} />} />
          
          <Route path="/appointments" element={<Appointments showAlert={showAlert} />} />
          
          <Route path="/contacts" element={<Contacts showAlert={showAlert} />} />
          <Route path="/settings" element={<Settings showAlert={showAlert} />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Route>
      )}
    </Routes>
  </>
);
}

export default App;