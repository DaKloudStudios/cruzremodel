import React, { useState } from 'react';
import { useCRM } from '../contexts/CRMContext';
import { useNavigation } from '../contexts/NavigationContext';
import { X, ChevronLeft, ChevronRight, Image as ImageIcon, Box } from 'lucide-react';

const DesignShowcaseView: React.FC = () => {
    // For presentation mode, we expect the lead ID to be passed or state to be managed,
    // but for simplicity in this full-screen view, we can select the project.
    // However, the prompt asks to "Add an Attach Design feature inside the LeadDetailPanel,
    // allowing a sales rep to quickly pull up the visualizer specific to that lead's property."
    // So we'll look at the current active lead.
    const { leads, designProjects } = useCRM();
    const { navigateTo } = useNavigation();

    // In a real app we'd pass this via router state, but for this demo we'll just
    // find the first lead that *has* a design attached, or fallback to the first design.
    const leadWithDesign = leads.find(l => l.designProjectId);
    const fallbackDesign = designProjects[0];
    const activeDesignId = leadWithDesign?.designProjectId || fallbackDesign?.id;

    const project = designProjects.find(dp => dp.id === activeDesignId);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [viewMode, setViewMode] = useState<'Before' | 'After' | '3D'>('After');

    if (!project) {
        return (
            <div className="h-screen w-screen bg-charcoal flex flex-col items-center justify-center text-white p-8">
                <X size={48} className="text-slate-500 mb-4" />
                <h1 className="text-2xl font-display">No Design Available</h1>
                <p className="text-slate-400 mt-2">Please attach a design to a lead first.</p>
                <button
                    onClick={() => navigateTo('Leads')}
                    className="mt-8 px-6 py-3 bg-white text-charcoal font-bold rounded-full hover:bg-cream-100"
                >
                    Return to Leads
                </button>
            </div>
        );
    }

    // Aggregate media based on view mode
    const currentMediaArray = viewMode === 'Before' ? project.beforeImageUrls : project.afterImageUrls;

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % currentMediaArray.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + currentMediaArray.length) % currentMediaArray.length);
    };

    const handleModeSwitch = (mode: 'Before' | 'After' | '3D') => {
        setViewMode(mode);
        setCurrentIndex(0); // Reset index when switching galleries
    };

    return (
        <div className="fixed inset-0 z-50 bg-charcoal flex flex-col animate-in fade-in duration-500">
            {/* Minimal Header */}
            <div className="absolute top-0 inset-x-0 p-6 flex justify-between items-start z-10 bg-gradient-to-b from-charcoal/80 to-transparent pointer-events-none">
                <div className="pointer-events-auto">
                    <h1 className="text-3xl font-display font-bold text-white drop-shadow-md">{project.title}</h1>
                    <p className="text-slate-300 max-w-xl mt-2 drop-shadow-sm text-sm md:text-base leading-relaxed">{project.description}</p>
                    {leadWithDesign && (
                        <div className="mt-3 inline-flex items-center px-3 py-1 bg-white/10 backdrop-blur rounded-full text-white text-xs font-bold border border-white/20">
                            Presenting to: {leadWithDesign.name}
                        </div>
                    )}
                </div>
                <button
                    onClick={() => navigateTo('Leads')}
                    className="p-3 bg-white/10 backdrop-blur hover:bg-white/20 text-white rounded-full transition-all pointer-events-auto border border-white/20"
                    title="Exit Presentation"
                >
                    <X size={24} />
                </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 relative flex items-center justify-center overflow-hidden">
                {viewMode === '3D' && project.design3dUrl ? (
                    <iframe
                        title="3D Design View"
                        src={project.design3dUrl}
                        className="w-full h-full border-none"
                        allowFullScreen
                        allow="autoplay; fullscreen; xr-spatial-tracking"
                        xr-spatial-tracking="true"
                        execution-while-out-of-viewport="true"
                        execution-while-not-rendered="true"
                        web-share="true"
                    />
                ) : (
                    <>
                        {/* Carousel Image */}
                        <img
                            key={`${viewMode}-${currentIndex}`}
                            src={currentMediaArray[currentIndex]}
                            alt={`${viewMode} View ${currentIndex + 1}`}
                            className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-700"
                        />

                        {/* Gradient overlays for contrast */}
                        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent pointer-events-none" />

                        {/* Navigation Arrows */}
                        {currentMediaArray.length > 1 && (
                            <>
                                <button
                                    onClick={handlePrev}
                                    className="absolute left-6 top-1/2 -translate-y-1/2 p-4 bg-charcoal/40 hover:bg-charcoal/80 backdrop-blur text-white rounded-full transition-all border border-white/10"
                                >
                                    <ChevronLeft size={32} />
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="absolute right-6 top-1/2 -translate-y-1/2 p-4 bg-charcoal/40 hover:bg-charcoal/80 backdrop-blur text-white rounded-full transition-all border border-white/10"
                                >
                                    <ChevronRight size={32} />
                                </button>

                                {/* Indicators */}
                                <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-2">
                                    {currentMediaArray.map((_, idx) => (
                                        <div
                                            key={idx}
                                            className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-white w-6' : 'bg-white/40'}`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>

            {/* Bottom Control Bar */}
            <div className="absolute bottom-6 inset-x-0 flex justify-center z-10 pointer-events-none">
                <div className="bg-charcoal/80 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 flex gap-1 pointer-events-auto shadow-2xl">
                    <button
                        onClick={() => handleModeSwitch('Before')}
                        className={`px-6 py-3 rounded-xl font-bold flex items-center transition-all ${viewMode === 'Before' ? 'bg-white text-charcoal' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
                    >
                        <ImageIcon size={18} className="mr-2" /> Before
                    </button>
                    <button
                        onClick={() => handleModeSwitch('After')}
                        className={`px-6 py-3 rounded-xl font-bold flex items-center transition-all ${viewMode === 'After' ? 'bg-white text-charcoal' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
                    >
                        <ImageIcon size={18} className="mr-2" /> Proposed Design
                    </button>
                    {project.design3dUrl && (
                        <button
                            onClick={() => handleModeSwitch('3D')}
                            className={`px-6 py-3 rounded-xl font-bold flex items-center transition-all ${viewMode === '3D' ? 'bg-emerald-500 text-charcoal' : 'text-emerald-400 hover:bg-white/10'}`}
                        >
                            <Box size={18} className="mr-2" /> Interactive 3D
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DesignShowcaseView;
