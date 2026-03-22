'use client';

import React from 'react';
import { Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const ChatPanel = () => {
  return (
    <div className="flex flex-col h-full bg-white/5 rounded-xl overflow-hidden border border-white/5">
      <ScrollArea className="flex-1 p-4">
        <div className="flex flex-col gap-3">
          {/* User Message */}
          <div className="flex justify-end">
            <div className="bg-purple-600 text-white px-3 py-2 rounded-2xl rounded-br-sm max-w-[85%] text-sm">
              ¿Cuál es mi canción más escuchada este mes?
            </div>
          </div>
          
          {/* Assistant Message */}
          <div className="flex justify-start">
            <div className="bg-white/10 text-white/80 px-3 py-2 rounded-2xl rounded-bl-sm max-w-[85%] text-sm">
              Basado en tus datos, "Neon Nights" de Lumina es tu canción top con 1.2M de reproducciones.
            </div>
          </div>

          {/* TODO: connect to your LLM endpoint */}
        </div>
      </ScrollArea>
      
      <div className="p-3 border-t border-white/10 flex gap-2">
        <Input 
          placeholder="Pregunta a la IA..." 
          className="bg-white/5 border-white/10 text-white h-9 text-xs focus-visible:ring-purple-500"
        />
        <Button size="icon" variant="ghost" className="h-9 w-9 text-white/60 hover:text-white hover:bg-purple-600/50">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatPanel;
