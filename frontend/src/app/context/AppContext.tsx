import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AppUser } from '../types';
import { currentUser as defaultUser } from '../data/mockData';
import { useAuth } from './AuthContext';

interface AppContextType {
  currentUser: AppUser;
  darkMode: boolean;
  sidebarOpen: boolean;
  setDarkMode: (v: boolean) => void;
  setSidebarOpen: (v: boolean) => void;
  setCurrentUser: (u: AppUser) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user: authUser } = useAuth();
  const [currentUser, setCurrentUser] = useState<AppUser>(() =>
    authUser
      ? { id: String(authUser.id), name: authUser.name, email: authUser.email, username: authUser.username,
          role: authUser.role as 'admin' | 'professional', teamId: '', position: '', status: 'online' }
      : defaultUser
  );
  const [darkMode, setDarkModeState] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (authUser) {
      setCurrentUser(prev => ({
        ...prev,
        id: String(authUser.id),
        name: authUser.name,
        email: authUser.email,
        username: authUser.username,
        role: authUser.role as 'admin' | 'professional',
      }));
    }
  }, [authUser]);

  const setDarkMode = (v: boolean) => {
    setDarkModeState(v);
    if (v) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  return (
    <AppContext.Provider value={{
      currentUser, darkMode, sidebarOpen,
      setDarkMode, setSidebarOpen, setCurrentUser,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
