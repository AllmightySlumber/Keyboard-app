import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import logo from '../assets/logo.png'
import {
  HomeIcon,
  LessonsIcon,
  KeyboardIcon,
  StatsIcon,
  TrophyIcon,
  FriendsIcon,
  ProfileIcon
} from './icons'

const NAV_ITEMS = [
  { to: '/', label: 'Accueil', Icon: HomeIcon },
  { to: '/lecons', label: 'Leçons', Icon: LessonsIcon },
  { to: '/exercice', label: 'Exercice', Icon: KeyboardIcon },
  { to: '/stats', label: 'Statistiques', Icon: StatsIcon },
  { to: '/classement', label: 'Classement', Icon: TrophyIcon },
  { to: '/amis', label: 'Amis', Icon: FriendsIcon },
  { to: '/profil', label: 'Profil', Icon: ProfileIcon }
]

export default function Sidebar(): JSX.Element {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  return (
    <aside
      style={{
        width: 256,
        flex: 'none',
        background: '#fff',
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '22px 16px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 6px 22px' }}>
        <img
          src={logo}
          alt="Keyboard"
          style={{
            width: 46,
            height: 46,
            borderRadius: 13,
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
          }}
        />
        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18 }}>
          Keyboard
        </span>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
        {NAV_ITEMS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 13,
              padding: '11px 12px',
              borderRadius: 12,
              fontWeight: 600,
              fontSize: 14.5,
              textDecoration: 'none',
              color: isActive ? '#fff' : 'var(--color-text)',
              background: isActive ? 'var(--color-primary)' : 'transparent'
            })}
          >
            <Icon />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 14, marginTop: 14 }}>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'var(--color-primary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 13,
                flex: 'none'
              }}
            >
              {user.pseudo.slice(0, 2).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.pseudo}
              </div>
              <button
                onClick={logout}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: 12, cursor: 'pointer', padding: 0 }}
              >
                Déconnexion
              </button>
            </div>
          </div>
        ) : (
          <NavLink
            to="/login"
            style={{
              display: 'block',
              textAlign: 'center',
              padding: '10px 12px',
              borderRadius: 10,
              border: '1px solid var(--color-border)',
              fontWeight: 600,
              fontSize: 13.5,
              textDecoration: 'none',
              color: 'var(--color-text)'
            }}
          >
            Se connecter
          </NavLink>
        )}
      </div>
    </aside>
  )
}
