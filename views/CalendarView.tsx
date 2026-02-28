
import React, { useState, useMemo } from 'react';
import { useProjects } from '../contexts/ProjectsContext';
import { useCRM } from '../contexts/CRMContext';
import { useNavigation } from '../contexts/NavigationContext';
import {
  ChevronLeft, ChevronRight, Calendar as CalendarIcon,
  Phone, Briefcase, UserPlus, Clock, MapPin, X, ArrowRight,
  CheckCircle2, AlertCircle, Plus, Map, User, CloudRain
} from 'lucide-react';
import { ViewState } from '../types';
import ScheduleModal from '../components/ScheduleModal';
import { useWeather } from '../utils/weatherUtils';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

interface CalendarEvent {
  id: string;
  date: Date;
  type: 'project_start' | 'project_end' | 'lead_task' | 'call_followup' | 'appointment' | 'service_visit' | 'project_task';
  title: string;
  subtitle?: string;
  referenceId: string;
  color: string;
  navTo?: ViewState;
  searchTerm: string; // Used to auto-filter the target view
  details?: any;
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CalendarView: React.FC = () => {
  const { projects } = useProjects();
  const { leads, calls, appointments } = useCRM();
  const { navigateTo, setSearchQuery } = useNavigation();
  const { getWeatherWarningForDate } = useWeather();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // --- 1. DATA AGGREGATION ---
  const events = useMemo(() => {
    const allEvents: CalendarEvent[] = [];

    // Appointments (New Feature)
    appointments.forEach(a => {
      allEvents.push({
        id: `appt-${a.id}`,
        date: new Date(a.date), // Assumes ISO 'YYYY-MM-DD' gets parsed correctly
        type: 'appointment',
        title: `${a.startTime} - ${a.title}`,
        subtitle: a.clientName,
        referenceId: a.id,
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        searchTerm: a.clientName,
        details: a
      });
    });

    // Projects (Start & End)
    projects.forEach(p => {
      // Start
      allEvents.push({
        id: `p-start-${p.id}`,
        date: new Date(p.startDate),
        type: 'project_start',
        title: `Start: ${p.name}`,
        subtitle: p.clientName,
        referenceId: p.id,
        color: 'bg-green-100 text-green-800 border-green-200',
        navTo: 'Projects',
        searchTerm: p.name
      });
      // End
      allEvents.push({
        id: `p-end-${p.id}`,
        date: new Date(p.endDate),
        type: 'project_end',
        title: `Due: ${p.name}`,
        subtitle: p.clientName,
        referenceId: p.id,
        color: 'bg-red-100 text-red-800 border-red-200',
        navTo: 'Projects',
        searchTerm: p.name
      });
      // Specific Project Tasks
      p.tasks.forEach(t => {
        if (t.dueDate && !t.isCompleted) {
          allEvents.push({
            id: `p-task-${t.id}`,
            date: new Date(t.dueDate),
            type: 'project_task',
            title: `Task: ${t.description}`,
            subtitle: p.name,
            referenceId: t.id,
            color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
            navTo: 'Projects',
            searchTerm: p.name
          });
        }
      });
    });

    // Leads (Next Action)
    leads.forEach(l => {
      if (l.nextActionDate && l.status !== 'Won' && l.status !== 'Lost') {
        allEvents.push({
          id: `lead-${l.id}`,
          date: new Date(l.nextActionDate),
          type: 'lead_task',
          title: l.nextAction || 'Follow Up',
          subtitle: l.name,
          referenceId: l.id,
          color: 'bg-amber-100 text-amber-800 border-amber-200',
          navTo: 'Leads',
          searchTerm: l.name
        });
      }
    });

    // Calls (Follow Up)
    calls.forEach(c => {
      if (c.followUpDate && !c.isFollowUpDone) {
        allEvents.push({
          id: `call-${c.id}`,
          date: new Date(c.followUpDate),
          type: 'call_followup',
          title: `Call: ${c.contactName}`,
          subtitle: c.notes,
          referenceId: c.id,
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          navTo: 'Calls',
          searchTerm: c.contactName
        });
      }
    });

    return allEvents;
  }, [projects, leads, calls, appointments]);

  // --- 2. HELPERS ---
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay();

    const days = [];
    // Padding for prev month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    // Days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const isSameDay = (d1: Date, d2: Date) => {
    // Standardize to local YYYY-MM-DD comparison to avoid timezone offsets issues with simple equality
    return d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear();
  };

