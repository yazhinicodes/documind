import { useState, useRef, useEffect } from 'react'
import { askQuestion } from '../api'

export default function Chat({ selectedDoc }) {
  const [messages, setMessages] = useState([])
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    setMessages([])
  }, [selectedDoc])

  const handleAsk = async () => {
    if (!question.trim() || loading) return
    const userMsg = { role: 'user', content: question }
    setMessages(prev => [...prev, userMsg])
    setQuestion('')
    setLoading(true)
    try {
      const res = await askQuestion({
        question: userMsg.content,
        document_id: selectedDoc?.id || null
      })
      const aiMsg = {
        role: 'ai',
        content: res.data.answer,
        sources: res.data.sources
      }
      setMessages(prev => [...prev, aiMsg])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'ai',
        content: 'Something went wrong. Please try again.',
        sources: []
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAsk()
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.headerTitle}>
            {selectedDoc ? selectedDoc.original_name : 'All Documents'}
          </h2>
          <p style={styles.headerSub}>
            {selectedDoc
              ? `${selectedDoc.chunk_count} chunks indexed`
              : 'Asking across all uploaded documents'}
          </p>
        </div>
      </div>

      <div style={styles.messages}>
        {messages.length === 0 && (
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>💬</span>
            <h3 style={styles.emptyTitle}>Ask anything about your documents</h3>
            <p style={styles.emptySub}>
              {selectedDoc
                ? `Currently asking about: ${selectedDoc.original_name}`
                : 'Upload a PDF and start asking questions'}
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={msg.role === 'user' ? styles.userBubbleWrap : styles.aiBubbleWrap}>
            {msg.role === 'ai' && (
              <div style={styles.aiAvatar}>AI</div>
            )}
            <div style={msg.role === 'user' ? styles.userBubble : styles.aiBubble}>
              <p style={styles.msgText}>{msg.content}</p>
              {msg.sources && msg.sources.length > 0 && (
                <div style={styles.sources}>
                  <p style={styles.sourcesLabel}>Sources:</p>
                  {msg.sources.map((s, j) => (
                    <span key={j} style={styles.sourceTag}>{s}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div style={styles.aiBubbleWrap}>
            <div style={styles.aiAvatar}>AI</div>
            <div style={styles.aiBubble}>
              <p style={styles.typing}>Thinking...</p>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={styles.inputArea}>
        <div style={styles.inputWrap}>
          <textarea
            style={styles.input}
            placeholder="Ask a question about your documents..."
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button
            style={{
              ...styles.sendBtn,
              opacity: question.trim() && !loading ? 1 : 0.4
            }}
            onClick={handleAsk}
            disabled={!question.trim() || loading}
          >
            ➤
          </button>
        </div>
        <p style={styles.hint}>Press Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    background: '#0f0f1a',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  },
  header: {
    padding: '16px 24px',
    borderBottom: '1px solid #2a2a3e',
    background: '#161622'
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: '600',
    margin: 0
  },
  headerSub: {
    color: '#6b7280',
    fontSize: '12px',
    margin: '2px 0 0 0'
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  emptyState: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '60px 20px'
  },
  emptyIcon: { fontSize: '48px', marginBottom: '16px' },
  emptyTitle: {
    color: '#ffffff',
    fontSize: '20px',
    fontWeight: '600',
    margin: '0 0 8px 0'
  },
  emptySub: { color: '#6b7280', fontSize: '14px', margin: 0 },
  userBubbleWrap: {
    display: 'flex',
    justifyContent: 'flex-end'
  },
  aiBubbleWrap: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start'
  },
  aiAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '11px',
    fontWeight: '700',
    flexShrink: 0
  },
  userBubble: {
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    borderRadius: '16px 16px 4px 16px',
    padding: '12px 16px',
    maxWidth: '70%'
  },
  aiBubble: {
    background: '#1e1e2e',
    border: '1px solid #2a2a3e',
    borderRadius: '4px 16px 16px 16px',
    padding: '12px 16px',
    maxWidth: '80%'
  },
  msgText: {
    color: '#ffffff',
    fontSize: '14px',
    lineHeight: '1.6',
    margin: 0,
    whiteSpace: 'pre-wrap'
  },
  sources: { marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #3a3a5e' },
  sourcesLabel: {
    color: '#6b7280',
    fontSize: '11px',
    fontWeight: '600',
    margin: '0 0 6px 0',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  sourceTag: {
    display: 'inline-block',
    background: '#2a2a3e',
    color: '#a78bfa',
    fontSize: '11px',
    padding: '3px 8px',
    borderRadius: '4px',
    marginRight: '6px',
    marginBottom: '4px'
  },
  typing: {
    color: '#6b7280',
    fontSize: '14px',
    margin: 0,
    fontStyle: 'italic'
  },
  inputArea: {
    padding: '16px 24px 20px',
    borderTop: '1px solid #2a2a3e',
    background: '#161622'
  },
  inputWrap: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-end',
    background: '#1e1e2e',
    border: '1px solid #3a3a5e',
    borderRadius: '12px',
    padding: '12px 16px'
  },
  input: {
    flex: 1,
    background: 'none',
    border: 'none',
    outline: 'none',
    color: '#ffffff',
    fontSize: '14px',
    resize: 'none',
    fontFamily: 'inherit',
    lineHeight: '1.5'
  },
  sendBtn: {
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    border: 'none',
    borderRadius: '8px',
    color: '#ffffff',
    width: '36px',
    height: '36px',
    cursor: 'pointer',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  hint: {
    color: '#4b5563',
    fontSize: '11px',
    textAlign: 'center',
    margin: '8px 0 0 0'
  }
}