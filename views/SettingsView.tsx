import React, { useState, useRef, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { useConfirm } from '../contexts/DialogContext';
import { Employee, OverheadItem, UserRole } from '../types';
import { uploadBusinessLogo, uploadUserProfilePhoto } from '../services/storage';
import { updateProfile } from 'firebase/auth';
import { writeBatch, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import {
  Building, Calendar, Users, DollarSign, Calculator, ShieldCheck,
  Plus, Trash2, Lock, Unlock, CheckSquare, Square, Edit, Save, X, Loader2, AlertTriangle, FileText, Upload, Image as ImageIcon, UserCircle
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

type SettingsTab = 'MyAccount';

const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => e.target.select();

// --- SUB-COMPONENTS ---

const MyAccountSection: React.FC = () => {
  const { currentUser, userRole } = useAuth();
  const { settings, updateSettings } = useSettings();
  const [uploading, setUploading] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [savingName, setSavingName] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayPhoto = currentUser?.photoURL;

  // Sync local state if currentUser changes
  useEffect(() => {
    if (currentUser?.displayName) {
      setDisplayName(currentUser.displayName);
    }
  }, [currentUser]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && currentUser) {
      setUploading(true);
      try {
        const file = e.target.files[0];
        const url = await uploadUserProfilePhoto(file, currentUser.uid);

        // 1. Update Firebase Auth (so current user sees it immediately in nav)
        await updateProfile(currentUser, { photoURL: url });

      } catch (error) {
        console.error(error);
        alert("Failed to upload profile picture.");
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSaveName = async () => {
    if (!currentUser || !displayName.trim()) return;

    const oldName = currentUser.displayName;
    const newName = displayName.trim();

    if (oldName === newName) return;

    setSavingName(true);
    try {
      // 1. Update Auth Profile
      await updateProfile(currentUser, { displayName: newName });

      // 3. Update "Settings > Employees" (Job Costing) - Only if Admin
      // If regular user, we skip this to avoid permission errors on 'settings/main'
      if (userRole === 'Admin') {
        const updatedEmployees = settings.employees.map(emp =>
          emp.name === oldName ? { ...emp, name: newName } : emp
        );

        if (JSON.stringify(updatedEmployees) !== JSON.stringify(settings.employees)) {
          await updateSettings({ ...settings, employees: updatedEmployees });
        }
      }

      // 4. Batch Update Time Logs (Historical & Active)
      // This ensures Time Clock history reflects the new name
      // BATCHING: Firestore allows max 500 writes per batch. We must chunk it.
      const logsQuery = query(
        collection(db, 'time_logs'),
        where('userId', '==', currentUser.uid)
      );

      const logsSnap = await getDocs(logsQuery);
      const chunks = [];
      const BATCH_SIZE = 450; // Safety margin

      for (let i = 0; i < logsSnap.docs.length; i += BATCH_SIZE) {
        chunks.push(logsSnap.docs.slice(i, i + BATCH_SIZE));
      }

      for (const chunk of chunks) {
        const batch = writeBatch(db);
        chunk.forEach(doc => {
          batch.update(doc.ref, { userName: newName });
        });
        await batch.commit();
      }

      alert(`Name updated to "${newName}" successfully across the system.`);
    } catch (error: any) {
      console.error("Error updating name:", error);
      if (error.code === 'permission-denied') {
        alert("Name updated in your profile, but some system records couldn't be updated due to permissions.");
      } else {
        alert("Failed to update name completely. Check console for details.");
      }
    } finally {
      setSavingName(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
      <div>
        <h3 className="text-xl font-bold text-slate-900">My Account</h3>
        <p className="text-sm text-slate-500">Manage your personal profile and login details.</p>
      </div>

      <Card className="flex flex-col md:flex-row gap-8 items-start">
        <div className="flex flex-col items-center gap-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-32 h-32 rounded-full border-4 border-slate-100 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-all relative overflow-hidden bg-slate-50 group shadow-md"
          >
            {displayPhoto ? (
              <img src={displayPhoto} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="text-slate-400 flex flex-col items-center">
                <UserCircle size={48} className="mb-1" />
              </div>
            )}

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Upload className="text-white" size={24} />
            </div>

            {uploading && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={24} />
              </div>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/png, image/jpeg"
            onChange={handlePhotoUpload}
          />
          <button onClick={() => fileInputRef.current?.click()} className="text-sm text-blue-600 font-bold hover:underline">Change Picture</button>
        </div>

        <div className="flex-1 space-y-5 w-full max-w-md">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Display Name</label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your Name"
              />
              <Button
                onClick={handleSaveName}
                disabled={savingName || !displayName.trim() || displayName === currentUser?.displayName}
                leftIcon={savingName ? <Loader2 size={16} className="animate-spin" /> : undefined}
              >
                {savingName ? '' : 'Save'}
              </Button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Updates across all time logs, projects, and team lists.</p>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-500 font-medium font-mono text-sm cursor-not-allowed flex justify-between items-center">
              <span>{currentUser?.email}</span>
              <Lock size={14} className="opacity-50" />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Email cannot be changed.</p>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role & Permissions</label>
            <div className="inline-flex items-center px-4 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-sm font-bold">
              {userRole || 'User'}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};




const SettingsView: React.FC = () => {
  const { userRole } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('MyAccount');

  const isRestricted = userRole === 'Laborer' || userRole === 'Foreman' || userRole === 'Deliverer';

  const TABS = [
    { id: 'MyAccount', label: 'My Account', icon: <UserCircle size={18} /> }
  ];

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-6">

      {/* Sidebar Navigation for Settings */}
      <Card className="w-64 !p-0 overflow-hidden flex-shrink-0">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h2 className="font-bold text-slate-800">Settings</h2>
        </div>
        <div className="p-2 space-y-1">
          {TABS.map(tab => {
            // Hide Team, Overhead, Terms for restricted roles
            if (isRestricted && tab.id !== 'MyAccount') return null;



            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${activeTab === tab.id
                  ? 'bg-slate-800 text-white shadow'
                  : 'text-slate-600 hover:bg-slate-50'
                  }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Main Content */}
      <Card className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {activeTab === 'MyAccount' && <MyAccountSection />}
      </Card>

    </div>
  );
};

export default SettingsView;
