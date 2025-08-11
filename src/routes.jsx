// routes.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Index from './pages/Index/Index';
import Profile from './pages/Profile/Profile';
import Login from './pages/Login/Login';
import History from './pages/History/History';
import Favorites from './pages/Favorites/Favorites';
import Settings from './pages/Settings/Settings';
import Feedback from './pages/Feedback/Feedback';
import { useApp } from './contexts/AppContext';

// 需要登录的路由保护组件
const ProtectedRoute = ({ children }) => {
  const { globalData } = useApp();
  
  if (!globalData.isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/history" element={
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        } />
        <Route path="/favorites" element={
          <ProtectedRoute>
            <Favorites />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={<Settings />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;