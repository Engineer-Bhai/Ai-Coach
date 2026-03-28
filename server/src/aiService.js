require('dotenv').config();
const OpenAI = require('openai');

const openai = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-your-openai-key-here'
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// ─── Mock fallback data ────────────────────────────────────────────
const MOCK_PLAN = (goal, hoursPerDay, skillLevel) => ({
  totalDays: 7,
  days: [
    {
      day: 1,
      theme: 'Foundation',
      tasks: [`Research core concepts of ${goal}`, `Watch intro tutorial (${hoursPerDay}h)`],
    },
    {
      day: 2,
      theme: 'Core Skills',
      tasks: [`Hands-on exercise for ${goal}`, 'Take notes and summarize learnings'],
    },
    {
      day: 3,
      theme: 'Practice',
      tasks: ['Build a mini project', 'Debug and iterate'],
    },
    {
      day: 4,
      theme: 'Deep Dive',
      tasks: ['Advanced concepts exploration', 'Read documentation'],
    },
    {
      day: 5,
      theme: 'Real-World Application',
      tasks: ['Apply skills to a real problem', 'Get peer feedback'],
    },
    {
      day: 6,
      theme: 'Review & Reinforce',
      tasks: ['Review all notes', 'Do a practice quiz'],
    },
    {
      day: 7,
      theme: 'Showcase',
      tasks: ['Polish your project', 'Share progress and celebrate 🎉'],
    },
  ],
});

const MOCK_FEEDBACK = [
  "🔥 You're on a roll! Keep this momentum going — consistency is your superpower.",
  "📚 Great work logging in today. Remember: small daily steps compound into massive results.",
  '💡 Every expert was once a beginner. Your effort today is building the expert of tomorrow.',
  "⚡ You've completed tasks that most people skip. That's what separates the best from the rest!",
  '🎯 Stay focused on your goal. The discomfort you feel is growth in disguise.',
];

const MOCK_ADAPTIVE = (missed) =>
  missed >= 2
    ? 'Reduced workload applied — focus on just 1 task per day this week. Progress > perfection. 💪'
    : 'Great consistency! Difficulty increased slightly to keep challenging you. 🚀';

// ─── AI Functions ──────────────────────────────────────────────────

/**
 * Generate a structured multi-day study plan
 */
async function generatePlan(goal, hoursPerDay, skillLevel) {
  if (!openai) {
    console.log('⚠️  No OpenAI key — using mock plan');
    return MOCK_PLAN(goal, hoursPerDay, skillLevel);
  }

  try {
    const prompt = `You are an expert study coach. Create a 7-day personalized study plan for a student.

Goal: ${goal}
Available time per day: ${hoursPerDay} hours
Skill level: ${skillLevel}

Return ONLY valid JSON in this exact format:
{
  "totalDays": 7,
  "days": [
    {
      "day": 1,
      "theme": "Theme Name",
      "tasks": ["Task 1", "Task 2", "Task 3"]
    }
  ]
}

Make tasks specific, actionable, and appropriately challenging for the skill level. Each day should have 2-4 tasks fitting within ${hoursPerDay} hours.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const content = response.choices[0].message.content;
    return JSON.parse(content);
  } catch (err) {
    console.error('OpenAI generatePlan error:', err.message);
    return MOCK_PLAN(goal, hoursPerDay, skillLevel);
  }
}

/**
 * Adaptive planner — adjusts difficulty based on consistency
 */
async function adaptPlan(userId, missedDays, streak, currentTasks) {
  if (!openai) {
    return {
      message: MOCK_ADAPTIVE(missedDays),
      adjustmentType: missedDays >= 2 ? 'decrease' : 'increase',
    };
  }

  try {
    const direction = missedDays >= 2 ? 'easier and shorter' : 'more challenging and detailed';
    const reason = missedDays >= 2
      ? `The student missed ${missedDays} days and needs encouragement with a lighter load.`
      : `The student has a ${streak}-day streak and needs more challenge to keep growing.`;

    const prompt = `You are an AI study coach. ${reason}

Current upcoming tasks:
${currentTasks.map((t, i) => `${i + 1}. ${t.title}`).join('\n')}

Rewrite these tasks to make them ${direction}. Return ONLY valid JSON:
{
  "message": "One encouraging sentence about the adjustment",
  "adjustmentType": "${missedDays >= 2 ? 'decrease' : 'increase'}",
  "updatedTasks": ["Task 1", "Task 2", "Task 3"]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
      max_tokens: 600,
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (err) {
    console.error('OpenAI adaptPlan error:', err.message);
    return {
      message: MOCK_ADAPTIVE(missedDays),
      adjustmentType: missedDays >= 2 ? 'decrease' : 'increase',
    };
  }
}

/**
 * Generate daily coach feedback message
 */
async function generateFeedback(userName, streak, progressPct, missedDays) {
  if (!openai) {
    const idx = Math.floor(Math.random() * MOCK_FEEDBACK.length);
    return MOCK_FEEDBACK[idx];
  }

  try {
    const context = streak > 0
      ? `${userName} has a ${streak}-day streak with ${progressPct}% progress overall.`
      : `${userName} missed ${missedDays} day(s) recently and needs motivation to get back on track.`;

    const prompt = `You are an encouraging AI study coach. ${context}

Generate a short (2-3 sentences max), personalized, motivational message. Be specific, warm, and energetic. Include 1 relevant emoji. Don't be generic.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.9,
      max_tokens: 150,
    });

    return response.choices[0].message.content.trim();
  } catch (err) {
    console.error('OpenAI generateFeedback error:', err.message);
    const idx = Math.floor(Math.random() * MOCK_FEEDBACK.length);
    return MOCK_FEEDBACK[idx];
  }
}

module.exports = { generatePlan, adaptPlan, generateFeedback };
