import React, { useState } from 'react';
import { useCRM } from '../contexts/CRMContext';
import { useNavigation } from '../contexts/NavigationContext';
import { CallLog } from '../types';
import CallDetail from '../components/CallDetail';
import { 
  Phone, ArrowUpRight, ArrowDownLeft, Clock, Calendar, Search, 
  Filter, Plus, User, FileText, CheckCircle2, XCircle
} from 'lucide-react';

const CallsView: React.FC = () => {
  const { calls } = useCRM();
    const { searchQuery, setSearchQuery } = useNavigation();
  const [selectedCall, setSelectedCall] = useState<CallLog | null>(null);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [filterType, setFilterType] = useState<'All' | 'Inbound' | 'Outbound' | 'FollowUp'>('All');

  // --- METRICS ---
  const today = new Date();
  const callsToday = calls.filter(c => new Date(c.date).toDateString() === today.toDateString()).length;
  const pendingFollowUps = calls.filter(c => c.followUpDate && new Date(c.followUpDate) <= today && !c.isFollowUpDone).length;
  const inboundCount = calls.filter(c => c.type === 'Inbound').length;

  // --- FILTERING ---
  const filteredCalls = calls.filter(c => {
      const matchesSearch = c.contactName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            c.phone.includes(searchQuery);
      
      let matchesType = true;
      if (filterType === 'Inbound') matchesType = c.type === 'Inbound';
      if (filterType === 'Outbound') matchesType = c.type === 'Outbound';
      if (filterType === 'FollowUp') matchesType = !!c.followUpDate && !c.isFollowUpDone;

      return matchesSearch && matchesType;
  }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // --- HANDLERS ---
  const handleOpenLog = () => {
      setSelectedCall(null);
      setIsLogOpen(true);
  };

  const handleEditCall = (call: CallLog) => {
      setSelectedCall(call);
      setIsLogOpen(true);
  };

  const getOutcomeColor = (outcome: string) => {
      if (outcome.includes('Scheduled') || outcome === 'Interested') return 'bg-green-100 text-green-700';
      if (outcome === 'No Answer' || outcome === 'Left Voicemail') return 'bg-slate-100 text-slate-600';
      if (outcome === 'Not Interested') return 'bg-red-50 text-red-600';
      return 'bg-blue-50 text-blue-700';
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER & STATS */}
      <div className="flex flex-col md:flex-row gap-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 flex-1">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-lg mr-4">
                      <Phone size={20} />
                  </div>
                  <div>
                      <p className="text-xs text-slate-500 uppercase font-bold">Calls Today</p>
                      <p className="text-2xl font-bold text-slate-800">{callsToday}</p>
                  </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center">
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-lg mr-4">
                      <Clock size={20} />
                  </div>
                  <div>
                      <p className="text-xs text-slate-500 uppercase font-bold">Due Follow-ups</p>
                      <p className="text-2xl font-bold text-slate-800">{pendingFollowUps}</p>
                  </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center">
                  <div className="p-3 bg-green-50 text-green-600 rounded-lg mr-4">
                      <ArrowDownLeft size={20} />
                  </div>
                  <div>
                      <p className="text-xs text-slate-500 uppercase font-bold">Total Inbound</p>
                      <p className="text-2xl font-bold text-slate-800">{inboundCount}</p>
                  </div>
              </div>
          </div>

          {/* Quick Action */}
          <div className="flex items-center">
              <button 
                onClick={handleOpenLog}
                className="bg-slate-900 text-white px-6 py-4 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-transform active:scale-95 flex items-center h-full"
              >
                  <Plus size={20} className="mr-2" /> Log Call
              </button>
          </div>
      </div>

      {/* FILTERS */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-slate-200">
          {(['All', 'Inbound', 'Outbound', 'FollowUp'] as const).map(ft => (
              <button
                key={ft}
                onClick={() => setFilterType(ft)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterType === ft 
                    ? 'bg-slate-800 text-white' 
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                  {ft === 'FollowUp' ? 'Pending Follow-ups' : ft}
              </button>
          ))}
      </div>

      {/* CALLS LIST TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                  <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Outcome</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Notes</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase">Date</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredCalls.map(call => (
                      <tr 
                        key={call.id} 
                        onClick={() => handleEditCall(call)}
                        className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                      >
                          <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold mr-3 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                      {call.contactName.charAt(0)}
                                  </div>
                                  <div>
                                      <div className="text-sm font-bold text-slate-900">{call.contactName}</div>
                                      <div className="text-xs text-slate-500">{call.phone}</div>
                                  </div>
                              </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`flex items-center text-xs font-medium ${call.type === 'Inbound' ? 'text-green-600' : 'text-blue-600'}`}>
                                  {call.type === 'Inbound' ? <ArrowDownLeft size={14} className="mr-1"/> : <ArrowUpRight size={14} className="mr-1"/>}
                                  {call.type}
                              </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getOutcomeColor(call.outcome)}`}>
                                  {call.outcome}
                              </span>
                          </td>
                          <td className="px-6 py-4">
                              <p className="text-sm text-slate-600 line-clamp-1 max-w-xs">{call.notes}</p>
                              {call.followUpDate && !call.isFollowUpDone && (
                                  <div className="flex items-center text-xs text-amber-600 mt-1 font-medium">
                                      <Clock size={12} className="mr-1" /> Follow-up: {new Date(call.followUpDate).toLocaleDateString()}
                                  </div>
                              )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-xs text-slate-500">
                              {new Date(call.date).toLocaleDateString()} <span className="mx-1">•</span> {new Date(call.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
          {filteredCalls.length === 0 && (
              <div className="p-12 text-center text-slate-400">
                  <Phone size={48} className="mx-auto mb-4 opacity-20" />
                  <p>No calls found.</p>
              </div>
          )}
      </div>

      {/* DETAIL MODAL */}
      {isLogOpen && (
          <CallDetail 
            call={selectedCall || undefined} 
            onClose={() => setIsLogOpen(false)} 
          />
      )}

    </div>
  );
};

export default CallsView;