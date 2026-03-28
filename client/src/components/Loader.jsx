export default function Loader({ message = 'Loading...' }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh', gap: '1.5rem',
    }}>
      {/* Animated spinner */}
      <div style={{ position: 'relative', width: 64, height: 64 }}>
        <div style={{
          position: 'absolute', inset: 0,
          borderRadius: '50%',
          border: '3px solid var(--border)',
          borderTopColor: '#6366f1',
          animation: 'spin 0.8s linear infinite',
        }} />
        <div style={{
          position: 'absolute', inset: 8,
          borderRadius: '50%',
          border: '3px solid transparent',
          borderTopColor: '#8b5cf6',
          animation: 'spin 1.2s linear infinite reverse',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.3rem',
        }}>🧠</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.05rem', marginBottom: '0.3rem' }}>
          {message}
        </p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          AI is working its magic...
        </p>
      </div>
    </div>
  );
}
