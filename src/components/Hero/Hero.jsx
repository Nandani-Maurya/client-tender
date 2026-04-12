import './Hero.css'

function Hero({ onNavigate }) {
  return (
    <div className="hero-section">
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
          <button className="primary-btn" onClick={() => onNavigate('login')}>
            Get Started
          </button>
          <button className="secondary-btn" onClick={() => onNavigate('signup')}>
            Create Account
          </button>
        </div>
      </div>
    </div>
  )
}

export default Hero
