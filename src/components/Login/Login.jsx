import { useState } from 'react'
import './Login.css'

function Login({ onNavigate }) {
  const [form, setForm] = useState({
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
      name: form.email ? form.email.split('@')[0] : 'User',
      email: form.email || 'user@portal.com',
      role: 'Client User'
    }
    setForm({ email: '', password: '' })
    onNavigate('dashboard', userData)
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your account</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
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
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="login-btn">
            Sign In
          </button>
        </form>

        <div className="login-footer">
          <p>
            Don&apos;t have an account?{' '}
            <button
              type="button"
              className="link-btn"
              onClick={() => onNavigate('signup')}
            >
              Create one here
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

export default Login
