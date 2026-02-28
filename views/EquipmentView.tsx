import React, { useState } from 'react';
import { useFleet } from '../contexts/FleetContext';
import { useProjects } from '../contexts/ProjectsContext';
import { Equipment, EquipmentStatus } from '../types';
import { Plus, Wrench, Search, Truck, MapPin, Calendar, CheckCircle2, Factory, X } from 'lucide-react';

const EquipmentView: React.FC = () => {
    const { equipment, addEquipment, updateEquipment } = useFleet();
    const { projects } = useProjects();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<EquipmentStatus | 'All'>('All');
    const [showAddModal, setShowAddModal] = useState(false);

    // Initial State for new equipment
    const [newEquip, setNewEquip] = useState<Partial<Equipment>>({
        name: '', type: 'Skid Steer', status: 'Available', location: 'Shop', notes: ''
    });

    const filteredEquipment = equipment.filter(e => {
        const nameMatch = (e.name || '').toLowerCase().includes(searchQuery.toLowerCase());
        const typeMatch = (e.type || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSearch = nameMatch || typeMatch;
        const matchesStatus = statusFilter === 'All' || e.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEquip.name || !newEquip.type) return;

        await addEquipment(newEquip as Omit<Equipment, 'id'>);
        setShowAddModal(false);
        setNewEquip({ name: '', type: 'Skid Steer', status: 'Available', location: 'Shop', notes: '' });
    };

    const StatusBadge = ({ status }: { status: EquipmentStatus }) => {
        const colors = {
            'Available': 'bg-emerald-100 text-emerald-800 border-emerald-200',
            'On Job': 'bg-blue-100 text-blue-800 border-blue-200',
            'In Shop': 'bg-amber-100 text-amber-800 border-amber-200'
        };
        return (
            <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${colors[status]}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="h-full flex flex-col pt-16 lg:pt-0">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-display font-bold text-charcoal flex items-center gap-3">
                        <Wrench className="text-emerald-500" size={32} />
                        Equipment & Fleet
                    </h1>
                    <p className="text-slate-500 mt-1">Manage machinery, vehicles, and maintenance logs.</p>
                </div>

                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-charcoal px-5 py-2.5 rounded-xl font-bold transition-all shadow-soft flex items-center gap-2"
                >
                    <Plus size={20} />
                    Add Equipment
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-cream-200">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search equipment by name or type..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-cream-200 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none"
                    />
                </div>
                <div className="flex gap-2 whitespace-nowrap overflow-x-auto custom-scrollbar pb-2 sm:pb-0">
                    {['All', 'Available', 'On Job', 'In Shop'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status as EquipmentStatus | 'All')}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${statusFilter === status
                                ? 'bg-charcoal text-white'
                                : 'bg-cream-50 text-slate-600 hover:bg-cream-100'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-8">
                    {filteredEquipment.length === 0 ? (
                        <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-2xl border border-cream-200 shadow-sm">
                            <Truck className="mx-auto mb-3 text-slate-300" size={48} />
                            <p>No equipment found matching your criteria.</p>
                        </div>
                    ) : (
                        filteredEquipment.map(item => (
                            <div key={item.id} className="bg-white rounded-2xl p-5 border border-cream-200 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                                            {item.type.includes('Truck') ? <Truck size={24} /> : <Factory size={24} />}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-charcoal text-lg">{item.name}</h3>
                                            <p className="text-xs text-slate-500 uppercase tracking-wider">{item.type}</p>
                                        </div>
                                    </div>
                                    <StatusBadge status={item.status} />
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-3 text-sm text-slate-600 bg-cream-50 p-2.5 rounded-lg">
                                        <MapPin size={16} className="text-slate-400" />
                                        <span className="font-medium truncate" title={item.location}>
                                            {item.location}
                                        </span>
                                    </div>
                                    {item.nextServiceDate && (
                                        <div className="flex items-center gap-3 text-sm text-slate-600 bg-cream-50 p-2.5 rounded-lg">
                                            <Calendar size={16} className="text-slate-400" />
                                            <span>Next Service: <strong className="text-charcoal">{new Date(item.nextServiceDate).toLocaleDateString()}</strong></span>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4 border-t border-cream-100 flex gap-2">
                                    <button className="flex-1 py-2 bg-cream-50 hover:bg-cream-100 text-charcoal text-sm font-bold rounded-xl transition-colors">
                                        View Details
                                    </button>
                                    <button className="flex-1 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 text-sm font-bold rounded-xl transition-colors">
                                        Log Maintenance
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Add Equipment Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95">
                        <div className="p-6 border-b border-cream-100 flex justify-between items-center bg-cream-50/50">
                            <h2 className="text-xl font-bold text-charcoal font-display">Add New Equipment</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-charcoal transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[70vh]">
                            <form id="add-equip-form" onSubmit={handleAddSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-charcoal mb-1">Equipment Name / ID*</label>
                                    <input
                                        type="text" required
                                        value={newEquip.name}
                                        onChange={e => setNewEquip({ ...newEquip, name: e.target.value })}
                                        className="w-full px-4 py-2 bg-cream-50 border border-cream-200 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                                        placeholder="e.g. Skid Steer #3"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-charcoal mb-1">Type*</label>
                                    <select
                                        required
                                        value={newEquip.type}
                                        onChange={e => setNewEquip({ ...newEquip, type: e.target.value })}
                                        className="w-full px-4 py-2 bg-cream-50 border border-cream-200 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                                    >
                                        <option value="Skid Steer">Skid Steer</option>
                                        <option value="Excavator">Excavator</option>
                                        <option value="Mower">Mower</option>
                                        <option value="Truck">Truck</option>
                                        <option value="Trailer">Trailer</option>
                                        <option value="Hand Tool">Hand Tool (Gas/Electric)</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-charcoal mb-1">Status</label>
                                        <select
                                            value={newEquip.status}
                                            onChange={e => setNewEquip({ ...newEquip, status: e.target.value as EquipmentStatus })}
                                            className="w-full px-4 py-2 bg-cream-50 border border-cream-200 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                                        >
                                            <option value="Available">Available</option>
                                            <option value="On Job">On Job</option>
                                            <option value="In Shop">In Shop</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-charcoal mb-1">Current Location</label>
                                        <input
                                            type="text"
                                            value={newEquip.location}
                                            onChange={e => setNewEquip({ ...newEquip, location: e.target.value })}
                                            className="w-full px-4 py-2 bg-cream-50 border border-cream-200 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                                            placeholder="Shop or Project Name"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-charcoal mb-1">Next Service Date</label>
                                    <input
                                        type="date"
                                        value={newEquip.nextServiceDate || ''}
                                        onChange={e => setNewEquip({ ...newEquip, nextServiceDate: e.target.value })}
                                        className="w-full px-4 py-2 bg-cream-50 border border-cream-200 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-charcoal mb-1">Internal Notes</label>
                                    <textarea
                                        rows={3}
                                        value={newEquip.notes || ''}
                                        onChange={e => setNewEquip({ ...newEquip, notes: e.target.value })}
                                        className="w-full px-4 py-2 bg-cream-50 border border-cream-200 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all resize-none"
                                        placeholder="Any specific care instructions or historical notes..."
                                    />
                                </div>
                            </form>
                        </div>
                        <div className="p-6 border-t border-cream-100 bg-cream-50/50 flex justify-end gap-3 rounded-b-3xl">
                            <button
                                type="button"
                                onClick={() => setShowAddModal(false)}
                                className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-cream-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="add-equip-form"
                                className="bg-emerald-500 hover:bg-emerald-600 text-charcoal px-6 py-2.5 rounded-xl font-bold transition-all shadow-md flex items-center gap-2"
                            >
                                <CheckCircle2 size={18} />
                                Save Equipment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EquipmentView;
