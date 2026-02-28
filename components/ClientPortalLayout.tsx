import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { LogOut, Home, CreditCard, Menu, X, User as UserIcon } from 'lucide-react';
import ClientDashboardView from '../views/ClientDashboardView';
import ClientBillingView from '../views/ClientBillingView';

const ClientPortalLayout: React.FC = () => {
    const { logout, currentUser } = useAuth();
    const { settings } = useSettings();
    const [activeTab, setActiveTab] = useState<'Dashboard' | 'Billing'>('Dashboard');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleTabChange = (tab: 'Dashboard' | 'Billing') => {
        setActiveTab(tab);
        setIsMobileMenuOpen(false);
    };

    return (
        <div className="min-h-screen bg-stone-50 selection:bg-emerald-200 selection:text-emerald-900 font-sans flex flex-col">
            {/* Minimal Client Header */}
            <header className="bg-white border-b border-stone-200 shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">

                        {/* Company Logo & Brand */}
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-emerald-950 rounded-xl flex items-center justify-center p-1.5 shadow-sm">
                                {settings.profile.logoUrl ? (
                                    <img src={settings.profile.logoUrl} alt="Logo" className="w-full h-full object-contain filter brightness-0 invert" />
                                ) : (
                                    <span className="text-white font-bold text-lg">Y</span>
                                )}
                            </div>
                            <span className="font-display font-bold text-xl text-stone-800 tracking-tight hidden sm:block">
                                {settings.profile.businessName || 'Cruz Remodel Client Portal'}
                            </span>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex space-x-8">
                            <button
                                onClick={() => handleTabChange('Dashboard')}
                                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium border-b-2 transition-colors duration-200 ${activeTab === 'Dashboard' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'}`}
                            >
                                <Home size={18} /> Dashboard
                            </button>
                            <button
                                onClick={() => handleTabChange('Billing')}
                                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium border-b-2 transition-colors duration-200 ${activeTab === 'Billing' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'}`}
                            >
                                <CreditCard size={18} /> Billing
                            </button>
                        </nav>

                        {/* User & Actions */}
                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex items-center gap-2 text-sm text-stone-600">
                                <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center overflow-hidden">
                                    {currentUser?.photoURL ? (
                                        <img src={currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <UserIcon size={16} className="text-stone-400" />
                                    )}
                                </div>
                                <span className="font-medium mr-2">{currentUser?.displayName || 'Client'}</span>
                            </div>

                            <button
                                onClick={logout}
                                className="hidden md:flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-red-600 transition-colors"
                            >
                                <LogOut size={16} /> Sign Out
                            </button>

                            {/* Mobile menu button */}
                            <div className="flex items-center md:hidden">
                                <button
                                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                    className="inline-flex items-center justify-center p-2 rounded-md text-stone-400 hover:text-stone-500 hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500"
                                >
                                    <span className="sr-only">Open main menu</span>
                                    {isMobileMenuOpen ? (
                                        <X className="block h-6 w-6" aria-hidden="true" />
                                    ) : (
                                        <Menu className="block h-6 w-6" aria-hidden="true" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-stone-200 bg-white">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            <button
                                onClick={() => handleTabChange('Dashboard')}
                                className={`flex w-full items-center gap-3 px-3 py-2 rounded-md text-base font-medium ${activeTab === 'Dashboard' ? 'bg-emerald-50 text-emerald-700' : 'text-stone-700 hover:text-stone-900 hover:bg-stone-50'}`}
                            >
                                <Home size={18} /> Dashboard
                            </button>
                            <button
                                onClick={() => handleTabChange('Billing')}
                                className={`flex w-full items-center gap-3 px-3 py-2 rounded-md text-base font-medium ${activeTab === 'Billing' ? 'bg-emerald-50 text-emerald-700' : 'text-stone-700 hover:text-stone-900 hover:bg-stone-50'}`}
                            >
                                <CreditCard size={18} /> Billing & Invoices
                            </button>
                            <button
                                onClick={logout}
                                className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 mt-4 border-t border-stone-100 pt-4"
                            >
                                <LogOut size={18} /> Sign Out
                            </button>
                        </div>
                    </div>
                )}
            </header>

            {/* Main Content Area */}
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'Dashboard' ? <ClientDashboardView /> : <ClientBillingView />}
            </main>

            {/* Simple footer */}
            <footer className="bg-white border-t border-stone-200 py-6 text-center">
                <p className="text-sm text-stone-400">
                    &copy; {new Date().getFullYear()} {settings.profile.businessName || 'Cruz Remodel'}. All rights reserved.
                </p>
            </footer>
        </div>
    );
};

export default ClientPortalLayout;
