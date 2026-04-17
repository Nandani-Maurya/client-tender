import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Hero from './components/Hero/Hero'
import Login from './components/Login/Login'
import Signup from './components/Signup/Signup'
import Dashboard from './components/dashboard/Dashboard'
import ProtectedRoute from './components/common/ProtectedRoute'
import PublicRoute from './components/common/PublicRoute'
import { getUser } from './utils/auth'
import ScrollToTop from './components/common/ScrollToTop'
import './App.css'

function App() {
  const [currentUser, setCurrentUser] = useState(getUser())
  const location = useLocation()
  useEffect(() => {setCurrentUser(getUser())}, [location])
  return (
    <div className="app-shell">
      <ScrollToTop />
      <main>
        <Routes>
          <Route path="/" element={<PublicRoute><Hero /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard user={currentUser} /></ProtectedRoute>}/>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App



