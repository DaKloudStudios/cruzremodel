import React, { useState, useMemo } from 'react';
import { Client, Project, CallLog, ProjectStatus } from '../types';
import { useProjects } from '../contexts/ProjectsContext';
import { useCRM } from '../contexts/CRMContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useConfirm } from '../contexts/DialogContext';
import {
    X, Phone, Mail, MapPin, Calendar, DollarSign,
    Briefcase, FileText, MessageSquare, Plus, Edit,
    Trash2, ExternalLink, Clock, CheckCircle, Shield, Tag
} from 'lucide-react';

interface ClientDetailProps {
    client: Client;
    onClose: () => void;
    onEdit: () => void;
}

const ClientDetail: React.FC<ClientDetailProps> = ({ client, onClose, onEdit }) => {
    const { projects } = useProjects();
    const { calls, deleteClient, addCall } = useCRM();
    const { navigateTo, setSearchQuery } = useNavigation();
    const { confirm } = useConfirm();

    const [activeTab, setActiveTab] = useState<'Overview' | 'Projects' | 'Communication'>('Overview');

    // --- DERIVED DATA ---
    const clientProjects = useMemo(() => projects.filter(p => p.clientId === client.id).sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()), [projects, client.id]);
    const clientCalls = useMemo(() => calls.filter(c => c.clientId === client.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [calls, client.id]);

    const stats = {
        totalRevenue: clientProjects.reduce((sum, p) => sum + p.revenue, 0),
        activeProjectsCount: clientProjects.filter(p => p.status === 'In Progress' || p.status === 'Scheduled').length,
        lastContact: clientCalls.length > 0 ? new Date(clientCalls[0].date) : null
    };

    // --- ACTIONS ---
    const handleDelete = async () => {
        const isConfirmed = await confirm({
            title: "Delete Client",
            message: `Are you sure you want to delete ${client.name}? This will permanently remove them from your database. Linked projects will remain but may lose client context.`,
            type: "danger",
            confirmText: "Delete Client",
            cancelText: "Cancel"
        });
        if (isConfirmed) {
            await deleteClient(client.id);
            onClose();
        }
    };

    const handleNavigateToProject = (project: Project) => {
        setSearchQuery(project.name);
        navigateTo('Projects');
        onClose();
    };

    // --- RENDERERS ---

    const renderOverview = () => (
        <div className="space-y-8 animate-in fade-in">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-cream-50 p-5 rounded-2xl border border-cream-100">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-2 tracking-wider">Lifetime Revenue</p>
                    <p className="text-2xl font-display font-bold text-charcoal">${stats.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="bg-cream-50 p-5 rounded-2xl border border-cream-100">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-2 tracking-wider">Lifetime Revenue</p>
                    <p className="text-2xl font-display font-bold text-charcoal">${stats.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="bg-cream-50 p-5 rounded-2xl border border-cream-100">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-2 tracking-wider">Active Jobs</p>
                    <p className="text-2xl font-display font-bold text-emerald-600">{stats.activeProjectsCount}</p>
                    <p className="text-xs text-slate-400 mt-1 font-medium">In progress or scheduled</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Info */}
                <div className="bg-white border border-cream-100 rounded-[1.5rem] p-6 shadow-sm">
                    <h4 className="font-display font-bold text-charcoal mb-4 flex items-center text-lg">
                        <Shield size={18} className="mr-2 text-emerald-500" /> Contact & Access
                    </h4>
                    <div className="space-y-5">
                        <div className="flex items-center">
                            <div className="w-10 flex justify-center"><Phone size={18} className="text-slate-400" /></div>
                            <div>
                                <p className="text-sm font-bold text-charcoal">{client.phone}</p>
                                <p className="text-xs text-slate-500 font-medium">Preferred: {client.preferredContact}</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <div className="w-10 flex justify-center"><Mail size={18} className="text-slate-400" /></div>
                            <a href={`mailto:${client.email}`} className="text-sm font-medium text-emerald-600 hover:text-emerald-500 hover:underline">{client.email || 'No Email'}</a>
                        </div>
                        <div className="flex items-center">
                            <div className="w-10 flex justify-center"><MapPin size={18} className="text-slate-400" /></div>
                            <p className="text-sm font-medium text-slate-600">{client.address}</p>
                        </div>
                        {client.gateCode && (
                            <div className="mt-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between">
                                <span className="text-emerald-700 font-bold text-xs uppercase ml-2">Gate Code</span>
                                <span className="text-charcoal font-mono font-bold bg-white px-3 py-1 rounded-md border border-emerald-100 mr-2">{client.gateCode}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Notes */}
                <div className="bg-white border border-cream-100 rounded-[1.5rem] p-6 shadow-sm flex flex-col">
                    <h4 className="font-display font-bold text-charcoal mb-4 flex items-center text-lg">
                        <FileText size={18} className="mr-2 text-emerald-500" /> Property Notes
                    </h4>
                    <div className="flex-1 bg-cream-50 rounded-xl p-4 text-sm text-slate-600 italic leading-relaxed border border-cream-100/50">
                        {client.propertyNotes || "No notes available for this property."}
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2">
                        {client.tags?.map(tag => (
                            <span key={tag} className="px-3 py-1 bg-white text-slate-600 text-xs rounded-full border border-cream-200 font-bold">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderProjects = () => (
        <div className="space-y-4 animate-in fade-in">
            {clientProjects.length === 0 && (
                <div className="text-center py-16 border-2 border-dashed border-cream-200 rounded-[1.5rem] bg-cream-50/30">
                    <Briefcase size={40} className="mx-auto text-cream-300 mb-3" />
                    <p className="text-slate-500 font-bold">No projects yet.</p>
                </div>
            )}
            {clientProjects.map(p => (
                <div
                    key={p.id}
                    onClick={() => handleNavigateToProject(p)}
                    className="bg-white border border-cream-200 rounded-2xl p-5 hover:shadow-soft hover:border-emerald-300 transition-all cursor-pointer group"
                >
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <h5 className="font-display font-bold text-charcoal group-hover:text-emerald-600 transition-colors text-lg">{p.name}</h5>
                            <p className="text-xs text-slate-500 font-medium">Started {new Date(p.startDate).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${p.status === 'In Progress' ? 'bg-emerald-100 text-emerald-800' :
                            p.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                                'bg-slate-100 text-slate-600'
                            }`}>
                            {p.status}
                        </span>
                    </div>
                    <div className="w-full bg-cream-100 h-2 rounded-full overflow-hidden mb-3">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${p.completionPercent}%` }}></div>
                    </div>
                    <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-500">{p.completionPercent}% Complete</span>
                        <span className="text-charcoal">${p.revenue.toLocaleString()}</span>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderCommunication = () => (
        <div className="space-y-5 animate-in fade-in">
            {clientCalls.map(c => (
                <div key={c.id} className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm border-2 border-white ${c.type === 'Inbound' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                            {c.type === 'Inbound' ? <Phone size={16} className="rotate-180" /> : <Phone size={16} />}
                        </div>
                    </div>
                    <div className="flex-1 bg-white border border-cream-200 rounded-2xl p-4 shadow-sm relative">
                        {/* Connector line could go here */}
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-charcoal text-sm">{c.outcome}</span>
                            <span className="text-[10px] font-bold text-slate-400 bg-cream-50 px-2 py-1 rounded-full">{new Date(c.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed max-w-lg">{c.notes}</p>
                    </div>
                </div>
            ))}
            {clientCalls.length === 0 && (
                <div className="text-center py-12 text-slate-400 italic">No calls recorded yet.</div>
            )}
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 bg-charcoal/20 backdrop-blur-[1px] flex flex-col items-end animate-in fade-in duration-200">
            <div className="h-full w-full max-w-[600px] bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-white/50">
                {/* HEADER */}
                <div className="bg-cream-50/80 backdrop-blur-md border-b border-cream-200 px-8 py-6 flex justify-between items-center shrink-0">
                    <div className="flex items-center">
                        <button onClick={onClose} className="mr-6 p-2 hover:bg-white rounded-full text-slate-400 hover:text-charcoal transition-all shadow-sm border border-transparent hover:border-cream-200">
                            <X size={24} />
                        </button>
                        <div>
                            <h2 className="text-3xl font-display font-bold text-charcoal">{client.name}</h2>
                            <p className="text-sm text-slate-500 flex items-center mt-1 font-medium">
                                <MapPin size={14} className="mr-1.5 opacity-60" /> {client.address}
                            </p>
                        </div>
                    </div>

                    <div className="flex space-x-2">
                        <button onClick={onEdit} className="p-2.5 text-slate-500 hover:text-emerald-600 bg-white border border-cream-200 rounded-xl shadow-sm hover:shadow-md hover:border-emerald-200 transition-all">
                            <Edit size={20} />
                        </button>
                        <button onClick={handleDelete} className="p-2.5 text-slate-400 hover:text-red-500 bg-white border border-cream-200 rounded-xl shadow-sm hover:shadow-md hover:border-red-200 hover:bg-red-50 transition-all">
                            <Trash2 size={20} />
                        </button>
                    </div>
                </div>

                {/* TABS */}
                <div className="bg-white border-b border-cream-100 px-8 flex space-x-8 shrink-0 overflow-x-auto">
                    {['Overview', 'Projects', 'Communication'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`py-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${activeTab === tab
                                ? 'border-emerald-500 text-charcoal'
                                : 'border-transparent text-slate-400 hover:text-charcoal'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* CONTENT */}
                <div className="flex-1 overflow-y-auto p-8 bg-white/50 custom-scrollbar">
                    <div className="max-w-4xl mx-auto h-full">
                        {activeTab === 'Overview' && renderOverview()}
                        {activeTab === 'Projects' && renderProjects()}
                        {activeTab === 'Communication' && renderCommunication()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientDetail;