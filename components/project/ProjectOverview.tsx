
import React, { useMemo } from 'react';
import { Project, UserRole } from '../../types';
import { useSettings } from '../../contexts/SettingsContext';
import { useProjectLogs } from '../../hooks/useProjectLogs';
import {
    Users, Sun, CloudRain, Snowflake, Wind, ClipboardList,
    Clock, User, CheckCircle2, Flag, AlertTriangle, Send, UserPlus, X, UserCog
} from 'lucide-react';

import NewWorkerModal from './NewWorkerModal';

interface ProjectOverviewProps {
    project: Project;
    onUpdate: (updates: Partial<Project>) => void;
    newLogText: string;
    setNewLogText: (text: string) => void;
    weatherTag: 'Sun' | 'Rain' | 'Snow' | 'Wind' | null;
    setWeatherTag: (tag: 'Sun' | 'Rain' | 'Snow' | 'Wind' | null) => void;
    addLog: () => void;
    isOverBudget: boolean;
    estHours: number;
    actHours: number;
    timePercent: number;
    daysElapsed: number;
    totalDays: number;
    userRole: UserRole | null;
}

const ProjectOverview: React.FC<ProjectOverviewProps> = ({
    project, onUpdate, newLogText, setNewLogText, weatherTag, setWeatherTag, addLog
}) => {
    const { settings } = useSettings();
    const { logs, loading: logsLoading } = useProjectLogs(project.id);
    const [showCrewDropdown, setShowCrewDropdown] = React.useState(false);
    const [showNewWorkerModal, setShowNewWorkerModal] = React.useState(false);

    // Logic: Identify relevant crew
    const relevantCrew = settings.employees
        .filter(member => member.role === 'Foreman' || member.role === 'Laborer' || member.role === 'Installer')
        .map(member => {
            const memberLogs = logs.filter(l => l.userName === member.name);
            const lastLog = memberLogs.length > 0 ? memberLogs[0] : null;
            const isActive = lastLog && !lastLog.clockOut;

            const memberTotalHours = memberLogs.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0) / 60;
            const isAssigned = project.assignedCrewIds.includes(member.id);

            if (!isActive && !lastLog && !isAssigned) return null;

            return {
                id: member.id,
                name: member.name,
                photoUrl: undefined,
                role: member.role,
                isActive: !!isActive,
                isAssigned: isAssigned,
                lastSeen: lastLog ? new Date(lastLog.clockIn) : null,
                totalHours: memberTotalHours
            };
        })
        .filter(Boolean)
        .sort((a, b) => (a?.isActive === b?.isActive ? 0 : a?.isActive ? -1 : 1));

    // Handle toggling assignments
    const toggleCrewAssignment = (employeeId: string) => {
        const currentAssigned = project.assignedCrewIds || [];
        const newAssigned = currentAssigned.includes(employeeId)
            ? currentAssigned.filter(id => id !== employeeId)
            : [...currentAssigned, employeeId];

        onUpdate({ assignedCrewIds: newAssigned });
    };

    // Merge Notes and Logs
    const timelineItems = useMemo(() => {
        const notes = project.notes.map(n => ({
            id: n.id,
            date: new Date(n.date),
            type: 'Note' as const,
            data: n,
            sortTime: new Date(n.date).getTime()
        }));

        const timePunches = logs.map(l => ({
            id: l.id,
            date: new Date(l.clockIn),
            type: 'TimeLog' as const,
            data: l,
            sortTime: new Date(l.clockIn).getTime()
        }));

        return [...notes, ...timePunches].sort((a, b) => b.sortTime - a.sortTime);
    }, [project.notes, logs]);

    const inputClass = "w-full p-3 pl-4 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all";

    // --- SUB-COMPONENTS ---

    const WeatherButton = ({ type, icon }: { type: typeof weatherTag, icon: React.ReactNode }) => (
        <button
            onClick={() => setWeatherTag(weatherTag === type ? null : type)}
            className={`p-2 rounded-lg transition-all ${weatherTag === type
                ? 'bg-slate-800 text-white shadow-md transform scale-105'
                : 'bg-white border border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600'
                }`}
            title={type || ''}
        >
            {icon}
        </button>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in">

            {/* --- LEFT COLUMN: SITE & CREW --- */}
            <div className="space-y-8">

                {/* 1. Daily Site Log Input */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>

                    <h4 className="font-bold text-slate-800 mb-4 flex items-center">
                        <ClipboardList size={18} className="mr-2 text-blue-600" /> Site Journal
                    </h4>

                    <div className="flex justify-between mb-4">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Conditions</span>
                        <div className="flex space-x-2">
                            <WeatherButton type="Sun" icon={<Sun size={16} />} />
                            <WeatherButton type="Rain" icon={<CloudRain size={16} />} />
                            <WeatherButton type="Snow" icon={<Snowflake size={16} />} />
                            <WeatherButton type="Wind" icon={<Wind size={16} />} />
                        </div>
                    </div>

                    <div className="relative">
                        <input
                            className={inputClass}
                            placeholder={weatherTag ? `[${weatherTag}] Describe site conditions...` : "Log progress, delays, or notes..."}
                            value={newLogText}
                            onChange={(e) => setNewLogText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addLog()}
                        />
                        <button
                            onClick={addLog}
                            className="absolute right-2 top-2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>

                {/* 2. Crew Card */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="font-bold text-slate-800 flex items-center">
                            <Users size={18} className="mr-2 text-indigo-600" /> Crew ({relevantCrew.length})
                        </h4>
                        <div className="flex items-center gap-2">
                            {relevantCrew.some(c => c?.isActive) && (
                                <span className="flex h-3 w-3 relative mr-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                </span>
                            )}
                            <div className="relative flex items-center gap-2">
                                <button
                                    onClick={() => setShowNewWorkerModal(true)}
                                    className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
                                >
                                    <UserCog size={14} className="mr-1.5" /> Add Worker
                                </button>
                                <button
                                    onClick={() => setShowCrewDropdown(!showCrewDropdown)}
                                    className="flex items-center text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
                                >
                                    <UserPlus size={14} className="mr-1.5" /> Assign
                                </button>

                                {/* Dropdown Menu for Assignments */}
                                {showCrewDropdown && (
                                    <>
                                        {/* Backdrop to close dropdown */}
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setShowCrewDropdown(false)}
                                        ></div>

                                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 z-20 overflow-hidden animate-in fade-in zoom-in-95">
                                            <div className="p-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                                <span className="text-xs font-bold text-slate-700">Assign Employees</span>
                                                <button onClick={() => setShowCrewDropdown(false)} className="text-slate-400 hover:text-slate-600"><X size={14} /></button>
                                            </div>
                                            <div className="max-h-60 overflow-y-auto custom-scrollbar p-2 space-y-1">
                                                {settings.employees.map(emp => {
                                                    const isAssigned = (project.assignedCrewIds || []).includes(emp.id);
                                                    return (
                                                        <label
                                                            key={emp.id}
                                                            className="flex items-center p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                className="mr-3 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                                                                checked={isAssigned}
                                                                onChange={() => toggleCrewAssignment(emp.id)}
                                                            />
                                                            <div>
                                                                <div className="text-sm font-medium text-slate-800">{emp.name}</div>
                                                                <div className="text-[10px] text-slate-500">{emp.role}</div>
                                                            </div>
                                                        </label>
                                                    );
                                                })}
                                                {settings.employees.length === 0 && (
                                                    <div className="p-3 text-xs text-center text-slate-500 italic">No employees found in settings.</div>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {relevantCrew.length === 0 && <p className="text-sm text-slate-400 italic text-center py-4">No crew assigned.</p>}

                        {relevantCrew.map((c, i) => (
                            <div key={i} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${c?.isActive ? 'bg-green-50 border-green-200 shadow-sm' : 'bg-white border-slate-100'}`}>
                                <div className="flex items-center">
                                    <div className="relative">
                                        <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center text-sm font-bold text-slate-500 overflow-hidden">
                                            {c?.photoUrl ? <img src={c.photoUrl} alt={c.name} className="w-full h-full object-cover" /> : c?.name.charAt(0)}
                                        </div>
                                        {c?.isActive && (
                                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                                        )}
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-bold text-slate-800">{c?.name}</p>
                                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">{c?.role}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    {c?.isActive ? (
                                        <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full">ON SITE</span>
                                    ) : (
                                        <p className="text-[10px] text-slate-400">{c?.lastSeen ? new Date(c.lastSeen).toLocaleDateString() : 'Assigned'}</p>
                                    )}
                                    {c?.totalHours > 0 && <p className="text-xs font-bold text-slate-700 mt-0.5">{c.totalHours.toFixed(1)}h</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- RIGHT COLUMN: ACTIVITY STREAM --- */}
            <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm h-full flex flex-col">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800 text-lg">Project Activity</h3>
                        <span className="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                            {timelineItems.length} Events
                        </span>
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto custom-scrollbar max-h-[600px]">
                        <div className="relative border-l-2 border-slate-100 ml-4 space-y-8">
                            {timelineItems.length === 0 && (
                                <div className="ml-8 text-slate-400 text-sm italic">
                                    No activity recorded yet. Start by logging a note or clocking in.
                                </div>
                            )}

                            {timelineItems.map((item) => {
                                if (item.type === 'TimeLog') {
                                    const log = item.data;
                                    const isClockedOut = !!log.clockOut;
                                    const duration = log.durationMinutes ? (log.durationMinutes / 60).toFixed(2) : '...';

                                    return (
                                        <div key={item.id} className="relative ml-8">
                                            <div className="absolute -left-[41px] top-0 h-6 w-6 rounded-full border-4 border-white bg-blue-100 flex items-center justify-center shadow-sm">
                                                <Clock size={12} className="text-blue-600" />
                                            </div>
                                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center">
                                                        <span className="text-sm font-bold text-slate-800 mr-2">{log.userName}</span>
                                                        <span className="text-xs text-slate-500">clocked in</span>
                                                    </div>
                                                    <span className="text-[10px] text-slate-400 font-mono">{item.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-medium text-slate-600 bg-white px-2 py-1 rounded border border-slate-200">
                                                        {isClockedOut ? `Shift: ${duration} hrs` : 'Currently Active'}
                                                    </span>
                                                    {log.photoUrl && (
                                                        <a href={log.photoUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline flex items-center">
                                                            View Photo
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                } else {
                                    const note = item.data;
                                    const isMilestone = note.type === 'Milestone';
                                    const isIssue = note.type === 'Issue';

                                    return (
                                        <div key={item.id} className="relative ml-8">
                                            <div className={`absolute -left-[41px] top-0 h-6 w-6 rounded-full border-4 border-white flex items-center justify-center shadow-sm ${isMilestone ? 'bg-purple-100 text-purple-600' :
                                                isIssue ? 'bg-red-100 text-red-600' :
                                                    'bg-slate-200 text-slate-500'
                                                }`}>
                                                {isMilestone ? <Flag size={12} /> : isIssue ? <AlertTriangle size={12} /> : <div className="h-2 w-2 rounded-full bg-slate-400"></div>}
                                            </div>
                                            <div className={`p-4 rounded-xl border transition-colors ${isIssue ? 'bg-red-50 border-red-100' :
                                                isMilestone ? 'bg-purple-50 border-purple-100' :
                                                    'bg-white border-slate-200 hover:border-slate-300'
                                                }`}>
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className={`text-xs font-bold uppercase tracking-wider ${isIssue ? 'text-red-800' : isMilestone ? 'text-purple-800' : 'text-slate-500'
                                                        }`}>
                                                        {note.author || 'System Log'}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-mono">{item.date.toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                                                    {note.content}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                }
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* NEW WORKER MODAL */}
            {showNewWorkerModal && (
                <NewWorkerModal
                    onClose={() => setShowNewWorkerModal(false)}
                    project={project}
                />
            )}
        </div>
    );
};

export default ProjectOverview;
