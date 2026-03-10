"use client"
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts';

export function MonthlyChart({ data }: { data: any[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-300px w-full bg-gray-50 animate-pulse rounded-[30px]" />;

  return (
    <div className="h-300px w-full" style={{ minHeight: '300px', display: 'block' }}>
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
          <Bar 
            dataKey="ganancia" 
            radius={[10, 10, 10, 10]} 
            barSize={40}
            isAnimationActive={false} // <--- ESTO ASEGURA QUE SE VEA AL CARGAR
          >
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