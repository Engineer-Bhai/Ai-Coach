import { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useParams } from 'react-router-dom';
import Navbar from './components/Navbar';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import WeeklyReportPage from './pages/WeeklyReportPage';

function AppLayout() {
  const location = useLocation();
  // Extract userId from route params for navbar links
  const pathParts = location.pathname.split('/');
  const userId = pathParts[2] || null;

  return (
    <>
      <Navbar userId={userId} />
      <Routes>
        <Route path="/" element={<OnboardingPage />} />
        <Route path="/dashboard/:userId" element={<DashboardPage />} />
        <Route path="/report/:userId" element={<WeeklyReportPage />} />
        <Route path="*" element={
          <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
            <h2 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Page not found</h2>
            <a href="/" style={{ color: '#6366f1' }}>← Back to home</a>
          </div>
        } />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
