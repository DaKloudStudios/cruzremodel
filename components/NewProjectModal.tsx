
import React, { useState } from 'react';
import { useCRM } from '../contexts/CRMContext';
import { useProjects } from '../contexts/ProjectsContext';
import { useSettings } from '../contexts/SettingsContext';
import { Client } from '../types';
import { X, Search, Briefcase, Calendar, DollarSign, Users, Check } from 'lucide-react';

interface NewProjectModalProps {
    onClose: () => void;
}

const NewProjectModal: React.FC<NewProjectModalProps> = ({ onClose }) => {
    const { clients } = useCRM();
    const { addProject } = useProjects();
    const { settings } = useSettings();
    const [step, setStep] = useState(1);
    const [search, setSearch] = useState('');
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        revenue: 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        description: '',
        assignedCrewIds: [] as string[]
    });

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search)
    ).slice(0, 5);

    const handleCreate = () => {
        if (!selectedClient) return;
        addProject({
            clientId: selectedClient.id,
            clientName: selectedClient.name,
            estimateId: '', // Manual project has no estimate linked initially
            name: formData.name || `Project for ${selectedClient.name}`,
            startDate: new Date(formData.startDate).toISOString(),
            endDate: new Date(formData.endDate).toISOString(),
            revenue: Number(formData.revenue),
            description: formData.description,
            assignedCrewIds: formData.assignedCrewIds
        });
        onClose();
    };

    const toggleEmployee = (empId: string) => {
        setFormData(prev => ({
            ...prev,
            assignedCrewIds: prev.assignedCrewIds.includes(empId)
                ? prev.assignedCrewIds.filter(id => id !== empId)
                : [...prev.assignedCrewIds, empId]
        }));
    };

    const inputClass = "w-full p-3 border border-slate-300 rounded-xl bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800">New Project</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 text-slate-500"><X size={20} /></button>
                </div>

                <div className="p-6">
                    {step === 1 ? (
                        <div className="space-y-4">
                            <p className="text-sm text-slate-500">Select a client to start a new project.</p>
                            <div className="relative">
                                <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                <input
                                    autoFocus
                                    className={`${inputClass} pl-10`}
                                    placeholder="Search clients..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                {filteredClients.map(client => (
                                    <button
                                        key={client.id}
                                        onClick={() => { setSelectedClient(client); setStep(2); setFormData({ ...formData, name: `Project for ${client.name}` }); }}
                                        className="w-full text-left p-3 border border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all"
                                    >
                                        <div className="font-bold text-slate-800">{client.name}</div>
                                        <div className="text-xs text-slate-500">{client.address}</div>
                                    </button>
                                ))}
                                {filteredClients.length === 0 && search && <div className="text-center text-slate-400 py-4">No clients found.</div>}
                            </div>
                        </div>
                    ) : step === 2 ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Project Name</label>
                                <input
                                    className={inputClass}
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        className={inputClass}
                                        value={formData.startDate}
                                        onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Target End</label>
                                    <input
                                        type="date"
                                        className={inputClass}
                                        value={formData.endDate}
                                        onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Contract Value ($)</label>
                                <input
                                    type="number"
                                    className={inputClass}
                                    value={formData.revenue}
                                    onChange={e => setFormData({ ...formData, revenue: Number(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Description</label>
                                <textarea
                                    className={inputClass}
                                    rows={3}
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <button
                                onClick={() => setStep(3)}
                                className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg mt-4"
                            >
                                Continue to Assign Crew
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-bold text-slate-800 flex items-center mb-1">
                                    <Users size={18} className="mr-2 text-indigo-600" /> Assign Crew
                                </h4>
                                <p className="text-sm text-slate-500 mb-4">Select employees to assign to this project. You can always change this later.</p>
                            </div>

                            <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar p-1">
                                {settings.employees.map(emp => {
                                    const isSelected = formData.assignedCrewIds.includes(emp.id);
                                    return (
                                        <div
                                            key={emp.id}
                                            onClick={() => toggleEmployee(emp.id)}
                                            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                                }`}
                                        >
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-500 mr-3">
                                                    {emp.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-800 text-sm">{emp.name}</div>
                                                    <div className="text-[10px] text-slate-500 uppercase tracking-wide">{emp.role}</div>
                                                </div>
                                            </div>
                                            <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'
                                                }`}>
                                                {isSelected && <Check size={14} className="text-white" />}
                                            </div>
                                        </div>
                                    );
                                })}
                                {settings.employees.length === 0 && (
                                    <div className="text-center text-slate-400 py-4 italic text-sm border-2 border-dashed border-slate-200 rounded-xl">
                                        No employees configured in settings.
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-slate-100">
                                <button
                                    onClick={() => setStep(2)}
                                    className="px-4 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleCreate}
                                    className="flex-1 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg"
                                >
                                    Create Project
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NewProjectModal;
