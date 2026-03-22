'use client';

import React from 'react';

interface LoadingSkeletonProps {
  rows?: number;
  variant?: 'row' | 'card' | 'hero';
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ rows = 3, variant = 'row' }) => {
  if (variant === 'hero') {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-white/5 p-8 md:p-12 animate-pulse">
        <div className="flex flex-col md:flex-row items-end gap-8">
          <div className="w-full md:w-[240px] aspect-square rounded-2xl bg-white/10" />
          <div className="flex-1 space-y-4 w-full">
            <div className="h-3 w-20 bg-white/10 rounded" />
            <div className="h-12 w-3/4 bg-white/10 rounded-lg" />
            <div className="h-4 w-1/2 bg-white/10 rounded" />
            <div className="flex gap-3 pt-4">
              <div className="h-12 w-36 bg-white/10 rounded-full" />
              <div className="h-12 w-28 bg-white/10 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="rounded-xl bg-white/5 overflow-hidden animate-pulse">
            <div className="aspect-video w-full bg-white/10" />
            <div className="p-4 space-y-3">
              <div className="h-5 w-3/4 bg-white/10 rounded" />
              <div className="h-3 w-full bg-white/5 rounded" />
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-white/10" />
                <div className="h-3 w-20 bg-white/5 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // variant === 'row' (default)
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 h-16 px-4 rounded-xl bg-white/5 animate-pulse"
        >
          <div className="h-4 w-4 bg-white/10 rounded" />
          <div className="h-10 w-10 rounded bg-white/10" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/3 bg-white/10 rounded" />
            <div className="h-2 w-1/5 bg-white/5 rounded" />
          </div>
          <div className="h-3 w-12 bg-white/5 rounded" />
          <div className="h-1.5 w-24 bg-white/5 rounded-full" />
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
