
import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Smartphone, Coins, ArrowUpRight } from 'lucide-react';

export type PaymentMode = 'Card' | 'UPI' | 'Cash' | 'Online';

interface PaymentModeSelectorProps {
  selectedMode: PaymentMode | null;
  onSelect: (mode: PaymentMode) => void;
}

const PaymentModeSelector: React.FC<PaymentModeSelectorProps> = ({
  selectedMode,
  onSelect,
}) => {
  const paymentModes: { mode: PaymentMode; icon: React.ElementType; color: string }[] = [
    { mode: 'UPI', icon: Smartphone, color: 'bg-budget-green/20 text-budget-green border-budget-green/30' },
    { mode: 'Card', icon: CreditCard, color: 'bg-budget-blue/20 text-budget-blue border-budget-blue/30' },
    { mode: 'Cash', icon: Coins, color: 'bg-budget-yellow/20 text-budget-yellow border-budget-yellow/30' },
    { mode: 'Online', icon: ArrowUpRight, color: 'bg-budget-purple/20 text-budget-purple border-budget-purple/30' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 w-full">
      {paymentModes.map(({ mode, icon: Icon, color }) => {
        const isSelected = selectedMode === mode;
        
        return (
          <motion.div
            key={mode}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(mode)}
            className={`relative rounded-xl border-2 p-4 flex flex-col items-center justify-center gap-2 h-24 cursor-pointer transition-all ${
              isSelected 
                ? `${color} border-opacity-100 shadow-md` 
                : 'bg-white/60 border-gray-200 hover:bg-white/80'
            }`}
          >
            <Icon size={24} className={isSelected ? '' : 'text-gray-500'} />
            <span className={`font-medium ${isSelected ? '' : 'text-gray-700'}`}>{mode}</span>
            
            {isSelected && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute -top-2 -right-2 bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center"
              >
                <span className="text-xs">✓</span>
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default PaymentModeSelector;
