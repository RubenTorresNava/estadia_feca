import { useState } from 'react';
import { Search } from 'lucide-react';


interface Option {
  value: string;
  label: string;
}

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string, filter: string) => void;
  className?: string;
  options: Option[];
  defaultFilter?: string;
}


export const SearchBar = ({
  placeholder = 'Buscar...',
  onSearch,
  className = '',
  options,
  defaultFilter
}: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState(defaultFilter || options[0]?.value || '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value, filter);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFilter(value);
    onSearch(query, value);
  };

  return (
    <div
      className={`relative flex items-center bg-white rounded-lg shadow-md border border-gray-200 px-2 py-1 ${className}`}
      style={{ minHeight: 48 }}
    >
      <select
        className="h-10 min-w-[110px] border-none bg-transparent text-sm text-gray-700 rounded-l-lg focus:ring-2 focus:ring-primary focus:outline-none transition-all px-3 py-2"
        value={filter}
        onChange={handleFilterChange}
        aria-label="Filtrar por"
        style={{ boxShadow: 'none' }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <div className="relative flex-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <Search className="h-5 w-5" />
        </span>
        <input
          type="text"
          className="w-full pl-10 pr-4 py-2 h-10 bg-transparent border-none focus:ring-2 focus:ring-primary focus:outline-none text-sm text-gray-800 rounded-r-lg transition-all"
          placeholder={placeholder}
          value={query}
          onChange={handleChange}
          aria-label="Buscar"
        />
      </div>
    </div>
  );
};
