import React, { useState } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { useProjects } from '../../contexts/ProjectsContext';
import { Project, Employee } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { X, UserPlus, DollarSign, Calculator } from 'lucide-react';

interface NewWorkerModalProps {
    onClose: () => void;
    project: Project;
}

const NewWorkerModal: React.FC<NewWorkerModalProps> = ({ onClose, project }) => {
    const { settings, updateSettings } = useSettings();
    const { updateProject } = useProjects();

    // Default new employee fields
    const [name, setName] = useState('');
    const [role, setRole] = useState('Laborer');
    const [payType, setPayType] = useState<'Hourly' | 'Salary'>('Hourly');
    const [wage, setWage] = useState('');
    const [laborBurdenPercent, setLaborBurdenPercent] = useState('20');
    const [utilizationPercent, setUtilizationPercent] = useState('80');

    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!name.trim() || !wage) {
            alert("Please fill out the name and wage.");
            return;
        }

        setIsSaving(true);
        try {
            // 1. Create the new Employee object
            const newEmployee: Employee = {
                id: Math.random().toString(36).substring(2, 9), // Simple ID generator
                name: name.trim(),
                role: role,
                payType: payType,
                wage: parseFloat(wage) || 0,
                laborBurdenPercent: parseFloat(laborBurdenPercent) || 20,
                utilizationPercent: parseFloat(utilizationPercent) || 80
            };

            // 2. Save globally to settings
            const updatedEmployees = [...settings.employees, newEmployee];
            await updateSettings({ ...settings, employees: updatedEmployees });

            // 3. Auto-assign the new worker to the current Project's crew
            const newAssignedCrew = [...(project.assignedCrewIds || []), newEmployee.id];
            await updateProject(project.id, { assignedCrewIds: newAssignedCrew });

            // Close the modal
            onClose();
        } catch (error) {
            console.error("Error creating new worker:", error);
            alert("Failed to save new worker. See console for details.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-in fade-in">
            <Card className="max-w-md w-full animate-in slide-in-from-bottom-4 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-indigo-500"></div>

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold flex items-center text-slate-800">
                        <UserPlus className="mr-2 text-indigo-600" />
                        Add New Worker
                    </h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Full Name *</label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. John Smith"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Company Role</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                        >
                            <option value="Laborer">Laborer</option>
                            <option value="Foreman">Foreman</option>
                            <option value="Installer">Installer</option>
                            <option value="Driver">Driver / Deliverer</option>
                            <option value="Office">Office Support</option>
                            <option value="Manager">Manager</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Pay Type</label>
                            <select
                                value={payType}
                                onChange={(e) => setPayType(e.target.value as 'Hourly' | 'Salary')}
                                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                            >
                                <option value="Hourly">Hourly</option>
                                <option value="Salary">Salary</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Wage / Rate *</label>
                            <Input
                                type="number"
                                value={wage}
                                onChange={(e) => setWage(e.target.value)}
                                placeholder="e.g. 25.00"
                                leftIcon={<DollarSign size={16} />}
                                min="0" step="0.50"
                            />
                        </div>
                    </div>

                    <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-800 text-xs">
                        <div className="flex items-start">
                            <Calculator size={16} className="mr-2 mt-0.5" />
                            <p>
                                <strong>Smart Add:</strong> Setting up this worker will permanently add them to your global roster, and immediately check them into this project's crew assigned list.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                    <Button variant="ghost" onClick={onClose} disabled={isSaving}>Cancel</Button>
                    <Button
                        onClick={handleSave}
                        disabled={!name.trim() || !wage || isSaving}
                    >
                        {isSaving ? 'Saving...' : 'Add Worker'}
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default NewWorkerModal;
