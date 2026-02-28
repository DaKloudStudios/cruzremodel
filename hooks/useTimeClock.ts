
import { useState } from 'react';
import { useTimeClockCtx } from '../contexts/TimeClockContext';
import { useProjects } from '../contexts/ProjectsContext';
import { useAuth } from '../contexts/AuthContext';
import { useGeolocation } from './useGeolocation';
import { uploadTimeClockPhoto } from '../services/storage';
import { useConfirm } from '../contexts/DialogContext';

export const useTimeClock = () => {
  const { currentUser, userRole } = useAuth();
  const { clockIn: dbClockIn, clockOut: dbClockOut, activeTimeLogs } = useTimeClockCtx();
    const { projects } = useProjects();
  const { coords, loading: locLoading, error: locError, getLocation } = useGeolocation();
  const { confirm } = useConfirm();

  const [processing, setProcessing] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Derived State
  const activeLog = activeTimeLogs.find(t => t.userId === currentUser?.uid);
  const isStrictRole = userRole === 'Laborer' || userRole === 'Deliverer' || userRole === 'Foreman';

  const validateClockIn = (projectId: string) => {
    if (isStrictRole) {
      if (!photo) throw new Error("Photo verification is required.");
      if (!projectId) throw new Error("Please select a project.");
      if (!coords) throw new Error("GPS Location required. Click 'Retry Location'.");
    }
    return true;
  };

  const handleClockIn = async (projectId: string) => {
    setError(null);
    try {
      validateClockIn(projectId);
      
      // Admin bypass warning if no photo
      if (!isStrictRole && !photo) {
         const proceed = await confirm({
             title: "No Photo?",
             message: "You are clocking in without a photo. Proceed?",
             type: "warning",
             confirmText: "Yes, Clock In"
         });
         if(!proceed) return;
      }

      setProcessing(true);

      let photoUrl = '';
      if (photo && currentUser) {
        photoUrl = await uploadTimeClockPhoto(photo, currentUser.uid);
      }

      const projectName = projects.find(p => p.id === projectId)?.name || 'General Shop Time';

      await dbClockIn({
        userId: currentUser?.uid || 'guest',
        userName: currentUser?.displayName || 'Guest User',
        userRole: userRole || 'Staff',
        clockIn: new Date().toISOString(),
        clockInLocation: coords || undefined,
        projectId: projectId || undefined,
        projectName,
        photoUrl
      });

      alert("Successfully Clocked In!");
      setPhoto(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleClockOut = async () => {
    if (!activeLog) return;
    setError(null);

    // Ensure we have location for clock out if possible, but don't block strictly if it fails midway
    // Logic: If user has coords from hook, use them. If not, try get them, but proceed anyway.
    
    if (!photo && isStrictRole) {
        setError("End-of-shift photo is required.");
        return;
    }

    setProcessing(true);
    try {
        let photoUrl = '';
        if (photo && currentUser) {
            photoUrl = await uploadTimeClockPhoto(photo, currentUser.uid);
        }

        await dbClockOut(activeLog.id, {
            clockOut: new Date().toISOString(),
            locationOut: coords || undefined,
            clockOutPhotoUrl: photoUrl
        });

        alert("Successfully Clocked Out!");
        setPhoto(null);
    } catch (e: any) {
        setError(e.message);
    } finally {
        setProcessing(false);
    }
  };

  return {
    // State
    activeLog,
    processing,
    photo,
    setPhoto,
    error,
    setError,
    
    // Location
    coords,
    locLoading,
    locError,
    getLocation,

    // Actions
    handleClockIn,
    handleClockOut,
    
    // Meta
    isStrictRole
  };
};
