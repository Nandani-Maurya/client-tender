import './Header.css'
import defaultUser from '../../assets/default-user.svg'

function Header({ user }) {
  return (
    <header className="dashboard-header">
      <div className="header-left">
        <h1>Snow Fountain Consultants</h1>
      </div>

      <div className="header-user">
        <img src={defaultUser} alt="User profile" />
        <div>
          <strong>{user?.name || 'Guest User'}</strong>
          <span>{user?.role || 'Visitor'}</span>
        </div>
      </div>
    </header>
  )
}

export default Header
