
import React from 'react';
import { useProjectLogs } from '../../hooks/useProjectLogs';
import { Clock, User, Calendar, Loader2, AlertTriangle, TrendingUp } from 'lucide-react';
import { Project } from '../../types';

interface ProjectTimeProps {
    project: Project;
}

const ProjectTime: React.FC<ProjectTimeProps> = ({ project }) => {
    const { logs, loading, totalHours } = useProjectLogs(project.id);

    // Group logs by user
    const summary = logs.reduce((acc, log) => {
        const name = log.userName || 'Unknown';
        if (!acc[name]) acc[name] = 0;
        acc[name] += (log.durationMinutes || 0) / 60;
        return acc;
    }, {} as Record<string, number>);

    const estimatedHours = project.estimatedLaborHours || 1; // Avoid divide by zero
    const percentUsed = (totalHours / estimatedHours) * 100;
    const isOver = percentUsed > 100;

    if (loading) {
        return (
            <div className="h-64 flex items-center justify-center text-slate-400">
                <Loader2 className="animate-spin mr-2" /> Loading time logs...
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in">

            {/* 1. BURN RATE VISUALIZATION */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h4 className="font-bold text-slate-800 text-lg mb-1">Labor Budget Burn</h4>
                        <p className="text-sm text-slate-500">Track real-time hours vs estimate.</p>
                    </div>
                    <div className="text-right">
                        <p className={`text-3xl font-bold ${isOver ? 'text-red-600' : 'text-slate-800'}`}>
                            {totalHours.toFixed(1)} <span className="text-lg text-slate-400 font-normal">/ {estimatedHours} hrs</span>
                        </p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden relative">
                    <div
                        className={`h-full transition-all duration-1000 ${isOver ? 'bg-red-500' : percentUsed > 80 ? 'bg-amber-500' : 'bg-blue-500'}`}
                        style={{ width: `${Math.min(100, percentUsed)}%` }}
                    ></div>
                </div>

                <div className="flex justify-between mt-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <span>Start</span>
                    <span>50%</span>
                    <span>Budget Limit</span>
                </div>

                {/* Warning if over */}
                {isOver && (
                    <div className="mt-4 bg-red-50 border border-red-100 rounded-lg p-3 flex items-center text-red-700 text-sm">
                        <AlertTriangle size={16} className="mr-2" />
                        <strong>Budget Exceeded:</strong> You are {(totalHours - estimatedHours).toFixed(1)} hours over estimate.
                    </div>
                )}
            </div>

            {/* 2. CREW LEADERBOARD */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 flex items-center">
                        <TrendingUp size={18} className="mr-2 text-indigo-600" /> Crew Efficiency
                    </h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(summary).map(([name, hours]) => (
                        <div key={name} className="flex items-center p-4 rounded-xl border border-slate-100 bg-white hover:shadow-md transition-shadow">
                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600 mr-4 shadow-inner">
                                {name.charAt(0)}
                            </div>
                            <div>
                                <p className="font-bold text-slate-800">{name}</p>
                                <p className="text-xs text-slate-500 font-medium">{(hours as number).toFixed(1)} Hours Logged</p>
                            </div>
                        </div>
                    ))}
                    {Object.keys(summary).length === 0 && (
                        <div className="col-span-full text-center py-8 text-slate-400 italic">No time logged yet.</div>
                    )}
                </div>
            </div>

            {/* 3. LOG TABLE */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">Detailed Logs</h3>
                    <button className="text-xs text-blue-600 hover:underline font-bold">Export CSV</button>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Employee</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">In / Out</th>
                            <th className="px-6 py-4 text-right">Duration</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {logs.map(log => (
                            <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <span className="font-bold text-slate-700 text-sm">{log.userName}</span>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-500">
                                    {new Date(log.clockIn).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-xs text-slate-500 font-mono">
                                    {new Date(log.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                    {log.clockOut ? new Date(log.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : <span className="text-green-600 font-bold ml-1">Active</span>}
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-slate-800 text-sm">
                                    {(log.durationMinutes ? log.durationMinutes / 60 : 0).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProjectTime;
