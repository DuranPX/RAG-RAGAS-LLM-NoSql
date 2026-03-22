'use client';

import React from 'react';
import { Inbox, Music, ListMusic, Users } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: 'inbox' | 'music' | 'playlist' | 'users';
}

const iconMap = {
  inbox: Inbox,
  music: Music,
  playlist: ListMusic,
  users: Users,
};

const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Sin datos',
  message = 'No hay elementos para mostrar.',
  icon = 'inbox',
}) => {
  const Icon = iconMap[icon] || Inbox;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-xl border border-white/5 bg-white/[0.02]">
      <div className="relative mb-5">
        <div className="absolute inset-0 bg-purple-500/10 blur-xl rounded-full" />
        <div className="relative bg-white/5 border border-white/10 rounded-2xl p-4">
          <Icon className="h-8 w-8 text-white/20" />
        </div>
      </div>
      <h3 className="text-lg font-bold text-white/60 mb-2">{title}</h3>
      <p className="text-white/30 text-sm max-w-md leading-relaxed">{message}</p>
    </div>
  );
};

export default EmptyState;
