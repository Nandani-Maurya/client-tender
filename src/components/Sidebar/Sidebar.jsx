import { logout } from "../../utils/auth";
import alerts from "../../utils/alerts";
import "./Sidebar.css";
import companyLogo from "../../assets/hero.png";

function Sidebar({ activeSection, onNavigate, onSectionChange }) {
  const handleLogout = async () => {
    const result = await alerts.confirm(
      "Logout Confirmation",
      "Are you sure you want to sign out?",
      "Yes, Logout"
    );

    if (result.isConfirmed) {
      logout();
      onNavigate("/login");
      alerts.success("Logged Out", "You have been successfully signed out");
    }
  };

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-brand">
        <img src={companyLogo} alt="Company logo" />
        <span>Portal</span>
      </div>

      <nav className="sidebar-nav">
        <button
          type="button"
          className={`nav-item ${activeSection === 'overview' ? 'active' : ''}`}
          onClick={() => onSectionChange('overview')}
        >
          Overview
        </button>
        <button
          type="button"
          className={`nav-item ${activeSection === 'addDetails' ? 'active' : ''}`}
          onClick={() => onSectionChange('addDetails')}
        >
          Add Details
        </button>
        <button type="button" className="nav-item">Tenders</button>
        <button type="button" className="nav-item">
          Settings
        </button>
      </nav>

      <button
        type="button"
        className="sidebar-logout"
        onClick={handleLogout}
      >
        Log Out
      </button>
    </aside>
  );
}

export default Sidebar;
