import React, { useState, useEffect } from 'react';
import { Client, ClientTag } from '../types';
import { X } from 'lucide-react';

interface ClientModalProps {
  client?: Client;
  onSave: (client: Omit<Client, 'id' | 'dateCreated' | 'totalSpent'> | Partial<Client>) => void;
  onClose: () => void;
}

const AVAILABLE_TAGS: ClientTag[] = ['Maintenance', 'Installation', 'Irrigation', 'Commercial', 'HOA', 'VIP', 'Bad Payer'];

const ClientModal: React.FC<ClientModalProps> = ({ client, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    propertyNotes: '',
    gateCode: '',
    preferredContact: 'Phone' as 'Phone' | 'Email' | 'Text',
    tags: [] as ClientTag[]
  });

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name,
        phone: client.phone,
        email: client.email,
        address: client.address,
        propertyNotes: client.propertyNotes,
        gateCode: client.gateCode,
        preferredContact: client.preferredContact,
        tags: client.tags || []
      });
    }
  }, [client]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const toggleTag = (tag: ClientTag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const inputClass = "w-full p-3 border border-cream-200 rounded-xl bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-500 transition-all font-medium placeholder:text-slate-400";
  const labelClass = "block text-sm font-bold text-slate-500 mb-1.5 uppercase tracking-wide";

  return (
    <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">
        <div className="flex justify-between items-center p-6 border-b border-cream-100 bg-cream-50/50">
          <h3 className="text-xl font-display font-bold text-charcoal">{client ? 'Edit Client' : 'New Client'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-charcoal hover:bg-cream-100 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className={labelClass}>Client Name / Business</label>
              <input
                type="text" required
                className={inputClass}
                placeholder="e.g. John Doe or Acme Corp"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className={labelClass}>Phone</label>
              <input
                type="text" required
                className={inputClass}
                placeholder="(555) 123-4567"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                className={inputClass}
                placeholder="john@example.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Property Address</label>
              <input
                type="text" required
                className={inputClass}
                placeholder="123 Main St, Springfield"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div>
              <label className={labelClass}>Gate Code</label>
              <input
                type="text"
                className={inputClass}
                placeholder="#1234"
                value={formData.gateCode}
                onChange={e => setFormData({ ...formData, gateCode: e.target.value })}
              />
            </div>

            <div>
              <label className={labelClass}>Preferred Contact</label>
              <div className="relative">
                <select
                  className={`${inputClass} appearance-none`}
                  value={formData.preferredContact}
                  onChange={e => setFormData({ ...formData, preferredContact: e.target.value as any })}
                >
                  <option value="Phone">Phone</option>
                  <option value="Email">Email</option>
                  <option value="Text">Text</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Property Notes</label>
              <textarea
                className={`${inputClass} min-h-[80px]`}
                rows={3}
                placeholder="Dog in backyard, park on street, etc."
                value={formData.propertyNotes}
                onChange={e => setFormData({ ...formData, propertyNotes: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Tags</label>
              <div className="flex flex-wrap gap-2.5">
                {AVAILABLE_TAGS.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all hover:-translate-y-0.5 ${formData.tags.includes(tag)
                        ? 'bg-charcoal text-white border-charcoal shadow-md'
                        : 'bg-white text-slate-500 border-cream-200 hover:border-emerald-300 hover:text-emerald-600'
                      }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-cream-100 gap-3">
            <button type="button" onClick={onClose} className="px-6 py-2.5 text-slate-500 font-bold hover:bg-cream-50 hover:text-charcoal rounded-xl transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-8 py-2.5 bg-emerald-500 text-charcoal font-bold rounded-xl hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 transition-all">
              {client ? 'Update Client' : 'Create Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientModal;