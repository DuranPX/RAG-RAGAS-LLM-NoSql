'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Grainient from '@/components/Grainient';
import { Button } from '@/components/ui/button';
import { ChevronRight, FileText, MousePointer2 } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#060010]">
      {/* OGL Background */}
      <div className="absolute inset-0 z-0">
        <Grainient
          color1="#FF9FFC"
          color2="#5227FF"
          color3="#B19EEF"
          timeSpeed={0.25}
          colorBalance={0}
          warpStrength={1}
          warpFrequency={5}
          warpSpeed={2}
          warpAmplitude={50}
          blendAngle={0}
          blendSoftness={0.05}
          rotationAmount={500}
          noiseScale={2}
          grainAmount={0.1}
          grainScale={2}
          grainAnimated={false}
          contrast={1.5}
          gamma={1}
          saturation={1}
          centerX={0}
          centerY={0}
          zoom={0.9}
        />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center max-w-4xl mx-auto">
        {/* Eyebrow Label */}
        <div className="mb-6 animate-fade-in-down">
          <span className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg">
            Análisis Musical Inteligente
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-tight drop-shadow-2xl">
          Bienvenido a tu Servicio de <br />
          <span className="bg-gradient-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent">
            Análisis Spotify
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-white/60 mb-8 max-w-lg mx-auto text-sm">
          Ingresa a la plataforma para analizar la música, tus métricas, estadísticas, y realizar pruebas de búsqueda RAG y IA sin fricciones.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Button
            size="lg"
            className="h-14 px-8 rounded-full bg-white text-black hover:bg-purple-100 transition-all duration-300 font-bold text-base shadow-xl hover:scale-105 group"
            onClick={() => router.push('/home')}
          >
            Empezar ahora
            <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>

        </div>
      </div>

    </div>
  );
}
