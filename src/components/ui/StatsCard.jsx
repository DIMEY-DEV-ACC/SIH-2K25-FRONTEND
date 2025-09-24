import React from 'react';

const StatsCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'primary',
  className = ''
}) => {
  const colors = {
    primary: 'border-primary-200 bg-primary-50',
    success: 'border-green-200 bg-green-50',
    warning: 'border-yellow-200 bg-yellow-50',
    danger: 'border-red-200 bg-red-50',
    info: 'border-blue-200 bg-blue-50'
  };

  const iconColors = {
    primary: 'text-primary-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
    info: 'text-blue-600'
  };

  return (
    <div className={`card border-l-4 ${colors[color]} ${className}`}>
      <div className="p-6">
        <div className="flex items-center">
          {Icon && (
            <div className="flex-shrink-0">
              <Icon className={`h-8 w-8 ${iconColors[color]}`} />
            </div>
          )}
          <div className={Icon ? 'ml-4' : ''}>
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
              {title}
            </p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {value}
            </p>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;