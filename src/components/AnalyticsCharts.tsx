"use client"
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export function MonthlyChart({ data }: { data: any[] }) {
  const [mounted, setMounted] = useState(false);

  // Solo renderizamos el gráfico cuando el componente se monta en el cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-300px w-full bg-gray-50 animate-pulse rounded-[30px]" />;

  const hasData = data.some(d => d.ganancia > 0 || d.ventas > 0);

  if (!hasData) {
    return (
      <div className="h-300px w-full flex items-center justify-center border-2 border-dashed border-gray-100 rounded-[40px] bg-gray-50/50">
        <p className="text-[10px] font-black uppercase text-gray-300 tracking-[0.2em]">Esperando ciclo de ventas...</p>
      </div>
    );
  }

  return (
    <div className="h-300px w-full" style={{ minHeight: '300px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 11, fontWeight: '900', fill: '#9ca3af' }} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fontWeight: 'bold', fill: '#d1d5db' }} 
          />
          <Tooltip 
            cursor={{ fill: '#f9fafb', radius: 10 }}
            contentStyle={{ 
                borderRadius: '24px', 
                border: 'none', 
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', 
                padding: '16px' 
            }}
          />
          <Bar dataKey="ganancia" radius={[10, 10, 10, 10]} barSize={35}>
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
  );
}