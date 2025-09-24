import React from 'react';
import { AlertCircle, ChevronDown } from 'lucide-react';

const Select = ({
  label,
  error,
  required = false,
  options = [],
  placeholder = 'Select an option',
  className = '',
  ...props
}) => {
  const selectClasses = `input pr-10 appearance-none ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'} ${className}`;

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select className={selectClasses} {...props}>
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      </div>
      {error && (
        <div className="flex items-center text-sm text-red-600">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}
    </div>
  );
};

export default Select;