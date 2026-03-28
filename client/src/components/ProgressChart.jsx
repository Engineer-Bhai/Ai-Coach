export default function ProgressChart({ weeklyData = [] }) {
  if (!weeklyData.length) return null;

  const maxRate = 100;

  return (
    <div className="card">
      <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        📈 Weekly Progress Chart
      </h3>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: 120 }}>
        {weeklyData.map((d) => {
          const barHeight = Math.max(4, (d.rate / maxRate) * 100);
          const color =
            d.status === 'missed'  ? '#ef4444' :
            d.status === 'perfect' ? '#10b981' :
            d.status === 'partial' ? '#f59e0b' :
            d.status === 'today'   ? '#6366f1' :
                                     '#334155';
          return (
            <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
              {/* Tooltip label */}
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {d.rate > 0 ? `${d.rate}%` : ''}
              </div>
              {/* Bar */}
              <div style={{
                width: '100%',
                height: `${barHeight}px`,
                background: color,
                borderRadius: '6px 6px 0 0',
                transition: 'all 0.5s ease',
                opacity: d.status === 'upcoming' ? 0.3 : 1,
                position: 'relative',
                cursor: 'pointer',
                minHeight: 4,
              }}
                title={`Day ${d.day}: ${d.completed}/${d.total} tasks (${d.rate}%)`}
              />
              {/* Day label */}
              <div style={{
                fontSize: '0.7rem',
                fontWeight: d.status === 'today' ? 700 : 400,
                color: d.status === 'today' ? '#6366f1' : 'var(--text-muted)',
              }}>D{d.day}</div>
            </div>
          );
        })}
      </div>
      {/* Legend */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
        {[
          { color: '#10b981', label: 'Perfect' },
          { color: '#f59e0b', label: 'Partial' },
          { color: '#ef4444', label: 'Missed' },
          { color: '#6366f1', label: 'Today' },
          { color: '#334155', label: 'Upcoming' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <div style={{ width: 10, height: 10, background: color, borderRadius: 3 }} />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
