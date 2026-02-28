import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ViewState } from '../types';
import { useAuth } from './AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavigationContextType {
    currentView: ViewState;
    navigateTo: (view: ViewState) => void;
    activeProposalId: string | null;
    viewProposal: (id: string) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    openSettings: () => void;
    closeSettings: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const useNavigation = () => {
    const context = useContext(NavigationContext);
    if (!context) {
        throw new Error('useNavigation must be used within a NavigationProvider');
    }
    return context;
};

// Map URL pathnames back to the ViewState string for TopNavigation / Sidebar active states
const pathToViewMap: Record<string, ViewState> = {
    '/': 'Dashboard',
    '/dashboard': 'Dashboard',
    '/leads': 'Leads',
    '/clients': 'Clients',
    '/estimates': 'Estimates',
    '/projects': 'Projects',
    '/maintenance': 'Services',

    '/schedule': 'Calendar',
    '/materials': 'Pricebook',
    '/templates': 'Templates',
    '/timeclock': 'TimeClock',

    '/settings': 'Settings',
    '/design-showcase': 'DesignShowcase',
    '/proposal': 'ProposalViewer',
    '/gantt': 'Gantt'
};

// Reverse map to navigate via strings
export const viewToPathMap: Record<ViewState, string> = {
    'Dashboard': '/dashboard',
    'Leads': '/leads',
    'Clients': '/clients',
    'Calls': '/schedule', // merged
    'Estimates': '/estimates',
    'Projects': '/projects',
    'Services': '/maintenance',
    'Maintenance': '/maintenance',

    'Calendar': '/schedule',
    'Pricebook': '/materials',
    'Templates': '/templates',
    'TimeClock': '/timeclock',
    'ProposalViewer': '/proposal',

    'Settings': '/settings',
    'DesignShowcase': '/design-showcase',
    'Gantt': '/gantt'
};

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { isAuthorized, currentUser, allowedViews } = useAuth();
    const [activeProposalId, setActiveProposalId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // React Router Hooks
    const navigate = useNavigate();
    const location = useLocation();

    // Derive the ViewState logically from the current React Router path
    const [currentView, setCurrentView] = useState<ViewState>('Dashboard');

    useEffect(() => {
        // Find the base path (e.g., /estimates from /estimates/123)
        const pathSegments = location.pathname.split('/');
        const basePath = '/' + (pathSegments[1] || '');

        let mappedView = pathToViewMap[basePath] || 'Dashboard';

        // Handle public proposals slightly differently if needed
        if (location.pathname.startsWith('/public/proposal/')) {
            mappedView = 'ProposalViewer';
            const pId = pathSegments[3];
            if (pId && pId !== activeProposalId) {
                setActiveProposalId(pId);
            }
        }

        setCurrentView(mappedView);
    }, [location.pathname]);

    useEffect(() => {
        if (currentUser && isAuthorized && allowedViews.length > 0) {
            if (!allowedViews.includes(currentView) && currentView !== 'Settings' && currentView !== 'DesignShowcase' && currentView !== 'ProposalViewer' && currentView !== 'Gantt') {
                const firstAllowedPath = viewToPathMap[allowedViews[0]] || '/dashboard';
                navigate(firstAllowedPath, { replace: true });
            }
        }
    }, [currentUser, isAuthorized, allowedViews, currentView, navigate]);

    const navigateTo = (view: ViewState) => {
        if (allowedViews.length > 0 && !allowedViews.includes(view) && view !== 'Settings' && view !== 'DesignShowcase' && view !== 'ProposalViewer' && view !== 'Gantt') {
            console.warn(`Access denied to ${view}`);
            return;
        }

        const path = viewToPathMap[view] || '/dashboard';
        navigate(path);
    };

    const viewProposal = (id: string) => {
        setActiveProposalId(id);
        navigate(`/proposal`);
    };

    const openSettings = () => navigate('/settings');
    const closeSettings = () => navigate('/dashboard');

    return (
        <NavigationContext.Provider value={{
            currentView,
            navigateTo,
            activeProposalId,
            viewProposal,
            searchQuery,
            setSearchQuery,
            openSettings,
            closeSettings
        }}>
            {children}
        </NavigationContext.Provider>
    );
};
