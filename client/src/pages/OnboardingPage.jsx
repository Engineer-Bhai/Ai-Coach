import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onboardUser } from '../api';

const SKILL_LEVELS = [
  { value: 'beginner', label: 'Beginner', icon: '🌱', desc: 'Just starting out' },
  { value: 'intermediate', label: 'Intermediate', icon: '⚡', desc: 'Some experience' },
  { value: 'advanced', label: 'Advanced', icon: '🚀', desc: 'Ready to be challenged' },
];

const GOALS_SUGGESTIONS = [
  'Master React and full-stack development',
  'Learn Python for Data Science & ML',
  'Become a UI/UX Designer',
  'Prepare for AWS Cloud Certification',
  'Learn Machine Learning with TensorFlow',
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    goal: '',
    hoursPerDay: 2,
    skillLevel: 'beginner',
  });

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit() {
    if (!form.goal.trim()) { setError('Please enter a learning goal'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await onboardUser(form);
      navigate(`/dashboard/${res.data.userId}`);
    } catch (e) {
      setError(e.response?.data?.error || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Hero background */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        background: 'radial-gradient(ellipse at 20% 20%, rgba(99,102,241,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(139,92,246,0.1) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'relative', zIndex: 1,
        maxWidth: 620,
        margin: '0 auto',
        padding: '4rem 1.5rem',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem', animation: 'fadeInUp 0.6s ease' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🧠</div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1.1, marginBottom: '0.75rem' }}>
            Your Personal{' '}
            <span style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>AI Coach</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: 420, margin: '0 auto' }}>
            Turn your learning goals into a consistent daily habit with AI-powered study plans.
          </p>
        </div>

        {/* Step indicators */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
          {[1, 2, 3].map((s) => (
            <div key={s} style={{
              width: s === step ? 32 : 10,
              height: 10,
              borderRadius: 999,
              background: s <= step ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'var(--border)',
              transition: 'all 0.4s ease',
            }} />
          ))}
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '2rem', animation: 'fadeInUp 0.5s ease' }}>

          {/* Step 1: About You */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h2 style={{ fontWeight: 700, marginBottom: '0.3rem' }}>👋 Tell us about yourself</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Let's personalize your experience</p>
              </div>
              <Field label="Your Name" required={false}>
                <Input placeholder="Alex Student" value={form.name} onChange={(v) => update('name', v)} />
              </Field>
              <Field label="Email (optional)">
                <Input type="email" placeholder="alex@example.com" value={form.email} onChange={(v) => update('email', v)} />
              </Field>
              <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
                onClick={() => setStep(2)}>
                Next: Set Your Goal →
              </button>
            </div>
          )}

          {/* Step 2: Goal & Schedule */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h2 style={{ fontWeight: 700, marginBottom: '0.3rem' }}>🎯 What do you want to learn?</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Be as specific as possible</p>
              </div>
              <Field label="Learning Goal *">
                <textarea
                  value={form.goal}
                  onChange={(e) => update('goal', e.target.value)}
                  placeholder="e.g. Master React and become a full-stack developer..."
                  rows={3}
                  style={{
                    width: '100%', background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)', borderRadius: 10, padding: '0.75rem',
                    color: 'var(--text-primary)', fontSize: '0.9rem', resize: 'vertical',
                    fontFamily: 'Inter, system-ui, sans-serif', lineHeight: 1.6,
                  }}
                />
              </Field>
              {/* Suggestions */}
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Quick suggestions:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {GOALS_SUGGESTIONS.map((g) => (
                    <button key={g} onClick={() => update('goal', g)} style={{
                      background: form.goal === g ? 'rgba(99,102,241,0.2)' : 'var(--bg-secondary)',
                      border: `1px solid ${form.goal === g ? 'rgba(99,102,241,0.5)' : 'var(--border)'}`,
                      color: form.goal === g ? '#a78bfa' : 'var(--text-secondary)',
                      padding: '0.3rem 0.7rem', borderRadius: 8, fontSize: '0.75rem',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}>{g}</button>
                  ))}
                </div>
              </div>
              {/* Hours per day */}
              <Field label={`⏱ Study time per day: ${form.hoursPerDay}h`}>
                <input type="range" min={0.5} max={8} step={0.5} value={form.hoursPerDay}
                  onChange={(e) => update('hoursPerDay', Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#6366f1' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <span>30 min</span><span>8 hours</span>
                </div>
              </Field>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={() => setStep(1)} style={{
                  flex: 1, padding: '0.75rem', borderRadius: 12, border: '1px solid var(--border)',
                  background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500,
                }}>← Back</button>
                <button className="btn-primary" style={{ flex: 2, justifyContent: 'center' }}
                  onClick={() => { if (!form.goal.trim()) { setError('Please enter a goal'); return; } setError(''); setStep(3); }}>
                  Next: Skill Level →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Skill Level */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h2 style={{ fontWeight: 700, marginBottom: '0.3rem' }}>⚡ What's your skill level?</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>We'll tailor the difficulty accordingly</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {SKILL_LEVELS.map((s) => (
                  <div key={s.value}
                    onClick={() => update('skillLevel', s.value)}
                    style={{
                      padding: '1rem 1.25rem', borderRadius: 12, cursor: 'pointer',
                      border: `2px solid ${form.skillLevel === s.value ? '#6366f1' : 'var(--border)'}`,
                      background: form.skillLevel === s.value ? 'rgba(99,102,241,0.1)' : 'var(--bg-secondary)',
                      transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '1rem',
                    }}>
                    <span style={{ fontSize: '1.5rem' }}>{s.icon}</span>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.1rem' }}>{s.label}</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{s.desc}</p>
                    </div>
                    {form.skillLevel === s.value && (
                      <div style={{ marginLeft: 'auto', color: '#6366f1', fontWeight: 700 }}>✓</div>
                    )}
                  </div>
                ))}
              </div>
              {error && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '0.75rem', color: '#ef4444', fontSize: '0.875rem' }}>
                  ⚠️ {error}
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={() => setStep(2)} style={{
                  flex: 1, padding: '0.75rem', borderRadius: 12, border: '1px solid var(--border)',
                  background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500,
                }}>← Back</button>
                <button className="btn-primary" style={{ flex: 2, justifyContent: 'center' }}
                  onClick={handleSubmit} disabled={loading}>
                  {loading ? (
                    <>
                      <div style={{
                        width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.6s linear infinite',
                      }} />
                      Generating your plan...
                    </>
                  ) : '🚀 Generate My Study Plan'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Feature highlights */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '2rem' }}>
          {[
            { icon: '🤖', label: 'AI-Powered Plans' },
            { icon: '🔥', label: 'Streak Tracking' },
            { icon: '📊', label: 'Progress Analytics' },
          ].map(({ icon, label }) => (
            <div key={label} style={{
              textAlign: 'center', padding: '1rem 0.5rem',
              background: 'rgba(15,22,41,0.6)', border: '1px solid var(--border)',
              borderRadius: 12,
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{icon}</div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Field({ label, required = true, children }) {
  return (
    <div>
      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function Input({ type = 'text', placeholder, value, onChange }) {
  return (
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      style={{
        width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)',
        borderRadius: 10, padding: '0.7rem 0.9rem', color: 'var(--text-primary)',
        fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
      }}
    />
  );
}
