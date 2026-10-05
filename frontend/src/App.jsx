import { useState, useEffect } from 'react'
import { getMe, getDocuments } from './api'
import Login from './components/Login'
import Sidebar from './components/Sidebar'
import Chat from './components/Chat'

export default function App() {
  const [user, setUser] = useState(null)
  const [documents, setDocuments] = useState([])
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      getMe()
        .then(res => {
          setUser(res.data)
          return getDocuments()
        })
        .then(res => setDocuments(res.data))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
    getDocuments().then(res => setDocuments(res.data))
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setDocuments([])
    setSelectedDoc(null)
  }

  if (loading) {
    return (
      <div style={styles.loading}>
        <span style={styles.loadingIcon}>📄</span>
        <p style={styles.loadingText}>Loading DocuMind...</p>
      </div>
    )
  }

  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div style={styles.app}>
      <Sidebar
        user={user}
        selectedDoc={selectedDoc}
        onSelectDoc={setSelectedDoc}
        onLogout={handleLogout}
        documents={documents}
        setDocuments={setDocuments}
      />
      <Chat selectedDoc={selectedDoc} />
    </div>
  )
}

const styles = {
  app: {
    display: 'flex',
    height: '100vh',
    overflow: 'hidden',
    background: '#0f0f1a'
  },
  loading: {
    minHeight: '100vh',
    background: '#0f0f1a',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  },
  loadingIcon: { fontSize: '48px', marginBottom: '16px' },
  loadingText: { color: '#6b7280', fontSize: '16px' }
}