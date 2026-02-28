import { useMemo } from 'react';
import { useCRM } from '../contexts/CRMContext';
import { useEstimates } from '../contexts/EstimatesContext';
import { useProjects } from '../contexts/ProjectsContext';
import { useSettings } from '../contexts/SettingsContext';
import { LeadStatus, EstimateStatus, ProjectStatus } from '../types';

export const useDashboardData = () => {
  const { leads, calls } = useCRM();
    const { estimates, pricebook } = useEstimates();
    const { projects } = useProjects();
    const { settings } = useSettings();

  // --- 1. KEY PERFORMANCE INDICATORS (KPIs) ---
  const kpis = useMemo(() => {
    // Revenue YTD (Sum of revenue from Completed/In Progress projects)
    const revenueYTD = projects
        .filter(p => ['Completed', 'In Progress'].includes(p.status))
        .reduce((sum, p) => sum + p.revenue, 0);

    // Pipeline Value (Estimates Sent/Review)
    const pipelineValue = estimates
        .filter(e => ['Sent', 'Review Needed'].includes(e.status))
        .reduce((sum, e) => sum + e.total, 0);

    // Win Rate calculation
    const closedEstimates = estimates.filter(e => ['Accepted', 'Declined', 'Expired'].includes(e.status));
    const wonEstimates = closedEstimates.filter(e => e.status === 'Accepted');
    const winRate = closedEstimates.length > 0 
        ? Math.round((wonEstimates.length / closedEstimates.length) * 100) 
        : 0;

    // Active Jobs
    const activeJobs = projects.filter(p => p.status === 'In Progress').length;

    return {
        revenueYTD,
        pipelineValue,
        winRate,
        activeJobs
    };
  }, [projects, estimates]);

  // --- 2. CHART DATA (Revenue Trend) ---
  const chartData = useMemo(() => {
      const last6Months = Array.from({ length: 6 }, (_, i) => {
          const d = new Date();
          d.setMonth(d.getMonth() - (5 - i));
          return {
              name: d.toLocaleString('default', { month: 'short' }),
              monthIdx: d.getMonth(),
              year: d.getFullYear(),
              revenue: 0,
              projected: 0
          };
      });

      projects.forEach(p => {
          const date = new Date(p.startDate); // Using start date for simple revenue attribution
          const monthIdx = date.getMonth();
          const year = date.getFullYear();
          
          const period = last6Months.find(m => m.monthIdx === monthIdx && m.year === year);
          if (period) {
              if (['Completed', 'In Progress'].includes(p.status)) {
                  period.revenue += p.revenue;
              }
          }
      });

      // Add projected from estimates to the current/next months
      estimates.forEach(e => {
          if (e.status === 'Sent' || e.status === 'Accepted') {
              const date = new Date(e.dateCreated); // Simplification: estimating based on creation
              // Ideally use validUntil or a 'projected start date'
              // For demo, distribute loosely
              const period = last6Months[5]; // Put in current month bucket as "Projected"
              if (period) period.projected += e.total;
          }
      });

      return last6Months;
  }, [projects, estimates]);

  // --- 3. ACTION ITEMS (The "Inbox") ---
  const actions = useMemo(() => {
      const items: { id: string; type: 'Call' | 'Lead' | 'Estimate' | 'System'; title: string; subtitle: string; urgency: 'High' | 'Medium' | 'Low'; linkTo: any; data?: any }[] = [];
      const today = new Date();

      // Overdue Calls
      calls.forEach(c => {
          if (c.followUpDate && !c.isFollowUpDone && new Date(c.followUpDate) <= today) {
              items.push({
                  id: `call-${c.id}`,
                  type: 'Call',
                  title: `Call ${c.contactName}`,
                  subtitle: c.notes || 'Scheduled follow-up',
                  urgency: 'High',
                  linkTo: 'Calls',
                  data: c
              });
          }
      });

      // Stale Leads (No action in 7 days)
      leads.forEach(l => {
          if (l.status === 'New' || l.status === 'Contacted') {
              const lastAction = l.nextActionDate ? new Date(l.nextActionDate) : new Date(l.dateCreated);
              const diffDays = (today.getTime() - lastAction.getTime()) / (1000 * 3600 * 24);
              
              if (diffDays > 3) {
                  items.push({
                      id: `lead-${l.id}`,
                      type: 'Lead',
                      title: `Follow up: ${l.name}`,
                      subtitle: `${Math.floor(diffDays)} days since last activity`,
                      urgency: diffDays > 7 ? 'High' : 'Medium',
                      linkTo: 'Leads',
                      data: l
                  });
              } else if (l.nextActionDate && new Date(l.nextActionDate) <= today) {
                   items.push({
                      id: `lead-due-${l.id}`,
                      type: 'Lead',
                      title: `${l.nextAction}: ${l.name}`,
                      subtitle: 'Scheduled task due today',
                      urgency: 'High',
                      linkTo: 'Leads',
                      data: l
                  });
              }
          }
      });

      // Expiring Estimates
      estimates.forEach(e => {
          if (e.status === 'Sent') {
              const validUntil = new Date(e.validUntil);
              const diffDays = (validUntil.getTime() - today.getTime()) / (1000 * 3600 * 24);
              if (diffDays < 3 && diffDays > 0) {
                  items.push({
                      id: `est-${e.id}`,
                      type: 'Estimate',
                      title: `Expiring Quote: ${e.clientName}`,
                      subtitle: `Expires in ${Math.ceil(diffDays)} days - Send reminder?`,
                      urgency: 'Medium',
                      linkTo: 'Estimates',
                      data: e
                  });
              }
          }
      });

      // System Checks
      const stalePrices = pricebook.filter(i => (today.getTime() - new Date(i.lastUpdated).getTime()) / (1000 * 3600 * 24) > 90);
      if (stalePrices.length > 5) {
          items.push({
              id: 'sys-prices',
              type: 'System',
              title: 'Review Pricebook',
              subtitle: `${stalePrices.length} items haven't been updated in 90 days`,
              urgency: 'Low',
              linkTo: 'Pricebook'
          });
      }

      if (settings.employees.length === 0) {
           items.push({
              id: 'sys-setup',
              type: 'System',
              title: 'Finish Setup',
              subtitle: 'Add employees to enable accurate job costing',
              urgency: 'High',
              linkTo: 'Settings'
          });
      }

      // Sort by Urgency then Date
      return items.sort((a, b) => {
          const priority = { High: 3, Medium: 2, Low: 1 };
          return priority[b.urgency] - priority[a.urgency];
      });
  }, [leads, calls, estimates, pricebook, settings]);

  return { kpis, chartData, actions };
};