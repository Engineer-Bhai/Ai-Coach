const express = require('express');
const router = express.Router();
const { getTaskById, completeTask, getUserById, getPlanByUserId, updateUser } = require('../db');

// PATCH /api/tasks/:taskId/complete
router.patch('/:taskId/complete', (req, res) => {
  try {
    const { taskId } = req.params;

    const task = getTaskById(taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (task.completed) return res.json({ message: 'Task already completed', task });

    completeTask(taskId);

    // Update streak & lastActive for user
    const user = getUserById(task.userId);
    if (user) {
      const now = new Date();
      const lastActive = user.lastActive ? new Date(user.lastActive) : null;
      const isNewDay = !lastActive || (now - lastActive) > 20 * 60 * 60 * 1000; // >20h gap

      let newStreak = user.streak;
      if (isNewDay) {
        newStreak = user.streak + 1;
      }

      updateUser(task.userId, {
        streak: newStreak,
        lastActive: now.toISOString(),
      });
    }

    return res.json({
      success: true,
      message: 'Task marked complete! 🎉',
      task: getTaskById(taskId),
      streak: user ? user.streak : 0,
    });
  } catch (err) {
    console.error('Task complete error:', err);
    res.status(500).json({ error: 'Failed to complete task.' });
  }
});

// GET /api/tasks/plan/:planId — all tasks for a plan
router.get('/plan/:planId', (req, res) => {
  try {
    const { getTasksByPlanId } = require('../db');
    const tasks = getTasksByPlanId(req.params.planId);
    res.json({ tasks });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get tasks.' });
  }
});

module.exports = router;
