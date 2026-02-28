
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { TimeLog } from '../types';

export const useProjectLogs = (projectId: string) => {
  const [logs, setLogs] = useState<TimeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalHours, setTotalHours] = useState(0);

  useEffect(() => {
    const fetchLogs = async () => {
      if (!projectId) return;
      
      setLoading(true);
      try {
        // Query without sorting first to ensure it works without composite index
        const q = query(
          collection(db, 'time_logs'),
          where('projectId', '==', projectId)
        );

        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as TimeLog));
        
        // Sort in memory (Newest First)
        data.sort((a, b) => new Date(b.clockIn).getTime() - new Date(a.clockIn).getTime());
        
        setLogs(data);

        // Calculate total hours
        const minutes = data.reduce((acc, log) => acc + (log.durationMinutes || 0), 0);
        setTotalHours(Math.round((minutes / 60) * 10) / 10);

      } catch (error) {
        console.error("Error fetching project logs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [projectId]);

  return { logs, loading, totalHours };
};
