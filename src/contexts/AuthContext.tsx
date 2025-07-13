
import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_USERNAME = 'admin';
const DEFAULT_PASSWORD = 'admin123';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const authStatus = localStorage.getItem('isAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
    
    // Initialize default credentials if not set
    if (!localStorage.getItem('username')) {
      localStorage.setItem('username', DEFAULT_USERNAME);
      localStorage.setItem('password', DEFAULT_PASSWORD);
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    const storedUsername = localStorage.getItem('username') || DEFAULT_USERNAME;
    const storedPassword = localStorage.getItem('password') || DEFAULT_PASSWORD;
    
    if (username === storedUsername && password === storedPassword) {
      setIsAuthenticated(true);
      localStorage.setItem('isAuthenticated', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
  };

  const changePassword = (currentPassword: string, newPassword: string): boolean => {
    const storedPassword = localStorage.getItem('password') || DEFAULT_PASSWORD;
    
    if (currentPassword === storedPassword) {
      localStorage.setItem('password', newPassword);
      return true;
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
