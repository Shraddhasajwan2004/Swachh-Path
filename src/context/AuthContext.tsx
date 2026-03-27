import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../api/config';

type Role = 'user' | 'admin';

interface AuthContextType {
  isAuthenticated: boolean;
  userEmail: string | null;
  userName: string | null;
  role: Role | null;
  login: (email: string, password: string, role: Role) => Promise<void>;
  register: (email: string, password: string, name: string, role: Role) => Promise<void>;
  logout: () => void;
  error: string | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('swachhpath_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setIsAuthenticated(true);
      setUserEmail(user.email);
      setUserName(user.name);
      setRole(user.role);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, selectedRole: Role) => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: selectedRole }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login failed');

      const user = { email: data.user.email, name: data.user.name, role: data.user.role };
      setIsAuthenticated(true);
      setUserEmail(user.email);
      setUserName(user.name);
      setRole(user.role as Role);
      localStorage.setItem('swachhpath_user', JSON.stringify(user));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, selectedRole: Role) => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role: selectedRole }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Registration failed');

      // Auto login after registration
      await login(email, password, selectedRole);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserEmail(null);
    setUserName(null);
    setRole(null);
    localStorage.removeItem('swachhpath_user');
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      userEmail, 
      userName, 
      role, 
      login, 
      register, 
      logout, 
      error, 
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
