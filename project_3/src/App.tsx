import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import HistoricalNews from './pages/HistoricalNews';
import LiveSentiment from './pages/LiveSentiment';
import Profile from './pages/Profile';
import { AnimatePresence } from 'framer-motion';

function App() {
  const { currentUser, loading } = useAuth();
  
  useEffect(() => {
    document.title = 'CRYPTO PULSE';
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen grid-background-animated flex items-center justify-center">
        <div className="breathing">
          <h1 className="font-heading text-3xl text-pastel-yellow neon-text">
            CRYPTO PULSE
          </h1>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<Navigate to="/dashboard/historical" />} />
          <Route path="historical" element={<HistoricalNews />} />
          <Route path="live" element={<LiveSentiment />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;