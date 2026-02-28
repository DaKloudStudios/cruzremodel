
import React, { useState, useMemo } from 'react';
import { Project, ProjectStatus } from '../types';
import { useProjects } from '../contexts/ProjectsContext';
import { useSettings } from '../contexts/SettingsContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useAuth } from '../contexts/AuthContext';
import { useProjectLogs } from '../hooks/useProjectLogs';
import {
    ArrowLeft, DollarSign, MapPin, FileText, ExternalLink,
    LayoutDashboard, CheckSquare, HardHat, Package, PieChart,
    Calendar, Clock, AlertTriangle, CheckCircle2
} from 'lucide-react';

import ProjectOverview from './project/ProjectOverview';
import ProjectTasks from './project/ProjectTasks';
import ProjectFinancials from './project/ProjectFinancials';
import ProjectTime from './project/ProjectTime';
import { Truck } from 'lucide-react';

interface ProjectDetailProps {
    project: Project;
    onClose: () => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onClose }) => {
    const { updateProject, updateProjectStatus } = useProjects();

    const { metrics, settings } = useSettings();
    const { navigateTo, setSearchQuery, viewProposal } = useNavigation();
    const { userRole } = useAuth();
    const { totalHours } = useProjectLogs(project.id); // Real-time labor data

    const [activeTab, setActiveTab] = useState<'Overview' | 'Tasks' | 'Labor' | 'Financials'>('Overview');

    // Local state for overview log logic
    const [newLogText, setNewLogText] = useState('');
    const [weatherTag, setWeatherTag] = useState<'Sun' | 'Rain' | 'Snow' | 'Wind' | null>(null);


    const canSeeFinancials = userRole === 'Admin' || userRole === 'Office';

    // --- VITAL SIGNS CALCULATIONS ---
    const budgetHours = project.estimatedLaborHours || 1;
    const usedHours = totalHours;
    const laborPercent = Math.min(100, Math.round((usedHours / budgetHours) * 100));
    const isLaborRisk = laborPercent > 90;

    const startDate = new Date(project.startDate);
    const endDate = new Date(project.endDate);
    const today = new Date();
    const totalDays = Math.max(1, (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysElapsed = Math.max(0, (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const timePercent = Math.min(100, Math.round((daysElapsed / totalDays) * 100));
    const isScheduleRisk = timePercent > (project.completionPercent + 10); // If time is moving 10% faster than work

    // --- ACTIONS ---
    const handleUpdateStatus = (status: ProjectStatus) => updateProjectStatus(project.id, status);

    const addLog = () => {
        if (!newLogText.trim()) return;
        let content = newLogText;
        if (weatherTag) content = `[${weatherTag}] ${content}`;
        const newNote = {
            id: Math.random().toString(36),
            date: new Date().toISOString(),
            author: 'User',
            content: content,
            type: 'Note' as const
        };
        updateProject(project.id, { notes: [newNote, ...project.notes] });
        setNewLogText('');
        setWeatherTag(null);
    };

    const navigateToClient = () => {
        setSearchQuery(project.clientName);
        navigateTo('Clients');
        onClose();
    };

    const navigateToEstimate = () => {
        // Estimates module removed
    };

    const TABS = [
        { id: 'Overview', label: 'Command Center', icon: <LayoutDashboard size={18} /> },
        { id: 'Tasks', label: 'Tasks', icon: <CheckSquare size={18} /> },
        { id: 'Labor', label: 'Labor & Time', icon: <HardHat size={18} /> },
        ...(canSeeFinancials ? [{ id: 'Financials', label: 'Financials', icon: <PieChart size={18} /> }] : [])
    ];

    return (
        <div className="fixed inset-0 z-[100] bg-slate-50 flex flex-col animate-in slide-in-from-right-8 duration-300">

            {/* --- 1. TOP NAV BAR --- */}
            <div className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center shrink-0 shadow-sm z-20">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 leading-none">{project.name}</h2>
                        <div className="flex items-center text-xs text-slate-500 mt-1 space-x-3">
                            <button onClick={navigateToClient} className="flex items-center hover:text-blue-600 transition-colors">
                                <MapPin size={12} className="mr-1" /> {project.clientName}
                            </button>

                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <select
                        value={project.status}
                        onChange={(e) => handleUpdateStatus(e.target.value as ProjectStatus)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase border cursor-pointer outline-none focus:ring-2 focus:ring-slate-900 transition-all ${project.status === 'In Progress' ? 'bg-blue-600 text-white border-blue-600' :
                            project.status === 'Completed' ? 'bg-emerald-600 text-white border-emerald-600' :
                                'bg-white text-slate-600 border-slate-300'
                            }`}
                    >
                        <option value={ProjectStatus.SCHEDULED}>Scheduled</option>
                        <option value={ProjectStatus.IN_PROGRESS}>In Progress</option>
                        <option value={ProjectStatus.COMPLETED}>Completed</option>
                        <option value={ProjectStatus.CANCELLED}>Cancelled</option>
                    </select>
                </div>
            </div>

            {/* --- 2. VITALS BAR (Sticky Context) --- */}
            <div className="bg-slate-900 text-white px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 shadow-md z-10">
                <div className="flex gap-8 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">

                    {/* Schedule Vital */}
                    <div className="flex items-center min-w-[140px]">
                        <div className={`p-2 rounded-lg mr-3 ${isScheduleRisk ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                            <Calendar size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Schedule</p>
                            <p className={`text-sm font-bold ${isScheduleRisk ? 'text-amber-400' : 'text-white'}`}>
                                {isScheduleRisk ? 'Behind Pace' : 'On Track'}
                            </p>
                            <div className="w-24 h-1 bg-slate-700 rounded-full mt-1 overflow-hidden">
                                <div className="h-full bg-blue-500" style={{ width: `${project.completionPercent}%` }} title="% Complete"></div>
                            </div>
                        </div>
                    </div>

                    {/* Labor Vital */}
                    <div className="flex items-center min-w-[140px]">
                        <div className={`p-2 rounded-lg mr-3 ${isLaborRisk ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                            <Clock size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Labor Budget</p>
                            <p className="text-sm font-bold text-white">{usedHours.toFixed(1)} / {budgetHours} Hrs</p>
                            <div className="w-24 h-1 bg-slate-700 rounded-full mt-1 overflow-hidden">
                                <div className={`h-full ${isLaborRisk ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${laborPercent}%` }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Financial Vital */}
                    {canSeeFinancials && (
                        <div className="flex items-center min-w-[140px]">
                            <div className="p-2 rounded-lg mr-3 bg-green-500/20 text-green-400">
                                <DollarSign size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Contract Value</p>
                                <p className="text-sm font-bold text-white">${project.revenue.toLocaleString()}</p>
                                <p className="text-[10px] text-slate-400">Fixed Price</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation Tabs */}
                <div className="flex bg-slate-800 p-1 rounded-xl overflow-x-auto">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-slate-700 text-white shadow-sm'
                                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                }`}
                        >
                            <span className="mr-2">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* --- 3. MAIN CONTENT AREA --- */}
            <div className="flex-1 overflow-y-auto bg-slate-100 p-4 md:p-8 custom-scrollbar">
                <div className="max-w-7xl mx-auto h-full">

                    {activeTab === 'Overview' && (
                        <ProjectOverview
                            project={project}
                            onUpdate={(u) => updateProject(project.id, u)}
                            newLogText={newLogText}
                            setNewLogText={setNewLogText}
                            weatherTag={weatherTag}
                            setWeatherTag={setWeatherTag}
                            addLog={addLog}
                            isOverBudget={isLaborRisk}
                            estHours={budgetHours}
                            actHours={usedHours}
                            timePercent={timePercent}
                            daysElapsed={daysElapsed}
                            totalDays={totalDays}
                            userRole={userRole}
                        />
                    )}

                    {activeTab === 'Tasks' && (
                        <ProjectTasks
                            project={project}
                            onUpdate={(u) => updateProject(project.id, u)}
                        />
                    )}

                    {activeTab === 'Labor' && (
                        <ProjectTime project={project} />
                    )}

                    {activeTab === 'Financials' && canSeeFinancials && (
                        <ProjectFinancials
                            project={project}
                            onUpdate={(u) => updateProject(project.id, u)}
                            metrics={metrics}
                            settings={settings}
                        />
                    )}

                </div>
            </div>
        </div>
    );
};

export default ProjectDetail;
