import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    LayoutDashboard, Users, Phone, Megaphone,
    Briefcase, Calendar, Settings, LogOut,
    MoreHorizontal, Menu, X, Search, Bell, GanttChart
} from 'lucide-react';
import { ViewState, AppNotification } from '../types';
import { useNavigation, viewToPathMap } from '../contexts/NavigationContext';
import { useAuth } from '../contexts/AuthContext';
import { useAppNotifications } from '../hooks/useAppNotifications';
import { Badge } from './ui/Badge';

interface TopNavigationProps {
    currentView: ViewState;
    onViewChange: (view: ViewState) => void;
    onQuickAction: (type: 'Lead' | 'Project') => void;
}

const TopNavigation: React.FC<TopNavigationProps> = ({ currentView, onViewChange, onQuickAction }) => {
    const { navigateTo, searchQuery, setSearchQuery } = useNavigation();
    const { notifications } = useAppNotifications();
    const { currentUser, logout, userRole, allowedViews } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showMoreMenu, setShowMoreMenu] = useState(false);

    // --- NAVIGATION ITEMS ---
    const allMenuItems = [
        { id: 'Dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { id: 'Clients', label: 'Clients', icon: <Users size={18} /> },
        { id: 'Projects', label: 'Projects', icon: <Briefcase size={18} /> },
        { id: 'Calendar', label: 'Schedule', icon: <Calendar size={18} /> },
        { id: 'Gantt', label: 'Gantt', icon: <GanttChart size={18} /> },
    ];

    // Filter by permissions
    const accessibleItems = allMenuItems.filter(item =>
        userRole === 'Admin' || allowedViews.includes(item.id as ViewState)
    );

    // Split into Primary (Visible) and Secondary (More Menu)
    // Adjust this count based on available width, for now hardcoded to 5
    const primaryItems = accessibleItems.slice(0, 5);
    const secondaryItems = accessibleItems.slice(5);

    const handleNavClick = () => {
        setIsMobileMenuOpen(false);
        setShowMoreMenu(false);
    };

    // --- REFS for click outside ---
    const notifRef = useRef<HTMLDivElement>(null);
    const moreRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
            if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
                setShowMoreMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const isRestricted = userRole === 'Laborer' || userRole === 'Foreman' || userRole === 'Deliverer';

    return (
        <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
            {/* 
                FULL WIDTH "MOLTEN GLASS" BAR
                - Removed floating margins/padding to cover full screen width
                - Kept backdrop blur and white opacity
            */}
            <div className="w-full pointer-events-auto">
                <div className="bg-white/70 backdrop-blur-2xl border-b border-white/50 shadow-soft p-3 flex items-center justify-between transition-all duration-300 hover:bg-white/80">

                    {/* 1. BRAND & MOBILE TRIGGER */}
                    <div className="flex items-center gap-4 pl-4">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-2 bg-forest-900 text-white hover:bg-forest-800 rounded-xl transition-colors shadow-sm"
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>

                        {/* Logo */}
                        <Link
                            to="/dashboard"
                            onClick={handleNavClick}
                            className="flex items-center gap-3 cursor-pointer group"
                        >
                            <img
                                src="https://storage.googleapis.com/aivoks_website_almacenamiento/ALEX/Cruzremodel%20app/Cruz%20remodel%20logo.png"
                                alt="Cruz Remodel Logo"
                                className="w-8 h-8 hidden xl:block object-contain"
                            />
                            <span className="font-display font-bold text-lg text-charcoal hidden xl:block tracking-tight">Cruz app</span>
                        </Link>
                    </div>

                    {/* 2. DESKTOP NAVIGATION (Centered) */}
                    <div className="hidden lg:flex items-center gap-1 xl:gap-2 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                        {accessibleItems.map(item => {
                            const isActive = currentView === item.id;
                            const path = viewToPathMap[item.id as ViewState] || '/dashboard';
                            return (
                                <Link
                                    key={item.id}
                                    to={path}
                                    onClick={handleNavClick}
                                    className={`
                                        flex items-center gap-2 px-3 xl:px-4 py-2.5 rounded-full text-sm font-bold transition-all duration-300
                                        ${isActive
                                            ? 'bg-forest-900 text-white shadow-lg shadow-forest-900/20 scale-105'
                                            : 'text-slate-500 hover:text-forest-900 hover:bg-white/50'
                                        }
                                    `}
                                >
                                    {isActive ? item.icon : React.cloneElement(item.icon as React.ReactElement, { size: 18, strokeWidth: 2 } as any)}
                                    <span className="hidden xl:inline">{item.label}</span>
                                    <span className="xl:hidden">{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* 3. ACTIONS (Right) */}
                    <div className="flex items-center gap-3 pr-2">

                        {/* Search (Icon only on mobile, expand on desk?) -> Keep pill for now */}
                        {!isRestricted && (
                            <div className="hidden xl:flex items-center bg-cream-50/80 rounded-full px-3 py-2 border border-black/5 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-400/50 transition-all w-48 focus-within:w-64">
                                <Search size={16} className="text-slate-400" />
                                <input
                                    className="bg-transparent border-none outline-none text-sm ml-2 w-full text-charcoal placeholder-slate-400 font-medium"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        )}

                        {/* Notifications */}
                        {!isRestricted && (
                            <div className="relative" ref={notifRef}>
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="w-10 h-10 flex items-center justify-center rounded-full text-slate-500 hover:bg-cream-100 hover:text-charcoal transition-colors relative"
                                >
                                    <Bell size={20} />
                                    {notifications.length > 0 && (
                                        <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                                    )}
                                </button>
                                {showNotifications && (
                                    <div className="absolute right-0 top-full mt-4 w-80 bg-white/95 backdrop-blur-xl rounded-[1.5rem] shadow-2xl border border-white/50 overflow-hidden animate-in fade-in zoom-in-95 origin-top-right">
                                        <div className="p-4 border-b border-cream-100/50 bg-cream-50/30 flex justify-between items-center">
                                            <span className="font-bold text-charcoal text-sm">Notifications</span>
                                            {notifications.length > 0 && (
                                                <Badge variant="default" size="sm" pulse>
                                                    {notifications.length} New
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="max-h-64 overflow-y-auto p-2">
                                            {notifications.length === 0 ? (
                                                <p className="text-center text-slate-400 text-xs py-8">All caught up!</p>
                                            ) : (
                                                notifications.map(n => (
                                                    <div key={n.id} onClick={() => { navigateTo(n.linkTo); setShowNotifications(false); }} className="p-3 hover:bg-cream-50 rounded-xl cursor-pointer transition-colors mb-1">
                                                        <p className="text-xs font-bold text-charcoal">{n.title}</p>
                                                        <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">{n.message}</p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Profile Dropdown */}
                        <div className="user-menu group relative cursor-pointer py-2">
                            <div className="w-10 h-10 rounded-full bg-cream-100 border border-white shadow-sm overflow-hidden hover:ring-2 hover:ring-emerald-300 transition-all">
                                {(() => {
                                    const photo = currentUser?.photoURL;
                                    return photo ? (
                                        <img src={photo} alt="User" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-charcoal font-bold bg-emerald-200">
                                            {(currentUser?.displayName || 'U').charAt(0)}
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Improved Dropdown with invisible bridge (padding-top) */}
                            <div className="absolute right-0 top-full pt-3 w-56 hidden group-hover:block hover:block animate-in fade-in zoom-in-95 origin-top-right z-50">
                                <div className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-soft border border-white/50 p-2 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-cream-100/50 bg-cream-50/30 rounded-t-2xl mb-1 -mt-2 -mx-2">
                                        <p className="text-sm font-bold text-charcoal truncate">{currentUser?.displayName}</p>
                                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mt-0.5">{userRole}</p>
                                    </div>

                                    <div className="h-px bg-cream-100 my-1"></div>

                                    <Link to="/settings" className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-cream-50 hover:text-charcoal rounded-xl transition-colors font-medium flex items-center gap-2">
                                        <Settings size={14} /> App Settings
                                    </Link>
                                    <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors font-bold flex items-center gap-2">
                                        <LogOut size={14} /> Sign Out
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>
            </div>

            {/* MOBILE MENU OVERLAY */}
            {isMobileMenuOpen && (
                <div className="absolute top-20 left-4 right-4 bg-white/95 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-white/50 p-4 animate-in slide-in-from-top-4 z-50 pointer-events-auto lg:hidden">
                    <div className="grid grid-cols-2 gap-2">
                        {allMenuItems.filter(item => userRole === 'Admin' || allowedViews.includes(item.id as ViewState)).map(item => {
                            const path = viewToPathMap[item.id as ViewState] || '/dashboard';
                            return (
                                <Link
                                    key={item.id}
                                    to={path}
                                    onClick={handleNavClick}
                                    className={`
                                        flex flex-col items-center justify-center p-4 rounded-2xl transition-all
                                        ${currentView === item.id ? 'bg-forest-900 text-white shadow-lg' : 'bg-cream-50 text-slate-600 hover:bg-cream-100'}
                                    `}
                                >
                                    {item.icon}
                                    <span className="text-xs font-bold mt-2">{item.label}</span>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TopNavigation;
