import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CallLog, CallOutcome, Client, Lead } from '../types';
import { useCRM } from '../contexts/CRMContext';
import { useNavigation } from '../contexts/NavigationContext';
import { 
  X, Phone, Calendar, User, Search, ArrowRight, 
  MessageSquare, Clock, CheckCircle, AlertCircle, 
  UserPlus, FileText
} from 'lucide-react';

interface CallDetailProps {
  call?: CallLog; // If undefined, we are in "Log New Call" mode
  onClose: () => void;
}

const OUTCOMES: CallOutcome[] = [
  'No Answer', 'Left Voicemail', 'Interested', 'Scheduled Estimate', 
  'Not Interested', 'Service Question', 'Other'
];

const CallDetail: React.FC<CallDetailProps> = ({ call, onClose }) => {
  const { addCall, clients, leads, addLead } = useCRM();
    const { navigateTo, setSearchQuery } = useNavigation();
  
  // Form State
  const [formData, setFormData] = useState({
    contactName: '',
    phone: '',
    type: 'Outbound' as 'Inbound' | 'Outbound',
    outcome: 'No Answer' as CallOutcome,
    notes: '',
    followUpDate: '',
    durationMinutes: 5
  });

  // Linking State
  const [searchTerm, setSearchTerm] = useState('');
  const [linkedEntity, setLinkedEntity] = useState<{ id: string, type: 'Client' | 'Lead', name: string } | null>(null);
  const [showLinkSearch, setShowLinkSearch] = useState(false);

  // Initialize data if viewing existing call
  useEffect(() => {
    if (call) {
      setFormData({
        contactName: call.contactName,
        phone: call.phone,
        type: call.type,
        outcome: call.outcome,
        notes: call.notes,
        followUpDate: call.followUpDate ? new Date(call.followUpDate).toISOString().split('T')[0] : '',
        durationMinutes: call.durationMinutes
      });
      if (call.clientId) {
          const c = clients.find(cl => cl.id === call.clientId);
          if (c) setLinkedEntity({ id: c.id, type: 'Client', name: c.name });
      } else if (call.leadId) {
          const l = leads.find(le => le.id === call.leadId);
          if (l) setLinkedEntity({ id: l.id, type: 'Lead', name: l.name });
      }
    }
  }, [call, clients, leads]);

  // Handle Smart Search for Linking
  const searchResults = showLinkSearch ? [
      ...clients.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone.includes(searchTerm)).map(c => ({ ...c, type: 'Client' as const })),
      ...leads.filter(l => l.name.toLowerCase().includes(searchTerm.toLowerCase()) || l.phone.includes(searchTerm)).map(l => ({ ...l, type: 'Lead' as const }))
  ].slice(0, 5) : [];

  const handleLinkSelect = (entity: any) => {
      setLinkedEntity({ id: entity.id, type: entity.type, name: entity.name });
      setFormData(prev => ({
          ...prev,
          contactName: entity.name,
          phone: entity.phone
      }));
      setShowLinkSearch(false);
      setSearchTerm('');
  };

  const handleSave = () => {
      // In a real app, validation goes here
      const newCallData = {
          contactName: formData.contactName || 'Unknown',
          phone: formData.phone,
          date: call ? call.date : new Date().toISOString(),
          durationMinutes: formData.durationMinutes,
          type: formData.type,
          outcome: formData.outcome,
          notes: formData.notes,
          followUpDate: formData.followUpDate ? new Date(formData.followUpDate).toISOString() : undefined,
          clientId: linkedEntity?.type === 'Client' ? linkedEntity.id : undefined,
          leadId: linkedEntity?.type === 'Lead' ? linkedEntity.id : undefined
      };

      if (call) {
          // Update logic would go here if we had an updateCall method exposed
          console.log("Updating call not implemented in this demo context, but data is:", newCallData);
      } else {
          addCall(newCallData);
      }
      onClose();
  };

  const handleCreateLead = () => {
      addLead({
          name: formData.contactName,
          phone: formData.phone,
          address: 'TBD', // Placeholder
          serviceInterest: 'From Call',
          notes: `Created from call log. ${formData.notes}`
      });
      onClose();
      navigateTo('Leads');
  };

  const inputClass = "w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all";

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end">
        <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <div>
                    <h2 className="font-bold text-lg text-slate-800">{call ? 'Call Details' : 'Log Communication'}</h2>
                    <p className="text-xs text-slate-500">{call ? new Date(call.date).toLocaleString() : 'Record a new interaction'}</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                    <X size={20} />
                </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* 1. Identity / Linker */}
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 space-y-3 relative">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-blue-700 uppercase">Contact</label>
                        {!linkedEntity && (
                            <button 
                                onClick={() => setShowLinkSearch(!showLinkSearch)}
                                className="text-xs flex items-center text-blue-600 hover:text-blue-800 font-medium"
                            >
                                <Search size={12} className="mr-1" /> Link Existing
                            </button>
                        )}
                    </div>

                    {showLinkSearch && (
                        <div className="absolute top-10 left-0 right-0 z-10 mx-4 bg-white shadow-xl rounded-lg border border-slate-200 overflow-hidden">
                            <input 
                                autoFocus
                                className="w-full p-3 text-sm border-b border-slate-100 outline-none"
                                placeholder="Search clients or leads..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                            <div className="max-h-40 overflow-y-auto">
                                {searchResults.map(res => (
                                    <button 
                                        key={res.id}
                                        onClick={() => handleLinkSelect(res)}
                                        className="w-full text-left p-2 hover:bg-slate-50 text-sm border-b border-slate-50 flex justify-between"
                                    >
                                        <span>{res.name}</span>
                                        <span className="text-xs text-slate-400 uppercase">{res.type}</span>
                                    </button>
                                ))}
                                {searchResults.length === 0 && searchTerm && (
                                    <div className="p-3 text-xs text-slate-400 text-center">No matches found</div>
                                )}
                            </div>
                        </div>
                    )}

                    {linkedEntity ? (
                        <div className="flex items-center justify-between bg-white p-2 rounded border border-blue-200">
                            <div className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3 ${linkedEntity.type === 'Client' ? 'bg-green-500' : 'bg-amber-500'}`}>
                                    {linkedEntity.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800">{linkedEntity.name}</p>
                                    <p className="text-[10px] text-slate-500 uppercase">{linkedEntity.type}</p>
                                </div>
                            </div>
                            <button onClick={() => setLinkedEntity(null)} className="text-slate-400 hover:text-red-500"><X size={16} /></button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            <input 
                                className={inputClass}
                                placeholder="Name"
                                value={formData.contactName}
                                onChange={e => setFormData({...formData, contactName: e.target.value})}
                            />
                            <input 
                                className={inputClass}
                                placeholder="Phone"
                                value={formData.phone}
                                onChange={e => setFormData({...formData, phone: e.target.value})}
                            />
                        </div>
                    )}
                </div>

                {/* 2. Call Info */}
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Direction</label>
                            <div className="flex bg-slate-100 p-1 rounded-lg">
                                <button 
                                    onClick={() => setFormData({...formData, type: 'Inbound'})}
                                    className={`flex-1 py-1.5 text-xs font-bold rounded transition-all ${formData.type === 'Inbound' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
                                >
                                    Inbound
                                </button>
                                <button 
                                    onClick={() => setFormData({...formData, type: 'Outbound'})}
                                    className={`flex-1 py-1.5 text-xs font-bold rounded transition-all ${formData.type === 'Outbound' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
                                >
                                    Outbound
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Duration (min)</label>
                            <input 
                                type="number"
                                className={inputClass}
                                value={formData.durationMinutes}
                                onChange={e => setFormData({...formData, durationMinutes: Number(e.target.value)})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Outcome</label>
                        <div className="flex flex-wrap gap-2">
                            {OUTCOMES.map(out => (
                                <button
                                    key={out}
                                    onClick={() => setFormData({...formData, outcome: out})}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                        formData.outcome === out 
                                        ? 'bg-slate-800 text-white border-slate-800' 
                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                    }`}
                                >
                                    {out}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                        <textarea 
                            className={`${inputClass} h-24 resize-none`}
                            placeholder="What was discussed?"
                            value={formData.notes}
                            onChange={e => setFormData({...formData, notes: e.target.value})}
                        />
                    </div>

                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                        <label className="flex items-center text-sm font-bold text-amber-900 mb-2">
                            <Clock size={16} className="mr-2" /> Follow-up Required?
                        </label>
                        <input 
                            type="date" 
                            className={inputClass}
                            value={formData.followUpDate}
                            onChange={e => setFormData({...formData, followUpDate: e.target.value})}
                        />
                    </div>
                </div>

            </div>

            {/* Footer / Actions */}
            <div className="p-5 border-t border-slate-200 bg-slate-50">
                {!call && !linkedEntity && formData.contactName && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100 flex justify-between items-center">
                        <span className="text-xs text-blue-700 font-medium">Unknown Contact</span>
                        <button 
                            onClick={handleCreateLead}
                            className="text-xs bg-white border border-blue-200 text-blue-700 px-3 py-1.5 rounded font-bold hover:bg-blue-50"
                        >
                            <UserPlus size={12} className="inline mr-1"/> Create Lead
                        </button>
                    </div>
                )}

                <div className="flex space-x-3">
                    <button onClick={onClose} className="flex-1 py-3 text-slate-500 font-medium hover:bg-slate-100 rounded-lg transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="flex-1 py-3 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 shadow-md transition-colors">
                        {call ? 'Update Log' : 'Save Call'}
                    </button>
                </div>
            </div>
        </div>
    </div>,
    document.body
  );
};

export default CallDetail;