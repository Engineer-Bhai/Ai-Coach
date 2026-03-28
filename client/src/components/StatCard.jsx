export default function StatCard({ icon, label, value, subtitle, color = '#6366f1', glow = false }) {
  return (
    <div className="card" style={{
      boxShadow: glow ? `0 0 30px ${color}33` : 'none',
      borderColor: glow ? `${color}44` : 'var(--border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {label}
          </p>
          <p style={{ fontSize: '2.4rem', fontWeight: 800, lineHeight: 1, color: color, marginBottom: '0.3rem' }}>
            {value}
          </p>
          {subtitle && <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{subtitle}</p>}
        </div>
        <div style={{
          width: 48, height: 48,
          borderRadius: 14,
          background: `${color}22`,
          border: `1px solid ${color}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.4rem',
        }}>{icon}</div>
      </div>
    </div>
  );
}
