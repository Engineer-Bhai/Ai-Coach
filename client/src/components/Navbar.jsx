import { Link, useLocation } from 'react-router-dom';

export default function Navbar({ userId }) {
  const location = useLocation();
  const isOnboarding = location.pathname === '/';

  return (
    <nav style={{
      background: 'rgba(15,22,41,0.9)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '0 1.5rem',
    }}>
      <div style={{
        maxWidth: 1100,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px',
      }}>
        {/* Logo */}
        <Link to={userId ? `/dashboard/${userId}` : '/'} style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: 36, height: 36,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem',
            }}>🧠</div>
            <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
              AI Study Coach
            </span>
          </div>
        </Link>

        {/* Nav links */}
        {!isOnboarding && userId && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <NavLink to={`/dashboard/${userId}`} label="Dashboard" icon="📊" location={location} />
            <NavLink to={`/report/${userId}`} label="Weekly Report" icon="📅" location={location} />
          </div>
        )}

        {isOnboarding && (
          <span style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 700, fontSize: '0.85rem',
          }}>
            Powered by OpenAI ✨
          </span>
        )}
      </div>
    </nav>
  );
}

function NavLink({ to, label, icon, location }) {
  const isActive = location.pathname === to;
  return (
    <Link to={to} style={{ textDecoration: 'none' }}>
      <div style={{
        padding: '0.4rem 0.9rem',
        borderRadius: 10,
        background: isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
        border: isActive ? '1px solid rgba(99,102,241,0.4)' : '1px solid transparent',
        color: isActive ? '#a78bfa' : 'var(--text-secondary)',
        fontWeight: 500,
        fontSize: '0.875rem',
        transition: 'all 0.2s',
        display: 'flex', alignItems: 'center', gap: '0.4rem',
      }}>
        {icon} {label}
      </div>
    </Link>
  );
}
