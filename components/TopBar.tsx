
import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Plus, UserPlus, FilePlus, Menu, AlertCircle, Info, CheckCircle, AlertTriangle, ChevronDown } from 'lucide-react';
import { useNavigation } from '../contexts/NavigationContext';
import { useAuth } from '../contexts/AuthContext';
import { useAppNotifications } from '../hooks/useAppNotifications';
import { AppNotification } from '../types';

interface TopBarProps {
    onQuickAction: (type: 'Lead' | 'Project') => void;
    onToggleSidebar: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onQuickAction, onToggleSidebar }) => {
    const { searchQuery, setSearchQuery, navigateTo } = useNavigation();
    const { notifications } = useAppNotifications();
    const { userRole, currentUser } = useAuth();
    const [showNotifications, setShowNotifications] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const inputClass = "block w-full pl-11 pr-4 py-2.5 rounded-full border border-slate-200 bg-slate-50/50 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 focus:bg-white transition-all duration-300 shadow-sm hover:bg-white";

    // Restricted roles logic
    const isRestricted = userRole === 'Laborer' || userRole === 'Foreman' || userRole === 'Deliverer';

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        }
        if (showNotifications) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showNotifications]);

    const handleNotificationClick = (n: AppNotification) => {
        navigateTo(n.linkTo);
        setShowNotifications(false);
    };

    const getNotificationIcon = (type: AppNotification['type']) => {
        switch (type) {
            case 'alert': return <AlertCircle size={18} className="text-red-500" />;
            case 'warning': return <AlertTriangle size={18} className="text-amber-500" />;
            case 'success': return <CheckCircle size={18} className="text-emerald-500" />;
            default: return <Info size={18} className="text-blue-500" />;
        }
    };

    const getNotificationColor = (type: AppNotification['type']) => {
        switch (type) {
            case 'alert': return 'bg-red-50 border-red-100 hover:bg-red-100/50';
            case 'warning': return 'bg-amber-50 border-amber-100 hover:bg-amber-100/50';
            case 'success': return 'bg-emerald-50 border-emerald-100 hover:bg-emerald-100/50';
            default: return 'bg-blue-50 border-blue-100 hover:bg-blue-100/50';
        }
    };

    return (
        <div className="z-30 sticky top-0 px-4 md:px-8 py-4">
            <div className="h-16 md:h-20 bg-white/80 backdrop-blur-xl border border-white/40 shadow-sm rounded-2xl flex items-center justify-between px-4 md:px-6 transition-all duration-300 hover:shadow-md hover:bg-white/90">

                {/* Left: Mobile Menu & Search */}
                <div className="flex items-center gap-6 flex-1">
                    <button
                        onClick={onToggleSidebar}
                        className="md:hidden p-2 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-colors"
                    >
                        <Menu size={24} />
                    </button>

                    {/* Hide Search for Restricted Roles */}
                    {!isRestricted && (
                        <div className="relative w-full max-w-md group hidden md:block">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search size={18} className="text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search leads, clients, projects..."
                                className={inputClass}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                {/* Right Actions */}
                <div className="flex items-center space-x-3 md:space-x-6">

                    {/* Notifications - Hidden for Restricted Roles */}
                    {!isRestricted && (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className={`relative p-2.5 rounded-full transition-all duration-300 ${showNotifications ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-200' : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'}`}
                            >
                                <Bell size={20} className={showNotifications ? 'animate-bounce-short' : ''} />
                                {notifications.length > 0 && (
                                    <span className="absolute top-2 right-2.5 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white animate-ping"></span>
                                )}
                                {notifications.length > 0 && (
                                    <span className="absolute top-2 right-2.5 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
                                )}
                            </button>

                            {/* Dropdown Panel */}
                            {showNotifications && (
                                <div className="absolute right-0 top-full mt-4 w-96 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-100/50 overflow-hidden animate-in fade-in zoom-in-95 origin-top-right ring-1 ring-black/5">
                                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
                                        <h4 className="font-display font-bold text-slate-800">Notifications</h4>
                                        <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">{notifications.length} New</span>
                                    </div>
                                    <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                                        {notifications.length === 0 ? (
                                            <div className="p-10 text-center flex flex-col items-center text-slate-400">
                                                <Bell size={32} className="mb-3 opacity-20" />
                                                <p className="text-sm">No new notifications</p>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-slate-50">
                                                {notifications.map(n => (
                                                    <button
                                                        key={n.id}
                                                        onClick={() => handleNotificationClick(n)}
                                                        className={`w-full text-left p-4 transition-all flex items-start gap-4 ${getNotificationColor(n.type)} border-l-[3px]`}
                                                    >
                                                        <div className="mt-0.5 p-1 bg-white rounded-full shadow-sm">{getNotificationIcon(n.type)}</div>
                                                        <div className="flex-1">
                                                            <div className="flex justify-between items-start">
                                                                <p className="text-sm font-bold text-slate-800">{n.title}</p>
                                                                <span className="text-[10px] mobile-hide font-medium text-slate-400">{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                            </div>
                                                            <p className="text-xs text-slate-600 leading-relaxed mt-1 line-clamp-2">{n.message}</p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-2 border-t border-slate-100 bg-slate-50/50 text-center">
                                        <button className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">Mark all as read</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* User Profile */}
                    <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
                        <div className="text-right hidden lg:block ml-4">
                            <p className="text-sm font-bold text-slate-800 leading-none font-display">{currentUser?.displayName || 'User'}</p>
                            <p className="text-[11px] font-medium text-emerald-600 mt-1 uppercase tracking-wide">{userRole}</p>
                        </div>
                        <div className="group relative cursor-pointer">
                            <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white shadow-md overflow-hidden transition-transform group-hover:scale-105 ring-2 ring-transparent group-hover:ring-emerald-200">
                                {(() => {
                                    const photo = currentUser?.photoURL;
                                    return photo ? (
                                        <img src={photo} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold bg-slate-100">
                                            {(currentUser?.displayName || 'U').charAt(0)}
                                        </div>
                                    );
                                })()}
                            </div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                    </div>

                    {/* Action Buttons - Hidden for restricted roles */}
                    {!isRestricted && (
                        <div className="flex space-x-3 pl-2">
                            <button
                                onClick={() => onQuickAction('Lead')}
                                className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-200 hover:shadow-emerald-300 hover:-translate-y-0.5 transition-all duration-300 active:scale-95 group"
                            >
                                <Plus size={18} className="group-hover:rotate-12 transition-transform" />
                                <span className="hidden md:inline">New Lead</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TopBar;
