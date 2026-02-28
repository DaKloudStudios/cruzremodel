import React from 'react';
import { TrendingUp, Users, DollarSign, Briefcase } from 'lucide-react';

interface MetricCardsProps {
  kpis: {
    revenueYTD: number;
    pipelineValue: number;
    winRate: number;
    activeJobs: number;
  };
}

const MetricCards: React.FC<MetricCardsProps> = ({ kpis }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* REVENUE */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            <div>
                <div className="flex items-center space-x-2 text-slate-500 mb-2 relative z-10">
                    <DollarSign size={18} className="text-emerald-600" />
                    <span className="text-xs font-bold uppercase tracking-wider">Revenue YTD</span>
                </div>
                <div className="text-2xl font-bold text-slate-900 relative z-10">
                    ${kpis.revenueYTD.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
            </div>
            <div className="mt-4 text-xs text-green-600 font-medium flex items-center">
                <TrendingUp size={12} className="mr-1" /> On track vs last month
            </div>
        </div>

        {/* PIPELINE */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
                <div className="flex items-center space-x-2 text-slate-500 mb-2">
                    <Briefcase size={18} className="text-blue-600" />
                    <span className="text-xs font-bold uppercase tracking-wider">Pipeline</span>
                </div>
                <div className="text-2xl font-bold text-slate-900">
                    ${kpis.pipelineValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
            </div>
            <div className="mt-4 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: '60%' }}></div>
            </div>
        </div>

        {/* WIN RATE */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center space-x-2 text-slate-500 mb-2">
                        <Users size={18} className="text-purple-600" />
                        <span className="text-xs font-bold uppercase tracking-wider">Win Rate</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                        {kpis.winRate}%
                    </div>
                </div>
                {/* Mini Pie Chart Representation */}
                <div className="relative w-12 h-12 rounded-full border-4 border-slate-100 flex items-center justify-center">
                    <svg className="absolute inset-0 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#7c3aed"
                            strokeWidth="4"
                            strokeDasharray={`${kpis.winRate}, 100`}
                        />
                    </svg>
                </div>
            </div>
            <div className="mt-2 text-xs text-slate-400">Based on closed estimates</div>
        </div>

        {/* ACTIVE JOBS */}
        <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Jobs</span>
                <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
            </div>
            <div className="text-3xl font-bold mt-2">{kpis.activeJobs}</div>
            <div className="mt-4 flex -space-x-2">
                {[1,2,3].map(i => (
                    <div key={i} className="w-6 h-6 rounded-full bg-slate-700 border border-slate-800"></div>
                ))}
                {kpis.activeJobs > 3 && <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-800 flex items-center justify-center text-[8px]">+</div>}
            </div>
        </div>
    </div>
  );
};

export default MetricCards;