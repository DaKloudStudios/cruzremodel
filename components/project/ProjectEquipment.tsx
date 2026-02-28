import React, { useState } from 'react';
import { useFleet } from '../../contexts/FleetContext';
import { useProjects } from '../../contexts/ProjectsContext';
import { Project, Equipment, EquipmentStatus } from '../../types';
import { Truck, CheckCircle2, RotateCcw } from 'lucide-react';

interface ProjectEquipmentProps {
    project: Project;
}

const ProjectEquipment: React.FC<ProjectEquipmentProps> = ({ project }) => {
    const { equipment, updateEquipment } = useFleet();
    const { updateProject } = useProjects();
    const [isUpdating, setIsUpdating] = useState<string | null>(null);

    // Derived states
    const assignedEquipmentIds = project.assignedEquipmentIds || [];

    // We get the actual full equipment objects matching the IDs for detailed display
    const checkedOutEquipment = equipment.filter(eq => assignedEquipmentIds.includes(eq.id));

    // Filter available equipment (not assigned anywhere, status === 'Available')
    const availableEquipment = equipment.filter(eq =>
        eq.status === 'Available' && !eq.projectId
    );

    const handleCheckOut = async (eq: Equipment) => {
        setIsUpdating(eq.id);
        try {
            // 1. Update the Equipment Document
            await updateEquipment(eq.id, {
                status: 'On Job',
                projectId: project.id,
                location: project.name
            });

            // 2. Update the Project Document to track the assignment
            const newAssignedIds = [...assignedEquipmentIds, eq.id];
            await updateProject(project.id, {
                assignedEquipmentIds: newAssignedIds
            });
        } catch (error) {
            console.error("Failed to check out equipment:", error);
        } finally {
            setIsUpdating(null);
        }
    };

    const handleReturn = async (eq: Equipment) => {
        setIsUpdating(eq.id);
        try {
            // 1. Update the Equipment Document
            await updateEquipment(eq.id, {
                status: 'Available',
                projectId: undefined,
                location: 'Shop'
            });

            // 2. Update the Project Document to remove the assignment
            const newAssignedIds = assignedEquipmentIds.filter(id => id !== eq.id);
            await updateProject(project.id, {
                assignedEquipmentIds: newAssignedIds
            });
        } catch (error) {
            console.error("Failed to return equipment:", error);
        } finally {
            setIsUpdating(null);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header section explaining the tool */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                        <Truck size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Equipment Assignments</h3>
                        <p className="text-sm text-slate-500">Sign out heavy machinery and fleet vehicles specific to this project.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Active Assigned Equipment Column */}
                <div className="space-y-4">
                    <h4 className="font-bold text-slate-700 flex items-center justify-between">
                        On Site
                        <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full">
                            {checkedOutEquipment.length}
                        </span>
                    </h4>

                    {checkedOutEquipment.length > 0 ? (
                        <div className="grid gap-3">
                            {checkedOutEquipment.map(eq => (
                                <div key={eq.id} className="bg-white p-4 rounded-xl border-l-4 border-l-emerald-500 border border-slate-200 shadow-sm flex items-center justify-between">
                                    <div>
                                        <h5 className="font-bold text-slate-800">{eq.name}</h5>
                                        <p className="text-xs text-slate-500">{eq.type}</p>
                                    </div>
                                    <button
                                        onClick={() => handleReturn(eq)}
                                        disabled={isUpdating === eq.id}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {isUpdating === eq.id ? (
                                            <span className="animate-pulse">Returning...</span>
                                        ) : (
                                            <>
                                                <RotateCcw size={14} /> Return to Shop
                                            </>
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                            <Truck size={24} className="text-slate-300 mb-2" />
                            <p className="text-sm font-medium text-slate-500">No equipment currently assigned.</p>
                            <p className="text-xs text-slate-400 mt-1">Check out items from the available pool.</p>
                        </div>
                    )}
                </div>

                {/* Pool of Available Equipment */}
                <div className="space-y-4">
                    <h4 className="font-bold text-slate-700 flex items-center justify-between">
                        Shop Inventory
                        <span className="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full">
                            {availableEquipment.length}
                        </span>
                    </h4>

                    {availableEquipment.length > 0 ? (
                        <div className="grid gap-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2 pb-2">
                            {availableEquipment.map(eq => (
                                <div key={eq.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-slate-300 transition-colors">
                                    <div>
                                        <h5 className="font-bold text-slate-800">{eq.name}</h5>
                                        <p className="text-xs text-slate-500">{eq.type}</p>
                                    </div>
                                    <button
                                        onClick={() => handleCheckOut(eq)}
                                        disabled={isUpdating === eq.id}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg transition-colors shadow-sm disabled:opacity-50"
                                    >
                                        {isUpdating === eq.id ? (
                                            <span className="animate-pulse">Checking out...</span>
                                        ) : (
                                            <>
                                                <CheckCircle2 size={14} /> Check Out
                                            </>
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white border rounded-xl p-6 text-center">
                            <p className="text-sm font-medium text-slate-500">No equipment available.</p>
                            <p className="text-xs text-slate-400 mt-1">All items might be checked out or in the shop for maintenance.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ProjectEquipment;
