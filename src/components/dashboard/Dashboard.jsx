import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Dashboard.css'
import AddDetails from '../AddDetails/AddDetails'
import Header from '../Header/Header'
import Sidebar from '../Sidebar/Sidebar'
import Footer from '../Footer/Footer'

function Dashboard({ user }) {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview')

  return (
    <section className="dashboard-page">
      <Sidebar
        activeSection={activeSection}
        onNavigate={navigate}
        onSectionChange={setActiveSection}
      />

      <div className="dashboard-main">
        <Header user={user} />

        <main className="dashboard-center">
          {activeSection === 'addDetails' ? (
            <AddDetails />
          ) : (
            <div className="welcome-card">
              <h2>Welcome</h2>
              <p>
                You are now logged in. This is static UI mode, ready for API integration later.
              </p>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </section>
  )
}

export default Dashboard
