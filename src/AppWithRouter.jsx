import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';

function AppWithRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main restaurant menu */}
        <Route path="/" element={<App />} />
        
        {/* Admin routes */}
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/dashboard/*" element={<Dashboard />} />
        
        {/* Catch all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppWithRouter;
