import React from 'react';
import { ChevronUp, ChevronDown, ArrowUpDown } from 'lucide-react';
import Button from './Button';

const Table = ({
  columns = [],
  data = [],
  sortField,
  sortDirection,
  onSort,
  onRowClick,
  className = '',
  emptyMessage = 'No data available'
}) => {
  const handleSort = (field) => {
    if (onSort) {
      onSort(field);
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    
    return sortDirection === 'asc' 
      ? <ChevronUp className="h-4 w-4 text-primary-600" />
      : <ChevronDown className="h-4 w-4 text-primary-600" />;
  };

  return (
    <div className={`overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg ${className}`}>
      <table className="table min-w-full divide-y divide-gray-300">
        <thead className="table-header bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                  column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                }`}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center space-x-1">
                  <span>{column.label}</span>
                  {column.sortable && getSortIcon(column.key)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td 
                colSpan={columns.length} 
                className="table-cell px-6 py-12 text-center text-gray-500"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={row.id || index}
                className={`table-row ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((column) => (
                  <td key={column.key} className="table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

// Table action buttons component
export const TableActions = ({ children, className = '' }) => (
  <div className={`flex items-center space-x-2 ${className}`}>
    {children}
  </div>
);

// Status badge component for table cells
export const StatusBadge = ({ status, variant = 'default' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800'
  };

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${variants[variant]}`}>
      {status}
    </span>
  );
};

export default Table;