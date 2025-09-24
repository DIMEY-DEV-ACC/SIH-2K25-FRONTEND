import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import Button from './Button';

const ErrorAlert = ({ 
  message, 
  onClose, 
  className = '',
  variant = 'error'
}) => {
  const variants = {
    error: {
      container: 'bg-red-50 border-red-200',
      icon: 'text-red-400',
      text: 'text-red-800',
      button: 'text-red-400 hover:text-red-600'
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200',
      icon: 'text-yellow-400',
      text: 'text-yellow-800',
      button: 'text-yellow-400 hover:text-yellow-600'
    },
    info: {
      container: 'bg-blue-50 border-blue-200',
      icon: 'text-blue-400',
      text: 'text-blue-800',
      button: 'text-blue-400 hover:text-blue-600'
    }
  };

  const style = variants[variant];

  if (!message) return null;

  return (
    <div className={`rounded-md border p-4 ${style.container} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className={`h-5 w-5 ${style.icon}`} />
        </div>
        <div className="ml-3 flex-1">
          <p className={`text-sm ${style.text}`}>
            {message}
          </p>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className={`p-1.5 ${style.button}`}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorAlert;