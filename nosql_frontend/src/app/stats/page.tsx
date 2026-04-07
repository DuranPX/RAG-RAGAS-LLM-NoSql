'use client';

import React, { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { Send, Image as ImageIcon, Type, Sparkles, Layers } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';

export default function StatsPage() {
// ...
  const [messages, setMessages] = useState([
<<<<<<< HEAD
    { role: 'assistant', text: '¡Hola! Soy tu asistente IA de SpotiAnalytics (Groq). Puedes preguntarme sobre tus canciones, realizar búsquedas multimodales o revisar tus métricas analíticas.' }
=======
    { role: 'assistant', text: '¡Hola! Soy tu asistente IA MelodIA. Puedes preguntarme sobre tus canciones, realizar búsquedas multimodales o revisar tus métricas analíticas.' }
>>>>>>> d8b8bf90163fbb324cc4d24d65b7c89b4c058133
  ]);
  const [inputVal, setInputVal] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        let res = reader.result as string;
        // Quitar metadata 'data:image/jpeg;base64,' al enviar
        res = res.split(',')[1] || res;
        resolve(res);
      };
      reader.onerror = error => reject(error);
    });
  };

  const sendPrompt = async (type: string, text: string) => {
    if (!text && type === 'texto-texto' && !selectedFile) return;
    
    const userDisplayMsg = [];
    if (selectedFile) userDisplayMsg.push(`[Imagen adjunta: ${selectedFile.name}]`);
    if (text) userDisplayMsg.push(text);

    const newMsg = { role: 'user', text: userDisplayMsg.join(' ') };
    setMessages(prev => [...prev, newMsg]);
    setInputVal('');

    try {
      let imageBase64 = null;
      if (selectedFile) {
        imageBase64 = await toBase64(selectedFile);
      }

      const body: any = { texto: text };
      if (imageBase64) body.imageBase64 = imageBase64;

      let endpoint = 'http://localhost:8080/api/rag/texto-texto';
      if (type === 'imagen-texto') endpoint = 'http://localhost:8080/api/rag/imagen-texto';
      if (type === 'hibrido') endpoint = 'http://localhost:8080/api/rag/hibrido';

      // Fallback a hibrido o imagen-texto si se adjunta imagen mediante boton send normal
      if (selectedFile && type === 'texto-texto') {
        endpoint = text ? 'http://localhost:8080/api/rag/hibrido' : 'http://localhost:8080/api/rag/imagen-texto';
        if (!body.prompt) body.prompt = text; // Por si necesita prompt para img-texto
      }

      setMessages(prev => [...prev, { role: 'assistant', text: 'Analizando...' }]);
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      
      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs.pop(); // Remove 'Analizando...'
        newMsgs.push({ role: 'assistant', text: data.respuesta || data.mensaje || 'Respuesta vacía.' });
        return newMsgs;
      });

      setSelectedFile(null); // Clear file after send
    } catch (error: any) {
      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs.pop();
        newMsgs.push({ role: 'assistant', text: `Error de conexión: ${error.message}` });
        return newMsgs;
      });
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col h-full gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Métricas y Estadísticas IA</h1>
          <p className="text-white/60">Consulta tus estadísticas mediante el asistente o utiliza los modelos RAG de búsqueda multimodal (Groq cobraba asi que pasamos a huggingface).</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white/5 border-white/10 text-white hover:bg-white/10 cursor-pointer transition-colors" onClick={() => sendPrompt('texto-texto', 'Dame una recomendación aleatoria')}>
            <CardContent className="p-4 flex flex-col items-center justify-center gap-2">
              <Type className="h-8 w-8 text-purple-400" />
              <span className="font-semibold text-sm">Ejemplo Semántico</span>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10 text-white hover:bg-white/10 cursor-pointer transition-colors" onClick={() => document.getElementById('file-upload')?.click()}>
            <CardContent className="p-4 flex flex-col items-center justify-center gap-2">
              <ImageIcon className="h-8 w-8 text-pink-400" />
              <span className="font-semibold text-sm">Subir Imagen</span>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10 text-white hover:bg-white/10 cursor-pointer transition-colors" onClick={() => sendPrompt('texto-imagen', 'Generar imagen')}>
            <CardContent className="p-4 flex flex-col items-center justify-center gap-2">
              <Sparkles className="h-8 w-8 text-yellow-400" />
              <span className="font-semibold text-sm">Texto a Imagen (Mock)</span>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10 text-white hover:bg-white/10 cursor-pointer transition-colors" onClick={() => sendPrompt('hibrido', 'Encuentra canciones similares y descríbelas.')}>
            <CardContent className="p-4 flex flex-col items-center justify-center gap-2">
              <Layers className="h-8 w-8 text-green-400" />
              <span className="font-semibold text-sm">Búsqueda Híbrida</span>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1 min-h-[400px] flex flex-col bg-white/5 rounded-xl border border-white/10 overflow-hidden">
          <ScrollArea className="flex-1 p-6">
            <div className="flex flex-col gap-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`px-4 py-4 rounded-2xl max-w-[85%] text-sm whitespace-pre-wrap leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-purple-600 text-white rounded-br-sm' 
                      : 'bg-white/5 border border-white/10 text-white/90 rounded-bl-sm shadow-md'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <div className="p-4 border-t border-white/10 flex flex-col gap-3 bg-black/20">
            {selectedFile && (
              <div className="text-xs text-green-400 bg-white/5 p-2 rounded w-fit border border-white/10">
                Imagen adjunta: {selectedFile.name}
                <button onClick={() => setSelectedFile(null)} className="ml-2 text-red-400 hover:text-red-300">X</button>
              </div>
            )}
            <div className="flex gap-3">
              <input type="file" id="file-upload" accept="image/*" className="hidden" onChange={handleFileChange} />
              <Button type="button" variant="outline" className="h-12 bg-white/5 border-white/10 hover:bg-white/10 text-white" onClick={() => document.getElementById('file-upload')?.click()}>
                <ImageIcon className="h-5 w-5" />
              </Button>
              <Input 
                placeholder="Pregunta algo (y opcionalmente adjunta una imagen)..." 
                className="bg-white/5 border-white/10 text-white h-12 text-sm focus-visible:ring-purple-500"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendPrompt('texto-texto', inputVal)}
              />
              <Button size="icon" className="h-12 w-12 bg-purple-600 hover:bg-purple-500 text-white shrink-0" onClick={() => sendPrompt('texto-texto', inputVal)}>
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
