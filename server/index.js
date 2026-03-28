require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────
app.use('/api/onboard', require('./src/routes/onboarding'));
app.use('/api/dashboard', require('./src/routes/dashboard'));
app.use('/api/tasks', require('./src/routes/tasks'));
app.use('/api/weekly-report', require('./src/routes/report'));

// ─── n8n Automation Hooks ─────────────────────────────────────────
app.use('/api', require('./src/routes/automation'));

// ─── Health Check ────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'AI Study Consistency Coach API is running 🚀',
    timestamp: new Date().toISOString(),
    endpoints: {
      onboard: 'POST /api/onboard',
      dashboard: 'GET /api/dashboard/:userId',
      completeTask: 'PATCH /api/tasks/:taskId/complete',
      weeklyReport: 'GET /api/weekly-report/:userId',
      n8n_pendingUsers: 'GET /api/pending-users',
      n8n_adaptPlan: 'POST /api/adapt-plan',
      n8n_logProgress: 'POST /api/log-progress',
    },
  });
});

// ─── 404 Handler ─────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ─── Error Handler ────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 AI Study Coach API running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 n8n hooks ready at /api/pending-users, /api/adapt-plan, /api/log-progress\n`);
});
