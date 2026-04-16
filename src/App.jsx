import { useState } from 'react'
import alerts from './utils/alerts'
import Hero from './components/Hero/Hero'
import Login from './components/Login/Login'
import Signup from './components/Signup/Signup'
import Dashboard from './components/dashboard/Dashboard'
import { getUser, logout } from './utils/auth'
import './App.css'

function App() {
  const initialUser = getUser()
  const [currentPage, setCurrentPage] = useState(initialUser ? 'dashboard' : 'home')
  const [currentUser, setCurrentUser] = useState(initialUser)

  const handleNavigate = async (page, user = null) => {
    if (page === 'logout') {
      const result = await alerts.confirm('Logout Confirmation', 'Are you sure you want to sign out?', 'Yes, Logout')

      if (result.isConfirmed) {
        logout()
        setCurrentUser(null)
        setCurrentPage('home')
        alerts.success('Logged Out', 'You have been successfully signed out')
      }
      return
    }

    if (user) {
      setCurrentUser(user)
    }
    setCurrentPage(page)
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <Login onNavigate={handleNavigate} />
      case 'signup':
        return <Signup onNavigate={handleNavigate} />
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} user={currentUser} />
      default:
        return <Hero onNavigate={handleNavigate} />
    }
  }

  return (
    <div className="app-shell">
      {currentPage === 'home' && (
        <>
          <div className="background-shapes">
            <span className="shape shape-1" />
            <span className="shape shape-2" />
            <span className="shape shape-3" />
            <span className="shape shape-4" />
          </div>

          <header className="brandbar">
            <div className="brand-mark">Portal</div>
            <p>EOI & RFP portal UI for government procurement</p>
          </header>
        </>
      )}

      <main>
        {renderPage()}
      </main>
    </div>
  )
}

export default App



