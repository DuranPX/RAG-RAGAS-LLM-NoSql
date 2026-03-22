'use client';

import React from 'react';
import { AlertTriangle, WifiOff, ServerCrash } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  variant?: 'inline' | 'fullpage';
}

const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry, variant = 'inline' }) => {
  // Detectar tipo de error para ícono contextual
  const isNetworkError = message.toLowerCase().includes('connection') 
    || message.toLowerCase().includes('network')
    || message.toLowerCase().includes('response');
  
  const Icon = isNetworkError ? WifiOff : message.includes('500') ? ServerCrash : AlertTriangle;

  const content = (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="relative mb-5">
        <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full" />
        <div className="relative bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
          <Icon className="h-8 w-8 text-red-400" />
        </div>
      </div>
      <h3 className="text-lg font-bold text-white mb-2">Algo salió mal</h3>
      <p className="text-white/40 text-sm max-w-md mb-6 leading-relaxed">{message}</p>
      {onRetry && (
        <Button 
          onClick={onRetry} 
          className="rounded-full bg-purple-600 hover:bg-purple-700 text-white px-6 font-bold shadow-lg shadow-purple-600/20 transition-all hover:scale-105"
        >
          Reintentar
        </Button>
      )}
    </div>
  );

  if (variant === 'fullpage') {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-16 px-4 rounded-xl border border-red-500/10 bg-red-500/5">
      {content}
    </div>
  );
};

export default ErrorState;
