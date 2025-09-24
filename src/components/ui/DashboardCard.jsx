import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const DashboardCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color = 'blue',
  className = '',
  onClick
}) => {
  const colors = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      text: 'text-blue-900'
    },
    green: {
      bg: 'bg-green-50',
      icon: 'text-green-600',
      text: 'text-green-900'
    },
    yellow: {
      bg: 'bg-yellow-50',
      icon: 'text-yellow-600',
      text: 'text-yellow-900'
    },
    red: {
      bg: 'bg-red-50',
      icon: 'text-red-600',
      text: 'text-red-900'
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'text-purple-600',
      text: 'text-purple-900'
    },
    indigo: {
      bg: 'bg-indigo-50',
      icon: 'text-indigo-600',
      text: 'text-indigo-900'
    }
  };

  const colorScheme = colors[color] || colors.blue;

  return (
    <div
      className={`card p-6 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className={`flex-shrink-0 p-3 rounded-lg ${colorScheme.bg}`}>
          {Icon && <Icon className={`h-6 w-6 ${colorScheme.icon}`} />}
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-semibold ${colorScheme.text}`}>
            {value}
          </p>
          {trend && trendValue && (
            <div className="flex items-center mt-1">
              {trend === 'up' ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {trendValue}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;