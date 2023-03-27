import React, { createContext, useContext, useState } from "react";
import sendQuery from "./sendQuery.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const auth = useState(null);

  const logout = () => {
    const [, setUser] = auth;
    sendQuery(`{ logout }`).then(() => {
      console.log("Logged out.");
      setUser(null);
    });
  };

  return (
    <AuthContext.Provider value={{ auth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("AuthContext can only be used inside AuthProvider");
  }

  return value;
};
