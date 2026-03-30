
import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/layout/Header';
import InventoryView from './views/InventoryView';
import LocationView from './views/LocationView';
import ProductivityView from './views/ProductivityView';
const ImportPage = lazy(() => import('./views/ImportPage.jsx'));
const LoginPage = lazy(() => import('./views/LoginPage.jsx'));

const AdminPanelPage = lazy(() => import('./views/AdminPanelPage.jsx'));



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

function ProtectedRoute({ children, roles }) {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  if (!user || !token || isTokenExpired(token)) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" />;
  }
  if (roles && !roles.includes(user.role)) return <Navigate to="/inventory" />;
  return children;
}

const App = () => {
  return (
    <Router>
      <div className="min-h-screen pb-12">
        <Header />
        <main className="container mx-auto px-4 mt-8">
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/login" element={<LoginPage onLogin={() => window.location = '/inventory'} />} />
              {/* <Route path="/dashboard" element={
                <ProtectedRoute><DashboardPage /></ProtectedRoute>
              } /> */}
              <Route path="/admin" element={
                <ProtectedRoute roles={['top_admin', 'admin']}><AdminPanelPage /></ProtectedRoute>
              } />
              <Route path="/inventory" element={<ProtectedRoute><InventoryView /></ProtectedRoute>} />
              <Route path="/location" element={<ProtectedRoute><LocationView /></ProtectedRoute>} />
              <Route path="/productivity" element={<ProtectedRoute roles={['top_admin', 'admin', 'manager']}><ProductivityView /></ProtectedRoute>} />
              <Route path="/import" element={<ProtectedRoute roles={['top_admin', 'admin']}><ImportPage /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/inventory" />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </Router>
  );
};

export default App;
