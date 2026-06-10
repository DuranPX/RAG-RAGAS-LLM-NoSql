'use client';

import React from 'react';
import AppShell from '@/components/layout/AppShell';
import { useApi } from '@/shared/hooks/useApi';
import { userService } from '@/api/services/userService';
import { Users, Crown, Clock, UserPlus } from 'lucide-react';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import ErrorState from '@/components/ui/ErrorState';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';


const PLAN_COLORS = {
  free:    '#dfe212ff',
  premium: '#00ffddff',
  family:  '#ff1100ff',
};
const PLAN_LABELS = {
  free:    'Gratuito',
  premium: 'Premium',
  family:  'Familiar',
};


const DonutTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white shadow-lg">
      {payload[0].name}: <span className="font-semibold">{payload[0].value}%</span>
    </div>
  );
};


const BarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white shadow-lg">
      <p className="text-white/50 mb-0.5">{label}</p>
      <p className="font-semibold">{payload[0].value} usuarios</p>
    </div>
  );
};


const ListenTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white shadow-lg">
      <p className="text-white/50 mb-0.5">{label}</p>
      <p className="font-semibold">{payload[0].value} min / usuario</p>
    </div>
  );
};


export default function UsersPage() {
  const { data: stats, isLoading, error, refetch } = useApi(
    () => userService.getStats(),
    []
  );


  const donutData = stats
    ? [
        { name: PLAN_LABELS.free,    value: stats.suscripciones?.free    ?? 0, key: 'free'    },
        { name: PLAN_LABELS.premium, value: stats.suscripciones?.premium ?? 0, key: 'premium' },
        { name: PLAN_LABELS.family,  value: stats.suscripciones?.family  ?? 0, key: 'family'  },
      ]
    : [];


  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
  const growthData = (stats?.crecimiento_mensual ?? []).map(
    (val: number, i: number) => ({ mes: meses[i] ?? `M${i + 1}`, usuarios: val })
  );

  
  const listenData = stats
    ? [
        { plan: PLAN_LABELS.free,    min: stats.escucha_por_plan?.free    ?? 0, key: 'free'    },
        { plan: PLAN_LABELS.premium, min: stats.escucha_por_plan?.premium ?? 0, key: 'premium' },
        { plan: PLAN_LABELS.family,  min: stats.escucha_por_plan?.family  ?? 0, key: 'family'  },
      ]
    : [];

  const paidPct = (stats?.suscripciones?.premium ?? 0) + (stats?.suscripciones?.family ?? 0);

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


            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                icon={<Users className="h-4 w-4 text-purple-400" />}
                label="Total de usuarios"
                value={(stats.total_usuarios ?? 0).toLocaleString()}
              />
              <MetricCard
                icon={<Crown className="h-4 w-4 text-pink-400" />}
                label="Usuarios premium"
                value={`${stats.suscripciones?.premium ?? 0}%`}
              />
              <MetricCard
                icon={<Clock className="h-4 w-4 text-blue-400" />}
                label="Escucha promedio"
                value={`${stats.promedio_tiempo_escucha ?? 0} min`}
              />
              <MetricCard
                icon={<UserPlus className="h-4 w-4 text-green-400" />}
                label="Nuevos hoy"
                value={(stats.nuevos_hoy ?? 0).toLocaleString()}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                <p className="text-sm font-semibold text-white/60">Distribución de planes</p>
                <div className="flex items-center gap-6">
                  <div className="relative w-40 h-40 flex-shrink-0">
                    <PieChart width={160} height={160}>
                      <Pie
                        data={donutData}
                        cx={75}
                        cy={75}
                        innerRadius={48}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {donutData.map((entry) => (
                          <Cell key={entry.key} fill={PLAN_COLORS[entry.key as keyof typeof PLAN_COLORS]} />
                        ))}
                      </Pie>
                      <Tooltip content={<DonutTooltip />} />
                    </PieChart>

                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-2xl font-bold text-white">{paidPct}%</span>
                      <span className="text-xs text-white/40">de pago</span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-3">
                    {donutData.map((d) => (
                      <div key={d.key} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-white/60">{d.name}</span>
                          <span className="text-white font-medium">{d.value}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${d.value}%`,
                              backgroundColor: PLAN_COLORS[d.key as keyof typeof PLAN_COLORS],
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                <p className="text-sm font-semibold text-white/60">Nuevos usuarios — últimos 6 meses</p>
                {growthData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={growthData} barCategoryGap="30%">
                      <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
                      <XAxis
                        dataKey="mes"
                        tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        width={32}
                      />
                      <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                      <Bar dataKey="usuarios" fill="#AFA9EC" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-white/30 text-sm text-center py-8">
                    Sin datos de crecimiento mensual.
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <span className="inline-block w-3 h-3 rounded-sm bg-[#AFA9EC]" />
                  Registros nuevos
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
              <p className="text-sm font-semibold text-white/60">Tiempo de escucha promedio por plan</p>
              {listenData.length > 0 ? (
                <ResponsiveContainer width="100%" height={listenData.length * 52 + 40}>
                  <BarChart
                    layout="vertical"
                    data={listenData}
                    barCategoryGap="35%"
                    margin={{ left: 8, right: 32 }}
                  >
                    <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                      type="number"
                      tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `${v} min`}
                    />
                    <YAxis
                      type="category"
                      dataKey="plan"
                      tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 13 }}
                      axisLine={false}
                      tickLine={false}
                      width={72}
                    />
                    <Tooltip content={<ListenTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                    <Bar dataKey="min" radius={[0, 4, 4, 0]}>
                      {listenData.map((d) => (
                        <Cell key={d.key} fill={PLAN_COLORS[d.key as keyof typeof PLAN_COLORS]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-white/30 text-sm text-center py-8">
                  Sin datos de escucha por plan.
                </p>
              )}
            </div>

          </div>
        )}
      </div>
    </AppShell>
  );
}

// ─── MetricCard ────────────────────────────────────────────────────────────────
function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2 text-white/50 text-xs font-semibold">
        {icon}
        {label}
      </div>
      <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
    </div>
  );
}