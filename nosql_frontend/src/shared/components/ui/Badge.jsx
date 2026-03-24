import React from 'react';

/**
 * A simple Badge component for genres or tags.
 * 
 * @param {object} props - Component props.
 * @param {string} props.children - The content of the badge.
 * @param {string} [props.variant='default'] - The style variant.
 * @returns {JSX.Element}
 */
const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'bg-gray-800 text-gray-300 border-gray-700',
    primary: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    secondary: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    accent: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]}`}>
      {children}
    </span>
  );
};

export default Badge;