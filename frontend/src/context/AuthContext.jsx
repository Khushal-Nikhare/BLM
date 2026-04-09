import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');
    const storedId = localStorage.getItem('userId');

    if (storedToken) {
      setToken(storedToken);
      setUser({ id: storedId, role: storedRole });
    }
    
    setIsLoading(false);
  }, []);

  const login = (jwtToken, role, id) => {
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('role', role);
    localStorage.setItem('userId', id);
    setToken(jwtToken);
    setUser({ id, role });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
