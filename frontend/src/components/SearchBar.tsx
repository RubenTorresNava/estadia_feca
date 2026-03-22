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
    <div className={`relative flex items-center gap-2 ${className}`}>
      <select
        className="border border-gray-300 rounded-lg px-2 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
        value={filter}
        onChange={handleFilterChange}
        aria-label="Filtrar por"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <input
        type="text"
        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary transition text-sm bg-white shadow-sm"
        placeholder={placeholder}
        value={query}
        onChange={handleChange}
        aria-label="Buscar"
      />
      <span className="absolute left-10 text-gray-400 pointer-events-none">
        <Search className="h-5 w-5" />
      </span>
    </div>
  );
};
