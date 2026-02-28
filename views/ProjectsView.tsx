import React, { useState } from 'react';
import { useProjects } from '../contexts/ProjectsContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { Project, ProjectStatus } from '../types';
import ProjectDetail from '../components/ProjectDetail';
import NewProjectModal from '../components/NewProjectModal';
import {
    LayoutGrid, List, Search, ArrowRight, Clock,
    CheckCircle, AlertCircle, Calendar, DollarSign,
    Briefcase, MoreHorizontal, CheckSquare, Plus, Filter
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

const ProjectsView: React.FC = () => {
    const { projects, updateProjectStatus } = useProjects();
    const { searchQuery, setSearchQuery } = useNavigation();
    const { settings } = useSettings();
    const { userRole } = useAuth();
    const [viewMode, setViewMode] = useState<'List' | 'Board'>('Board');

    // FIX: Track ID instead of object to prevent stale state issues
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

    const [showNewProjectModal, setShowNewProjectModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState<ProjectStatus | 'All'>('All');

    // Derive the active project from the live list
    const selectedProject = selectedProjectId ? projects.find(p => p.id === selectedProjectId) || null : null;

    // Permission Check
    const canSeeFinancials = userRole === 'Admin' || userRole === 'Office';

    // --- FILTERS & STATS ---
    const filteredProjects = projects.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.clientName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'All' || p.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const activeRevenue = filteredProjects
        .filter(p => p.status === 'In Progress' || p.status === 'Scheduled')
        .reduce((sum, p) => sum + p.revenue, 0);

    const activeCount = filteredProjects.filter(p => p.status === 'In Progress').length;

    // --- SUB-COMPONENT: PROJECT CARD ---
    const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
        const nextTask = project.tasks.find(t => !t.isCompleted);
        const isOverdue = new Date(project.endDate) < new Date() && project.status !== 'Completed';

        let borderClass = 'border-l-4 border-l-slate-400';
        if (project.status === 'In Progress') borderClass = 'border-l-4 border-l-blue-500';
        if (project.status === 'Completed') borderClass = 'border-l-4 border-l-green-500';
        if (project.status === 'Cancelled') borderClass = 'border-l-4 border-l-red-300';

        // --- AVATAR LOGIC ---
        const crew = (project.assignedCrewIds || [])
            .map(id => {
                const emp = settings.employees.find(e => e.id === id);
                if (!emp) return null;
                return {
                    name: emp.name,
                    photoUrl: undefined,
                    initial: emp.name.charAt(0)
                };
            })
            .filter(Boolean);

        return (
            <Card
                hover
                onClick={() => setSelectedProjectId(project.id)}
                className={`cursor-pointer group relative flex flex-col gap-3 !p-4 !border-l-4 ${borderClass.replace('border-l-4 ', '')}`}
            >
                <div className="flex justify-between items-start">
                    <div>
                        <h5 className="font-bold text-slate-800 text-sm line-clamp-1 group-hover:text-blue-600 transition-colors">{project.name}</h5>
                        <p className="text-xs text-slate-500 flex items-center mt-1">
                            <Briefcase size={10} className="mr-1.5" /> {project.clientName}
                        </p>
                    </div>
                    {isOverdue && <span title="Overdue"><AlertCircle size={14} className="text-red-500" /></span>}
                </div>

                {/* Quick Task Preview */}
                {nextTask ? (
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-start">
                        <div className={`mt-0.5 w-2 h-2 rounded-full mr-2 ${project.status === 'In Progress' ? 'bg-blue-400 animate-pulse' : 'bg-slate-300'}`}></div>
                        <span className="text-xs text-slate-600 line-clamp-1 flex-1">{nextTask.description}</span>
                    </div>
                ) : (
                    <div className="bg-green-50 p-2 rounded-lg border border-green-100 text-xs text-green-700 font-medium flex items-center">
                        <CheckCircle size={12} className="mr-1.5" /> All tasks complete
                    </div>
                )}

                {/* Footer Stats & Avatars */}
                <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                    <div className="flex items-center -space-x-2 overflow-hidden pl-1">
                        {crew.slice(0, 3).map((member: any, i: number) => (
                            <div
                                key={i}
                                className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 shadow-sm overflow-hidden"
                                title={member.name}
                            >
                                {member.photoUrl ? (
                                    <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
                                ) : (
                                    member.initial
                                )}
                            </div>
                        ))}
                        {crew.length > 3 && (
                            <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-500 shadow-sm">
                                +{crew.length - 3}
                            </div>
                        )}
                        {crew.length === 0 && (
                            <div className="text-[10px] text-slate-400 italic pl-1">No Crew</div>
                        )}
                    </div>

                    <div className="flex items-center space-x-3 text-right">
                        {canSeeFinancials && (
                            <span className="text-xs font-bold text-slate-700">${project.revenue.toLocaleString()}</span>
                        )}
                        <div className="text-[10px] font-bold text-slate-400">
                            {project.completionPercent}%
                        </div>
                    </div>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full ${project.completionPercent > 90 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${project.completionPercent}%` }}></div>
                </div>
            </Card>
        );
    };

    // --- SUB-COMPONENT: KANBAN COLUMN ---
    const KanbanColumn = ({ status, title, color }: { status: ProjectStatus, title: string, color: string }) => {
        const colProjects = filteredProjects.filter(p => p.status === status);

        return (
            <div className="flex flex-col h-full min-w-[320px] w-80 bg-slate-50/50 rounded-2xl border border-slate-200/60 backdrop-blur-sm">
                <div className={`p-4 border-b border-slate-100 rounded-t-2xl flex justify-between items-center ${color} bg-opacity-10 sticky top-0 bg-white/80 z-10`}>
                    <h4 className={`font-bold text-sm flex items-center ${color.replace('bg-', 'text-').replace('100', '700')}`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${color.replace('bg-', 'bg-').replace('100', '500')}`}></div>
                        {title}
                    </h4>
                    <span className="bg-white px-2 py-0.5 rounded-full text-xs font-bold shadow-sm text-slate-500 border border-slate-100">{colProjects.length}</span>
                </div>
                <div className="flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar">
                    {colProjects.map(p => <ProjectCard key={p.id} project={p} />)}
                    {colProjects.length === 0 && (
                        <div className="text-center py-12 text-slate-400 text-xs border-2 border-dashed border-slate-200 rounded-xl m-2">
                            No {title.toLowerCase()} projects
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col gap-6">

            {/* HEADER & CONTROLS */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
                    <p className="text-slate-500 text-sm">Active jobs and production schedule.</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none w-full md:w-64 group">
                        <Input
                            leftIcon={<Search size={18} />}
                            placeholder="Search projects..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex bg-white rounded-xl border border-slate-200 p-1">
                        <button
                            onClick={() => setViewMode('Board')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'Board' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('List')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'List' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <List size={18} />
                        </button>
                    </div>
                    <Button
                        onClick={() => setShowNewProjectModal(true)}
                        leftIcon={<Plus size={16} />}
                    >
                        New Project
                    </Button>
                </div>
            </div>

            {/* FILTER TABS */}
            <div className="flex items-center space-x-1 overflow-x-auto pb-1 shrink-0">
                {(['All', 'Scheduled', 'In Progress', 'Completed', 'Cancelled'] as const).map(status => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status as ProjectStatus | 'All')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors border ${filterStatus === status
                            ? 'bg-forest-900 text-white border-forest-900'
                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                            }`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {/* STATS BAR */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
                {canSeeFinancials && (
                    <Card hover className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Active Revenue</p>
                            <p className="text-lg font-bold text-slate-900">${activeRevenue.toLocaleString()}</p>
                        </div>
                        <DollarSign className="text-green-500 opacity-20" size={24} />
                    </Card>
                )}
                <Card hover className="p-4 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Active Jobs</p>
                        <p className="text-lg font-bold text-slate-900">{activeCount}</p>
                    </div>
                    <Clock className="text-blue-500 opacity-20" size={24} />
                </Card>
            </div>

            {/* BOARD VIEW */}
            {viewMode === 'Board' && (
                <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
                    <div className="flex h-full gap-4 px-1">
                        <KanbanColumn status={ProjectStatus.SCHEDULED} title="Scheduled" color="bg-slate-100" />
                        <KanbanColumn status={ProjectStatus.IN_PROGRESS} title="In Progress" color="bg-blue-100" />
                        <KanbanColumn status={ProjectStatus.COMPLETED} title="Completed" color="bg-green-100" />
                    </div>
                </div>
            )}

            {/* LIST VIEW */}
            {viewMode === 'List' && (
                <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="overflow-x-auto flex-1">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Project Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Client</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Timeline</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Progress</th>
                                    {canSeeFinancials && (
                                        <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase">Revenue</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {filteredProjects.map(p => (
                                    <tr key={p.id} onClick={() => setSelectedProjectId(p.id)} className="hover:bg-slate-50 cursor-pointer transition-colors group">
                                        <td className="px-6 py-4 font-bold text-slate-800 group-hover:text-blue-600">{p.name}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{p.clientName}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {new Date(p.startDate).toLocaleDateString()} - {new Date(p.endDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${p.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                                p.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-slate-100 text-slate-600'
                                                }`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 w-48">
                                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                                <div className="bg-slate-800 h-full" style={{ width: `${p.completionPercent}%` }}></div>
                                            </div>
                                        </td>
                                        {canSeeFinancials && (
                                            <td className="px-6 py-4 text-right font-bold text-slate-900">
                                                ${p.revenue.toLocaleString()}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* PROJECT DETAIL OVERLAY - NOW USES LIVE OBJECT */}
            {selectedProject && (
                <ProjectDetail
                    project={selectedProject}
                    onClose={() => setSelectedProjectId(null)}
                />
            )}

            {/* NEW PROJECT MODAL */}
            {showNewProjectModal && (
                <NewProjectModal onClose={() => setShowNewProjectModal(false)} />
            )}

        </div>
    );
};

export default ProjectsView;
