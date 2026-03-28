const express = require('express');
const router = express.Router();
const { getUserById, getPlanByUserId, getTasksByPlanId, getTasksByDay } = require('../db');

// GET /api/weekly-report/:userId
router.get('/:userId', (req, res) => {
  try {
    const { userId } = req.params;

    const user = getUserById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const plan = getPlanByUserId(userId);
    if (!plan) return res.status(404).json({ error: 'No active plan found' });

    const allTasks = getTasksByPlanId(plan.id);

    // Build per-day report
    const daysReport = [];
    for (let d = 1; d <= plan.totalDays; d++) {
      const dayTasks = getTasksByDay(plan.id, d);
      const completed = dayTasks.filter((t) => t.completed).length;
      const total = dayTasks.length;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
      const status = d < plan.currentDay
        ? completed === total ? 'perfect' : completed > 0 ? 'partial' : 'missed'
        : d === plan.currentDay ? 'today' : 'upcoming';

      daysReport.push({
        day: d,
        label: `Day ${d}`,
        theme: dayTasks[0]?.theme || `Day ${d}`,
        completed,
        total,
        rate,
        status,
        tasks: dayTasks,
      });
    }

    const totalCompleted = allTasks.filter((t) => t.completed).length;
    const overallRate = allTasks.length > 0
      ? Math.round((totalCompleted / allTasks.length) * 100)
      : 0;

    const perfectDays = daysReport.filter((d) => d.status === 'perfect').length;
    const missedDays = daysReport.filter((d) => d.status === 'missed').length;

    // Motivational summary
    let summary;
    if (overallRate >= 80) summary = '🏆 Outstanding week! You are crushing your goals!';
    else if (overallRate >= 60) summary = '💪 Solid progress! Keep it up and you\'ll finish strong!';
    else if (overallRate >= 40) summary = '📈 You\'ve made a start — now let\'s build momentum!';
    else summary = '🌱 Every journey starts somewhere. Tomorrow is a fresh chance!';

    res.json({
      user: { id: user.id, name: user.name, goal: user.goal },
      report: {
        totalDays: plan.totalDays,
        currentDay: plan.currentDay,
        daysReport,
        overallRate,
        perfectDays,
        missedDays,
        streak: user.streak,
        consistencyScore: Math.min(100, Math.round(overallRate * 0.7 + user.streak * 5)),
        summary,
      },
    });
  } catch (err) {
    console.error('weekly-report error:', err);
    res.status(500).json({ error: 'Failed to generate weekly report.' });
  }
});

module.exports = router;
