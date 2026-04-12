import { useState } from 'react'
import './Signup.css'

function Signup({ onNavigate }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  })

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const userData = {
      name: form.name || 'New User',
      email: form.email || 'user@portal.com',
      role: 'Company Admin'
    }
    setForm({ name: '', email: '', password: '' })
    onNavigate('dashboard', userData)
  }

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-header">
          <h1>Create Account</h1>
          <p>Join our platform</p>
        </div>

        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="name@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Create a password"
              required
            />
          </div>

          <button type="submit" className="signup-btn">
            Create Account
          </button>
        </form>

        <div className="signup-footer">
          <p>
            Already have an account?{' '}
            <button
              type="button"
              className="link-btn"
              onClick={() => onNavigate('login')}
            >
              Sign in here
            </button>
          </p>
          <button
            type="button"
            className="back-btn"
            onClick={() => onNavigate('home')}
          >
            &lt; Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}

export default Signup
