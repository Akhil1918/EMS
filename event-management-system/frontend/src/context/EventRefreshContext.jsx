import React, { createContext, useContext, useState } from 'react';

const EventRefreshContext = createContext();

export const EventRefreshProvider = ({ children }) => {
  const [refreshCount, setRefreshCount] = useState(0);

  const refreshEvents = () => {
    setRefreshCount(prev => prev + 1);
  };

  return (
    <EventRefreshContext.Provider value={{ refreshCount, refreshEvents }}>
      {children}
    </EventRefreshContext.Provider>
  );
};

export const useEventRefresh = () => {
  return useContext(EventRefreshContext);
}; 