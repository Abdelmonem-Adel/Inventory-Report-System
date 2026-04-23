
import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/layout/Header';
import InventoryView from './views/InventoryView';
import LocationView from './views/LocationView';
import ProductivityView from './views/ProductivityView';
import authApi from './api/authApi';

const ImportPage = lazy(() => import('./views/ImportPage.jsx'));
const LoginPage = lazy(() => import('./views/LoginPage.jsx'));
const AdminPanelPage = lazy(() => import('./views/AdminPanelPage.jsx'));
const ManpowerCalculator = lazy(() => import('./views/ManpowerCalculator.jsx'));



// Helper: Check JWT expiration
function isTokenExpired(token) {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

function ProtectedRoute({ children, roles, user, loading }) {
  if (loading) return <div>Loading...</div>;

  const token = localStorage.getItem('token');
  
  // If no session-user and no valid JWT token, redirect to login
  if (!user && (!token || isTokenExpired(token))) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" />;
  }

  const activeUser = user || JSON.parse(localStorage.getItem('user'));
  
  if (roles && activeUser && !roles.includes(activeUser.role)) {
    return <Navigate to={activeUser.role === 'planner' ? "/manpower" : "/inventory"} />;
  }
  
  return children;
}

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await authApi.get('/auth/user');
        setUser(res.data);
        // Also sync to localStorage for legacy components
        localStorage.setItem('user', JSON.stringify(res.data));
      } catch (err) {
        console.log("No session found, checking localStorage...");
        const localUser = localStorage.getItem('user');
        if (localUser) setUser(JSON.parse(localUser));
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    window.location.href = userData.role === 'planner' ? '/manpower' : '/inventory';
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <Router>
      <div className="min-h-screen pb-12">
        <Header user={user} onLogout={handleLogout} />
        <main className="container mx-auto px-4 mt-8">
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
              <Route path="/admin" element={
                <ProtectedRoute roles={['top_admin', 'admin']} user={user} loading={loading}>
                  <AdminPanelPage />
                </ProtectedRoute>
              } />
              <Route path="/inventory" element={
                <ProtectedRoute roles={['top_admin', 'admin', 'manager', 'shiftLeader', 'keeper']} user={user} loading={loading}>
                  <InventoryView />
                </ProtectedRoute>
              } />
              <Route path="/location" element={
                <ProtectedRoute roles={['top_admin', 'admin', 'manager', 'shiftLeader', 'keeper']} user={user} loading={loading}>
                  <LocationView />
                </ProtectedRoute>
              } />
              <Route path="/productivity" element={
                <ProtectedRoute roles={['top_admin', 'admin', 'manager', 'shiftLeader']} user={user} loading={loading}>
                  <ProductivityView />
                </ProtectedRoute>
              } />
              <Route path="/manpower" element={
                <ProtectedRoute roles={['top_admin', 'admin', 'manager', 'shiftLeader', 'planner']} user={user} loading={loading}>
                  <ManpowerCalculator />
                </ProtectedRoute>
              } />
              <Route path="/import" element={
                <ProtectedRoute roles={['top_admin', 'admin']} user={user} loading={loading}>
                  <ImportPage />
                </ProtectedRoute>
              } />
              <Route path="*" element={<Navigate to="/inventory" />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </Router>
  );
};

export default App;
