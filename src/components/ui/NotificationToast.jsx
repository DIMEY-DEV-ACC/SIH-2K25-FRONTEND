import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import Button from './Button';

const NotificationToast = () => {
  const { state, actions } = useAppContext();
  const { notifications } = state;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          notification={notification}
          onClose={() => actions.removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

const Toast = ({ notification, onClose }) => {
  const { type, message, duration = 3000 } = notification;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const types = {
    success: {
      icon: CheckCircle,
      classes: 'bg-green-50 border-green-200 text-green-800',
      iconClasses: 'text-green-400'
    },
    error: {
      icon: AlertCircle,
      classes: 'bg-red-50 border-red-200 text-red-800',
      iconClasses: 'text-red-400'
    },
    warning: {
      icon: AlertTriangle,
      classes: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      iconClasses: 'text-yellow-400'
    },
    info: {
      icon: Info,
      classes: 'bg-blue-50 border-blue-200 text-blue-800',
      iconClasses: 'text-blue-400'
    }
  };

  const config = types[type] || types.info;
  const Icon = config.icon;

  return (
    <div className={`max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden transform transition-all duration-300 ease-in-out ${config.classes}`}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 ${config.iconClasses}`} />
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium">
              {message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationToast;