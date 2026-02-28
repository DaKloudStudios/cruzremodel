
import React, { useState } from 'react';
import { TeamMember, TimeLog } from '../types';
import { useTimeClockCtx } from '../contexts/TimeClockContext';
import { X, User, Briefcase, Clock, Calendar, Save, Edit2 } from 'lucide-react';

interface EmployeeDetailModalProps {
  employee: TeamMember;
  timeLogs: TimeLog[];
  onClose: () => void;
}

const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({ employee, timeLogs, onClose }) => {
  const { updateTimeLog } = useTimeClockCtx();
  
  // Edit State
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ start: string, end: string }>({ start: '', end: '' });

  // Filter logs for this employee
  const employeeLogs = timeLogs.filter(log => log.userId === employee.email || log.userName === employee.name).sort((a,b) => new Date(b.clockIn).getTime() - new Date(a.clockIn).getTime());

  // Calculate Stats (Last 14 Days)
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  
  const recentLogs = employeeLogs.filter(log => new Date(log.clockIn) >= twoWeeksAgo);
  
  const totalMinutes = recentLogs.reduce((acc, log) => acc + (log.durationMinutes || 0), 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  
  const uniqueProjectNames = Array.from(new Set(recentLogs.map(l => l.projectName || 'General Shop Time')));
  const daysWorked = new Set(recentLogs.map(l => new Date(l.clockIn).toDateString())).size;

  // -- EDIT HANDLERS --
  const handleEditClick = (log: TimeLog) => {
      setEditingLogId(log.id);
      // Format for datetime-local input: YYYY-MM-DDTHH:MM
      const formatTime = (isoString?: string) => isoString ? new Date(isoString).toISOString().slice(0, 16) : '';
      setEditForm({
          start: formatTime(log.clockIn),
          end: formatTime(log.clockOut)
      });
  };

  const handleSaveEdit = async (logId: string) => {
      if (!editForm.start) return; // Start required
      
      const updates: Partial<TimeLog> = {
          clockIn: new Date(editForm.start).toISOString(),
      };

      if (editForm.end) {
          updates.clockOut = new Date(editForm.end).toISOString();
          const start = new Date(editForm.start).getTime();
          const end = new Date(editForm.end).getTime();
          updates.durationMinutes = Math.round((end - start) / 60000);
      } else {
          // If clearing end time (marking active), clear duration
          updates.clockOut = undefined; // Actually delete the field logic would be needed in updateTimeLog wrapper usually, or just set null/undefined here
          updates.durationMinutes = 0;
      }

      await updateTimeLog(logId, updates);
      setEditingLogId(null);
  };

  const inputClass = "p-1 border rounded text-xs w-36";

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 max-h-[80vh]">
        
        {/* Header Profile Section */}
        <div className="bg-slate-50 border-b border-slate-200 p-6 flex items-center justify-between relative shrink-0">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-200 flex items-center justify-center">
                    {employee.photoUrl ? (
                        <img src={employee.photoUrl} alt={employee.name} className="w-full h-full object-cover" />
                    ) : (
                        <User size={32} className="text-slate-400" />
                    )}
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900">{employee.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                            employee.role === 'Admin' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                            employee.role === 'Foreman' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                            'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                            {employee.role}
                        </span>
                        <span className="text-xs text-slate-500">{employee.email}</span>
                    </div>
                </div>
            </div>
            
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-full transition-colors">
                <X size={24} />
            </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-200 bg-white shrink-0">
            <div className="p-4 text-center">
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">14-Day Hours</p>
                <p className="text-2xl font-bold text-slate-800">{totalHours}</p>
            </div>
            <div className="p-4 text-center">
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Days Active</p>
                <p className="text-2xl font-bold text-slate-800">{daysWorked}</p>
            </div>
            <div className="p-4 text-center">
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Projects</p>
                <p className="text-2xl font-bold text-slate-800">{uniqueProjectNames.length}</p>
            </div>
        </div>

        {/* Work History */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                <Briefcase size={18} className="mr-2 text-slate-400" /> Recent Work History
            </h3>
            
            <div className="space-y-3">
                {recentLogs.length === 0 && (
                    <p className="text-sm text-slate-400 italic pl-2">No work logs in the past 14 days.</p>
                )}
                
                {recentLogs.map(log => {
                    const isEditing = editingLogId === log.id;
                    return (
                        <div key={log.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
                            {/* Left Info */}
                            <div className="flex-1">
                                <div className="font-bold text-slate-700 text-sm mb-1">{log.projectName || 'General Shop'}</div>
                                <div className="flex items-center gap-4 text-xs text-slate-500">
                                    <span className="flex items-center"><Calendar size={12} className="mr-1"/> {new Date(log.clockIn).toLocaleDateString()}</span>
                                    {!isEditing && (
                                        <span className="flex items-center">
                                            <Clock size={12} className="mr-1"/> 
                                            {new Date(log.clockIn).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - 
                                            {log.clockOut ? new Date(log.clockOut).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : 'Active'}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Center Editing / Hours */}
                            <div className="flex items-center gap-4">
                                {isEditing ? (
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1">
                                            <span className="text-[10px] font-bold text-slate-400 w-6">IN:</span>
                                            <input 
                                                type="datetime-local" 
                                                className={inputClass}
                                                value={editForm.start}
                                                onChange={e => setEditForm({...editForm, start: e.target.value})}
                                            />
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-[10px] font-bold text-slate-400 w-6">OUT:</span>
                                            <input 
                                                type="datetime-local" 
                                                className={inputClass}
                                                value={editForm.end}
                                                onChange={e => setEditForm({...editForm, end: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded min-w-[60px] text-center">
                                        {(log.durationMinutes ? log.durationMinutes / 60 : 0).toFixed(2)} hrs
                                    </span>
                                )}

                                {/* Action Button */}
                                {isEditing ? (
                                    <button 
                                        onClick={() => handleSaveEdit(log.id)}
                                        className="p-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                                        title="Save"
                                    >
                                        <Save size={16} />
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => handleEditClick(log)}
                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                        title="Edit Time"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

      </div>
    </div>
  );
};

export default EmployeeDetailModal;
