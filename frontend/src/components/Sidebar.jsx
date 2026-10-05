import { useState, useRef } from 'react'
import { getDocuments, uploadDocument, deleteDocument } from '../api'

export default function Sidebar({ user, selectedDoc, onSelectDoc, onLogout, documents, setDocuments }) {
  const [uploading, setUploading] = useState(false)
  const [menuOpen, setMenuOpen] = useState(null)
  const fileRef = useRef()

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await uploadDocument(formData)
      setDocuments([...documents, res.data])
      onSelectDoc(res.data)
    } catch (err) {
      alert(err.response?.data?.detail || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (doc) => {
    if (!confirm(`Delete "${doc.original_name}"?`)) return
    try {
      await deleteDocument(doc.id)
      const updated = documents.filter(d => d.id !== doc.id)
      setDocuments(updated)
      if (selectedDoc?.id === doc.id) onSelectDoc(null)
    } catch (err) {
      alert('Delete failed')
    }
    setMenuOpen(null)
  }

  return (
    <div style={styles.sidebar}>
      <div style={styles.top}>
        <div style={styles.logo}>
          <span>📄</span>
          <span style={styles.logoText}>DocuMind</span>
        </div>

        <p style={styles.sectionLabel}>DOCUMENTS</p>

        <div style={styles.docList}>
          {documents.length === 0 && (
            <p style={styles.empty}>No documents yet</p>
          )}
          {documents.map(doc => (
            <div
              key={doc.id}
              style={{
                ...styles.docItem,
                background: selectedDoc?.id === doc.id ? '#2a2a4e' : 'transparent'
              }}
              onClick={() => onSelectDoc(doc)}
            >
              <span style={styles.docIcon}>📄</span>
              <span style={styles.docName}>{doc.original_name}</span>
              <div style={styles.menuWrapper}>
                <button
                  style={styles.menuBtn}
                  onClick={(e) => {
                    e.stopPropagation()
                    setMenuOpen(menuOpen === doc.id ? null : doc.id)
                  }}
                >⋮</button>
                {menuOpen === doc.id && (
                  <div style={styles.dropdown}>
                    <div
                      style={styles.dropdownItem}
                      onClick={(e) => { e.stopPropagation(); handleDelete(doc) }}
                    >
                      🗑️ Delete
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <input
          type="file"
          accept=".pdf"
          ref={fileRef}
          style={{ display: 'none' }}
          onChange={handleUpload}
        />
        <button
          style={styles.uploadBtn}
          onClick={() => fileRef.current.click()}
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : '+ Upload PDF'}
        </button>
      </div>

      <div style={styles.bottom}>
        <div style={styles.userInfo}>
          <div style={styles.avatar}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p style={styles.userName}>{user?.name}</p>
            <p style={styles.userEmail}>{user?.email}</p>
          </div>
        </div>
        <button style={styles.logoutBtn} onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  )
}

const styles = {
  sidebar: {
    width: '260px',
    minWidth: '260px',
    background: '#161622',
    borderRight: '1px solid #2a2a3e',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100vh'
  },
  top: { padding: '20px 16px', flex: 1, overflowY: 'auto' },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '24px'
  },
  logoText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: '18px'
  },
  sectionLabel: {
    color: '#4b5563',
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '1px',
    marginBottom: '8px'
  },
  docList: { marginBottom: '16px' },
  empty: { color: '#4b5563', fontSize: '13px', padding: '8px 0' },
  docItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 10px',
    borderRadius: '8px',
    cursor: 'pointer',
    position: 'relative',
    marginBottom: '4px'
  },
  docIcon: { fontSize: '14px', flexShrink: 0 },
  docName: {
    color: '#d1d5db',
    fontSize: '13px',
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  menuWrapper: { position: 'relative', flexShrink: 0 },
  menuBtn: {
    background: 'none',
    border: 'none',
    color: '#6b7280',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '0 4px',
    lineHeight: 1
  },
  dropdown: {
    position: 'absolute',
    right: 0,
    top: '100%',
    background: '#2a2a3e',
    border: '1px solid #3a3a5e',
    borderRadius: '8px',
    zIndex: 100,
    minWidth: '130px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
  },
  dropdownItem: {
    padding: '10px 14px',
    color: '#ef4444',
    fontSize: '13px',
    cursor: 'pointer'
  },
  uploadBtn: {
    width: '100%',
    padding: '10px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    border: 'none',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  bottom: {
    padding: '16px',
    borderTop: '1px solid #2a2a3e'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '12px'
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: '700',
    fontSize: '14px',
    flexShrink: 0
  },
  userName: {
    color: '#ffffff',
    fontSize: '13px',
    fontWeight: '600',
    margin: 0
  },
  userEmail: {
    color: '#6b7280',
    fontSize: '11px',
    margin: 0
  },
  logoutBtn: {
    width: '100%',
    padding: '8px',
    background: 'transparent',
    border: '1px solid #3a3a5e',
    borderRadius: '8px',
    color: '#9ca3af',
    fontSize: '13px',
    cursor: 'pointer'
  }
}