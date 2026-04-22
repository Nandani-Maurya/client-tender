import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Hero from './components/Hero/Hero'
import Login from './components/Login/Login'
import Signup from './components/Signup/Signup'
import Dashboard from './components/dashboard/Dashboard'
import ProtectedRoute from './components/common/ProtectedRoute'
import PublicRoute from './components/common/PublicRoute'
import { getUser } from './utils/auth'
import ScrollToTop from './components/common/ScrollToTop'
import GlobalApiLoader from './components/common/GlobalApiLoader'
import useGlobalLoading from './hooks/useGlobalLoading'
import './App.css'

function App() {
  const { isGlobalLoading } = useGlobalLoading()
  const location = useLocation()
  const isDashboardRoute = location.pathname.startsWith('/dashboard')
  const currentUser = getUser()

  return (
    <div className={`app-shell ${isDashboardRoute ? 'app-shell--dashboard' : ''}`}>
      <ScrollToTop />
      <main className="app-shell-main">
        <Routes>
          <Route path="/" element={<PublicRoute><Hero /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard user={currentUser} /></ProtectedRoute>}/>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        {!isDashboardRoute && (
          <GlobalApiLoader
            visible={isGlobalLoading}
            scope="full"
          />
        )}
      </main>
    </div>
  )
}

export default App



