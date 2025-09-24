import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Breadcrumbs = ({ items = [], className = '' }) => {
  const location = useLocation();

  // Auto-generate breadcrumbs from current path if no items provided
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ label: 'Dashboard', href: '/dashboard' }];

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Skip if it's an ID (numeric) or edit/new
      if (!isNaN(segment) || segment === 'edit' || segment === 'new') {
        return;
      }

      const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      breadcrumbs.push({
        label,
        href: currentPath,
        isActive: index === pathSegments.length - 1
      });
    });

    return breadcrumbs;
  };

  const breadcrumbItems = items.length > 0 ? items : generateBreadcrumbs();

  return (
    <nav className={`flex ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {breadcrumbItems.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
            )}
            
            {index === 0 && (
              <Home className="h-4 w-4 text-gray-400 mr-2" />
            )}
            
            {item.href && !item.isActive ? (
              <Link
                to={item.href}
                className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-sm font-medium text-gray-900">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;