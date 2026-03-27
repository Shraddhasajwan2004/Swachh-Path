import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BinProvider } from './context/BinContext';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import UserPanel from './pages/UserPanel';
import AdminDashboard from './pages/AdminDashboard';
import AuthPage from './pages/AuthPage';
import UserProfile from './pages/UserProfile';

function PrivateRoute({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
  const { isAuthenticated, role, isLoading } = useAuth();

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-cyber-bg text-cyber-accent">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/auth" />;
  if (adminOnly && role !== 'admin') return <Navigate to="/user" />;

  return <>{children}</>;
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <BinProvider>
            <Router>
              <Layout>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/admin/auth" element={<AuthPage />} />
                  <Route 
                    path="/user" 
                    element={
                      <PrivateRoute>
                        <UserPanel />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/admin" 
                    element={
                      <PrivateRoute adminOnly>
                        <AdminDashboard />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/profile" 
                    element={
                      <PrivateRoute>
                        <UserProfile />
                      </PrivateRoute>
                    } 
                  />
                </Routes>
              </Layout>
            </Router>
          </BinProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
