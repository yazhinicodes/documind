import { useState } from 'react'
import { login, signup } from '../api'

export default function Login({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isSignup) {
        await signup({ name: form.name, email: form.email, password: form.password })
      }
      const res = await login({ email: form.email, password: form.password })
      localStorage.setItem('token', res.data.access_token)
      // fetch user info after login
      const { getMe } = await import('../api')
      const userRes = await getMe()
      onLogin(userRes.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>📄</span>
          <h1 style={styles.logoText}>DocuMind</h1>
        </div>
        <p style={styles.subtitle}>AI-powered document Q&A</p>

        <form onSubmit={handleSubmit}>
          {isSignup && (
            <input
              style={styles.input}
              type="text"
              name="name"
              placeholder="Full name"
              value={form.name}
              onChange={handleChange}
              required
            />
          )}
          <input
            style={styles.input}
            type="email"
            name="email"
            placeholder="Email address"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            style={styles.input}
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          {error && <p style={styles.error}>{error}</p>}
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Please wait...' : isSignup ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <p style={styles.toggle}>
          {isSignup ? 'Already have an account?' : "Don't have an account?"}
          <span style={styles.link} onClick={() => setIsSignup(!isSignup)}>
            {isSignup ? ' Sign in' : ' Sign up'}
          </span>
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  },
  card: {
    background: '#1e1e2e',
    border: '1px solid #2a2a3e',
    borderRadius: '16px',
    padding: '48px 40px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px'
  },
  logoIcon: { fontSize: '32px' },
  logoText: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#ffffff',
    margin: 0
  },
  subtitle: {
    color: '#6b7280',
    fontSize: '14px',
    marginBottom: '32px',
    marginTop: '4px'
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    background: '#2a2a3e',
    border: '1px solid #3a3a5e',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '14px',
    marginBottom: '12px',
    outline: 'none',
    boxSizing: 'border-box'
  },
  button: {
    width: '100%',
    padding: '12px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    border: 'none',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px'
  },
  error: {
    color: '#ef4444',
    fontSize: '13px',
    marginBottom: '8px'
  },
  toggle: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: '14px',
    marginTop: '24px'
  },
  link: {
    color: '#6366f1',
    cursor: 'pointer',
    fontWeight: '600'
  }
}