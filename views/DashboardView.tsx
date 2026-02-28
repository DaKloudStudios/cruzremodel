import React from 'react';
import {
  DollarSign, Users, Briefcase, TrendingUp,
  Plus, Calendar, ArrowRight, Activity, Clock,
  MoreHorizontal
} from 'lucide-react';
import { useCRM } from '../contexts/CRMContext';
import { useProjects } from '../contexts/ProjectsContext';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { LineChart, Line, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis } from 'recharts';
import { WeatherWidget } from '../components/WeatherWidget';

interface DashboardViewProps {
  onQuickAction: (type: 'Lead' | 'Project') => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ onQuickAction }) => {
  const { leads } = useCRM();
  const { projects } = useProjects();
  const { metrics } = useSettings();
  const { userRole, currentUser } = useAuth();



  const activeProjectsCount = projects.filter(p => p.status === 'In Progress').length;
  const newLeadsCount = leads.filter(l => l.status === 'New').length;

  // Mock Data for Soft Chart
  const data = [
    { name: 'Mon', value: 4000 },
    { name: 'Tue', value: 3000 },
    { name: 'Wed', value: 5000 },
    { name: 'Thu', value: 2780 },
    { name: 'Fri', value: 1890 },
    { name: 'Sat', value: 2390 },
    { name: 'Sun', value: 3490 },
  ];

  return (
    <div className="space-y-8 animate-in pb-10 w-full">

      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 pt-6">
        <div>
          <h2 className="text-4xl font-display font-bold text-charcoal tracking-tight">
            Dashboard
          </h2>
          <p className="text-slate-500 mt-2 text-lg">
            Welcome back, <span className="text-charcoal font-semibold">{currentUser?.displayName?.split(' ')[0]}</span>. You have <span className="text-emerald-600 font-bold">{newLeadsCount} new leads</span> today.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="px-5 py-2.5 bg-white rounded-full shadow-sm border border-cream-200 text-charcoal text-sm font-bold flex items-center gap-2.5">
            <Calendar size={18} className="text-emerald-500" />
            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>

          <button
            onClick={() => onQuickAction('Project')}
            className="px-6 py-2.5 bg-charcoal text-white rounded-full shadow-lg shadow-charcoal/20 hover:bg-forest-800 transition-all flex items-center gap-2 font-bold"
          >
            <Plus size={18} />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Hero Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Stat Card 2 - Projects */}
        <div className="bg-white p-8 rounded-[2rem] shadow-soft relative overflow-hidden group border border-cream-100">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-cream-100 rounded-2xl text-blue-600">
              <Briefcase size={24} />
            </div>
            <button className="text-slate-300 hover:text-charcoal transition-colors"><MoreHorizontal size={20} /></button>
          </div>
          <div>
            <p className="text-slate-400 font-bold text-sm uppercase tracking-wider">Active Projects</p>
            <h3 className="text-4xl font-display font-bold text-charcoal mt-2">{activeProjectsCount}</h3>
          </div>
          <div className="mt-4 flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white"></div>
            ))}
          </div>
        </div>

        {/* Stat Card 3 - Leads */}
        <div className="bg-white p-8 rounded-[2rem] shadow-soft relative overflow-hidden group border border-cream-100">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-cream-100 rounded-2xl text-emerald-600">
              <Users size={24} />
            </div>
          </div>
          <div>
            <p className="text-slate-400 font-bold text-sm uppercase tracking-wider">New Leads</p>
            <h3 className="text-4xl font-display font-bold text-charcoal mt-2">{newLeadsCount}</h3>
          </div>
        </div>
      </div>

      {/* Weather Intelligence Widget */}
      <div className="mt-8 mb-8">
        <WeatherWidget />
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column (2/3) - Chart & Projects */}
        <div className="lg:col-span-2 space-y-8">

          {/* Activity Chart Section */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-soft border border-cream-100">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-display font-bold text-charcoal">Revenue Trends</h3>
                <p className="text-sm text-slate-400">Monthly overview</p>
              </div>
              <select className="bg-cream-50 border-none text-sm font-bold text-charcoal rounded-xl px-4 py-2 cursor-pointer hover:bg-cream-100 transition-colors">
                <option>This Week</option>
                <option>This Month</option>
              </select>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FFD572" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#FFD572" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F1F1F', borderRadius: '16px', border: 'none', color: '#fff' }}
                    itemStyle={{ color: '#FFD572' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#FFD572" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Projects Table */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-soft border border-cream-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-display font-bold text-charcoal">Recent Projects</h3>
              <button className="text-sm font-bold text-emerald-600 hover:text-emerald-700">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="py-4 pl-2 font-bold">Project Name</th>
                    <th className="py-4 font-bold">Client</th>
                    <th className="py-4 font-bold">Status</th>
                    <th className="py-4 pr-2 text-right font-bold">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-100">
                  {projects.slice(0, 5).map(p => (
                    <tr key={p.id} className="group hover:bg-cream-50 transition-colors">
                      <td className="py-4 pl-2 font-bold text-charcoal">{p.name}</td>
                      <td className="py-4 text-slate-500">{p.clientName}</td>
                      <td className="py-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${p.status === 'In Progress' ? 'bg-blue-50 text-blue-600' :
                          p.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                            'bg-slate-100 text-slate-500'
                          }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-4 pr-2 text-right">
                        <div className="w-24 ml-auto h-2 bg-cream-200 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${p.completionPercent}%` }}></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {projects.length === 0 && (
                    <tr><td colSpan={4} className="py-8 text-center text-slate-400">No active projects found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (1/3) - Quick Actions & Leads */}
        <div className="space-y-8">

          {/* Create Estimate / Quick Action - Renamed to "Quick Access" */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-soft border border-cream-100">
            <h3 className="text-lg font-display font-bold text-charcoal mb-4">Quick Access</h3>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => onQuickAction('Project')} className="p-4 rounded-2xl bg-cream-50 hover:bg-emerald-50 hover:text-emerald-600 transition-colors text-center group">
                <div className="w-10 h-10 mx-auto bg-white rounded-full flex items-center justify-center shadow-sm mb-2 group-hover:scale-110 transition-transform">
                  <Briefcase size={20} className="text-charcoal" />
                </div>
                <span className="text-xs font-bold text-charcoal">New Project</span>
              </button>
              <button onClick={() => onQuickAction('Lead')} className="p-4 rounded-2xl bg-cream-50 hover:bg-blue-50 hover:text-blue-600 transition-colors text-center group">
                <div className="w-10 h-10 mx-auto bg-white rounded-full flex items-center justify-center shadow-sm mb-2 group-hover:scale-110 transition-transform">
                  <Users size={20} className="text-charcoal" />
                </div>
                <span className="text-xs font-bold text-charcoal">Add Lead</span>
              </button>
            </div>
          </div>

          {/* Pending Leads */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-soft border border-cream-100">
            <h3 className="font-display font-bold text-charcoal mb-6 flex items-center gap-2">
              New Leads
              {newLeadsCount > 0 && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}
            </h3>
            <div className="space-y-4">
              {leads.filter(l => l.status === 'New').slice(0, 4).map(lead => (
                <div key={lead.id} className="p-4 rounded-2xl bg-cream-50 border border-transparent hover:border-emerald-200 transition-all cursor-pointer group">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-charcoal group-hover:text-emerald-600 transition-colors">{lead.name}</h4>
                    <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-1 rounded-lg">{new Date(lead.dateCreated).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 truncate bg-white/50 p-1.5 rounded-lg inline-block">{lead.serviceInterest}</p>
                </div>
              ))}
              {leads.filter(l => l.status === 'New').length === 0 && (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-cream-100 text-cream-400 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users size={20} />
                  </div>
                  <p className="text-sm text-slate-400">No new leads pending.</p>
                </div>
              )}
            </div>
            <button className="w-full mt-6 py-3 border border-cream-200 rounded-xl text-sm font-bold text-slate-500 hover:text-charcoal hover:border-charcoal/20 transition-all">
              View All Leads
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DashboardView;
