import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }
  const closeMenu = () => setMenuOpen(false)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>

      {/* Mobile top bar */}
      <header className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>🌾</span>
          <span style={{ fontFamily: 'Instrument Serif', fontSize: '1.1rem', color: 'var(--wheat)' }}>SmartSeason</span>
        </div>
        <button
          onClick={() => setMenuOpen(o => !o)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, color: 'var(--wheat)', fontSize: 22, lineHeight: 1 }}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </header>

      {/* Mobile overlay */}
      {menuOpen && (
        <div onClick={closeMenu} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 150 }} />
      )}

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>

        {/* Sidebar */}
        <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
          <div className="sidebar-logo" style={{ padding: '28px 24px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 22 }}>🌾</span>
              <div>
                <div style={{ fontFamily: 'Instrument Serif', fontSize: '1.15rem', color: 'var(--wheat)', lineHeight: 1.1 }}>SmartSeason</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--straw)', opacity: 0.75, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Field Monitor</div>
              </div>
            </div>
          </div>

          <nav style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <NavLink to="/" end style={navStyle} onClick={closeMenu}>
              <span>⊞</span> Dashboard
            </NavLink>
            <NavLink to="/fields" style={navStyle} onClick={closeMenu}>
              <span>◫</span> Fields
            </NavLink>
            {user?.role === 'admin' && (
              <NavLink to="/agents" style={navStyle} onClick={closeMenu}>
                <span>◎</span> Agents
              </NavLink>
            )}
          </nav>

          <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--straw)', marginBottom: 4 }}>
              {user?.role === 'admin' ? '★ Coordinator' : '● Field Agent'}
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--wheat)', marginBottom: 10 }}>{user?.name}</div>
            <button onClick={handleLogout} className="btn btn-ghost btn-sm" style={{ color: 'var(--straw)', width: '100%', justifyContent: 'center' }}>
              Sign out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, minWidth: 0, background: 'var(--cream)', overflowX: 'hidden' }}>
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="bottom-nav">
        <NavLink to="/" end style={bottomNavStyle}>
          <span style={{ fontSize: 18 }}>⊞</span>
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/fields" style={bottomNavStyle}>
          <span style={{ fontSize: 18 }}>◫</span>
          <span>Fields</span>
        </NavLink>
        {user?.role === 'admin' && (
          <NavLink to="/agents" style={bottomNavStyle}>
            <span style={{ fontSize: 18 }}>◎</span>
            <span>Agents</span>
          </NavLink>
        )}
        <button onClick={handleLogout} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3, flex:1, padding:'8px 4px', fontSize:'0.65rem', color:'rgba(240,217,168,0.55)', background:'none', border:'none', cursor:'pointer' }}>
          <span style={{ fontSize: 18 }}>⏻</span>
          <span>Sign out</span>
        </button>
      </nav>
    </div>
  )
}

function navStyle({ isActive }) {
  return {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '9px 14px', borderRadius: 7,
    fontSize: '0.875rem', fontWeight: isActive ? 600 : 400,
    color: isActive ? 'var(--wheat)' : 'rgba(240,217,168,0.6)',
    background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
    transition: 'all 0.15s', textDecoration: 'none',
  }
}

function bottomNavStyle({ isActive } = {}) {
  return {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 3, flex: 1, padding: '8px 4px', fontSize: '0.65rem',
    fontWeight: isActive ? 600 : 400,
    color: isActive ? 'var(--wheat)' : 'rgba(240,217,168,0.55)',
    textDecoration: 'none',
  }
}