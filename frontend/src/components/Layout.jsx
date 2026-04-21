import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SmartSeasonLogo from './SmartSeasonLogo'

export default function Layout() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{
        width: 220,
        background: 'linear-gradient(180deg, #15803d 0%, #16a34a 52%, #22c55e 100%)',
        color: 'var(--cream)',
        display: 'flex',
        flexDirection: 'column',
        padding: '0',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh',
        boxShadow: 'inset -1px 0 0 rgba(255,255,255,0.08)',
      }}>
        <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <SmartSeasonLogo size={42} light subtitle="Field Monitor" />
        </div>

        <nav style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <NavLink to="/" end style={navStyle}>
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/fields" style={navStyle}>
            <span>Fields</span>
          </NavLink>
          {isAdmin && (
            <NavLink to="/agents" style={navStyle}>
              <span>Agents</span>
            </NavLink>
          )}
        </nav>

        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '0.78rem', color: 'rgba(244, 238, 221, 0.72)', marginBottom: 4 }}>
            {isAdmin ? 'Coordinator' : 'Field Agent'}
          </div>
          <div style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--cream)', marginBottom: 10 }}>{user?.name}</div>
          <button onClick={handleLogout} className="btn btn-ghost btn-sm" style={{ color: 'rgba(244, 238, 221, 0.8)', width: '100%', justifyContent: 'center' }}>
            Sign out
          </button>
        </div>
      </aside>

      <main style={{
        flex: 1,
        minWidth: 0,
        background: 'radial-gradient(circle at top right, rgba(21, 128, 61, 0.16), transparent 20%), linear-gradient(180deg, #e9f6ec 0%, #e0efe4 100%)',
      }}>
        <Outlet />
      </main>
    </div>
  )
}

function navStyle({ isActive }) {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '9px 14px',
    borderRadius: 12,
    fontSize: '0.875rem',
    fontWeight: isActive ? 600 : 400,
    color: isActive ? 'var(--cream)' : 'rgba(244, 238, 221, 0.68)',
    background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
    transition: 'all 0.15s',
    textDecoration: 'none',
  }
}
