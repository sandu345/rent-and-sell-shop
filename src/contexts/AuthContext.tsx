
// import React, { createContext, useContext, useState, useEffect } from 'react';

// interface AuthContextType {
//   isAuthenticated: boolean;
//   login: (username: string, password: string) => boolean;
//   logout: () => void;
//   changePassword: (currentPassword: string, newPassword: string) => boolean;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// const DEFAULT_USERNAME = 'admin';
// const DEFAULT_PASSWORD = 'admin123';

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);

//   useEffect(() => {
//     // Check if user is already logged in
//     const authStatus = localStorage.getItem('isAuthenticated');
//     if (authStatus === 'true') {
//       setIsAuthenticated(true);
//     }
    
//     // Initialize default credentials if not set
//     if (!localStorage.getItem('username')) {
//       localStorage.setItem('username', DEFAULT_USERNAME);
//       localStorage.setItem('password', DEFAULT_PASSWORD);
//     }
//   }, []);

//   const login = (username: string, password: string): boolean => {
//     const storedUsername = localStorage.getItem('username') || DEFAULT_USERNAME;
//     const storedPassword = localStorage.getItem('password') || DEFAULT_PASSWORD;
    
//     if (username === storedUsername && password === storedPassword) {
//       setIsAuthenticated(true);
//       localStorage.setItem('isAuthenticated', 'true');
//       return true;
//     }
//     return false;
//   };

//   const logout = () => {
//     setIsAuthenticated(false);
//     localStorage.removeItem('isAuthenticated');
//   };

//   const changePassword = (currentPassword: string, newPassword: string): boolean => {
//     const storedPassword = localStorage.getItem('password') || DEFAULT_PASSWORD;
    
//     if (currentPassword === storedPassword) {
//       localStorage.setItem('password', newPassword);
//       return true;
//     }
//     return false;
//   };

//   return (
//     <AuthContext.Provider value={{ isAuthenticated, login, logout, changePassword }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };



import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';


interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message?: string }>;
  isLoading: boolean;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('authToken');
      
      if (storedToken) {
        try {
          const response = await fetch(`${API_BASE}/api/auth/validate`, {
            headers: {
              'Authorization': `Bearer ${storedToken}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            setToken(storedToken);
            setUser(data.user);
            setIsAuthenticated(true);
          } else {
            // Token is invalid, remove it
            localStorage.removeItem('authToken');
          }
        } catch (error) {
          console.error('Auth validation error:', error);
          localStorage.removeItem('authToken');
        }
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        localStorage.setItem('authToken', data.token);
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error occurred' };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    
    // Optional: Call logout endpoint
    if (token) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }).catch(error => console.error('Logout error:', error));
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message?: string }> => {
    if (!token) {
      return { success: false, message: 'Not authenticated' };
    }

    try {
      const response = await fetch(`${API_BASE}/api/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();
      return { success: data.success, message: data.message };
    } catch (error) {
      console.error('Password change error:', error);
      return { success: false, message: 'Network error occurred' };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      token, 
      login, 
      logout, 
      changePassword, 
      isLoading 
    }}>
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