import { createContext, useContext, ReactNode } from 'react';

interface DashboardContextType {
  refreshDashboard: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const useDashboardContext = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboardContext must be used within a DashboardProvider');
  }
  return context;
};

interface DashboardProviderProps {
  children: ReactNode;
  refreshDashboard: () => Promise<void>;
}

export const DashboardProvider = ({ children, refreshDashboard }: DashboardProviderProps) => {
  return (
    <DashboardContext.Provider value={{ refreshDashboard }}>
      {children}
    </DashboardContext.Provider>
  );
}; 