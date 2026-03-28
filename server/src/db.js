const { v4: uuidv4 } = require('uuid');

// ─── In-Memory Store ───────────────────────────────────────────────
const db = {
  users: [],
  plans: [],
  tasks: [],
  progressLogs: [],
};

// ─── Seed Demo Data ────────────────────────────────────────────────
function seedData() {
  const userId = 'demo-user-001';
  const planId = 'demo-plan-001';
  const today = new Date();

  // Demo user
  db.users.push({
    id: userId,
    email: 'demo@aicoach.com',
    name: 'Alex Student',
    goal: 'Master React and become a full-stack developer',
    hoursPerDay: 2,
    skillLevel: 'intermediate',
    streak: 3,
    lastActive: new Date(today.getTime() - 86400000).toISOString(),
    joinedAt: new Date(today.getTime() - 7 * 86400000).toISOString(),
    consistencyScore: 72,
  });

  // Demo plan
  db.plans.push({
    id: planId,
    userId,
    goal: 'Master React and become a full-stack developer',
    totalDays: 7,
    currentDay: 4,
    createdAt: new Date(today.getTime() - 6 * 86400000).toISOString(),
    status: 'active',
  });

  // Demo tasks — 7 days
  const taskDefs = [
    // Day 1 (completed)
    { title: 'React fundamentals: JSX and components', day: 1, completed: true },
    { title: 'Build a simple counter app', day: 1, completed: true },
    // Day 2 (completed)
    { title: 'State and props deep dive', day: 2, completed: true },
    { title: 'Refactor counter with useState', day: 2, completed: true },
    // Day 3 (completed)
    { title: 'useEffect and lifecycle', day: 3, completed: true },
    { title: 'Fetch data from a public API', day: 3, completed: false },
    // Day 4 — TODAY
    { title: 'React Router: navigation & params', day: 4, completed: false },
    { title: 'Build a multi-page app skeleton', day: 4, completed: false },
    { title: 'Design your portfolio layout', day: 4, completed: false },
    // Day 5 (upcoming)
    { title: 'Context API and global state', day: 5, completed: false },
    { title: 'Theme switcher with Context', day: 5, completed: false },
    // Day 6 (upcoming)
    { title: 'Introduction to Node.js + Express', day: 6, completed: false },
    { title: 'Build a REST API with 3 endpoints', day: 6, completed: false },
    // Day 7 (upcoming)
    { title: 'Connect React frontend to Express backend', day: 7, completed: false },
    { title: 'Deploy app to Vercel + Render', day: 7, completed: false },
  ];

  taskDefs.forEach((t) => {
    db.tasks.push({
      id: uuidv4(),
      planId,
      userId,
      title: t.title,
      day: t.day,
      completed: t.completed,
      completedAt: t.completed ? new Date(today.getTime() - (7 - t.day) * 86400000).toISOString() : null,
    });
  });

  // Progress logs
  for (let i = 1; i <= 3; i++) {
    db.progressLogs.push({
      id: uuidv4(),
      userId,
      day: i,
      date: new Date(today.getTime() - (4 - i) * 86400000).toISOString(),
      completed: i === 3 ? 1 : 2,
      total: 2,
    });
  }

  console.log('✅ Demo data seeded successfully');
}

seedData();

// ─── Helper Queries ────────────────────────────────────────────────
const dbHelpers = {
  getUserById: (id) => db.users.find((u) => u.id === id),
  getPlanByUserId: (userId) => db.plans.find((p) => p.userId === userId && p.status === 'active'),
  getTasksByPlanId: (planId) => db.tasks.filter((t) => t.planId === planId),
  getTasksByDay: (planId, day) => db.tasks.filter((t) => t.planId === planId && t.day === day),
  getTaskById: (id) => db.tasks.find((t) => t.id === id),

  createUser: (data) => {
    const user = { id: uuidv4(), ...data, streak: 0, consistencyScore: 0, lastActive: null, joinedAt: new Date().toISOString() };
    db.users.push(user);
    return user;
  },
  createPlan: (data) => {
    const plan = { id: uuidv4(), ...data, status: 'active', createdAt: new Date().toISOString() };
    db.plans.push(plan);
    return plan;
  },
  createTask: (data) => {
    const task = { id: uuidv4(), ...data, completed: false, completedAt: null };
    db.tasks.push(task);
    return task;
  },
  completeTask: (taskId) => {
    const task = db.tasks.find((t) => t.id === taskId);
    if (task) {
      task.completed = true;
      task.completedAt = new Date().toISOString();
    }
    return task;
  },
  updateUser: (userId, updates) => {
    const user = db.users.find((u) => u.id === userId);
    if (user) Object.assign(user, updates);
    return user;
  },
  logProgress: (data) => {
    const log = { id: uuidv4(), ...data, date: new Date().toISOString() };
    db.progressLogs.push(log);
    return log;
  },
  getProgressLogs: (userId) => db.progressLogs.filter((l) => l.userId === userId),
  getAllUsers: () => db.users,
};

module.exports = { db, ...dbHelpers };
