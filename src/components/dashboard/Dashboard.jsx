import { useState } from 'react'
import './Dashboard.css'
import AddDetails from '../AddDetails/AddDetails'
import FormatEditor from '../FormatEditor/FormatEditor'
import Header from '../Header/Header'
import Sidebar from '../Sidebar/Sidebar'
import Footer from '../Footer/Footer'
import FormatLinking from '../FormatLinking/FormatLinking'
import FormatManagement from '../FormatManagement/FormatManagement'

function Dashboard({ onNavigate, user }) {
  const [activeSection, setActiveSection] = useState('overview')

  return (
    <section className="dashboard-page">
      <Sidebar
        activeSection={activeSection}
        onNavigate={onNavigate}
        onSectionChange={setActiveSection}
      />

      <div className="dashboard-main">
        <Header user={user} />

        <main className="dashboard-center">
          {activeSection === 'formatEditor' ? (
            <FormatEditor />
          ) : activeSection === 'addDetails' ? (
            <AddDetails />
          ) : activeSection === 'formatLinking' ? (
            <FormatLinking />
          ) : activeSection === 'formatManagement' ? (
            <FormatManagement />
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
