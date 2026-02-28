import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface RevenueChartProps {
  data: any[];
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[320px] flex flex-col">
        <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800">Revenue Trend</h3>
            <div className="flex items-center space-x-4 text-xs">
                <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-slate-900 mr-2"></span> Actual</div>
                <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-400 mr-2"></span> Pipeline</div>
            </div>
        </div>
        
        <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} barSize={20} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 11 }} 
                        dy={10}
                    />
                    <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        tickFormatter={(value) => `$${value/1000}k`}
                    />
                    <Tooltip 
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="revenue" stackId="a" fill="#0f172a" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="projected" stackId="a" fill="#34d399" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
  );
};

export default RevenueChart;