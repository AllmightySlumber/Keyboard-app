import { FormEvent, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { ApiError, Message, getMessages, sendMessage } from '../lib/api'
import { useAuthStore } from '../store/authStore'

const POLL_INTERVAL_MS = 4000

export default function Conversation(): JSX.Element {
  const { friendId } = useParams<{ friendId: string }>()
  const location = useLocation()
  const pseudo = (location.state as { pseudo?: string } | null)?.pseudo ?? 'Ami'
  const token = useAuthStore((s) => s.token)
  const userId = useAuthStore((s) => s.user?.id)
  const [messages, setMessages] = useState<Message[]>([])
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!token || !friendId) return
    const activeToken = token
    const activeFriendId = friendId

    let cancelled = false
    function poll(): void {
      getMessages(activeToken, activeFriendId)
        .then((msgs) => {
          if (!cancelled) setMessages(msgs)
        })
        .catch(() => {
          if (!cancelled) setError('Impossible de charger la conversation')
        })
    }

    poll()
    const id = setInterval(poll, POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [token, friendId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function onSend(e: FormEvent): Promise<void> {
    e.preventDefault()
    if (!token || !friendId || !draft.trim()) return
    const content = draft.trim()
    setDraft('')
    try {
      const sent = await sendMessage(token, friendId, content)
      setMessages((m) => [...m, sent])
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible d'envoyer le message")
    }
  }

  if (!token || !friendId) {
    return (
      <div>
        <h1 style={{ fontFamily: 'var(--font-heading)' }}>Conversation</h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: 12 }}>
          <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
            Connecte-toi
          </Link>{' '}
          pour écrire à tes amis.
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <Link to="/amis" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: 13 }}>
          ← Amis
        </Link>
        <h1 style={{ fontFamily: 'var(--font-heading)', margin: 0 }}>{pseudo}</h1>
      </div>

      <div
        style={{
          flex: 1,
          background: '#fff',
          border: '1px solid var(--color-border)',
          borderRadius: 16,
          padding: 16,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          maxHeight: 480
        }}
      >
        {messages.length === 0 && (
          <p style={{ color: 'var(--color-text-muted)', fontSize: 13.5 }}>
            Aucun message encore — dis bonjour !
          </p>
        )}
        {messages.map((m, i) => {
          const mine = m.senderId === userId
          const isLast = i === messages.length - 1
          return (
            <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start' }}>
              <div
                style={{
                  background: mine ? 'var(--color-primary)' : 'var(--color-bg-soft)',
                  color: mine ? '#fff' : 'var(--color-text)',
                  borderRadius: 14,
                  padding: '8px 14px',
                  maxWidth: '70%',
                  fontSize: 14
                }}
              >
                {m.content}
              </div>
              {mine && isLast && (
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 3 }}>
                  {m.readAt ? 'Vu' : 'Envoyé'}
                </span>
              )}
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {error && <p style={{ color: 'oklch(0.55 0.2 28)', fontSize: 13, marginTop: 8 }}>{error}</p>}

      <form onSubmit={onSend} style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Écrire un message…"
          style={{ flex: 1, padding: '12px 14px', borderRadius: 10, border: '1px solid var(--color-border)' }}
        />
        <button
          type="submit"
          style={{
            padding: '12px 20px',
            borderRadius: 10,
            border: 'none',
            background: 'var(--color-primary)',
            color: '#fff',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Envoyer
        </button>
      </form>
    </div>
  )
}
