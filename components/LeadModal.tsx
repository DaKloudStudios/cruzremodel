import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Lead, LeadStatus } from '../types';
import { X } from 'lucide-react';

interface LeadModalProps {
  lead?: Lead;
  onSave: (lead: Omit<Lead, 'id' | 'dateCreated' | 'status' | 'tags'> | Partial<Lead>) => void;
  onClose: () => void;
}

const LeadModal: React.FC<LeadModalProps> = ({ lead, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    serviceInterest: '',
    notes: '',
    value: 0
  });

  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name,
        phone: lead.phone,
        email: lead.email || '',
        address: lead.address,
        serviceInterest: lead.serviceInterest,
        notes: lead.notes,
        value: lead.value || 0
      });
    }
  }, [lead]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const inputClass = "w-full p-2 border border-slate-300 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all";

  return createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">{lead ? 'Edit Lead' : 'New Lead'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Prospect Name</label>
            <input
              type="text" required
              autoFocus
              className={inputClass}
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              <input
                type="text" required
                className={inputClass}
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email (Optional)</label>
              <input
                type="email"
                className={inputClass}
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
            <input
              type="text" required
              className={inputClass}
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Service Interest</label>
              <select
                className={inputClass}
                value={formData.serviceInterest}
                onChange={e => setFormData({ ...formData, serviceInterest: e.target.value })}
              >
                <option value="">Select...</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Installation">Installation</option>
                <option value="Clean Up">Clean Up</option>
                <option value="Irrigation">Irrigation</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Est. Value ($)</label>
              <input
                type="number"
                className={inputClass}
                value={formData.value}
                onChange={e => setFormData({ ...formData, value: Number(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Initial Notes</label>
            <textarea
              className={`${inputClass} text-sm`}
              rows={3}
              placeholder="How did they hear about us? Specific requests?"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg mr-2">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 shadow-md">
              {lead ? 'Update Lead' : 'Create Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default LeadModal;