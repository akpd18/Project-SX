function Topbar({ onLogout }) {

  const handleLogout = (e) => {
    e.preventDefault();
    if (window.confirm("Bạn có chắc muốn đăng xuất?")) {
      localStorage.removeItem("isAdminLoggedIn");
      onLogout(); // Gọi hàm này để quay về trang Login
    }
  };

  return (
    <header className="topbar">
      <h2>WELCOME BACK, ADMINISTRATOR</h2>
      <a href="#" onClick={handleLogout} className="logout-btn">ĐĂNG XUẤT</a>
    </header>
  );
}

export default Topbar;