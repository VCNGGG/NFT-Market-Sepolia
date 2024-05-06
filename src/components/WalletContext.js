// WalletContext.js
import React, { createContext, useState } from 'react';

export const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [connected, setConnected] = useState(false);

  const toggleConnection = (status) => {
    setConnected(status);
  };

  return (
    <WalletContext.Provider value={{ connected, toggleConnection }}>
      {children}
    </WalletContext.Provider>
  );
};
