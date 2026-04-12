import { useState } from 'react'
import Hero from './components/Hero/Hero'
import Login from './components/Login/Login'
import Signup from './components/Signup/Signup'
import Dashboard from './components/dashboard/Dashboard'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [currentUser, setCurrentUser] = useState({
    name: 'Guest User',
    email: 'guest@portal.com',
    role: 'Visitor'
  })

  const handleNavigate = (page, user = null) => {
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
