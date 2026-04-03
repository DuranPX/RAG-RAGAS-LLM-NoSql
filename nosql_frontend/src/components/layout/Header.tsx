'use client';

import React from 'react';
import { Search, Bell, FlaskConical } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname } from 'next/navigation';

const Header = () => {
  const pathname = usePathname();
  const pageName = pathname.split('/').pop() || 'Dashboard';
  const formattedPageName = pageName.charAt(0).toUpperCase() + pageName.slice(1);

  return (
    <header className="fixed top-0 right-0 left-[280px] h-16 bg-[#0d0d18]/80 backdrop-blur-md border-b border-white/10 flex items-center px-8 justify-between z-40">
      {/* Breadcrumbs */}
      <div className="flex-1">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/home" className="text-white/40 hover:text-white transition-colors">App</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-white/20" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-white font-medium">{formattedPageName}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-md relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 group-focus-within:text-purple-400 transition-colors" />
        <Input 
          placeholder="Buscar canciones, artistas..." 
          className="w-full bg-white/5 border-white/10 rounded-full pl-10 text-sm text-white placeholder:text-white/30 focus-visible:ring-purple-500"
        />
      </div>

      {/* Right Actions */}
      <div className="flex-1 flex items-center justify-end gap-4">
        {/* RAGAS Badge */}
        <Button 
          variant="outline" 
          size="sm" 
          className="hidden lg:flex items-center gap-2 border-amber-500/50 text-amber-400 bg-amber-500/5 hover:bg-amber-500/10 hover:text-amber-300 rounded-full text-xs font-bold animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.2)]"
          onClick={() => console.log('RAGAS Panel Placeholder')}
        >
          <FlaskConical className="h-3 w-3" />
          {/* TODO: open RAGAS panel */}
          RAGAS Experimental
        </Button>

        <Button variant="ghost" size="icon" className="text-white/60 hover:text-white relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-purple-500 rounded-full border-2 border-[#0d0d18]"></span>
        </Button>

        <div className="flex items-center gap-3 ml-2 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors">Juan Duran</p>
            <p className="text-[10px] text-white/40">Premium</p>
          </div>
          <Avatar className="h-9 w-9 border-2 border-purple-500/50 group-hover:border-purple-400 transition-all">
            <AvatarImage src="" />
            <AvatarFallback className="bg-purple-600 text-white font-bold text-xs">JD</AvatarFallback>
            {/* TODO: user avatar image */}
          </Avatar>
        </div>
      </div>
    </header>
  );
};

export default Header;
