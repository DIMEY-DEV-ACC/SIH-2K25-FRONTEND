import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import Button from './Button';

const SearchBar = ({
  placeholder = 'Search...',
  value = '',
  onChange,
  onClear,
  debounceMs = 300,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState(value);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onChange) {
        onChange(searchTerm);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchTerm, onChange, debounceMs]);

  // Update local state when value prop changes
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  const handleClear = () => {
    setSearchTerm('');
    if (onClear) {
      onClear();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        className="input pl-10 pr-10"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {searchTerm && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default SearchBar;