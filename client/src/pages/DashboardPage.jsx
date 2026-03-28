import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getDashboard } from '../api';
import Loader from '../components/Loader';
import StatCard from '../components/StatCard';
import ProgressChart from '../components/ProgressChart';
import TaskCard from '../components/TaskCard';

export default function DashboardPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completedCount, setCompletedCount] = useState(0);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await getDashboard(userId);
      setData(res.data);
      setCompletedCount(res.data.todayTasks.filter((t) => t.completed).length);
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  function handleTaskComplete(taskId) {
    setCompletedCount((c) => c + 1);
    // Refresh dashboard stats after a task is completed
    setTimeout(fetchDashboard, 800);
  }

  if (loading) return <Loader message="Loading your dashboard..." />;
  if (error) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: '#ef4444' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
      <h2 style={{ marginBottom: '0.5rem' }}>{error}</h2>
      <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/')}>
        Start Fresh
      </button>
    </div>
  );

  const { user, stats, todayTasks, upcomingTasks, weeklyData, aiInsight } = data;
  const todayTotal = todayTasks.length;
  const todayDone = todayTasks.filter((t) => t.completed).length + completedCount - todayTasks.filter((t) => t.completed).length;
  const allTodayDone = todayTotal > 0 && todayDone >= todayTotal;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      paddingBottom: '4rem',
    }}>
      {/* Bg glow */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        background: 'radial-gradient(ellipse at 70% 10%, rgba(99,102,241,0.08) 0%, transparent 50%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem',
        }}>
          <div>
            <h1 style={{ fontWeight: 800, fontSize: '1.75rem', marginBottom: '0.3rem' }}>
              Welcome back, {user.name} 👋
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              🎯 Goal: {user.goal}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {/* Demo badge */}
            <span style={{
              fontSize: '0.72rem', fontWeight: 600, padding: '0.3rem 0.8rem',
              background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: 999, color: '#a78bfa',
            }}>
              Day {stats.currentDay} of {stats.totalDays}
            </span>
            <Link to={`/report/${userId}`}>
              <button style={{
                padding: '0.5rem 1.1rem', borderRadius: 10, border: '1px solid var(--border)',
                background: 'var(--bg-card)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem',
                fontWeight: 500, transition: 'all 0.2s',
              }}>📅 Weekly Report</button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <StatCard icon="🔥" label="Current Streak" value={`${stats.streak}d`} subtitle="consecutive days" color="#f59e0b" glow={stats.streak >= 3} />
          <StatCard icon="📊" label="Overall Progress" value={`${stats.progressPct}%`} subtitle={`${stats.completedTasks}/${stats.totalTasks} tasks`} color="#6366f1" />
          <StatCard icon="⭐" label="Consistency Score" value={stats.consistencyScore} subtitle="out of 100" color="#8b5cf6" glow={stats.consistencyScore >= 70} />
          <StatCard icon="✅" label="Today's Tasks" value={`${todayDone}/${todayTotal}`} subtitle={allTodayDone ? 'All done! 🎉' : 'Keep going!'} color={allTodayDone ? '#10b981' : '#6366f1'} glow={allTodayDone} />
        </div>

        {/* Progress bar */}
        <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Week Progress</span>
            <span style={{ color: '#6366f1', fontWeight: 700 }}>{stats.progressPct}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${stats.progressPct}%` }} />
          </div>
        </div>

        {/* Main Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>

          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Today's Tasks */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h2 style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                  📋 Today's Tasks
                  <span style={{
                    marginLeft: '0.6rem', fontSize: '0.72rem', fontWeight: 600,
                    color: allTodayDone ? '#10b981' : '#6366f1',
                    background: allTodayDone ? 'rgba(16,185,129,0.1)' : 'rgba(99,102,241,0.1)',
                    padding: '0.2rem 0.6rem', borderRadius: 999,
                  }}>Day {stats.currentDay}</span>
                </h2>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{todayDone}/{todayTotal} done</span>
              </div>
              {todayTasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  🎉 No tasks for today — you're ahead of the curve!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {todayTasks.map((task) => (
                    <TaskCard key={task.id} task={task} onComplete={handleTaskComplete} />
                  ))}
                </div>
              )}
              {allTodayDone && (
                <div style={{
                  marginTop: '1rem', padding: '1rem', borderRadius: 12,
                  background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
                  textAlign: 'center', color: '#10b981', fontWeight: 700,
                }}>
                  🎉 All tasks done for today! Incredible work!
                </div>
              )}
            </div>

            {/* Upcoming Tasks */}
            {upcomingTasks && upcomingTasks.length > 0 && (
              <div className="card">
                <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '1rem' }}>📅 Coming Up Next</h2>
                {upcomingTasks.map(({ day, tasks }) => (
                  <div key={day} style={{ marginBottom: '1rem' }}>
                    <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Day {day}
                    </p>
                    {tasks.map((t) => (
                      <div key={t.id} style={{
                        padding: '0.6rem 0.9rem', borderRadius: 10, marginBottom: '0.35rem',
                        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                        color: 'var(--text-secondary)', fontSize: '0.875rem',
                        display: 'flex', alignItems: 'center', gap: '0.6rem',
                      }}>
                        <span style={{ opacity: 0.5 }}>◦</span> {t.title}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* Progress Chart */}
            <ProgressChart weeklyData={weeklyData} />
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* AI Insight Card */}
            <div className="card animate-pulse-glow" style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))',
              borderColor: 'rgba(99,102,241,0.3)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
                }}>🤖</div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.875rem' }}>AI Coach Insight</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Powered by OpenAI</p>
                </div>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7, fontStyle: 'italic' }}>
                "{aiInsight}"
              </p>
            </div>

            {/* Streak Info */}
            {stats.streak >= 1 && (
              <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
                <div className="animate-streak" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🔥</div>
                <p style={{ fontWeight: 800, fontSize: '1.8rem', color: '#f59e0b', marginBottom: '0.2rem' }}>
                  {stats.streak} Day Streak!
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  {stats.streak >= 7 ? "🏆 Week champion! Keep the fire burning!"
                    : stats.streak >= 3 ? "⚡ Three days strong — the habit is forming!"
                    : "🌟 Great start! Don't break the chain!"}
                </p>
              </div>
            )}

            {/* Quick Actions / n8n Status */}
            <div className="card">
              <h3 style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '1rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                🔗 n8n Automation Hooks
              </h3>
              {[
                { label: 'Pending Users', endpoint: 'GET /api/pending-users', color: '#10b981' },
                { label: 'Adapt Plan', endpoint: 'POST /api/adapt-plan', color: '#f59e0b' },
                { label: 'Log Progress', endpoint: 'POST /api/log-progress', color: '#6366f1' },
              ].map(({ label, endpoint, color }) => (
                <div key={label} style={{
                  display: 'flex', alignItems: 'center', gap: '0.7rem',
                  padding: '0.6rem 0', borderBottom: '1px solid var(--border)',
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>{label}</p>
                    <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{endpoint}</p>
                  </div>
                  <span style={{
                    fontSize: '0.65rem', padding: '0.15rem 0.5rem',
                    background: 'rgba(16,185,129,0.1)', color: '#10b981', borderRadius: 999,
                  }}>LIVE</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
