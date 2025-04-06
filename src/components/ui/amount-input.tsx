
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Indian } from 'lucide-react';

interface AmountInputProps {
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const AmountInput: React.FC<AmountInputProps> = ({
  value,
  onChange,
  placeholder = '0',
  className = '',
}) => {
  // Format the input to always show ₹ symbol
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    onChange(rawValue);
  };

  const formattedValue = value ? `₹ ${value}` : '';

  return (
    <div className={`relative ${className}`}>
      <Input
        type="text"
        value={formattedValue}
        onChange={handleChange}
        placeholder={`₹ ${placeholder}`}
        className="text-2xl font-semibold h-14 pl-10 pr-4 rounded-xl bg-white/80 backdrop-blur-sm"
      />
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
        {!formattedValue && <span className="text-2xl">₹</span>}
      </div>
    </div>
  );
};

export default AmountInput;
