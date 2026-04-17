import { useNavigate } from 'react-router-dom'
import './Hero.css'

function Hero() {
  const navigate = useNavigate();

  return (
    <div className="hero-section">
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

      <div className="hero-content">
        <h1>Streamline Your Tender Process</h1>
        <p>
          Professional platform for managing government tenders, proposals, and procurement workflows.
          Stay organized, compliant, and ahead of deadlines.
        </p>

        <ul className="feature-list">
          <li>Tender tracking and management</li>
          <li>Proposal status monitoring</li>
          <li>Team collaboration tools</li>
        </ul>

        <div className="hero-actions">
          <button className="primary-btn" onClick={() => navigate('/login')}>
            Get Started
          </button>
          <button className="secondary-btn" onClick={() => navigate('/signup')}>
            Create Account
          </button>
        </div>
      </div>
    </div>
  )
}

export default Hero
