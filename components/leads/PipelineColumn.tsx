import React from 'react';
import { Lead, LeadStatus } from '../../types';
import LeadCard from './LeadCard';

interface PipelineColumnProps {
    status: LeadStatus;
    label: string;
    leads: Lead[];
    totalValue: number;
    onDrop: (e: React.DragEvent, status: LeadStatus) => void;
    onDragOver: (e: React.DragEvent) => void;
    onCardClick: (lead: Lead) => void;
    onDragStart: (e: React.DragEvent, id: string) => void;
}

const PipelineColumn: React.FC<PipelineColumnProps> = ({
    status, label, leads, totalValue, onDrop, onDragOver, onCardClick, onDragStart
}) => {

    const isWon = status === LeadStatus.WON;
    const isLost = status === LeadStatus.LOST;

    return (
        <div
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, status)}
            className={`w-80 flex-shrink-0 flex flex-col rounded-[2rem] h-full transition-colors ${isWon ? 'bg-emerald-50/50' :
                    isLost ? 'bg-slate-100/50' :
                        'bg-cream-100/40' // Subtle column background
                }`}
        >
            {/* Header */}
            <div className={`p-5 sticky top-0 z-10 backdrop-blur-sm rounded-t-[2rem] border-b border-transparent ${isWon ? 'bg-emerald-100/80 text-emerald-900 icon-emerald' :
                    isLost ? 'bg-slate-200/50 text-slate-600' :
                        'bg-cream-100/80 text-charcoal'
                }`}>
                <div className="flex justify-between items-center mb-1">
                    <h3 className="font-display font-bold text-sm tracking-tight uppercase">{label}</h3>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full shadow-sm ${isWon ? 'bg-white text-emerald-700' :
                            isLost ? 'bg-white text-slate-500' :
                                'bg-white text-charcoal'
                        }`}>{leads.length}</span>
                </div>
                {totalValue > 0 && (
                    <div className="flex items-center gap-2 mt-3">
                        <div className={`h-1.5 flex-1 rounded-full overflow-hidden ${isWon ? 'bg-emerald-200' : 'bg-cream-200'}`}>
                            <div className={`h-full rounded-full ${isWon ? 'bg-emerald-500' : 'bg-emerald-400'}`} style={{ width: '60%' }}></div>
                        </div>
                        <span className="text-[10px] font-bold font-mono opacity-60">${totalValue > 1000 ? (totalValue / 1000).toFixed(1) + 'k' : totalValue}</span>
                    </div>
                )}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
                {leads.map(lead => (
                    <LeadCard
                        key={lead.id}
                        lead={lead}
                        onClick={onCardClick}
                        onDragStart={onDragStart}
                    />
                ))}
                {leads.length === 0 && (
                    <div className="h-32 flex flex-col items-center justify-center text-slate-400/50 text-xs border-2 border-dashed border-cream-200 rounded-2xl m-2">
                        <span className="font-bold uppercase tracking-widest">Empty</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PipelineColumn;