
import React, { useState } from 'react';
import { useCRM } from '../contexts/CRMContext';
import { Client, Appointment } from '../types';
import { X, Search, Calendar, Clock, MapPin, User, Check } from 'lucide-react';

interface ScheduleModalProps {
  onClose: () => void;
  selectedDate?: Date | null;
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({ onClose, selectedDate }) => {
  const { clients, addAppointment } = useCRM();
  const [step, setStep] = useState<'Client' | 'Details'>('Client');
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Form State
  const [formData, setFormData] = useState({
      title: '',
      date: selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '10:00',
      type: 'Site Visit' as Appointment['type'],
      notes: ''
  });

  const filteredClients = clients.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.address.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5);

  const handleClientSelect = (client: Client) => {
      setSelectedClient(client);
      setFormData(prev => ({ ...prev, title: `Visit: ${client.name}` }));
      setStep('Details');
  };

  const handleSave = () => {
      if(!selectedClient) return;
      
      // Calculate duration
      const start = new Date(`2000-01-01T${formData.startTime}`);
      const end = new Date(`2000-01-01T${formData.endTime}`);
      const durationMinutes = (end.getTime() - start.getTime()) / 60000;

      const newAppointment: Omit<Appointment, 'id'> = {
          clientId: selectedClient.id,
          clientName: selectedClient.name,
          clientAddress: selectedClient.address,
          title: formData.title,
          date: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime,
          type: formData.type,
          notes: formData.notes,
          durationMinutes: durationMinutes > 0 ? durationMinutes : 60
      };

      addAppointment(newAppointment);
      onClose();
  };

  const inputClass = "w-full p-3 border border-slate-300 rounded-xl bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm";

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95">
         
         {/* Header */}
         <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-slate-800 text-lg">Schedule Appointment</h3>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 text-slate-500"><X size={20}/></button>
         </div>

         <div className="p-6">
             {step === 'Client' ? (
                 <div className="space-y-4">
                     <p className="text-sm text-slate-500">Who are you visiting?</p>
                     <div className="relative">
                         <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
                         <input 
                            autoFocus
                            className={`${inputClass} pl-10`}
                            placeholder="Search clients by name or address..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                         />
                     </div>
                     <div className="space-y-2 max-h-[300px] overflow-y-auto">
                         {filteredClients.map(client => (
                             <button
                                key={client.id}
                                onClick={() => handleClientSelect(client)}
                                className="w-full text-left p-3 border border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                             >
                                 <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-bold text-slate-800 group-hover:text-blue-700">{client.name}</div>
                                        <div className="text-xs text-slate-500 flex items-center mt-1">
                                            <MapPin size={10} className="mr-1"/> {client.address}
                                        </div>
                                    </div>
                                    <div className="bg-slate-100 text-slate-500 p-1 rounded-full group-hover:bg-blue-100 group-hover:text-blue-600">
                                        <User size={16} />
                                    </div>
                                 </div>
                             </button>
                         ))}
                         {filteredClients.length === 0 && searchQuery && <div className="text-center text-slate-400 py-4">No clients found.</div>}
                     </div>
                 </div>
             ) : (
                 <div className="space-y-4 animate-in slide-in-from-right-4">
                     {/* Selected Client Badge */}
                     <div className="flex items-center justify-between bg-blue-50 p-3 rounded-xl border border-blue-100">
                         <div className="flex items-center">
                             <div className="bg-blue-100 p-2 rounded-full mr-3 text-blue-600"><User size={16}/></div>
                             <div>
                                 <div className="font-bold text-slate-800 text-sm">{selectedClient?.name}</div>
                                 <div className="text-xs text-slate-500">{selectedClient?.address}</div>
                             </div>
                         </div>
                         <button onClick={() => setStep('Client')} className="text-xs text-blue-600 hover:underline">Change</button>
                     </div>

                     {/* Details Form */}
                     <div>
                         <label className="block text-xs font-bold text-slate-500 mb-1">Title</label>
                         <input 
                            className={inputClass}
                            value={formData.title}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                         />
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                         <div>
                             <label className="block text-xs font-bold text-slate-500 mb-1">Date</label>
                             <div className="relative">
                                 <Calendar className="absolute left-3 top-3 text-slate-400" size={16}/>
                                 <input 
                                    type="date"
                                    className={`${inputClass} pl-10`}
                                    value={formData.date}
                                    onChange={e => setFormData({...formData, date: e.target.value})}
                                 />
                             </div>
                         </div>
                         <div>
                             <label className="block text-xs font-bold text-slate-500 mb-1">Type</label>
                             <select 
                                className={inputClass}
                                value={formData.type}
                                onChange={e => setFormData({...formData, type: e.target.value as any})}
                             >
                                 <option>Site Visit</option>
                                 <option>Service Call</option>
                                 <option>Consultation</option>
                                 <option>Final Walkthrough</option>
                             </select>
                         </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                         <div>
                             <label className="block text-xs font-bold text-slate-500 mb-1">Start Time</label>
                             <div className="relative">
                                 <Clock className="absolute left-3 top-3 text-slate-400" size={16}/>
                                 <input 
                                    type="time"
                                    className={`${inputClass} pl-10`}
                                    value={formData.startTime}
                                    onChange={e => setFormData({...formData, startTime: e.target.value})}
                                 />
                             </div>
                         </div>
                         <div>
                             <label className="block text-xs font-bold text-slate-500 mb-1">End Time</label>
                             <div className="relative">
                                 <Clock className="absolute left-3 top-3 text-slate-400" size={16}/>
                                 <input 
                                    type="time"
                                    className={`${inputClass} pl-10`}
                                    value={formData.endTime}
                                    onChange={e => setFormData({...formData, endTime: e.target.value})}
                                 />
                             </div>
                         </div>
                     </div>

                     <div>
                         <label className="block text-xs font-bold text-slate-500 mb-1">Notes</label>
                         <textarea 
                            className={inputClass}
                            rows={3}
                            placeholder="Gate code, specific instructions, etc..."
                            value={formData.notes}
                            onChange={e => setFormData({...formData, notes: e.target.value})}
                         />
                     </div>

                     <div className="pt-2 flex gap-3">
                         <button onClick={onClose} className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50">Cancel</button>
                         <button onClick={handleSave} className="flex-1 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 shadow-lg flex items-center justify-center">
                             <Check size={18} className="mr-2"/> Save Appointment
                         </button>
                     </div>
                 </div>
             )}
         </div>
      </div>
    </div>
  );
};

export default ScheduleModal;
