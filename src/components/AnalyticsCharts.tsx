"use client"
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts';

export function MonthlyChart({ data }: { data: any[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Forzamos un pequeño delay para que el DOM esté listo
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return <div className="h-300px w-full bg-gray-50 animate-pulse rounded-[30px]" />;

  // Verificamos si hay algún dato mayor a 0
  const hasData = data.some(d => d.ganancia > 0);

  return (
    <div className="w-full bg-white">
      {hasData ? (
        <div className="h-300px w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fontWeight: 'bold', fill: '#9ca3af' }} 
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#d1d5db' }} />
              <Tooltip 
                cursor={{ fill: '#f9fafb', radius: 10 }}
                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="ganancia" radius={[6, 6, 6, 6]} barSize={30}>
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={index === data.length - 1 ? '#f13d4b' : '#000000'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-300px flex items-center justify-center border-2 border-dashed border-gray-100 rounded-[30px]">
          <p className="text-[10px] font-black uppercase text-gray-300 tracking-widest">Sin datos para el período</p>
        </div>
      )}

      {/* TABLA DE RESPALDO: Para verificar que la lógica de datos funciona */}
      <div className="mt-8 grid grid-cols-6 gap-2">
        {data.map((m) => (
          <div key={m.name} className="text-center">
            <p className="text-[8px] font-black text-gray-400 uppercase">{m.name}</p>
            <p className="text-[10px] font-bold text-black">${m.ganancia.toLocaleString('es-AR')}</p>
          </div>
        ))}
      </div>
    </div>
  );
}