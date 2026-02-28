import React, { useState } from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
import { Bell, Phone, FileText, ArrowRight, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface ActionCenterProps {
  actions: any[];
}

const ActionCenter: React.FC<ActionCenterProps> = ({ actions }) => {
  const { navigateTo } = useNavigation();
  const [filter, setFilter] = useState<'All' | 'High'>('All');

  const filteredActions = filter === 'All' ? actions : actions.filter(a => a.urgency === 'High');

  const getIcon = (type: string) => {
      switch(type) {
          case 'Call': return <Phone size={14} />;
          case 'Estimate': return <FileText size={14} />;
          case 'Lead': return <Clock size={14} />;
          default: return <AlertCircle size={14} />;
      }
  };

  const getUrgencyColor = (u: string) => {
      if(u === 'High') return 'bg-red-50 text-red-600 border-red-100';
      if(u === 'Medium') return 'bg-amber-50 text-amber-600 border-amber-100';
      return 'bg-blue-50 text-blue-600 border-blue-100';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm h-full flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800 flex items-center">
                <Bell size={16} className="mr-2 text-slate-400" /> Action Center
            </h3>
            <div className="flex bg-white rounded-lg border border-slate-200 p-0.5">
                <button 
                    onClick={() => setFilter('All')}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${filter === 'All' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-900'}`}
                >
                    ALL
                </button>
                <button 
                    onClick={() => setFilter('High')}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${filter === 'High' ? 'bg-red-100 text-red-600' : 'text-slate-500 hover:text-red-600'}`}
                >
                    URGENT
                </button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {filteredActions.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <CheckCircle size={48} className="mb-2 opacity-10" />
                    <p className="text-xs">All caught up!</p>
                </div>
            ) : (
                filteredActions.map(action => (
                    <div 
                        key={action.id}
                        onClick={() => navigateTo(action.linkTo)}
                        className="group flex items-start p-3 hover:bg-slate-50 rounded-xl transition-all cursor-pointer border border-transparent hover:border-slate-100"
                    >
                        <div className={`p-2 rounded-full mr-3 shrink-0 ${getUrgencyColor(action.urgency)}`}>
                            {getIcon(action.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-0.5">
                                <h4 className="font-bold text-sm text-slate-800 truncate">{action.title}</h4>
                                {action.urgency === 'High' && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>}
                            </div>
                            <p className="text-xs text-slate-500 truncate">{action.subtitle}</p>
                        </div>
                        <ArrowRight size={14} className="text-slate-300 ml-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                ))
            )}
        </div>
    </div>
  );
};

export default ActionCenter;