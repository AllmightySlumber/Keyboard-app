import { FormEvent, useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ApiError,
  FriendRequest,
  FriendUser,
  acceptFriendRequest,
  blockUser,
  declineFriendRequest,
  getBlockedUsers,
  getFriendRequests,
  getFriends,
  removeFriend,
  reportFriend,
  searchUsers,
  sendFriendRequest,
  unblockUser
} from '../lib/api'
import { useAuthStore } from '../store/authStore'

const ghostButtonStyle = {
  padding: '8px 12px',
  borderRadius: 10,
  border: '1px solid var(--color-border)',
  background: 'transparent',
  color: 'var(--color-text-muted)',
  fontWeight: 600,
  fontSize: 13,
  cursor: 'pointer'
} as const

const cardStyle = {
  background: '#fff',
  border: '1px solid var(--color-border)',
  borderRadius: 16,
  padding: '12px 18px',
  display: 'flex',
  alignItems: 'center',
  gap: 12
} as const

export default function Amis(): JSX.Element {
  const token = useAuthStore((s) => s.token)
  const [friends, setFriends] = useState<FriendUser[]>([])
  const [requests, setRequests] = useState<FriendRequest[]>([])
  const [blocked, setBlocked] = useState<FriendUser[]>([])
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<FriendUser[]>([])
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [reportingId, setReportingId] = useState<string | null>(null)
  const [reportReason, setReportReason] = useState('')

  const refresh = useCallback(() => {
    if (!token) return
    Promise.all([getFriends(token), getFriendRequests(token), getBlockedUsers(token)])
      .then(([friendsList, requestsList, blockedList]) => {
        setFriends(friendsList)
        setRequests(requestsList)
        setBlocked(blockedList)
      })
      .catch(() => setMessage('Impossible de charger tes amis'))
  }, [token])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function onSearch(e: FormEvent): Promise<void> {
    e.preventDefault()
    if (!token || !query.trim()) return
    setLoading(true)
    setMessage(null)
    try {
      setResults(await searchUsers(token, query.trim()))
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : 'Recherche impossible')
    } finally {
      setLoading(false)
    }
  }

  async function onAdd(friendId: string): Promise<void> {
    if (!token) return
    try {
      await sendFriendRequest(token, friendId)
      setMessage('Demande envoyée')
      setResults((r) => r.filter((u) => u.id !== friendId))
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : 'Impossible d\'envoyer la demande')
    }
  }

  async function onAccept(requestId: string): Promise<void> {
    if (!token) return
    await acceptFriendRequest(token, requestId)
    refresh()
  }

  async function onDecline(requestId: string): Promise<void> {
    if (!token) return
    await declineFriendRequest(token, requestId)
    refresh()
  }

  async function onRemove(friend: FriendUser): Promise<void> {
    if (!token) return
    if (!window.confirm(`Retirer ${friend.displayName} de tes amis ?`)) return
    try {
      await removeFriend(token, friend.id)
      refresh()
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : 'Impossible de retirer cet ami')
    }
  }

  async function onBlock(friend: FriendUser): Promise<void> {
    if (!token) return
    if (!window.confirm(`Bloquer ${friend.displayName} ? Cette personne ne pourra plus t'ajouter ni t'écrire.`)) return
    try {
      await blockUser(token, friend.id)
      refresh()
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : 'Impossible de bloquer cet utilisateur')
    }
  }

  async function onUnblock(user: FriendUser): Promise<void> {
    if (!token) return
    try {
      await unblockUser(token, user.id)
      refresh()
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : 'Impossible de débloquer cet utilisateur')
    }
  }

  function toggleReport(friendId: string): void {
    setReportingId((current) => (current === friendId ? null : friendId))
    setReportReason('')
  }

  async function onSubmitReport(friend: FriendUser): Promise<void> {
    if (!token || !reportReason.trim()) return
    try {
      await reportFriend(token, friend.id, reportReason.trim())
      setMessage('Signalement envoyé, merci.')
      setReportingId(null)
      setReportReason('')
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : "Impossible d'envoyer le signalement")
    }
  }

  if (!token) {
    return (
      <div>
        <h1 style={{ fontFamily: 'var(--font-heading)' }}>Amis</h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: 12 }}>
          <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
            Connecte-toi
          </Link>{' '}
          pour ajouter des amis et te comparer à eux.
        </p>
      </div>
    )
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-heading)' }}>Amis</h1>

      <form onSubmit={onSearch} style={{ display: 'flex', gap: 8, marginTop: 16, maxWidth: 420 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Chercher un identifiant (ex: lucas164)…"
          style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid var(--color-border)' }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '10px 18px',
            borderRadius: 10,
            border: 'none',
            background: 'var(--color-primary)',
            color: '#fff',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Chercher
        </button>
      </form>

      {message && <p style={{ color: 'var(--color-text-muted)', marginTop: 10, fontSize: 13.5 }}>{message}</p>}

      {results.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
          {results.map((user) => (
            <div key={user.id} style={cardStyle}>
              <span style={{ flex: 1 }}>
                <span style={{ fontWeight: 600 }}>{user.displayName}</span>{' '}
                <span style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>({user.pseudo})</span>
              </span>
              <button
                onClick={() => onAdd(user.id)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 10,
                  border: '1px solid var(--color-primary)',
                  background: 'transparent',
                  color: 'var(--color-primary)',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Ajouter
              </button>
            </div>
          ))}
        </div>
      )}

      {requests.length > 0 && (
        <section style={{ marginTop: 28 }}>
          <h2 style={{ fontSize: 16, fontFamily: 'var(--font-heading)' }}>Demandes reçues</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
            {requests.map((r) => (
              <div key={r.requestId} style={cardStyle}>
                <span style={{ flex: 1, fontWeight: 600 }}>{r.from.displayName}</span>
                <button
                  onClick={() => onAccept(r.requestId)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 10,
                    border: 'none',
                    background: 'var(--color-primary)',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Accepter
                </button>
                <button
                  onClick={() => onDecline(r.requestId)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 10,
                    border: '1px solid var(--color-border)',
                    background: 'transparent',
                    color: 'var(--color-text-muted)',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Refuser
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <section style={{ marginTop: 28 }}>
        <h2 style={{ fontSize: 16, fontFamily: 'var(--font-heading)' }}>
          Mes amis {friends.length > 0 && `(${friends.length})`}
        </h2>
        {friends.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', marginTop: 10, fontSize: 13.5 }}>
            Aucun ami pour l'instant — cherche un identifiant ci-dessus pour envoyer une demande.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
            {friends.map((f) => (
              <div key={f.id}>
                <div style={cardStyle}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: 'var(--color-primary)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 12
                    }}
                  >
                    {f.displayName.slice(0, 2).toUpperCase()}
                  </div>
                  <span style={{ flex: 1, fontWeight: 600 }}>{f.displayName}</span>
                  <Link
                    to={`/amis/${f.id}`}
                    state={{ displayName: f.displayName }}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 10,
                      border: '1px solid var(--color-primary)',
                      color: 'var(--color-primary)',
                      fontWeight: 700,
                      fontSize: 13,
                      textDecoration: 'none'
                    }}
                  >
                    Écrire
                  </Link>
                  <button onClick={() => toggleReport(f.id)} style={ghostButtonStyle}>
                    Signaler
                  </button>
                  <button onClick={() => onRemove(f)} style={ghostButtonStyle}>
                    Retirer
                  </button>
                  <button onClick={() => onBlock(f)} style={ghostButtonStyle}>
                    Bloquer
                  </button>
                </div>

                {reportingId === f.id && (
                  <div
                    style={{
                      ...cardStyle,
                      marginTop: 6,
                      background: 'var(--color-bg-soft)',
                      border: '1px solid var(--color-border)'
                    }}
                  >
                    <input
                      autoFocus
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      placeholder={`Pourquoi signaler ${f.displayName} ?`}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid var(--color-border)',
                        fontSize: 13.5
                      }}
                    />
                    <button
                      onClick={() => onSubmitReport(f)}
                      disabled={!reportReason.trim()}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 8,
                        border: 'none',
                        background: 'var(--color-primary)',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: 'pointer'
                      }}
                    >
                      Envoyer
                    </button>
                    <button onClick={() => toggleReport(f.id)} style={ghostButtonStyle}>
                      Annuler
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {blocked.length > 0 && (
        <section style={{ marginTop: 28 }}>
          <h2 style={{ fontSize: 16, fontFamily: 'var(--font-heading)' }}>
            Utilisateurs bloqués ({blocked.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
            {blocked.map((u) => (
              <div key={u.id} style={cardStyle}>
                <span style={{ flex: 1, fontWeight: 600 }}>{u.displayName}</span>
                <button onClick={() => onUnblock(u)} style={ghostButtonStyle}>
                  Débloquer
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
