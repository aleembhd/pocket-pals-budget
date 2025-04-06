
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, History, User, ScanLine } from 'lucide-react';
import { motion } from 'framer-motion';
import QRScanner from '../scanner/QRScanner';

const NavBar: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);

  const isActive = (path: string) => currentPath === path;

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Search', path: '/search' },
    { label: 'Scan', path: '/scan', isMiddle: true },
    { icon: History, label: 'Stats', path: '/stats' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 shadow-lg dark:shadow-gray-800/50 rounded-t-xl z-10">
        <div className="flex justify-around items-center h-16 px-4 max-w-md mx-auto relative">
          {navItems.map((item, index) => {
            if (item.isMiddle) {
              return (
                <div 
                  key={index}
                  className="absolute left-1/2 -translate-x-1/2 -top-6"
                >
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsQRScannerOpen(true)}
                    className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg"
                  >
                    <ScanLine size={26} color="white" />
                  </motion.button>
                </div>
              );
            }
            
            const Icon = item.icon!;
            const active = isActive(item.path);
            
            return (
              <Link
                key={index}
                to={item.path}
                className={`flex flex-col items-center justify-center w-16 h-full transition-all ${
                  active ? 'text-primary dark:text-primary scale-110' : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                <Icon size={active ? 24 : 20} />
                <span className={`text-xs mt-1 ${active ? 'font-medium' : ''}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
      
      <QRScanner 
        isOpen={isQRScannerOpen} 
        onClose={() => setIsQRScannerOpen(false)} 
      />
    </>
  );
};

export default NavBar;
