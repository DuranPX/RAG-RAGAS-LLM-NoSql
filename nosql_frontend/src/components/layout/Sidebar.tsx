'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Music2, Home, ListMusic, Users, BarChart2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const Sidebar = () => {
  const pathname = usePathname();

  const navLinks = [
    { name: 'Home', href: '/home', icon: Home },
    { name: 'ListMusic', href: '/playlists', icon: ListMusic },
    { name: 'Usuarios', href: '/users', icon: Users },
    { name: 'Métricas y Estadísticas', href: '/stats', icon: BarChart2 },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-[280px] bg-[#0d0d18] border-r border-white/10 flex flex-col z-50">
      {/* App Logo */}
      <div className="h-16 flex items-center px-6 gap-3">
        {/* TODO: replace with your logo image */}
        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
          <Music2 className="text-white h-5 w-5" />
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
          SpotiAnalytics
        </span>
      </div>

      <Separator className="bg-white/5" />

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <div className="mb-8">
          <h3 className="px-3 text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">
            NAVEGACIÓN
          </h3>
          <ul className="space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
                      isActive 
                        ? 'bg-purple-600/30 text-purple-300' 
                        : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <link.icon className={`h-5 w-5 ${isActive ? 'text-purple-400' : 'group-hover:text-purple-400'}`} />
                    <span className="text-sm font-medium">{link.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>


      </nav>
    </aside>
  );
};

export default Sidebar;
