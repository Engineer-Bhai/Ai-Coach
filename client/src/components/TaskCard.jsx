import { useState } from 'react';
import { completeTask } from '../api';

export default function TaskCard({ task, onComplete }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(task.completed);

  async function handleCheck() {
    if (done || loading) return;
    setLoading(true);
    try {
      await completeTask(task.id);
      setDone(true);
      onComplete && onComplete(task.id);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.9rem',
      padding: '0.9rem 1rem',
      borderRadius: 12,
      background: done ? 'rgba(16,185,129,0.06)' : 'rgba(99,102,241,0.05)',
      border: done ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(99,102,241,0.15)',
      transition: 'all 0.3s ease',
      cursor: done ? 'default' : 'pointer',
      opacity: loading ? 0.7 : 1,
    }} onClick={handleCheck}>
      {/* Checkbox */}
      <div style={{
        width: 22, height: 22, borderRadius: 6,
        border: done ? '2px solid #10b981' : '2px solid #475569',
        background: done ? '#10b981' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, transition: 'all 0.2s ease',
      }}>
        {done && <span style={{ color: 'white', fontSize: '12px', fontWeight: 700 }}>✓</span>}
        {loading && <div style={{
          width: 12, height: 12, border: '2px solid #6366f1',
          borderTopColor: 'transparent', borderRadius: '50%',
          animation: 'spin 0.6s linear infinite',
        }} />}
      </div>

      {/* Title */}
      <span style={{
        flex: 1,
        color: done ? 'var(--text-muted)' : 'var(--text-primary)',
        textDecoration: done ? 'line-through' : 'none',
        fontSize: '0.9rem',
        fontWeight: 400,
        transition: 'all 0.3s',
      }}>
        {task.title}
      </span>

      {/* Badge */}
      {done && (
        <span style={{
          fontSize: '0.7rem', fontWeight: 600,
          color: '#10b981', background: 'rgba(16,185,129,0.1)',
          padding: '0.2rem 0.6rem', borderRadius: 999,
        }}>Done ✓</span>
      )}
    </div>
  );
}
