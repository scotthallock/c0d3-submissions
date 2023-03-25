import React, { createContext, useContext, useState } from "react";
import sendQuery from "./sendQuery.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const auth = useState(null);
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const auth = useContext(AuthContext);

  if (!auth) {
    throw new Error("AuthContext can only be used inside AuthProvider");
  }

  const handleLogout = () => {
    const [, setUser] = auth;
    sendQuery(`{ logout }`)
      .then(() => {
        console.log('Logged out.')
        setUser(undefined)
      });
  };

  return { auth, handleLogout };
};
