import React, { useState, useMemo } from 'react';
import { useCRM } from '../contexts/CRMContext';
import { useNavigation } from '../contexts/NavigationContext';
import { Lead, LeadStatus } from '../types';

export const useLeadsBoard = () => {
  const { leads, updateLeadStatus } = useCRM();
    const { searchQuery } = useNavigation();
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'All' | 'Overdue' | 'HighValue'>('All');

  // --- FILTERING ---
  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
       const matchesSearch = l.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             l.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             l.phone.includes(searchQuery);
       
       let matchesFilter = true;
       if (filterMode === 'Overdue') {
           matchesFilter = !!l.nextActionDate && new Date(l.nextActionDate) < new Date(new Date().setHours(0,0,0,0)) && l.status !== LeadStatus.WON && l.status !== LeadStatus.LOST;
       } else if (filterMode === 'HighValue') {
           matchesFilter = (l.value || 0) > 5000;
       }

       return matchesSearch && matchesFilter;
    });
  }, [leads, searchQuery, filterMode]);

  // --- STATS AGGREGATION ---
  const getColumnStats = (status: LeadStatus) => {
      const leadsInStage = filteredLeads.filter(l => l.status === status);
      const count = leadsInStage.length;
      const totalValue = leadsInStage.reduce((sum, l) => sum + (l.value || 0), 0);
      return { count, totalValue };
  };

  // --- DRAG & DROP HANDLERS ---
  const handleDragStart = (e: React.DragEvent, id: string) => {
      setDraggedLeadId(id);
      e.dataTransfer.effectAllowed = 'move';
      // Create a ghost image if needed, or rely on browser default
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (e: React.DragEvent, status: LeadStatus) => {
      e.preventDefault();
      if (draggedLeadId) {
          updateLeadStatus(draggedLeadId, status);
          setDraggedLeadId(null);
      }
  };

  return {
      filteredLeads,
      filterMode,
      setFilterMode,
      handleDragStart,
      handleDragOver,
      handleDrop,
      getColumnStats,
      draggedLeadId
  };
};