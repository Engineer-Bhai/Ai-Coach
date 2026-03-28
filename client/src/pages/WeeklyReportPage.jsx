import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getWeeklyReport } from '../api';
import Loader from '../components/Loader';

const statusColors = {
  perfect:  { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', text: '#10b981', label: '✅ Perfect' },
  partial:  { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)',  text: '#f59e0b', label: '⚡ Partial' },
  missed:   { bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)', text: '#ef4444', label: '❌ Missed' },
  today:    { bg: 'rgba(99,102,241,0.1)',  border: 'rgba(99,102,241,0.35)',text: '#818cf8', label: '📍 Today' },
  upcoming: { bg: 'rgba(71,85,105,0.1)',   border: 'rgba(71,85,105,0.2)',  text: '#475569', label: '🕐 Upcoming' },
};

export default function WeeklyReportPage() {
  const { userId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getWeeklyReport(userId)
      .then((r) => setData(r.data))
      .catch((e) => setError(e.response?.data?.error || 'Failed to load report'))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <Loader message="Generating your weekly report..." />;
  if (error) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: '#ef4444' }}>
      <div style={{ fontSize: '3rem' }}>⚠️</div>
      <h2>{error}</h2>
    </div>
  );

  const { user, report } = data;
  const { daysReport, overallRate, perfectDays, missedDays, streak, consistencyScore, summary, currentDay, totalDays } = report;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingBottom: '4rem' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Back */}
        <Link to={`/dashboard/${userId}`} style={{ textDecoration: 'none' }}>
          <button style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 10, padding: '0.5rem 1rem', color: 'var(--text-secondary)',
            cursor: 'pointer', marginBottom: '1.5rem', fontSize: '0.875rem',
            display: 'flex', alignItems: 'center', gap: '0.4rem',
          }}>← Back to Dashboard</button>
        </Link>

        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontWeight: 800, fontSize: '2rem', marginBottom: '0.4rem' }}>
            📅 Weekly Report
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {user.name} · {user.goal}
          </p>
        </div>

        {/* Summary banner */}
        <div className="card" style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))',
          borderColor: 'rgba(99,102,241,0.3)',
          marginBottom: '2rem',
          padding: '1.75rem',
        }}>
          <p style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>{summary}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Day {currentDay} of {totalDays}</p>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { icon: '📊', label: 'Overall Rate', value: `${overallRate}%`, color: '#6366f1' },
            { icon: '✅', label: 'Perfect Days', value: perfectDays, color: '#10b981' },
            { icon: '❌', label: 'Missed Days', value: missedDays, color: '#ef4444' },
            { icon: '🔥', label: 'Streak', value: `${streak}d`, color: '#f59e0b' },
            { icon: '⭐', label: 'Consistency', value: consistencyScore, color: '#8b5cf6' },
          ].map(({ icon, label, value, color }) => (
            <div key={label} className="card" style={{ textAlign: 'center', padding: '1.25rem 0.75rem' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{icon}</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>📈 Day-by-Day Completion</h2>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: 150 }}>
            {daysReport.map((d) => {
              const colors = statusColors[d.status] || statusColors.upcoming;
              const barH = Math.max(4, (d.rate / 100) * 130);
              return (
                <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.65rem', color: colors.text, fontWeight: 700 }}>
                    {d.rate > 0 ? `${d.rate}%` : ''}
                  </span>
                  <div style={{
                    width: '100%', height: barH,
                    background: colors.text,
                    borderRadius: '6px 6px 0 0',
                    opacity: d.status === 'upcoming' ? 0.25 : 1,
                    transition: 'all 0.5s ease',
                    minHeight: 4,
                  }} title={`Day ${d.day}: ${d.completed}/${d.total} tasks`} />
                  <span style={{ fontSize: '0.68rem', color: d.status === 'today' ? '#818cf8' : 'var(--text-muted)', fontWeight: d.status === 'today' ? 700 : 400 }}>
                    D{d.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Day-by-day detail */}
        <div>
          <h2 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>📋 Day-by-Day Breakdown</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {daysReport.map((d) => {
              const colors = statusColors[d.status] || statusColors.upcoming;
              return (
                <div key={d.day} className="card" style={{
                  background: colors.bg,
                  borderColor: colors.border,
                  padding: '1.25rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: d.tasks.length ? '0.9rem' : 0, flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: `${colors.text}22`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: '0.875rem', color: colors.text,
                        flexShrink: 0,
                      }}>D{d.day}</span>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: '0.925rem' }}>{d.theme}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {d.completed}/{d.total} tasks completed
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {/* Rate bar */}
                      <div style={{ width: 80 }}>
                        <div className="progress-track">
                          <div style={{
                            height: '100%', borderRadius: 999,
                            width: `${d.rate}%`,
                            background: colors.text,
                            transition: 'width 0.8s ease',
                          }} />
                        </div>
                      </div>
                      <span style={{
                        fontSize: '0.72rem', fontWeight: 700, padding: '0.25rem 0.7rem',
                        borderRadius: 999, background: `${colors.text}22`, color: colors.text,
                      }}>{colors.label}</span>
                    </div>
                  </div>
                  {/* Tasks list */}
                  {d.tasks.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      {d.tasks.map((t) => (
                        <div key={t.id} style={{
                          display: 'flex', alignItems: 'center', gap: '0.6rem',
                          fontSize: '0.825rem', color: t.completed ? 'var(--text-muted)' : 'var(--text-secondary)',
                        }}>
                          <span style={{ color: t.completed ? '#10b981' : '#475569', flexShrink: 0 }}>
                            {t.completed ? '✓' : '○'}
                          </span>
                          <span style={{ textDecoration: t.completed ? 'line-through' : 'none' }}>{t.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* n8n hint */}
        <div className="card" style={{ marginTop: '2rem', background: 'rgba(99,102,241,0.05)', borderColor: 'rgba(99,102,241,0.2)' }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.75rem', color: '#a78bfa' }}>
            🔗 Use with n8n Automation
          </h3>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>
            Connect your n8n instance to auto-generate this report weekly:
          </p>
          <code style={{
            display: 'block', background: 'var(--bg-secondary)',
            borderRadius: 8, padding: '0.75rem', fontSize: '0.8rem',
            color: '#a78bfa', fontFamily: 'monospace',
          }}>
            GET /api/weekly-report/{userId}
          </code>
        </div>

      </div>
    </div>
  );
}
