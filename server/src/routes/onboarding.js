const express = require('express');
const router = express.Router();
const { createUser, createPlan, createTask, getUserById } = require('../db');
const { generatePlan } = require('../aiService');

// POST /api/onboard
router.post('/', async (req, res) => {
  try {
    const { email, name, goal, hoursPerDay, skillLevel } = req.body;

    if (!goal || !hoursPerDay || !skillLevel) {
      return res.status(400).json({ error: 'Missing required fields: goal, hoursPerDay, skillLevel' });
    }

    // Create user
    const user = createUser({
      email: email || `user_${Date.now()}@aicoach.com`,
      name: name || 'Learner',
      goal,
      hoursPerDay: Number(hoursPerDay),
      skillLevel,
    });

    // Generate AI plan
    const aiPlan = await generatePlan(goal, hoursPerDay, skillLevel);

    // Create plan record
    const plan = createPlan({
      userId: user.id,
      goal,
      totalDays: aiPlan.totalDays || 7,
      currentDay: 1,
    });

    // Create all tasks from AI plan
    const tasks = [];
    for (const dayData of aiPlan.days) {
      for (const taskTitle of dayData.tasks) {
        const task = createTask({
          planId: plan.id,
          userId: user.id,
          title: taskTitle,
          day: dayData.day,
          theme: dayData.theme || `Day ${dayData.day}`,
        });
        tasks.push(task);
      }
    }

    res.status(201).json({
      success: true,
      userId: user.id,
      planId: plan.id,
      tasksCreated: tasks.length,
      message: 'Your personalized study plan is ready! 🚀',
    });
  } catch (err) {
    console.error('Onboarding error:', err);
    res.status(500).json({ error: 'Failed to create study plan. Please try again.' });
  }
});

module.exports = router;
