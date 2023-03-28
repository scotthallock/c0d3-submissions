import React, { createContext, useContext, useState } from "react";
import { useLazyQuery } from "@apollo/client";
import { LOGOUT_QUERY } from "../queriesAndMutations.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const auth = useState(null);
  const [queryLogout] = useLazyQuery(LOGOUT_QUERY);

  const logout = () => {
    const [, setUser] = auth;
    setUser(null);
    queryLogout({
      fetchPolicy: "network-only",
      onCompleted: () => console.log("Logged out."),
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
