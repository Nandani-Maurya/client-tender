import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import alerts from '../../utils/alerts'
import { setToken, setUser, setRefreshToken } from '../../utils/auth'
import { loginUser } from '../../services/auth.service'
import './Login.css'

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: ''
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

    try {
      const data = await loginUser(form)

      if (data.success) {
        setToken(data.data.token)
        setRefreshToken(data.data.refreshToken)
        setUser(data.data.user)

        await alerts.success('Login Successful', `Welcome back, ${data.data.user.name}!`)
        navigate('/dashboard')
      } else {
        alerts.error('Authentication Failed', data.message || 'Invalid email or password')
      }
    } catch (err) {
      const errorMessage = err.message || 'Something went wrong'
      if (errorMessage.toLowerCase().includes('failed to fetch') || errorMessage.toLowerCase().includes('network')) {
        alerts.error('Server Unreachable', 'Please check your internet connection or ensure the server is running.')
      } else {
        alerts.error('Authentication Failed', errorMessage)
      }
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
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
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className={`login-btn ${loading ? 'btn-loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Don&apos;t have an account?{' '}
            <button
              type="button"
              className="link-btn"
              onClick={() => !loading && navigate('/signup')}
              disabled={loading}
            >
              Create one here
            </button>
          </p>
          <button
            type="button"
            className="back-btn"
            onClick={() => !loading && navigate('/')}
            disabled={loading}
          >
            &lt; Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login
