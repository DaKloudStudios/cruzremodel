import React, { useState } from 'react';
import { Lead, LeadStatus, CallLog } from '../../types';
import { useCRM } from '../../contexts/CRMContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { X, Phone, MapPin, Clock, UserCheck, Calendar, MessageSquare, Plus, Mail, DollarSign, Tag, Trash2 } from 'lucide-react';

interface LeadDetailPanelProps {
    lead: Lead;
    onClose: () => void;
    onConvert: (leadId: string) => void;
    onLogCall: (lead: Lead) => void;
}

const LeadDetailPanel: React.FC<LeadDetailPanelProps> = ({ lead, onClose, onConvert, onLogCall }) => {
    const { updateLead, updateLeadDesign, calls, updateLeadStatus, designProjects } = useCRM();
    const { navigateTo } = useNavigation();
    const [activeTab, setActiveTab] = useState<'Info' | 'Activity'>('Info');

    // Related Data
    const leadCalls = calls.filter(c => c.leadId === lead.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const inputClass = "w-full p-2.5 border border-cream-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-500 outline-none transition-all bg-white hover:bg-cream-50 focus:bg-white";

    return (
        <div className="absolute inset-y-0 right-0 w-[450px] bg-white shadow-2xl border-l border-cream-200 z-30 flex flex-col animate-in slide-in-from-right duration-300">

            {/* HEADER */}
            <div className="p-6 border-b border-cream-200 bg-cream-50 flex justify-between items-start">
                <div className="flex-1 pr-4">
                    <input
                        className="font-display font-bold text-2xl bg-transparent border-none p-0 focus:ring-0 text-charcoal w-full placeholder:text-slate-400"
                        value={lead.name}
                        onChange={(e) => updateLead(lead.id, { name: e.target.value })}
                        placeholder="Lead Name"
                    />
                    <div className="flex items-center text-xs text-slate-500 mt-2 space-x-2">
                        <span className={`px-2.5 py-0.5 rounded-full border font-bold uppercase ${lead.status === 'Won' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-white border-cream-200 text-slate-500'
                            }`}>
                            {lead.status}
                        </span>
                        <span className="text-slate-400">Created {new Date(lead.dateCreated).toLocaleDateString()}</span>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 text-slate-400 hover:text-charcoal hover:bg-cream-200 rounded-full transition-colors">
                    <X size={20} />
                </button>
            </div>

            {/* TABS */}
            <div className="flex border-b border-cream-200 px-6 bg-white overflow-x-auto no-scrollbar">
                <button
                    onClick={() => setActiveTab('Info')}
                    className={`py-4 mr-6 whitespace-nowrap text-sm font-bold border-b-2 transition-colors ${activeTab === 'Info' ? 'border-emerald-500 text-charcoal' : 'border-transparent text-slate-400 hover:text-charcoal'}`}
                >
                    Info & Strategy
                </button>
                <button
                    onClick={() => setActiveTab('Activity')}
                    className={`py-4 whitespace-nowrap text-sm font-bold border-b-2 transition-colors flex items-center ${activeTab === 'Activity' ? 'border-emerald-500 text-charcoal' : 'border-transparent text-slate-400 hover:text-charcoal'}`}
                >
                    Activity <span className="ml-2 bg-cream-100 text-charcoal px-1.5 py-0.5 rounded-full text-[10px]">{leadCalls.length}</span>
                </button>
            </div>

            {/* BODY */}
            <div className="flex-1 overflow-y-auto p-6 bg-white custom-scrollbar">

                {activeTab === 'Info' && (
                    <div className="space-y-6">
                        {/* Pipeline Strategy */}
                        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl space-y-3">
                            <div className="flex justify-between items-center">
                                <h5 className="text-xs font-bold text-emerald-700 uppercase flex items-center">
                                    <Clock size={12} className="mr-1.5" /> Next Action
                                </h5>
                                {lead.nextActionDate && (
                                    <span className={`text-[10px] font-bold ${new Date(lead.nextActionDate) < new Date() ? 'text-red-600 bg-red-50 px-2 py-0.5 rounded-full' : 'text-emerald-600'}`}>
                                        Due: {new Date(lead.nextActionDate).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                            <div className="flex space-x-2">
                                <input
                                    className="flex-1 text-sm p-2.5 border border-emerald-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white placeholder:text-emerald-300"
                                    placeholder="What needs to happen next?"
                                    value={lead.nextAction || ''}
                                    onChange={(e) => updateLead(lead.id, { nextAction: e.target.value })}
                                />
                                <input
                                    type="date"
                                    className="w-36 text-sm p-2.5 border border-emerald-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white text-emerald-800"
                                    value={lead.nextActionDate ? lead.nextActionDate.split('T')[0] : ''}
                                    onChange={(e) => updateLead(lead.id, { nextActionDate: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Contact Details */}
                        <div>
                            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 ml-1">Contact Information</h5>
                            <div className="space-y-3">
                                <div className="relative">
                                    <Phone className="absolute left-3.5 top-3 text-slate-400" size={16} />
                                    <input
                                        className={`${inputClass} pl-11`}
                                        placeholder="Phone Number"
                                        value={lead.phone}
                                        onChange={(e) => updateLead(lead.id, { phone: e.target.value })}
                                    />
                                </div>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-3 text-slate-400" size={16} />
                                    <input
                                        className={`${inputClass} pl-11`}
                                        placeholder="Email Address"
                                        value={lead.email || ''}
                                        onChange={(e) => updateLead(lead.id, { email: e.target.value })}
                                    />
                                </div>
                                <div className="relative">
                                    <MapPin className="absolute left-3.5 top-3 text-slate-400" size={16} />
                                    <input
                                        className={`${inputClass} pl-11`}
                                        placeholder="Property Address"
                                        value={lead.address}
                                        onChange={(e) => updateLead(lead.id, { address: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Deal Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 block ml-1">Est. Value</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3.5 top-3 text-slate-400" size={14} />
                                    <input
                                        type="number"
                                        className={`${inputClass} pl-9 font-bold text-charcoal`}
                                        value={lead.value || ''}
                                        onChange={(e) => updateLead(lead.id, { value: Number(e.target.value) })}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 block ml-1">Service Type</label>
                                <select
                                    className={inputClass}
                                    value={lead.serviceInterest}
                                    onChange={(e) => updateLead(lead.id, { serviceInterest: e.target.value })}
                                >
                                    <option value="">Unknown</option>
                                    <option value="Maintenance">Maintenance</option>
                                    <option value="Installation">Installation</option>
                                    <option value="Clean Up">Clean Up</option>
                                    <option value="Irrigation">Irrigation</option>
                                </select>
                            </div>
                        </div>

                        {/* Design Visualizer Link */}
                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                            <h5 className="text-xs font-bold text-slate-700 uppercase flex items-center relative z-10">
                                <Tag size={12} className="mr-1.5 text-emerald-500" /> Presentation Visuals
                            </h5>
                            <p className="text-[10px] text-slate-500 relative z-10 hidden sm:block">Attach a portfolio design to present to this client.</p>
                            <div className="flex flex-col sm:flex-row gap-2 relative z-10">
                                <select
                                    className={`${inputClass} flex-1`}
                                    value={lead.designProjectId || ''}
                                    onChange={(e) => updateLeadDesign(lead.id, e.target.value)}
                                >
                                    <option value="">-- No Design Attached --</option>
                                    {designProjects.map(dp => (
                                        <option key={dp.id} value={dp.id}>{dp.title}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={() => navigateTo('DesignShowcase')}
                                    disabled={!lead.designProjectId}
                                    className={`px-4 py-2 font-bold rounded-xl text-sm transition-all whitespace-nowrap ${lead.designProjectId
                                            ? 'bg-charcoal text-white hover:bg-slate-800 shadow-md'
                                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                        }`}
                                >
                                    Present
                                </button>
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Notes</h5>
                            <textarea
                                className={`${inputClass} h-32 resize-none leading-relaxed`}
                                placeholder="Customer preferences, gate codes, or details..."
                                value={lead.notes}
                                onChange={(e) => updateLead(lead.id, { notes: e.target.value })}
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'Activity' && (
                    <div className="space-y-4">
                        <button
                            onClick={() => onLogCall(lead)}
                            className="w-full py-4 border-2 border-dashed border-cream-200 rounded-2xl text-slate-400 font-bold hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all flex items-center justify-center group"
                        >
                            <Phone size={20} className="mr-2 group-hover:scale-110 transition-transform" /> Log Call / Interaction
                        </button>

                        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:h-full before:w-0.5 before:bg-cream-200 before:z-0 py-2">
                            {leadCalls.length === 0 && <p className="text-center text-slate-400 text-sm py-8 pl-8 relative z-10 bg-white rounded-xl border border-dashed border-cream-100 scale-95 opacity-70">No activity logged.</p>}
                            {leadCalls.map(call => (
                                <div key={call.id} className="relative z-10 flex items-start group">
                                    <div className={`flex-shrink-0 w-8 h-8 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 ${call.outcome === 'Scheduled Estimate' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                                        }`}>
                                        <Phone size={12} />
                                    </div>
                                    <div className="ml-4 bg-cream-50 p-4 rounded-xl border border-cream-100 flex-1 hover:border-emerald-200 transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-bold text-charcoal text-sm">{call.outcome}</span>
                                            <span className="text-[10px] text-slate-400 font-bold bg-white px-2 py-0.5 rounded-full">{new Date(call.date).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-xs text-slate-600 leading-relaxed">{call.notes}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>

            {/* FOOTER ACTIONS */}
            <div className="p-6 border-t border-cream-200 bg-cream-50">
                {lead.status !== 'Won' ? (
                    <div className="flex gap-3">
                        <button
                            onClick={() => updateLeadStatus(lead.id, LeadStatus.LOST)}
                            className="flex-1 py-3.5 bg-white border border-cream-200 text-slate-500 font-bold rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all shadow-sm"
                        >
                            Mark Lost
                        </button>
                        <button
                            onClick={() => onConvert(lead.id)}
                            className="flex-[2] py-3.5 bg-charcoal text-white font-bold rounded-xl hover:bg-slate-800 shadow-lg shadow-slate-900/10 hover:-translate-y-0.5 transition-all flex items-center justify-center border border-charcoal"
                        >
                            <UserCheck size={18} className="mr-2" /> Convert to Client
                        </button>
                    </div>
                ) : (
                    <div className="text-center p-3.5 bg-emerald-100 text-emerald-700 font-bold rounded-xl border border-emerald-200 flex items-center justify-center">
                        <UserCheck size={20} className="mr-2" /> Client Converted
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeadDetailPanel;