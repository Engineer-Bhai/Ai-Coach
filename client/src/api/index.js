import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

export const onboardUser = (data) => API.post('/onboard', data);
export const getDashboard = (userId) => API.get(`/dashboard/${userId}`);
export const completeTask = (taskId) => API.patch(`/tasks/${taskId}/complete`);
export const getWeeklyReport = (userId) => API.get(`/weekly-report/${userId}`);
export const getPendingUsers = () => API.get('/pending-users');
export const adaptPlan = (data) => API.post('/adapt-plan', data);
export const logProgress = (data) => API.post('/log-progress', data);

export default API;
