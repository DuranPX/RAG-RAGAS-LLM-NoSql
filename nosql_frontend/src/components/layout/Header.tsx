'use client';

import React from 'react';
import { Bell, FlaskConical } from 'lucide-react';
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
import SearchBar from '@/shared/components/forms/SearchBar';
import { usePathname, useRouter } from 'next/navigation';

const Header = () => {
  const pathname = usePathname();
  const pageName = pathname.split('/').pop() || 'Dashboard';
  const router = useRouter();
  const formattedPageName = pageName.charAt(0).toUpperCase() + pageName.slice(1).replace(/-/g, ' ');

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
      <SearchBar className="flex-1 max-w-md" />

      {/* Right Actions */}
      <div className="flex-1 flex items-center justify-end gap-4">
        {/* RAGAS Badge */}
        <Button
          variant="outline"
          size="sm"
          className="hidden lg:flex items-center gap-2 border-amber-500/50 text-amber-400 bg-amber-500/5 hover:bg-amber-500/10 hover:text-amber-300 rounded-full text-xs font-bold animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.2)]"
          onClick={() => router.push('/evaluation')}
        >
          <FlaskConical className="h-3 w-3" />
          {/* TODO: open RAGAS panel */}
          RAGAS Experimental
        </Button>
      </div>
    </header>
  );
};

export default Header;