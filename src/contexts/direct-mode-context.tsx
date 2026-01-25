'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type DirectModeContextType = {
  isDirectMode: boolean;
  toggleDirectMode: () => void;
  setDirectMode: (value: boolean) => void;
};

const DirectModeContext = createContext<DirectModeContextType | undefined>(undefined);

export function DirectModeProvider({ children }: { children: React.ReactNode }) {
  const [isDirectMode, setIsDirectMode] = useState(false);

  // Carregar preferência do localStorage na inicialização
  useEffect(() => {
    const saved = localStorage.getItem('directMode');
    if (saved !== null) {
      setIsDirectMode(saved === 'true');
    }
  }, []);

  // Salvar preferência no localStorage quando mudar
  const setDirectMode = (value: boolean) => {
    setIsDirectMode(value);
    localStorage.setItem('directMode', String(value));
  };

  const toggleDirectMode = () => {
    setDirectMode(!isDirectMode);
  };

  return (
    <DirectModeContext.Provider value={{ isDirectMode, toggleDirectMode, setDirectMode }}>
      {children}
    </DirectModeContext.Provider>
  );
}

export function useDirectMode() {
  const context = useContext(DirectModeContext);
  if (context === undefined) {
    throw new Error('useDirectMode must be used within a DirectModeProvider');
  }
  return context;
}

