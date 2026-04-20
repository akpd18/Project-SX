import { NavLink } from "react-router-dom";
import LogoImg from './logo_white.png';

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img style={{ width: "220px", height: "auto" }} src={LogoImg} alt="Logo" />
      </div>

      <ul className="menu">
        <li>
          <NavLink to="/">
            <span className="icon">🏠</span>
            <span className="text">Dashboard</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/cars">
            <span className="icon">🚗</span>
            <span className="text">Quản lý Xe</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/customers">
            <span className="icon">👤</span>
            <span className="text">Quản lý Khách hàng</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/appointments">
            <span className="icon">🗓️</span>
            <span className="text">Quản lý Lịch hẹn</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/contacts">
            <span className="icon">📩</span>
            <span className="text">Quản lý Tin nhắn</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/Settings">
            <span className="icon">⚙</span>
            <span className="text">Cài Đặt</span>
          </NavLink>
        </li>
      </ul>
    </aside>
  );
}

export default Sidebar;