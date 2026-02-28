import React from 'react';
import { useProjects } from '../contexts/ProjectsContext';
import { useAuth } from '../contexts/AuthContext';
import { Briefcase } from 'lucide-react';

const ClientDashboardView: React.FC = () => {
    const { projects } = useProjects();
    const { clientId } = useAuth(); // The ID of the currently logged-in Client user

    // Fallback if somehow rendered without a valid client ID
    if (!clientId) {
        return (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200 text-center">
                <h2 className="text-xl font-bold text-stone-800 mb-2">Account Error</h2>
                <p className="text-stone-500">We could not link your account to a specific client record. Please contact support.</p>
            </div>
        );
    }

    // Filter all data for this specific client
    const clientProjects = projects.filter(p => p.clientId === clientId);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Welcome Banner */}
            <div className="bg-emerald-900 rounded-2xl p-8 text-white shadow-lg overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-display font-bold mb-2">Welcome back!</h1>
                    <p className="text-emerald-100 max-w-xl">
                        View your active projects all in one place.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* Left Column (Wider for Projects/Estimates) */}
                <div className="space-y-8">

                    {/* Active Projects Section */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                                <Briefcase className="text-emerald-600" size={20} /> Active Projects
                            </h2>
                        </div>

                        {clientProjects.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4">
                                {clientProjects.map(project => (
                                    <div key={project.id} className="bg-white rounded-xl shadow-sm border border-stone-200 p-5 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="font-bold text-lg text-stone-800">{project.name}</h3>
                                                <p className="text-sm text-stone-500 line-clamp-2">{project.description}</p>
                                            </div>
                                            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full whitespace-nowrap">
                                                {project.status}
                                            </span>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="mt-4">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="font-bold text-stone-600">Completion</span>
                                                <span className="font-bold text-emerald-600">{project.completionPercent}%</span>
                                            </div>
                                            <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className="bg-emerald-500 h-2 rounded-full transition-all duration-1000 ease-out"
                                                    style={{ width: `${project.completionPercent}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-stone-50 border-2 border-dashed border-stone-200 rounded-xl p-8 text-center text-stone-500">
                                <p>You don't have any active projects right now.</p>
                            </div>
                        )}
                    </section>

                </div>
            </div>
        </div>
    );
};

export default ClientDashboardView;
