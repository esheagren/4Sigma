import React, { useState, useEffect } from 'react';

interface NumericRangeInputProps {
  onChange: (lowerBound: number | null, upperBound: number | null) => void;
  lowerBound: number | null;
  upperBound: number | null;
  unit: string;
}

const NumericRangeInput: React.FC<NumericRangeInputProps> = ({ 
  onChange, 
  lowerBound, 
  upperBound,
  unit 
}) => {
  const [localLower, setLocalLower] = useState<string>(lowerBound?.toLocaleString() || '');
  const [localUpper, setLocalUpper] = useState<string>(upperBound?.toLocaleString() || '');

  useEffect(() => {
    setLocalLower(lowerBound?.toLocaleString() || '');
    setLocalUpper(upperBound?.toLocaleString() || '');
  }, [lowerBound, upperBound]);

  const parseNumericInput = (value: string): number | null => {
    // Remove commas and convert to number
    const numValue = parseFloat(value.replace(/,/g, ''));
    return isNaN(numValue) ? null : numValue;
  };

  const formatNumber = (value: string): string => {
    // Handle empty or invalid input
    if (!value || value === '-' || value === '.') return value;

    // Remove existing commas and handle decimal points
    const [integerPart, decimalPart] = value.replace(/,/g, '').split('.');
    
    // Format integer part with commas
    const formattedInteger = parseInt(integerPart).toLocaleString();
    
    // Return with decimal part if it exists
    return decimalPart !== undefined ? `${formattedInteger}.${decimalPart}` : formattedInteger;
  };

  const handleLowerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/,/g, '');
    // Allow numbers, decimal points, and minus sign
    if (!/^-?\d*\.?\d*$/.test(rawValue) && rawValue !== '') return;
    
    const formattedValue = rawValue === '' ? '' : formatNumber(rawValue);
    setLocalLower(formattedValue);
    
    const numValue = parseNumericInput(rawValue);
    onChange(numValue, upperBound);
  };

  const handleUpperChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/,/g, '');
    // Allow numbers, decimal points, and minus sign
    if (!/^-?\d*\.?\d*$/.test(rawValue) && rawValue !== '') return;
    
    const formattedValue = rawValue === '' ? '' : formatNumber(rawValue);
    setLocalUpper(formattedValue);
    
    const numValue = parseNumericInput(rawValue);
    onChange(lowerBound, numValue);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="relative">
          <input
            id="lowerBound"
            type="text"
            inputMode="decimal"
            value={localLower}
            onChange={handleLowerChange}
            placeholder="Enter lower bound"
            className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-neutral-500 dark:text-neutral-400">{unit}</span>
          </div>
        </div>
        
        <div className="relative">
          <input
            id="upperBound"
            type="text"
            inputMode="decimal"
            value={localUpper}
            onChange={handleUpperChange}
            placeholder="Enter upper bound"
            className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-neutral-500 dark:text-neutral-400">{unit}</span>
          </div>
        </div>
      </div>
      
      <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-md border border-neutral-200 dark:border-neutral-700">
        <p className="text-sm text-neutral-700 dark:text-neutral-300">
          You believe there's only a 5% chance the true value is outside these bounds
          {localLower && localUpper ? (
            <span className="font-medium">: {localLower} to {localUpper} {unit}</span>
          ) : (
            <span className="italic">: Not yet specified</span>
          )}
        </p>
      </div>
    </div>
  );
};

export default NumericRangeInput;