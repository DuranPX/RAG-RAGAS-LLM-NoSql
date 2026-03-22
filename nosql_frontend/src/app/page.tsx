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
        <p className="text-lg md:text-xl text-white/70 mb-12 max-w-2xl font-light leading-relaxed">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
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
          
          <Button 
            variant="outline" 
            size="lg" 
            className="h-14 px-8 rounded-full border-white/20 bg-white/5 hover:bg-white/10 text-white transition-all duration-300 font-medium text-base backdrop-blur-sm"
          >
            <FileText className="mr-2 h-5 w-5 opacity-60" />
            Ver documentación
          </Button>
        </div>
      </div>

      {/* Bottom Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/40">
        <span className="text-[10px] uppercase tracking-widest font-bold">Scroll para descubrir</span>
        <div className="animate-bounce p-2 rounded-full border border-white/10 bg-white/5">
          <MousePointer2 className="h-4 w-4 rotate-180" />
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in-down {
          0% { opacity: 0; transform: translateY(-20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
