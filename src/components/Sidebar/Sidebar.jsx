import './Sidebar.css'
import companyLogo from '../../assets/hero.png'

function Sidebar({ activeSection, onNavigate, onSectionChange }) {
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
        <button
          type="button"
          className={`nav-item ${activeSection === 'formatEditor' ? 'active' : ''}`}
          onClick={() => onSectionChange('formatEditor')}
        >
          Add Format
        </button>
        <button
          type="button"
          className={`nav-item ${activeSection === 'formatLinking' ? 'active' : ''}`}
          onClick={() => onSectionChange('formatLinking')}
        >
          Format Linking
        </button>
        <button
          type="button"
          className={`nav-item ${activeSection === 'formatManagement' ? 'active' : ''}`}
          onClick={() => onSectionChange('formatManagement')}
        >
          Annexures / Formats
        </button>
        <button type="button" className="nav-item">Tenders</button>
        <button type="button" className="nav-item">Documents</button>
        <button type="button" className="nav-item">Settings</button>
      </nav>

      <button
        type="button"
        className="sidebar-logout"
        onClick={() => onNavigate('logout')}
      >
        Log Out
      </button>
    </aside>
  )
}

export default Sidebar
