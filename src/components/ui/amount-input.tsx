import React from 'react';
import { Input } from '@/components/ui/input';

interface AmountInputProps {
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
}

const AmountInput: React.FC<AmountInputProps> = ({
  value,
  onChange,
  placeholder = '0',
  className = '',
  inputClassName,
}) => {
  // Format the input to always show ₹ symbol
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    onChange(rawValue);
  };

  const formattedValue = value ? `₹ ${value}` : '';

  // Define default styles (excluding padding needed for symbol)
  const defaultInputBaseStyles = "text-2xl font-semibold h-14 pr-4 rounded-xl bg-white/80 backdrop-blur-sm";
  // Define styles when inputClassName is provided (excluding padding)
  // We assume inputClassName contains all necessary styles like bg, text color, etc.
  const customInputBaseStyles = inputClassName || ""; // Use empty string if undefined

  // Determine final class string, always keeping pl-10
  const finalInputClassName = `pl-10 ${inputClassName !== undefined ? customInputBaseStyles : defaultInputBaseStyles}`;

  return (
    <div className={`relative ${className}`}>
      <Input
        type="text"
        value={formattedValue}
        onChange={handleChange}
        placeholder={`₹ ${placeholder}`}
        className={finalInputClassName}
      />
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
        {!formattedValue && <span className="text-2xl">₹</span>}
      </div>
    </div>
  );
};

export default AmountInput;
