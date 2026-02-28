import React, { useState, useMemo } from 'react';
import { useProjects } from '../contexts/ProjectsContext';
import { Project, ProjectStatus } from '../types';
import { Card } from '../components/ui/Card';
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Search,
    Filter,
    ArrowLeft,
    Clock,
    CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function GanttView() {
    const { projects } = useProjects();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'All' | ProjectStatus>('All');

    // View state
    const [viewStartDate, setViewStartDate] = useState(() => {
        const d = new Date();
        d.setDate(1); // Start at beginning of current month
        return d;
    });

    const activeProjects = useMemo(() => {
        return projects.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.clientName.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'All' || p.status === statusFilter;

            // Only show projects that have valid start and end dates
            const hasValidDates = p.startDate && p.endDate && !isNaN(new Date(p.startDate).getTime()) && !isNaN(new Date(p.endDate).getTime());

            return matchesSearch && matchesStatus && hasValidDates;
        }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    }, [projects, searchQuery, statusFilter]);


    // -- Time calculations --
    // Show 60 days of timeline at a time
    const daysToShow = 60;

    const timelineDays = useMemo(() => {
        const days = [];
        const current = new Date(viewStartDate);

        for (let i = 0; i < daysToShow; i++) {
            days.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }
        return days;
    }, [viewStartDate, daysToShow]);

    const navigateTime = (direction: 'back' | 'forward') => {
        const newDate = new Date(viewStartDate);
        newDate.setDate(newDate.getDate() + (direction === 'forward' ? 14 : -14)); // Move 2 weeks at a time
        setViewStartDate(newDate);
    };

    const getStatusColor = (status: ProjectStatus) => {
        switch (status) {
            case ProjectStatus.SCHEDULED: return 'bg-blue-500';
            case ProjectStatus.IN_PROGRESS: return 'bg-amber-500';
            case ProjectStatus.COMPLETED: return 'bg-emerald-500';
            case ProjectStatus.CANCELLED: return 'bg-slate-400';
            default: return 'bg-slate-500';
        }
    };

    // Calculate position and width of a project bar
    const getProjectBarStyle = (project: Project) => {
        const pStart = new Date(project.startDate);
        const pEnd = new Date(project.endDate);
        const tStart = timelineDays[0];
        const tEnd = timelineDays[timelineDays.length - 1];

        // If project doesn't overlap with timeline at all, hide outside bounds
        if (pEnd < tStart || pStart > tEnd) {
            return { display: 'none' };
        }

        // Calculate visible start (either project start, or timeline start if project started earlier)
        const visibleStart = pStart < tStart ? tStart : pStart;

        // Calculate visible end
        const visibleEnd = pEnd > tEnd ? tEnd : pEnd;

        // Calculate pixel positions (assuming each day column is roughly 40px wide)
        // We'll use percentages to be responsive
        const totalMs = tEnd.getTime() - tStart.getTime();

        const startPercent = Math.max(0, ((pStart.getTime() - tStart.getTime()) / totalMs) * 100);

        // Calculate width percent (duration)
        const durationMs = pEnd.getTime() - pStart.getTime() + (24 * 60 * 60 * 1000); // Add one day so same-day projects show up
        const widthPercent = (durationMs / totalMs) * 100;

        return {
            left: `${startPercent}%`,
            width: `${Math.max(widthPercent, 1)}%`, // Minimum 1% width
            minWidth: '4px'
        };
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };


    return (
        <div className="h-screen bg-slate-50 flex flex-col font-sans relative overflow-hidden">

            {/* Header / Controls */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex-shrink-0 z-10 shadow-sm">
                <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">

                    <div className="flex items-center gap-4">
                        <Link to="/projects" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <CalendarIcon size={24} className="text-emerald-600" />
                                Project Timeline Overview
                            </h1>
                            <p className="text-sm text-slate-500 tracking-tight">Visual schedule for all jobs over the next 60 days.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search projects..."
                                className="w-full pl-9 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <select
                            className="bg-slate-100 border-none rounded-full px-4 py-2 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500 cursor-pointer outline-none"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                        >
                            <option value="All">All Statuses</option>
                            <option value={ProjectStatus.SCHEDULED}>Scheduled</option>
                            <option value={ProjectStatus.IN_PROGRESS}>In Progress</option>
                            <option value={ProjectStatus.COMPLETED}>Completed</option>
                        </select>
                    </div>

                </div>
            </div>

            {/* Main Gantt Area */}
            <div className="flex-1 overflow-auto bg-white custom-scrollbar w-full">
                <div className="min-w-[1200px] h-full flex flex-col">

                    {/* Time Header row */}
                    <div className="flex border-b border-slate-200 bg-slate-50 sticky top-0 z-20 shadow-sm">
                        {/* Fixed Left Column (Names) */}
                        <div className="flex-shrink-0 w-80 border-r border-slate-200 bg-slate-50 p-4 flex items-center justify-between sticky left-0 z-30">
                            <span className="font-bold text-slate-700 text-sm">Projects ({activeProjects.length})</span>
                            <div className="flex gap-1">
                                <button onClick={() => navigateTime('back')} className="p-1 hover:bg-slate-200 rounded text-slate-600 transition-colors">
                                    <ChevronLeft size={16} />
                                </button>
                                <button onClick={() => navigateTime('forward')} className="p-1 hover:bg-slate-200 rounded text-slate-600 transition-colors">
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Scrolling Timeline Header */}
                        <div className="flex-1 flex relative">
                            {timelineDays.map((day, i) => {
                                const isFirstOfMonth = day.getDate() === 1 || i === 0;

                                return (
                                    <div
                                        key={i}
                                        className={`flex-1 border-r border-slate-100 flex flex-col justify-end pb-2 items-center relative min-w-[30px] ${isToday(day) ? 'bg-emerald-50' : ''}`}
                                    >
                                        {/* Month Label (only on 1st of month or first day of view) */}
                                        {isFirstOfMonth && (
                                            <div className="absolute top-2 left-2 text-xs font-bold text-slate-800 whitespace-nowrap bg-slate-50 px-1 rounded z-10">
                                                {MONTHS[day.getMonth()]} {day.getFullYear()}
                                            </div>
                                        )}

                                        <span className={`text-xs mt-8 ${day.getDay() === 0 || day.getDay() === 6 ? 'text-slate-400 font-medium' : 'text-slate-700'} ${isToday(day) ? 'font-bold text-emerald-600' : ''}`}>
                                            {day.getDate()}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Project Rows */}
                    <div className="flex-1 overflow-y-auto">
                        {activeProjects.map(project => (
                            <div key={project.id} className="flex border-b border-slate-100 group hover:bg-slate-50 transition-colors">

                                {/* Fixed Left Column */}
                                <div className="flex-shrink-0 w-80 border-r border-slate-200 p-3 flex flex-col justify-center bg-white group-hover:bg-slate-50 sticky left-0 z-10 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <Link to={`/projects`} className="font-bold text-sm text-slate-900 hover:text-emerald-700 truncate mr-2 block">
                                            {project.name}
                                        </Link>
                                    </div>
                                    <div className="text-xs text-slate-500 truncate flex items-center justify-between mt-1">
                                        <span>{project.clientName}</span>
                                        <span className="bg-slate-100 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold">
                                            {project.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Scrolling Timeline Row */}
                                <div className="flex-1 relative flex items-center min-h-[60px]">

                                    {/* Grid Lines Overlay */}
                                    <div className="absolute inset-0 flex pointer-events-none z-0">
                                        {timelineDays.map((day, i) => (
                                            <div key={i} className={`flex-1 border-r border-slate-100 ${isToday(day) ? 'bg-emerald-50/50' : ''} ${day.getDay() === 0 || day.getDay() === 6 ? 'bg-slate-50/50' : ''}`} />
                                        ))}
                                    </div>

                                    {/* Project Bar Layer */}
                                    <div className="absolute inset-y-0 left-0 right-0 flex items-center px-1 z-10 pointer-events-none">
                                        <div
                                            className={`h-8 rounded overflow-visible shadow-sm flex items-center px-3 relative group/bar pointer-events-auto hover:ring-2 hover:ring-offset-1 hover:ring-emerald-400 transition-all cursor-pointer ${getStatusColor(project.status)}`}
                                            style={getProjectBarStyle(project)}
                                        >
                                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/bar:opacity-100 transition-opacity rounded"></div>
                                            <span className="text-xs font-bold text-white truncate drop-shadow-sm sticky left-2 z-10">
                                                {project.name}
                                            </span>

                                            {/* Tooltip */}
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-900 text-white rounded-xl p-3 shadow-xl opacity-0 invisible group-hover/bar:opacity-100 group-hover/bar:visible transition-all z-50 pointer-events-none text-left">
                                                <p className="font-bold text-sm mb-1">{project.name}</p>
                                                <p className="text-xs text-slate-300 mb-2">{project.clientName}</p>
                                                <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-1">
                                                    <CalendarIcon size={12} />
                                                    {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                                    <CheckCircle2 size={12} className={project.completionPercent === 100 ? 'text-emerald-400' : ''} />
                                                    {project.completionPercent}% Complete
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        ))}

                        {activeProjects.length === 0 && (
                            <div className="p-12 text-center text-slate-400 border-2 border-dashed border-slate-200 m-8 rounded-2xl bg-slate-50">
                                <CalendarIcon size={48} className="mx-auto text-slate-300 mb-4" />
                                <h3 className="text-lg font-bold text-slate-700">No Projects Found</h3>
                                <p className="text-sm mt-2">Adjust your search or status filters to find projects.</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Legend footer */}
            <div className="bg-white border-t border-slate-200 p-3 flex justify-center gap-6 text-xs text-slate-500 font-medium z-10 shrink-0">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div>Scheduled</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500"></div>In Progress</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div>Completed</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-400"></div>Cancelled</div>
            </div>

        </div>
    );
}

