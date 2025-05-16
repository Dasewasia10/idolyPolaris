// SearchBar.tsx
import React, { useState, useEffect, useRef } from "react";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectSuggestion?: (item: any) => void;
  placeholderText: string;
  suggestions?: any[];
  showSuggestions?: boolean;
  setShowSuggestions?: (show: boolean) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  onSelectSuggestion,
  placeholderText,
  suggestions,
  showSuggestions,
  setShowSuggestions,
}) => {
  const [placeholder, setPlaceholder] = useState(placeholderText);
  const searchRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions && setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;

    const regex = new RegExp(`(${query})`, "gi");
    return text.split(regex).map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={i} className="bg-yellow-200">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div className="relative" ref={searchRef}>
      <input
        type="text"
        value={searchTerm}
        onChange={onSearchChange}
        placeholder={placeholder}
        onFocus={() => {
          setPlaceholder("");
          if (searchTerm.length > 0) {
            setShowSuggestions && setShowSuggestions(true);
          }
        }}
        onBlur={() => setPlaceholder(placeholderText)}
        className="peer w-full rounded border p-2 outline outline-2 hover:outline-rose-700 focus:outline-rose-700"
      />
      <label className="absolute left-2 rounded bg-white px-2 text-gray-500 opacity-0 transition-all duration-200 ease-in-out peer-placeholder-shown:-top-40 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-rose-700 peer-focus:opacity-100">
        {placeholderText}
      </label>

      {/* Suggestions dropdown */}
      {showSuggestions && (suggestions ?? []).length > 0 && (
        <ul className="absolute z-10 bottom-full mb-1 w-full rounded-md border border-gray-300 bg-white shadow-lg">
          {(suggestions ?? []).map((item, index) => (
            <li
              key={`${item.sourceName}-${index}`}
              className="cursor-pointer border-b border-gray-100 p-2 last:border-b-0 hover:bg-rose-200"
              onClick={() => {
                onSelectSuggestion && onSelectSuggestion(item);
                setShowSuggestions && setShowSuggestions(false);
              }}
            >
              <div className="font-medium text-gray-900">
                {highlightMatch(item.title, searchTerm)}
              </div>
              {item.alternateTitle && (
                <div className="text-sm text-gray-500">
                  {highlightMatch(item.alternateTitle, searchTerm)}
                </div>
              )}
              {item.jpTitle && (
                <div className="text-sm text-gray-500">{item.jpTitle}</div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
