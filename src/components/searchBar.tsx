// SearchBar.tsx
import React, { useState } from "react";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholderText: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  placeholderText,
}) => {
  const [placeholder, setPlaceholder] = useState(placeholderText);

  return (
    <div className="relative mb-4">
      <input
        type="text"
        value={searchTerm}
        onChange={onSearchChange}
        placeholder={placeholder}
        onFocus={() => setPlaceholder("")}
        onBlur={() => setPlaceholder(placeholderText)}
        className="peer w-full rounded border p-2 outline outline-2 hover:outline-rose-700"
      />
      <label className="absolute left-2 rounded bg-white px-2 text-gray-500 opacity-0 transition-all duration-200 ease-in-out peer-placeholder-shown:-top-40 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-rose-700 peer-focus:opacity-100">
        {placeholderText}
      </label>
    </div>
  );
};

export default SearchBar;
