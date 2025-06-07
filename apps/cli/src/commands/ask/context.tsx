import React, { createContext, useContext } from 'react';
import type { AgentTransportClient } from '@bashbuddy/agent/transport';

interface TransporterContextType {
  transporter: AgentTransportClient;
}

const TransporterContext = createContext<TransporterContextType | undefined>(undefined);

interface TransporterProviderProps {
  transporter: AgentTransportClient;
  children: React.ReactNode;
}

export const TransporterProvider: React.FC<TransporterProviderProps> = ({
  transporter,
  children
}) => {
  return (
    <TransporterContext.Provider value={{ transporter }}>
      {children}
    </TransporterContext.Provider>
  );
};

export const useTransporter = (): AgentTransportClient => {
  const context = useContext(TransporterContext);
  if (context === undefined) {
    throw new Error('useTransporter must be used within a TransporterProvider');
  }
  return context.transporter;
}; 