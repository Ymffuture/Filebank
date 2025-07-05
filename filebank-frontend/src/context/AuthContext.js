import React, { createContext, useState, useContext } from 'react';

// Create the Auth context
const AuthContext = createContext();

// Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to consume AuthContext
export function useAuth() {
  return useContext(AuthContext);
}
