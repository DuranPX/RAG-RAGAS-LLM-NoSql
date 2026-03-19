'use client';

import React, { useState } from 'react';

/**
 * SearchBar component with RAG capabilities.
 * 
 * @param {object} props - Component props.
 * @param {function} props.onSearch - Callback function when search is submitted.
 * @param {boolean} [props.isRAG=false] - Whether to enable RAG mode in the backend.
 * @returns {JSX.Element}
 */
const SearchBar = ({ onSearch, isRAG = false }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-gray-500 group-focus-within:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={isRAG ? "Ask anything about music (e.g., songs for a rainy Sunday)..." : "Search for songs, artists, or genres..."}
          className="w-full pl-12 pr-4 py-4 bg-gray-900 border border-gray-800 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-xl shadow-black/40"
        />
        <button 
          type="submit"
          className="absolute right-3 top-2 bottom-2 px-6 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-colors text-sm"
        >
          {isRAG ? 'Ask AI' : 'Search'}
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
