import { useState } from 'react'
import alerts from '../../utils/alerts'
import { setToken, setUser } from '../../utils/auth'
import { signupUser } from '../../services/auth.service'
import './Signup.css'

function Signup({ onNavigate }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone_number: ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (loading) return

    setLoading(true)
    alerts.loading('Creating Account...', 'Setting up your profile')

    try {
      const data = await signupUser(form)

      if (data.success) {
        setToken(data.data.token)
        setUser(data.data.user)

        await alerts.success('Welcome Aboard!', 'Your account has been created successfully')
        onNavigate('dashboard', data.data.user)
      } else {
        alerts.error('Registration Failed', data.message || 'Could not create account')
      }
    } catch (err) {
      const errorMessage = err.message || 'Something went wrong'
      if (errorMessage.toLowerCase().includes('failed to fetch') || errorMessage.toLowerCase().includes('network')) {
        alerts.error('Server Unreachable', 'Please check your internet connection or ensure the server is running.')
      } else {
        alerts.error('Registration Failed', errorMessage)
      }
      console.error('Signup error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-header">
          <h1>Create Account</h1>
          <p>Join our platform with a Standard user account</p>
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
              placeholder="e.g. Rahul Sharma"
              required
              disabled={loading}
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
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone_number">Phone Number</label>
            <input
              type="tel"
              id="phone_number"
              name="phone_number"
              value={form.phone_number}
              onChange={handleChange}
              placeholder="10-digit mobile number"
              disabled={loading}
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
              placeholder="At least 6 characters"
              required
              minLength="6"
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className={`signup-btn ${loading ? 'btn-loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Create Account'}
          </button>
        </form>

        <div className="signup-footer">
          <p>
            Already have an account?{' '}
            <button
              type="button"
              className="link-btn"
              onClick={() => !loading && onNavigate('login')}
              disabled={loading}
            >
              Sign in here
            </button>
          </p>
          <button
            type="button"
            className="back-btn"
            onClick={() => !loading && onNavigate('home')}
            disabled={loading}
          >
            &lt; Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}

export default Signup






