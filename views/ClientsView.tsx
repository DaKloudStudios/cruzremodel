import React, { useState } from 'react';
import { useCRM } from '../contexts/CRMContext';
import { useProjects } from '../contexts/ProjectsContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useAuth } from '../contexts/AuthContext';
import { Client, ClientTag } from '../types';
import ClientDetail from '../components/ClientDetail';
import ClientModal from '../components/ClientModal';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import {
    Users, Search, Plus, MapPin, Briefcase,
    DollarSign, Phone, Filter, Star
} from 'lucide-react';

import LeadsView from './LeadsView';

interface ClientsViewProps {
    initialTab?: 'Clients' | 'Leads';
}

const ClientsView: React.FC<ClientsViewProps> = ({ initialTab = 'Clients' }) => {
    const { clients, addClient, updateClient } = useCRM();
    const { projects } = useProjects();
    const { searchQuery, setSearchQuery } = useNavigation();
    const { userRole } = useAuth();
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | undefined>(undefined);
    const [filterTag, setFilterTag] = useState<ClientTag | 'All'>('All');
    const [activeTab, setActiveTab] = useState<'Clients' | 'Leads'>(initialTab);

    // Permission Check
    const canCreateClient = userRole === 'Admin' || userRole === 'Office';

    // --- KPIS ---
    const totalClients = clients.length;
    const activeClients = clients.filter(c => projects.some(p => p.clientId === c.id && p.status === 'In Progress')).length;
    const vipClients = clients.filter(c => c.tags?.includes('VIP')).length;

    // --- FILTERING ---
    const filteredClients = clients.filter(c => {
        const matchesSearch =
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.phone.includes(searchQuery);

        const matchesTag = filterTag === 'All' || (c.tags && c.tags.includes(filterTag));

        return matchesSearch && matchesTag;
    }).sort((a, b) => b.totalSpent - a.totalSpent); // Sort by LTV by default

    const handleSave = (data: any) => {
        if (editingClient) {
            updateClient(editingClient.id, data);
        } else {
            addClient(data);
        }
        setIsModalOpen(false);
        setEditingClient(undefined);
    };

    const openEditModal = () => {
        setEditingClient(selectedClient || undefined);
        setIsModalOpen(true);
    };

    // --- SUB-COMPONENT: CLIENT CARD ---
    const ClientCard: React.FC<{ client: Client }> = ({ client }) => {
        const activeProjectCount = projects.filter(p => p.clientId === client.id && p.status === 'In Progress').length;

        return (
            <Card
                hover
                onClick={() => setSelectedClient(client)}
                className="cursor-pointer group flex flex-col justify-between h-full"
            >
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-display font-bold transition-colors shadow-sm ${client.tags?.includes('VIP') ? 'bg-emerald-100 text-emerald-700' : 'bg-cream-100 text-charcoal group-hover:bg-emerald-50 group-hover:text-emerald-600'}`}>
                                {client.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-display font-bold text-charcoal group-hover:text-emerald-600 transition-colors line-clamp-1 text-lg">{client.name}</h3>
                                <p className="text-xs text-slate-500 flex items-center mt-1 line-clamp-1 font-medium">
                                    <MapPin size={10} className="mr-1 opacity-70" /> {client.address}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-2 h-6 overflow-hidden">
                        {client.tags?.slice(0, 3).map(tag => (
                            <span key={tag} className="text-[10px] bg-white text-slate-500 px-2 py-0.5 rounded-full border border-cream-200 font-bold tracking-wide uppercase">{tag}</span>
                        ))}
                    </div>
                </div>

                <div className="bg-cream-50/50 p-4 border-t border-cream-100 flex justify-between items-center text-xs backdrop-blur-sm group-hover:bg-cream-100/30 transition-colors">
                    <div className="text-slate-500 font-medium flex items-center">
                        <Briefcase size={14} className="mr-1.5 opacity-60" />
                        {activeProjectCount > 0 ? (
                            <span className="text-emerald-600 font-bold">{activeProjectCount} Active Job</span>
                        ) : (
                            <span>No Active Jobs</span>
                        )}
                    </div>
                    <div className="font-bold text-charcoal flex items-center bg-white px-2 py-1 rounded-md shadow-sm border border-cream-100">
                        <DollarSign size={12} className="mr-0.5 text-emerald-500" /> {client.totalSpent.toLocaleString()}
                    </div>
                </div>
            </Card>
        );
    };

    return (
        <div className="space-y-8 h-full flex flex-col pt-2">

            {/* TAB SWITCHER */}
            <div className="flex space-x-1 bg-cream-100 p-1 rounded-xl w-fit mb-4 shrink-0">
                <button
                    onClick={() => setActiveTab('Clients')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'Clients' ? 'bg-forest-900 text-white shadow-md' : 'text-slate-500 hover:text-charcoal'}`}
                >
                    Clients
                </button>
                <button
                    onClick={() => setActiveTab('Leads')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'Leads' ? 'bg-forest-900 text-white shadow-md' : 'text-slate-500 hover:text-charcoal'}`}
                >
                    Leads Pipeline
                </button>
            </div>

            {activeTab === 'Leads' ? (
                <LeadsView />
            ) : (
                <>
                    {/* CLIENTS VIEW CONTENT */}
                    {/* HEADER STATS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
                        <Card hover className="flex items-center p-6">
                            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl mr-5 shadow-sm ring-1 ring-blue-100"><Users size={24} /></div>
                            <div>
                                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-0.5">Total Clients</p>
                                <p className="text-3xl font-display font-bold text-charcoal">{totalClients}</p>
                            </div>
                        </Card>
                        <Card hover className="flex items-center p-6">
                            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl mr-5 shadow-sm ring-1 ring-emerald-100"><Briefcase size={24} /></div>
                            <div>
                                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-0.5">Active Jobs</p>
                                <p className="text-3xl font-display font-bold text-charcoal">{activeClients}</p>
                            </div>
                        </Card>
                        <Card hover className="flex items-center p-6">
                            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl mr-5 shadow-sm ring-1 ring-emerald-100"><Star size={24} /></div>
                            <div>
                                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-0.5">VIP Clients</p>
                                <p className="text-3xl font-display font-bold text-charcoal">{vipClients}</p>
                            </div>
                        </Card>
                    </div>

                    {/* CONTROLS */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 shrink-0">
                        <div className="flex items-center space-x-4 w-full md:w-auto">
                            <div className="relative group w-full md:w-80">
                                <Input
                                    leftIcon={<Search size={18} />}
                                    placeholder="Search clients..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex bg-white border border-cream-200 rounded-xl p-1.5 shadow-sm">
                                <button
                                    onClick={() => setFilterTag('All')}
                                    className={`px-5 py-2 rounded-lg text-xs font-bold transition-all shadow-sm ${filterTag === 'All' ? 'bg-forest-900 text-white shadow-md border border-forest-800' : 'text-slate-500 hover:bg-cream-50 shadow-none'}`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setFilterTag('VIP')}
                                    className={`px-5 py-2 rounded-lg text-xs font-bold transition-all shadow-sm ${filterTag === 'VIP' ? 'bg-forest-900 text-white shadow-md border border-forest-800' : 'text-slate-500 hover:bg-cream-50 shadow-none'}`}
                                >
                                    VIP
                                </button>
                            </div>
                        </div>

                        {canCreateClient && (
                            <Button
                                onClick={() => { setEditingClient(undefined); setIsModalOpen(true); }}
                                leftIcon={<Plus size={18} />}
                            >
                                New Client
                            </Button>
                        )}
                    </div>

                    {/* GRID */}
                    <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar pr-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6">
                            {filteredClients.map(client => (
                                <ClientCard key={client.id} client={client} />
                            ))}
                        </div>

                        {filteredClients.length === 0 && (
                            <div className="h-64 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-cream-200 rounded-[2rem] bg-cream-50/50">
                                <Users size={48} className="mb-4 opacity-20 text-charcoal" />
                                <p className="font-medium text-lg">No clients found matching "{searchQuery}"</p>
                                <p className="text-sm mt-2 opacity-60">Try adjusting your search filters</p>
                            </div>
                        )}
                    </div>

                    {/* DETAIL OVERLAY */}
                    {selectedClient && (
                        <ClientDetail
                            client={selectedClient}
                            onClose={() => setSelectedClient(null)}
                            onEdit={openEditModal}
                        />
                    )}

                    {/* EDIT MODAL */}
                    {isModalOpen && (
                        <ClientModal
                            client={editingClient}
                            onClose={() => setIsModalOpen(false)}
                            onSave={handleSave}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default ClientsView;
