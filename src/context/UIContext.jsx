'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);

  const openNewOrder = useCallback(() => setIsNewOrderOpen(true), []);
  const closeNewOrder = useCallback(() => setIsNewOrderOpen(false), []);

  return (
    <UIContext.Provider value={{ isNewOrderOpen, openNewOrder, closeNewOrder }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}
