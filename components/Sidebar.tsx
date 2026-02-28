import React from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, Users, Phone, Megaphone,
  FileText, Briefcase, Truck, PhoneCall, CheckSquare, Search,
  Bell, Database, Ruler, Camera, ChevronRight, X, Clock, Calendar, Package, Settings, LogOut, Wrench
} from 'lucide-react';
import { ViewState } from '../types';
import { useNavigation, viewToPathMap } from '../contexts/NavigationContext';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, isOpen, onClose }) => {
  const { navigateTo } = useNavigation();
  const { currentUser, logout, userRole, allowedViews } = useAuth();

  const displayPhoto = currentUser?.photoURL;

  const handleNavClick = () => {
    onClose();
  };

  const menuItems: { id: ViewState; label: string; icon: React.ReactNode }[] = [
    { id: 'Dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} strokeWidth={1.5} /> },
    { id: 'Leads', label: 'Leads', icon: <Megaphone size={20} strokeWidth={1.5} /> },
    { id: 'Clients', label: 'Clients', icon: <Users size={20} strokeWidth={1.5} /> },
    { id: 'Calls', label: 'Calls', icon: <Phone size={20} strokeWidth={1.5} /> },
    { id: 'Projects', label: 'Projects', icon: <Briefcase size={20} strokeWidth={1.5} /> },
    { id: 'Calendar', label: 'Schedule', icon: <Calendar size={20} strokeWidth={1.5} /> },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-forest-900/20 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container - Soft Cream Theme */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white/60 backdrop-blur-3xl text-charcoal flex flex-col h-full border-r border-cream-200/50 shadow-2xl md:shadow-none
        transform transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1)
        md:relative md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>

        {/* Brand Header */}
        <div className="p-8 pb-6 flex flex-col items-center">
          <Link to="/dashboard" onClick={handleNavClick} className="relative group cursor-pointer block">
            <img
              src="https://storage.googleapis.com/aivoks_website_almacenamiento/ALEX/Cruzremodel%20app/Cruz%20remodel%20logo.png"
              alt="Cruz Remodel Logo"
              className="relative h-16 w-auto object-contain drop-shadow-md transition-transform duration-500 hover:scale-105 group-hover:scale-105"
            />
          </Link>

          <div className="text-center mt-3 flex flex-col items-center">
            <h1 className="text-xl font-display font-bold text-charcoal tracking-tight">Cruz app</h1>
            <p className="text-[10px] text-slate-400 tracking-[0.2em] font-medium uppercase mt-1">CRM System</p>
          </div>

          <button onClick={onClose} className="md:hidden text-slate-400 hover:text-charcoal absolute right-4 top-4 transition-colors">
            <X size={24} strokeWidth={1.5} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto py-2 custom-scrollbar">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest px-4 mb-4 mt-2">Main Menu</div>

          {menuItems.map((item) => {
            const hasAccess = userRole === 'Admin' || allowedViews.includes(item.id);
            if (!hasAccess) return null;

            const isActive = currentView === item.id;
            const path = viewToPathMap[item.id] || '/dashboard';

            return (
              <Link
                key={item.id}
                to={path}
                onClick={handleNavClick}
                className={`group relative w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 ${isActive
                  ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 text-charcoal shadow-soft font-bold translate-x-1'
                  : 'text-slate-500 hover:bg-white/60 hover:text-charcoal'
                  }`}
              >
                <div className="flex items-center space-x-3.5 z-10 w-full">
                  <span className={`transition-all duration-300 ${isActive ? 'text-charcoal' : 'group-hover:text-emerald-500'}`}>
                    {item.icon}
                  </span>
                  <span className="tracking-wide text-[15px] flex-1 text-left">{item.label}</span>
                  {isActive && <ChevronRight size={14} className="text-charcoal/50" />}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-4 mx-4 mb-6 pt-4 border-t border-cream-200">
          <Link
            to="/settings"
            onClick={handleNavClick}
            className={`flex items-center space-x-3 w-full p-2.5 rounded-2xl transition-all duration-300 group ${currentView === 'Settings' ? 'bg-white/80 shadow-sm' : 'hover:bg-white/60'
              }`}
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-cream-200 border border-white p-0.5 shadow-sm overflow-hidden">
                {displayPhoto ? (
                  <img src={displayPhoto} alt="User" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-charcoal font-bold text-sm bg-emerald-400">
                    {(currentUser?.displayName || 'U').charAt(0)}
                  </div>
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
            </div>

            <div className="text-left overflow-hidden flex-1 min-w-0">
              <p className="text-sm font-bold truncate text-charcoal font-display">{currentUser?.displayName}</p>
              <p className="text-[11px] text-slate-400 tracking-wide font-medium">{userRole}</p>
            </div>

            <Settings size={16} className="text-slate-400 group-hover:text-emerald-600 transition-colors" />
          </Link>

          <button
            onClick={logout}
            className="mt-2 w-full text-slate-400 hover:text-red-500 py-2 transition-colors text-[10px] font-bold tracking-widest uppercase hover:bg-red-50 rounded-lg flex items-center justify-center gap-2"
          >
            <LogOut size={12} /> Sign Out
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
