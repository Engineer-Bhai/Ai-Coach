const express = require('express');
const router = express.Router();
const {
  getUserById,
  getPlanByUserId,
  getTasksByPlanId,
  getTasksByDay,
  getProgressLogs,
} = require('../db');
const { generateFeedback } = require('../aiService');

// GET /api/dashboard/:userId
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = getUserById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const plan = getPlanByUserId(userId);
    if (!plan) return res.status(404).json({ error: 'No active plan found' });

    const allTasks = getTasksByPlanId(plan.id);
    const todayTasks = getTasksByDay(plan.id, plan.currentDay);
    const logs = getProgressLogs(userId);

    // Stats
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter((t) => t.completed).length;
    const progressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Missed days calculation
    const recentLogs = logs.slice(-7);
    const missedDays = Math.max(0, plan.currentDay - 1 - recentLogs.length);

    // Consistency score (0-100): based on completion rate + streak bonus
    const streakBonus = Math.min(user.streak * 5, 30);
    const consistencyScore = Math.min(100, Math.round(progressPct * 0.7 + streakBonus));

    // Weekly chart data (per-day breakdown)
    const weeklyData = [];
    for (let d = 1; d <= plan.totalDays; d++) {
      const dayTasks = getTasksByDay(plan.id, d);
      const doneTasks = dayTasks.filter((t) => t.completed).length;
      weeklyData.push({
        day: d,
        label: `Day ${d}`,
        total: dayTasks.length,
        completed: doneTasks,
        rate: dayTasks.length > 0 ? Math.round((doneTasks / dayTasks.length) * 100) : 0,
      });
    }

    // Upcoming tasks (next 2 days)
    const upcomingTasks = [];
    for (let d = plan.currentDay + 1; d <= Math.min(plan.currentDay + 2, plan.totalDays); d++) {
      const dayTasks = getTasksByDay(plan.id, d);
      upcomingTasks.push({ day: d, tasks: dayTasks.filter((t) => !t.completed) });
    }

    // AI feedback (async, non-blocking)
    const aiInsight = await generateFeedback(
      user.name,
      user.streak,
      progressPct,
      missedDays
    );

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        goal: user.goal,
        skillLevel: user.skillLevel,
        joinedAt: user.joinedAt,
      },
      stats: {
        streak: user.streak,
        progressPct,
        consistencyScore,
        totalTasks,
        completedTasks,
        currentDay: plan.currentDay,
        totalDays: plan.totalDays,
        missedDays,
      },
      todayTasks,
      upcomingTasks,
      weeklyData,
      aiInsight,
      planId: plan.id,
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Failed to load dashboard.' });
  }
});

module.exports = router;
