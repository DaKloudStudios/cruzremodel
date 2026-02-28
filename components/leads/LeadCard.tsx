import React from 'react';
import { Lead, LeadStatus } from '../../types';
import { MapPin, Clock, DollarSign, AlertCircle } from 'lucide-react';

interface LeadCardProps {
  lead: Lead;
  onClick: (lead: Lead) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead, onClick, onDragStart }) => {

  const isOverdue = lead.nextActionDate
    ? new Date(lead.nextActionDate) < new Date(new Date().setHours(0, 0, 0, 0))
    : false;

  const isWon = lead.status === LeadStatus.WON;
  const isLost = lead.status === LeadStatus.LOST;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, lead.id)}
      onClick={() => onClick(lead)}
      className={`
        bg-white p-5 rounded-[1.25rem] border transition-all duration-300 group relative cursor-grab active:cursor-grabbing hover:-translate-y-1 hover:shadow-soft
        ${isOverdue && !isWon && !isLost ? 'border-l-4 border-l-red-400 border-y-cream-100 border-r-cream-100' : 'border-cream-100 hover:border-emerald-300'}
        ${isWon ? 'opacity-90 bg-emerald-50/30 border-emerald-200' : ''}
        ${isLost ? 'opacity-60 bg-slate-50 border-slate-200 grayscale-[0.5]' : ''}
      `}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0 pr-2">
          <h4 className="font-bold font-display text-charcoal text-base truncate group-hover:text-emerald-600 transition-colors">{lead.name}</h4>
          <div className="flex items-center text-xs text-slate-400 mt-1 font-medium">
            <MapPin size={12} className="mr-1 flex-shrink-0 opacity-70" />
            <span className="truncate">{lead.address || 'No address provided'}</span>
          </div>
        </div>
        {(lead.value || 0) > 0 && (
          <div className={`text-[10px] font-bold px-2 py-1 rounded-lg border flex items-center shadow-sm ${isWon ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-cream-100 text-charcoal border-cream-200'}`}>
            <DollarSign size={10} className="mr-0.5" />
            {(lead.value || 0).toLocaleString()}
          </div>
        )}
      </div>

      {/* Tags Row */}
      <div className="flex flex-wrap gap-2 mb-4">
        {lead.serviceInterest && (
          <span className="text-[10px] bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider border border-blue-100">
            {lead.serviceInterest}
          </span>
        )}
        {lead.tags?.slice(0, 2).map(tag => (
          <span key={tag} className="text-[10px] bg-slate-50 text-slate-500 px-2.5 py-1 rounded-lg border border-slate-100 font-semibold">
            {tag}
          </span>
        ))}
      </div>

      {/* Action Footer */}
      {lead.nextAction && !isWon && !isLost && (
        <div className={`mt-2 pt-3 border-t border-cream-100 text-xs flex items-center justify-between ${isOverdue ? 'text-red-500 font-bold' : 'text-slate-400 font-medium'}`}>
          <div className="flex items-center truncate max-w-[150px] bg-cream-50/50 px-2 py-1 rounded-md">
            {isOverdue ? <AlertCircle size={12} className="mr-1.5 text-red-400" /> : <Clock size={12} className="mr-1.5 opacity-70" />}
            {lead.nextAction}
          </div>
          <span className={`text-[10px] ${isOverdue ? 'text-red-500 bg-red-50 px-2 py-0.5 rounded-full' : 'text-slate-400'}`}>
            {new Date(lead.nextActionDate!).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        </div>
      )}
    </div>
  );
};

export default LeadCard;