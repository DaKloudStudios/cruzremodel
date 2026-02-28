import React, { useState } from 'react';
import { useLeadsBoard } from '../hooks/useLeadsBoard';
import { useCRM } from '../contexts/CRMContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useAuth } from '../contexts/AuthContext';
import { useConfirm } from '../contexts/DialogContext';
import { LeadStatus, Lead } from '../types';
import PipelineColumn from '../components/leads/PipelineColumn';
import LeadDetailPanel from '../components/leads/LeadDetailPanel';
import LeadModal from '../components/LeadModal';
import CallDetail from '../components/CallDetail';
import {
    Filter, Plus, Search, DollarSign, Clock, Users,
    ListFilter
} from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

const PIPELINE_STAGES: LeadStatus[] = [
    LeadStatus.NEW,
    LeadStatus.CONTACTED,
    LeadStatus.SITE_VISIT,
    LeadStatus.ESTIMATE_NEEDED,
    LeadStatus.PROPOSAL_SENT,
    LeadStatus.WON,
    LeadStatus.LOST
];

const STAGE_LABELS: Record<LeadStatus, string> = {
    [LeadStatus.NEW]: 'New Lead',
    [LeadStatus.CONTACTED]: 'Contacted',
    [LeadStatus.SITE_VISIT]: 'Site Visit',
    [LeadStatus.ESTIMATE_NEEDED]: 'Est. Needed',
    [LeadStatus.PROPOSAL_SENT]: 'Proposal Sent',
    [LeadStatus.WON]: 'Won',
    [LeadStatus.LOST]: 'Lost'
};

const LeadsView: React.FC = () => {
    const {
        filteredLeads, filterMode, setFilterMode,
        handleDragStart, handleDragOver, handleDrop, getColumnStats
    } = useLeadsBoard();

    const { addLead, convertLeadToClient } = useCRM();
    const { searchQuery, setSearchQuery } = useNavigation();
    const { userRole } = useAuth();
    const { confirm } = useConfirm();

    // UI State
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
    const [isCallModalOpen, setIsCallModalOpen] = useState(false);
    const [leadToLogCall, setLeadToLogCall] = useState<Lead | null>(null);

    // Permissions
    const canAddLead = userRole === 'Admin' || userRole === 'Office';

    // --- ACTIONS ---

    const handleConvert = async (leadId: string) => {
        const lead = filteredLeads.find(l => l.id === leadId);
        if (!lead) return;

        const isConfirmed = await confirm({
            title: "Convert to Client",
            message: `Convert ${lead.name} to a Client? This will create a permanent record and mark this deal as WON.`,
            type: "success",
            confirmText: "Convert & Win",
            cancelText: "Cancel"
        });

        if (isConfirmed) {
            convertLeadToClient(leadId);
            setSelectedLead(null);
        }
    };

    const handleLogCall = (lead: Lead) => {
        setLeadToLogCall(lead);
        setIsCallModalOpen(true);
    };

    // --- RENDER ---

    return (
        <div className="h-full flex flex-col overflow-hidden relative animate-in fade-in">

            {/* TOOLBAR */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8 shrink-0 pt-2">
                <div className="flex items-center space-x-4 w-full md:w-auto">
                    <div className="relative group w-full md:w-80">
                        <Input
                            leftIcon={<Search size={18} />}
                            placeholder="Search pipeline..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex bg-white rounded-xl p-1.5 border border-cream-200 shadow-sm">
                        <button
                            onClick={() => setFilterMode('All')}
                            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all shadow-sm ${filterMode === 'All' ? 'bg-forest-900 text-white shadow-md border border-forest-800' : 'text-slate-500 hover:bg-cream-50 shadow-none'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilterMode('Overdue')}
                            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center shadow-sm ${filterMode === 'Overdue' ? 'bg-forest-900 text-white shadow-md border border-forest-800' : 'text-slate-500 hover:bg-cream-50 shadow-none'}`}
                        >
                            <Clock size={14} className="mr-1.5" /> Due
                        </button>
                        <button
                            onClick={() => setFilterMode('HighValue')}
                            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center shadow-sm ${filterMode === 'HighValue' ? 'bg-forest-900 text-white shadow-md border border-forest-800' : 'text-slate-500 hover:bg-cream-50 shadow-none'}`}
                        >
                            <DollarSign size={14} className="mr-1.5" /> $5k+
                        </button>
                    </div>
                </div>

                {canAddLead && (
                    <Button
                        onClick={() => setIsLeadModalOpen(true)}
                        leftIcon={<Plus size={18} />}
                    >
                        Add Lead
                    </Button>
                )}
            </div>

            {/* KANBAN BOARD */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden pb-6 -mx-4 px-4 md:mx-0 md:px-0">
                <div className="flex h-full space-x-6 min-w-max pb-4">
                    {PIPELINE_STAGES.map(stage => {
                        const { totalValue } = getColumnStats(stage);
                        const stageLeads = filteredLeads.filter(l => l.status === stage);

                        return (
                            <PipelineColumn
                                key={stage}
                                status={stage}
                                label={STAGE_LABELS[stage]}
                                leads={stageLeads}
                                totalValue={totalValue}
                                onDragStart={handleDragStart}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                onCardClick={setSelectedLead}
                            />
                        );
                    })}
                </div>
            </div>

            {/* SLIDE-OVER DETAIL */}
            {selectedLead && (
                <LeadDetailPanel
                    lead={selectedLead}
                    onClose={() => setSelectedLead(null)}
                    onConvert={handleConvert}
                    onLogCall={handleLogCall}
                />
            )}

            {/* MODALS */}
            {isLeadModalOpen && (
                <LeadModal
                    onSave={(data) => addLead(data as any)}
                    onClose={() => setIsLeadModalOpen(false)}
                />
            )}

            {isCallModalOpen && (
                <CallDetail
                    onClose={() => { setIsCallModalOpen(false); setLeadToLogCall(null); }}
                // Pre-fill logic is handled inside CallDetail via linking, but passing context would be better if refactored further.
                // For now, CallDetail supports 'logging new call', user just needs to confirm lead name.
                // A refinement would be passing `initialLinkedEntity` to CallDetail.
                />
            )}

        </div>
    );
};

export default LeadsView;
