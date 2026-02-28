
import React from 'react';
import { Project, Estimate } from '../../types';
import { Package, Truck, CheckCircle2, Box, AlertCircle } from 'lucide-react';

interface ProjectMaterialsProps {
  project: Project;
  estimate?: Estimate;
  onUpdate: (updates: Partial<Project>) => void;
}

const ProjectMaterials: React.FC<ProjectMaterialsProps> = ({ project, estimate, onUpdate }) => {
  
  const updateStatus = (itemId: string, newStatus: string) => {
      const currentStatuses = project.materialStatus || [];
      const existingIndex = currentStatuses.findIndex(s => s.estimateItemId === itemId);
      
      let updatedStatuses = [...currentStatuses];
      if (existingIndex >= 0) {
          updatedStatuses[existingIndex] = { ...updatedStatuses[existingIndex], status: newStatus };
      } else {
          updatedStatuses.push({ estimateItemId: itemId, status: newStatus });
      }
      onUpdate({ materialStatus: updatedStatuses });
  };

  const materialItems = estimate?.items.filter(i => i.type !== 'Labor' && i.type !== 'Subcontractor') || [];

  // Group items by status
  const columns = {
      'Needs Ordering': materialItems.filter(i => {
          const s = project.materialStatus?.find(st => st.estimateItemId === i.id)?.status;
          return !s || s === 'Needs Ordering';
      }),
      'Ordered': materialItems.filter(i => project.materialStatus?.find(st => st.estimateItemId === i.id)?.status === 'Ordered'),
      'Ready/Staged': materialItems.filter(i => project.materialStatus?.find(st => st.estimateItemId === i.id)?.status === 'Ready/Staged'),
      'Installed': materialItems.filter(i => project.materialStatus?.find(st => st.estimateItemId === i.id)?.status === 'Installed'),
  };

  const getColumnIcon = (status: string) => {
      switch(status) {
          case 'Needs Ordering': return <AlertCircle size={16} className="text-red-500" />;
          case 'Ordered': return <Truck size={16} className="text-amber-500" />;
          case 'Ready/Staged': return <Box size={16} className="text-blue-500" />;
          case 'Installed': return <CheckCircle2 size={16} className="text-green-500" />;
          default: return <Package size={16} />;
      }
  };

  const getColumnColor = (status: string) => {
      switch(status) {
          case 'Needs Ordering': return 'bg-red-50 border-red-100 text-red-700';
          case 'Ordered': return 'bg-amber-50 border-amber-100 text-amber-700';
          case 'Ready/Staged': return 'bg-blue-50 border-blue-100 text-blue-700';
          case 'Installed': return 'bg-green-50 border-green-100 text-green-700';
          default: return 'bg-slate-50';
      }
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in">
        <div className="mb-4 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center">
                <Package size={20} className="mr-2 text-indigo-600"/> Procurement Board
            </h3>
            <span className="text-xs text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                {materialItems.length} Materials Tracked
            </span>
        </div>

        <div className="flex-1 overflow-x-auto pb-4">
            <div className="flex gap-4 h-full min-w-[1000px]">
                {Object.entries(columns).map(([status, items]) => (
                    <div key={status} className="flex-1 flex flex-col min-w-[240px] bg-slate-100/50 rounded-xl border border-slate-200">
                        {/* Column Header */}
                        <div className={`p-3 rounded-t-xl border-b flex justify-between items-center ${getColumnColor(status)}`}>
                            <div className="flex items-center font-bold text-xs uppercase tracking-wide">
                                <span className="mr-2">{getColumnIcon(status)}</span>
                                {status === 'Ready/Staged' ? 'Staged' : status}
                            </div>
                            <span className="bg-white/50 px-2 py-0.5 rounded text-[10px] font-bold">
                                {items.length}
                            </span>
                        </div>

                        {/* Column Body */}
                        <div className="flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar">
                            {items.map(item => (
                                <div key={item.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all group relative">
                                    <div className="mb-2">
                                        <div className="flex justify-between items-start">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.type}</span>
                                            <span className="text-xs font-bold text-slate-900">${item.cost.toLocaleString()}</span>
                                        </div>
                                        <p className="text-sm font-bold text-slate-800 leading-tight mt-1">{item.description}</p>
                                        <p className="text-xs text-slate-500 mt-1">{item.quantity} units</p>
                                    </div>

                                    {/* Quick Actions (Move Next) */}
                                    <div className="pt-2 border-t border-slate-50 flex justify-end gap-1">
                                        {status !== 'Installed' && (
                                            <button 
                                                onClick={() => {
                                                    const next = status === 'Needs Ordering' ? 'Ordered' : status === 'Ordered' ? 'Ready/Staged' : 'Installed';
                                                    updateStatus(item.id, next);
                                                }}
                                                className="text-[10px] bg-slate-900 text-white px-2 py-1 rounded hover:bg-slate-700 transition-colors"
                                            >
                                                Move &rarr;
                                            </button>
                                        )}
                                        {status !== 'Needs Ordering' && (
                                            <button 
                                                onClick={() => {
                                                    const prev = status === 'Installed' ? 'Ready/Staged' : status === 'Ready/Staged' ? 'Ordered' : 'Needs Ordering';
                                                    updateStatus(item.id, prev);
                                                }}
                                                className="text-[10px] text-slate-400 hover:text-slate-600 px-2 py-1"
                                            >
                                                Undo
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {items.length === 0 && (
                                <div className="h-24 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-300 text-xs italic">
                                    Empty
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default ProjectMaterials;
