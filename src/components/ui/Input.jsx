import React from 'react';
import { AlertCircle } from 'lucide-react';

const Input = ({
  label,
  error,
  required = false,
  className = '',
  type = 'text',
  ...props
}) => {
  const inputClasses = `input ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'} ${className}`;

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        className={inputClasses}
        {...props}
      />
      {error && (
        <div className="flex items-center text-sm text-red-600">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}
    </div>
  );
};

export default Input;