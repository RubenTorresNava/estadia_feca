import { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  className?: string;
}

export const SearchBar = ({ placeholder = 'Buscar...', onSearch, className = '' }: SearchBarProps) => {
  const [query, setQuery] = useState('');

  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      <input
        type="text"
        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary transition text-sm bg-white shadow-sm"
        placeholder={placeholder}
        value={query}
        onChange={handleChange}
        aria-label="Buscar"
      />
      <span className="absolute left-3 text-gray-400 pointer-events-none">
        <Search className="h-5 w-5" />
      </span>
    </div>
  );
};