  const isToday = (date: Date) => isSameDay(date, new Date());

  const handleNavigate = (event: CalendarEvent) => {
    // If it's an appointment, we don't have a dedicated "View" for it yet, 
    // but we could navigate to Client view or show a modal. 
    // For now, let's navigate to the client associated with it.
    if (event.type === 'appointment') {
      setSearchQuery(event.searchTerm);
      navigateTo('Clients');
    } else if (event.navTo) {
      setSearchQuery(event.searchTerm);
      navigateTo(event.navTo);
    }
  };

  const changeMonth = (delta: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
    setSelectedDate(null);
  };

  // --- 3. FILTERED DATA FOR SELECTED DAY ---
  const selectedDayEvents = selectedDate
    ? events.filter(e => isSameDay(e.date, selectedDate))
    : [];

  const activeProjects = selectedDate
    ? projects.filter(p => {
      const start = new Date(p.startDate);
      const end = new Date(p.endDate);
      // Reset hours to compare dates only
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      const current = new Date(selectedDate);
      current.setHours(12, 0, 0, 0);
      return current >= start && current <= end && p.status === 'In Progress';
    })
    : [];

  const days = getDaysInMonth(currentDate);

  // --- ICONS ---
  const getEventIcon = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'project_start': return <Briefcase size={14} className="mr-1" />;
      case 'project_end': return <AlertCircle size={14} className="mr-1" />;
      case 'lead_task': return <UserPlus size={14} className="mr-1" />;
      case 'call_followup': return <Phone size={14} className="mr-1" />;
      case 'appointment': return <MapPin size={14} className="mr-1" />;

