import React, { useEffect, useRef } from "react";
import { Search } from "lucide-react";

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
  const searchRef = useRef<HTMLDivElement>(null);

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
        <span
          key={i}
          className="text-cyan-400 font-bold underline decoration-cyan-500/50"
        >
          {part}
        </span>
      ) : (
        part
      ),
    );
  };

  return (
    <div className="relative w-full" ref={searchRef}>
      <div className="relative group">
        <input
          type="text"
          value={searchTerm}
          onChange={onSearchChange}
          placeholder={placeholderText}
          onFocus={() => {
            if (searchTerm.length > 0)
              setShowSuggestions && setShowSuggestions(true);
          }}
          className="w-full bg-[#0a0c10] border border-white/20 text-white pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder-gray-600 font-mono text-sm shadow-inner"
        />
        <Search
          size={16}
          className="absolute left-3 top-3 text-gray-500 group-focus-within:text-cyan-400 transition-colors"
        />
      </div>

      {showSuggestions && (suggestions ?? []).length > 0 && (
        <ul className="absolute z-50 top-full mt-1 w-full rounded-lg border border-white/10 bg-[#161b22] shadow-2xl max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {(suggestions ?? []).map((item, index) => (
            <li
              key={`${item.sourceName}-${index}`}
              className="cursor-pointer border-b border-white/5 p-3 last:border-b-0 hover:bg-white/5 transition-colors group"
              onClick={() => {
                onSelectSuggestion && onSelectSuggestion(item);
                setShowSuggestions && setShowSuggestions(false);
              }}
            >
              <div className="font-bold text-sm text-gray-300 group-hover:text-white">
                {highlightMatch(item.title, searchTerm)}
              </div>
              {(item.alternateTitle || item.jpTitle) && (
                <div className="text-xs text-gray-500 mt-0.5 font-mono truncate">
                  {highlightMatch(
                    item.alternateTitle || item.jpTitle,
                    searchTerm,
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
