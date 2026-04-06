'use client';

import React from 'react';
import AppShell from '@/components/layout/AppShell';
import { useApi } from '@/shared/hooks/useApi';
import { userService } from '@/api/services/userService';
import { Users, Crown, Headphones, Clock, History } from 'lucide-react';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import ErrorState from '@/components/ui/ErrorState';
import { Card, CardContent } from '@/components/ui/card';

export default function UsersPage() {
  const { data: stats, isLoading, error, refetch } = useApi(
    () => userService.getStats(),
    []
  );

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Users className="h-8 w-8 text-purple-400" />
            Comunidad de Usuarios
          </h1>
          <p className="text-white/60 mt-2">Métricas y estadísticas de nuestra plataforma.</p>
        </div>

        {error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : isLoading ? (
          <LoadingSkeleton variant="card" rows={4} />
        ) : stats?.mensaje ? (
          <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center text-white/60">
            {stats.mensaje}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-purple-900/40 to-black border-white/10">
                <CardContent className="p-6 flex flex-col gap-2">
                  <span className="text-white/60 text-sm font-semibold">Total de Usuarios</span>
                  <div className="text-4xl font-bold text-white">{stats.total_usuarios || 0}</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-pink-900/40 to-black border-white/10">
                <CardContent className="p-6 flex flex-col gap-2">
                  <span className="text-white/60 text-sm font-semibold flex items-center gap-2"><Crown className="h-4 w-4" />Usuarios Premium</span>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold text-white">{stats.suscripciones?.premium || 0}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-900/40 to-black border-white/10">
                <CardContent className="p-6 flex flex-col gap-2">
                  <span className="text-white/60 text-sm font-semibold flex items-center gap-2"><Headphones className="h-4 w-4" />Usuarios Familiares</span>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold text-white">{stats.suscripciones?.family || 0}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-900/40 to-black border-white/10">
                <CardContent className="p-6 flex flex-col gap-2">
                  <span className="text-white/60 text-sm font-semibold flex items-center gap-2">Usuarios Gratuitos</span>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold text-white">{stats.suscripciones?.free || 0}%</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6 flex flex-col gap-2">
                  <span className="text-white/60 text-sm font-semibold flex items-center gap-2"><Clock className="text-purple-400 h-4 w-4"/>Tiempo de Escucha Promedio</span>
                  <div className="flex items-baseline gap-2">
                     <span className="text-3xl font-bold text-white">{stats.promedio_tiempo_escucha || 0}</span>
                     <span className="text-white/40 text-sm">minutos/usuario</span>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6 flex flex-col gap-2">
                  <span className="text-white/60 text-sm font-semibold flex items-center gap-2"><History className="text-purple-400 h-4 w-4" />Eventos de Historial Promedio</span>
                  <div className="flex items-baseline gap-2">
                     <span className="text-3xl font-bold text-white">{stats.historial_promedio || 0}</span>
                     <span className="text-white/40 text-sm">canciones recientes/usuario</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
