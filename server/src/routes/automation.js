const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, getPlanByUserId, getTasksByPlanId, logProgress, updateUser } = require('../db');
const { adaptPlan } = require('../aiService');

// ─────────────────────────────────────────────────────────────────
// GET /api/pending-users
// Returns users who haven't logged progress today (for n8n reminders)
// ─────────────────────────────────────────────────────────────────
router.get('/pending-users', (req, res) => {
  try {
    const now = new Date();
    const allUsers = getAllUsers();

    const pendingUsers = allUsers.filter((user) => {
      if (!user.lastActive) return true;
      const lastActive = new Date(user.lastActive);
      const hoursSince = (now - lastActive) / (1000 * 60 * 60);
      return hoursSince >= 20; // hasn't been active in 20+ hours
    });

    res.json({
      count: pendingUsers.length,
      users: pendingUsers.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        goal: u.goal,
        streak: u.streak,
        lastActive: u.lastActive,
        hoursInactive: u.lastActive
          ? Math.round((now - new Date(u.lastActive)) / (1000 * 60 * 60))
          : null,
      })),
      timestamp: now.toISOString(),
      n8nHint: 'Use this list to send reminder emails/WhatsApp messages via n8n.',
    });
  } catch (err) {
    console.error('pending-users error:', err);
    res.status(500).json({ error: 'Failed to fetch pending users.' });
  }
});

// ─────────────────────────────────────────────────────────────────
// POST /api/adapt-plan
// Triggers AI adaptive planner for a user
// Body: { userId, missedDays?, streak? }
// ─────────────────────────────────────────────────────────────────
router.post('/adapt-plan', async (req, res) => {
  try {
    const { userId, missedDays, streak } = req.body;

    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const user = getUserById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const plan = getPlanByUserId(userId);
    if (!plan) return res.status(404).json({ error: 'No active plan found' });

    const allTasks = getTasksByPlanId(plan.id);
    const incompleteTasks = allTasks.filter((t) => !t.completed);

    const effectiveMissedDays = missedDays !== undefined ? Number(missedDays) : 0;
    const effectiveStreak = streak !== undefined ? Number(streak) : user.streak;

    // Call AI adaptive planner
    const adaptation = await adaptPlan(
      userId,
      effectiveMissedDays,
      effectiveStreak,
      incompleteTasks.slice(0, 6)
    );

    // If tasks were updated by AI, apply them
    if (adaptation.updatedTasks && adaptation.updatedTasks.length > 0) {
      const tasksToUpdate = incompleteTasks.slice(0, adaptation.updatedTasks.length);
      tasksToUpdate.forEach((task, i) => {
        task.title = adaptation.updatedTasks[i];
        task.adaptedAt = new Date().toISOString();
      });
    }

    res.json({
      success: true,
      userId,
      adjustmentType: adaptation.adjustmentType,
      message: adaptation.message,
      tasksUpdated: adaptation.updatedTasks ? adaptation.updatedTasks.length : 0,
      n8nHint: 'Send adaptation.message to user via email/SMS using n8n.',
    });
  } catch (err) {
    console.error('adapt-plan error:', err);
    res.status(500).json({ error: 'Failed to adapt plan.' });
  }
});

// ─────────────────────────────────────────────────────────────────
// POST /api/log-progress
// External progress logging hook (from forms, apps, n8n)
// Body: { userId, completed, total, notes? }
// ─────────────────────────────────────────────────────────────────
router.post('/log-progress', (req, res) => {
  try {
    const { userId, completed, total, notes } = req.body;

    if (!userId || completed === undefined || total === undefined) {
      return res.status(400).json({ error: 'Required: userId, completed, total' });
    }

    const user = getUserById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const plan = getPlanByUserId(userId);

    // Log the progress
    const log = logProgress({
      userId,
      planId: plan ? plan.id : null,
      day: plan ? plan.currentDay : null,
      completed: Number(completed),
      total: Number(total),
      notes: notes || null,
      source: 'n8n_webhook',
    });

    // Update user streak
    const now = new Date();
    const lastActive = user.lastActive ? new Date(user.lastActive) : null;
    const isNewDay = !lastActive || (now - lastActive) > 20 * 60 * 60 * 1000;
    if (isNewDay) {
      updateUser(userId, {
        streak: user.streak + 1,
        lastActive: now.toISOString(),
      });
    }

    // Advance plan day if fully completed
    if (plan && Number(completed) >= Number(total)) {
      plan.currentDay = Math.min(plan.currentDay + 1, plan.totalDays);
    }

    res.json({
      success: true,
      logId: log.id,
      message: `Progress logged: ${completed}/${total} tasks`,
      streak: user.streak,
      n8nHint: 'Trigger report generation or send congratulations using n8n after this.',
    });
  } catch (err) {
    console.error('log-progress error:', err);
    res.status(500).json({ error: 'Failed to log progress.' });
  }
});

module.exports = router;