      case 'project_task': return <Briefcase size={14} className="mr-1 opacity-50" />;
    }
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-6 overflow-hidden relative">

      {/* MAIN CALENDAR GRID */}
      <div className="flex-1 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-slate-800">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex bg-white rounded-lg border border-slate-300 shadow-sm">
              <button onClick={() => changeMonth(-1)} className="p-1.5 hover:bg-slate-50 text-slate-600 rounded-l-lg border-r border-slate-300"><ChevronLeft size={18} /></button>
              <button onClick={() => setCurrentDate(new Date())} className="px-3 text-xs font-bold text-slate-600 hover:bg-slate-50">Today</button>
              <button onClick={() => changeMonth(1)} className="p-1.5 hover:bg-slate-50 text-slate-600 rounded-r-lg border-l border-slate-300"><ChevronRight size={18} /></button>
            </div>
          </div>

          <Button
            onClick={() => setIsScheduleModalOpen(true)}
            leftIcon={<Plus size={16} />}
          >
            Schedule Visit
          </Button>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
          {DAYS_OF_WEEK.map(day => (
            <div key={day} className="py-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Grid Body */}
        <div className="grid grid-cols-7 flex-1 auto-rows-fr bg-slate-200 gap-px border-b border-slate-200">
          {days.map((date, idx) => {
            if (!date) return <div key={`empty-${idx}`} className="bg-slate-50/50"></div>;

            const dayEvents = events.filter(e => isSameDay(e.date, date));
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            const isTodayDate = isToday(date);

            return (
              <div
                key={date.toISOString()}
                onClick={() => setSelectedDate(date)}
                className={`bg-white relative p-2 cursor-pointer transition-colors hover:bg-blue-50/50 flex flex-col gap-1 overflow-hidden ${isSelected ? 'ring-2 ring-inset ring-blue-500 z-10' : ''}`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isTodayDate ? 'bg-blue-600 text-white' : 'text-slate-700'}`}>
                    {date.getDate()}
                  </span>
                  {dayEvents.length > 0 && <span className="text-[10px] text-slate-400 font-bold">{dayEvents.length} items</span>}
                </div>

                {/* Event Dots / Bars */}
                <div className="flex-1 flex flex-col gap-1 overflow-hidden">
                  {dayEvents.slice(0, 3).map(event => {
                    const isRainRisk = getWeatherWarningForDate(event.date.toISOString());
                    return (
                      <div key={event.id} className={`text-[10px] px-1.5 py-0.5 rounded truncate font-medium border-l-2 ${event.color} flex items-center justify-between`}>
                        <span className="truncate">{event.title}</span>
                        {isRainRisk && <CloudRain size={10} className="text-red-500 shrink-0 ml-1" />}
                      </div>
                    );
                  })}
                  {dayEvents.length > 3 && (
                    <div className="text-[10px] text-slate-400 pl-1 font-medium">
                      +{dayEvents.length - 3} more...
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DETAIL SIDE PANEL */}
      <div className="w-80 bg-white rounded-xl border border-slate-200 shadow-xl flex flex-col overflow-hidden transition-all">

        <div className="p-6 border-b border-slate-100 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <CalendarIcon size={64} />
          </div>
          <h3 className="text-2xl font-bold relative z-10">
            {selectedDate ? selectedDate.getDate() : '--'}
          </h3>
          <p className="text-slate-400 font-medium uppercase text-xs tracking-wider relative z-10">
            {selectedDate ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', year: 'numeric' }) : 'Select a Date'}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50">

          {!selectedDate ? (
            <div className="text-center py-10 text-slate-400">
              Select a date to view agenda.
            </div>
          ) : (
            <>
              {/* Active Projects Section (Not single day events, but ongoing) */}
              {activeProjects.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center">
                    <Briefcase size={12} className="mr-1.5" /> Active Projects
                  </h4>
                  <div className="space-y-2">
                    {activeProjects.map(p => (
                      <Card
                        hover
                        key={p.id}
                        onClick={() => { setSearchQuery(p.name); navigateTo('Projects'); }}
                        className="!p-3 cursor-pointer group"
                      >
                        <div className="flex justify-between items-start">
                          <div className="font-bold text-slate-800 text-sm group-hover:text-blue-600">{p.name}</div>
                          <div className="bg-blue-100 text-blue-700 text-[10px] px-1.5 rounded font-bold">ONGOING</div>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">{p.clientName}</div>
                        <div className="w-full bg-slate-100 h-1 mt-2 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full" style={{ width: `${p.completionPercent}%` }}></div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Milestones / Tasks */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center">
                    <Clock size={12} className="mr-1.5" /> Agenda
                  </h4>
                  <button onClick={() => setIsScheduleModalOpen(true)} className="text-xs text-blue-600 font-bold hover:underline">+ Add</button>
                </div>

                {selectedDayEvents.length === 0 ? (
                  <div className="text-sm text-slate-400 italic bg-white p-4 rounded-lg border border-dashed border-slate-200 text-center">
                    Nothing scheduled for this day.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedDayEvents.map(event => (
                      <div
                        key={event.id}
                        onClick={() => handleNavigate(event)}
                        className={`p-3 rounded-lg border shadow-sm cursor-pointer hover:shadow-md transition-all group ${event.color} bg-white`}
                      >
                        <div className="flex items-start">
                          <div className="mt-0.5 opacity-70">
                            {getEventIcon(event.type)}
                          </div>
                          <div className="ml-2 flex-1">
                            <div className="font-bold text-sm">{event.title}</div>
                            {event.subtitle && <div className="text-xs opacity-80 mt-0.5 line-clamp-1">{event.subtitle}</div>}
                            {event.details && event.details.notes && (
                              <div className="text-[10px] bg-white/50 p-1 rounded mt-1 opacity-90 truncate">{event.details.notes}</div>
                            )}
                          </div>
                          {getWeatherWarningForDate(event.date.toISOString()) && (
                            <div className="ml-2 flex flex-col items-center justify-center text-red-500 bg-red-50 px-2 py-1 rounded border border-red-100 shrink-0" title="High chance of rain! Might need to reschedule.">
                              <CloudRain size={14} />
                              <span className="text-[8px] font-bold uppercase mt-0.5">Rain Risk</span>
                            </div>
                          )}
                          <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 mt-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {isScheduleModalOpen && (
        <ScheduleModal
          onClose={() => setIsScheduleModalOpen(false)}
          selectedDate={selectedDate}
        />
      )}

    </div>
  );
};

export default CalendarView;
