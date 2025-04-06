
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import NavBar from './NavBar';
import { motion } from 'framer-motion';
import { useTheme } from '@/hooks/use-theme';
import { Moon, Sun } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
  hideNav?: boolean;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, hideNav = false }) => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className="min-h-screen bg-gradient-blue dark:bg-gray-900 flex flex-col">
      <header className="sticky top-0 z-20 px-4 py-2 backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border-b border-gray-200 dark:border-gray-800">
        <div className="container max-w-md mx-auto flex justify-end">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun size={20} className="text-gray-300" />
            ) : (
              <Moon size={20} className="text-gray-600" />
            )}
          </button>
        </div>
      </header>
      <main className="flex-1 container max-w-md mx-auto px-4 pb-20 pt-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          {children}
        </motion.div>
      </main>
      {!hideNav && <NavBar />}
    </div>
  );
};

export default AppLayout;
