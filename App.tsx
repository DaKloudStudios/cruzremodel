import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { CRMProvider, useCRM } from './contexts/CRMContext';

import { ProjectsProvider } from './contexts/ProjectsContext';



import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DialogProvider } from './contexts/DialogContext';
import { NavigationProvider, useNavigation } from './contexts/NavigationContext';
import TopNavigation from './components/TopNavigation';


import LeadModal from './components/LeadModal';

// Estimator from './components/ConcreteEstimator';
// FrostEstimator from './components/ConcreteFrostEstimator';
// Estimator from './components/TurfEstimator';
// Estimator from './components/EarthworkEstimator';
// TopekaEstimator from './components/HardscapeTopekaEstimator';
// ManagementEstimator from './components/WaterManagementEstimator';
// IceEstimator from './components/SnowIceEstimator';
// WallEstimator from './components/RetainingWallEstimator';
// TreeEstimator from './components/PlantingTreeEstimator';
// Estimator from './components/CarpentryEstimator';
import LoginView from './components/LoginView';
import { Loader2 } from 'lucide-react';
import ClientPortalLayout from './components/ClientPortalLayout';

// --- LAZY LOADED VIEWS ---
const DashboardView = React.lazy(() => import('./views/DashboardView'));
const LeadsView = React.lazy(() => import('./views/LeadsView'));
const ClientsView = React.lazy(() => import('./views/ClientsView'));

const ProjectsView = React.lazy(() => import('./views/ProjectsView'));


const CalendarView = React.lazy(() => import('./views/CalendarView'));

const SettingsView = React.lazy(() => import('./views/SettingsView'));
const GanttView = React.lazy(() => import('./views/GanttView'));

const DesignShowcaseView = React.lazy(() => import('./views/DesignShowcaseView'));

// Unified Workflow State Definition
type WorkflowStep = 'Idle' | 'LeadModal' | 'EstimateLauncher' | 'ConcreteCalc' | 'ConcreteFrostCalc' | 'TurfCalc' | 'EarthworkCalc' | 'HardscapeTopekaCalc' | 'AgronomicsCalc' | 'WaterManagementCalc' | 'SnowIceCalc' | 'RetainingWallCalc' | 'PlantingTreeCalc' | 'CarpentryCalc' | 'EstimateEditor' | 'ProjectModal';

interface WorkflowState {
    step: WorkflowStep;
    data?: any; // Holds temporary data like selectedClient, calculationResults, or the full estimate being edited
}

const LoadingFallback = () => (
    <div className="h-[60vh] w-full flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-emerald-600 mb-4" size={40} />
        <p className="text-slate-400 text-sm animate-pulse font-medium">Loading View...</p>
    </div>
);

const AppContent: React.FC = () => {
    const { settingsLoading, metrics, settings } = useSettings();
    const { currentView, navigateTo } = useNavigation();
    const { addLead } = useCRM();

    const { isAuthorized, loading: authLoading, currentUser, userRole } = useAuth();

    // --- UNIFIED WORKFLOW STATE ---
    const [workflow, setWorkflow] = useState<WorkflowState>({ step: 'Idle' });


    // --- LOADING STATES ---
    if (authLoading || (isAuthorized && settingsLoading)) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-stone-50">
                <Loader2 className="animate-spin text-emerald-600" size={48} />
            </div>
        );
    }

    // --- LOGIN CHECK ---
    if (!currentUser && !authLoading) {
        return <LoginView />;
    }

    // --- MAIN APP ---
    if (userRole === 'Client') {
        return <ClientPortalLayout />;
    }

    const handleNavigation = (view: any) => {
        navigateTo(view);
    };

    return (
        <div className="flex flex-col min-h-screen bg-cream-50 font-sans text-slate-900 selection:bg-emerald-200 selection:text-forest-900 overflow-x-hidden">

            {/* Top Navigation - 'Molten Glass' Style */}
            {currentView !== 'ProposalViewer' && currentView !== 'DesignShowcase' && currentView !== 'Gantt' && (
                <TopNavigation
                    currentView={currentView}
                    onViewChange={handleNavigation}
                    onQuickAction={(type) => setWorkflow({ step: 'LeadModal' })}
                />
            )}

            {/* View Content - Padded at top to account for floating nav */}
            <div className={`flex-1 w-full mx-auto ${currentView !== 'ProposalViewer' && currentView !== 'DesignShowcase' && currentView !== 'Gantt' ? 'pt-24 px-4 md:px-8 pb-10' : ''}`}>
                <Suspense fallback={<LoadingFallback />}>
                    <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<DashboardView onQuickAction={(type) => setWorkflow({ step: 'LeadModal' })} />} />
                        <Route path="/leads" element={<LeadsView />} />
                        <Route path="/clients" element={<ClientsView />} />
                        <Route path="/projects" element={<ProjectsView />} />

                        <Route path="/schedule" element={<CalendarView />} />
                        <Route path="/gantt" element={<GanttView />} />

                        <Route path="/settings" element={<SettingsView />} />
                        <Route path="/design-showcase" element={<DesignShowcaseView />} />


                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </Suspense>
            </div>

            {/* --- UNIFIED MODAL CONTROLLER --- */}

            {
                workflow.step === 'LeadModal' && (
                    <LeadModal
                        onSave={(data) => { addLead(data as any); }}
                        onClose={() => setWorkflow({ step: 'Idle' })}
                    />
                )
            }

            {
                workflow.step === 'ProjectModal' && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm text-center">
                            <h3 className="font-bold text-lg mb-2 text-slate-800">Create Project</h3>
                            <p className="text-sm text-slate-500 mb-6">Projects should be created from an existing Client.</p>
                            <button onClick={() => setWorkflow({ step: 'Idle' })} className="px-6 py-2 bg-emerald-950 text-white rounded-lg hover:bg-emerald-900 transition-colors">Got it</button>
                        </div>
                    </div>
                )
            }

        </div >
    );
};







const App: React.FC = () => {
    return (
        <Router>
            <AuthProvider>
                <SettingsProvider>
                    <CRMProvider>

                        <ProjectsProvider>
                            <NavigationProvider>
                                <DialogProvider>
                                    <AppContent />
                                </DialogProvider>
                            </NavigationProvider>
                        </ProjectsProvider>

                    </CRMProvider>
                </SettingsProvider>
            </AuthProvider>
        </Router>
    );
};

export default App;
