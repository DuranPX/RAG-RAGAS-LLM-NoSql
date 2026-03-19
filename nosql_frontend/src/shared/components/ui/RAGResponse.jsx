import React from 'react';

/**
 * RAGResponse component for displaying AI-generated responses.
 * 
 * @param {object} props - Component props.
 * @param {string} props.response - The text response from the RAG pipeline.
 * @param {Array} [props.sources=[]] - Relevant sources/songs found.
 * @returns {JSX.Element}
 */
const RAGResponse = ({ response, sources = [] }) => {
  if (!response) return null;

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 bg-gray-950 border border-emerald-500/20 rounded-3xl p-6 shadow-2xl">
      <div className="flex items-start space-x-4">
        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div className="flex-1">
          <h4 className="text-emerald-400 font-bold text-sm uppercase tracking-widest mb-2">SpotiRAG Analysis</h4>
          <div className="prose prose-invert max-w-none text-gray-200">
            <p className="leading-relaxed">{response}</p>
          </div>
          
          {sources.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-800">
              <h5 className="text-xs font-bold text-gray-500 uppercase tracking-tighter mb-4">Referenced Tracks</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sources.map((source, index) => (
                  <div key={index} className="flex items-center space-x-3 bg-gray-900/50 p-2 rounded-lg border border-gray-800">
                    <div className="w-8 h-8 bg-gray-800 rounded flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{source.title || 'Source'}</p>
                      <p className="text-[10px] text-gray-500 truncate">{source.artist || 'Artist'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RAGResponse;
