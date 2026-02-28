
import React, { useEffect, useState, useRef } from 'react';
import { Estimate, ProposalSettings, Client, BusinessProfile, EstimateItem } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';
import {
    Check, X, CreditCard, ChevronDown, Calendar, MapPin,
    Phone, Mail, ArrowRight, ShieldCheck, Download, Star, Sparkles
} from 'lucide-react';

interface PremiumProposalViewProps {
    estimate: Estimate;
    settings: ProposalSettings;
    client: Client | null;
    businessProfile: BusinessProfile | null;
    onAccept: () => void;
    onDecline: () => void;
    readOnly?: boolean;
    isEditor?: boolean;
}

const PremiumProposalView: React.FC<PremiumProposalViewProps> = ({
    estimate, settings, client, businessProfile, onAccept, onDecline, readOnly, isEditor = false
}) => {
    const [scrolled, setScrolled] = useState(false);

    // Default Settings / Fallbacks
    const primaryColor = settings.primaryColor || settings.accentColor || '#059669'; // Emerald-600 default
    const secondaryColor = settings.secondaryColor || '#10b981'; // Emerald-500 default
    const label = settings.proposalLabel || 'Proposal';
    const buttonText = settings.buttonText || 'Sign & Accept';
    const heroOpacity = settings.heroOverlayOpacity ?? 0.4;
    const sectionOrder = settings.sectionOrder || ['scope', 'gallery', 'pricing', 'terms'];

    // Scroll Listener for Navbar Effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // --- COMPATIBILITY HELPERS ---
    const bgImage = settings.customCoverImageUrl ||
        (settings.coverImageTheme === 'Natural' ? 'https://images.unsplash.com/photo-1558904541-efa843a96f01?auto=format&fit=crop&q=80' :
            settings.coverImageTheme === 'Elegant' ? 'https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&q=80' :
                'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80');

    const grandTotal = estimate.total;
    const primaryFont = settings.fontFamily === 'Serif' ? 'font-serif' :
        settings.fontFamily === 'Mono' ? 'font-mono' : 'font-sans';

    // --- ANIMATION STYLES (Inline CSS for custom effects & Dynamic Colors) ---
    const customStyles = `
    :root {
        --primary: ${primaryColor};
        --secondary: ${secondaryColor};
    }
    @keyframes growGrass {
        0% { transform: scaleY(0); transform-origin: bottom; opacity: 0; }
        100% { transform: scaleY(1); transform-origin: bottom; opacity: 1; }
    }
    .grass-blade {
        animation: growGrass 1.5s ease-out forwards;
    }
    .parallax-bg {
        transform: translateZ(-1px) scale(2);
    }
    .scroll-fade-up {
        animation: fadeUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        opacity: 0;
        transform: translateY(20px);
    }
    @keyframes fadeUp {
        to { opacity: 1; transform: translateY(0); }
    }
    .text-primary { color: var(--primary) !important; }
    .bg-primary { background-color: var(--primary) !important; }
    .border-primary { border-color: var(--primary) !important; }
    .text-secondary { color: var(--secondary) !important; }
    .ring-primary { --tw-ring-color: var(--primary) !important; }
  `;

    const [showSignatureModal, setShowSignatureModal] = useState(false);
    const [signatureData, setSignatureData] = useState<string | null>(estimate.signature || null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    // Initialize signature if exists
    useEffect(() => {
        if (estimate.signature) setSignatureData(estimate.signature);
    }, [estimate.signature]);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        setIsDrawing(true);
        const rect = canvas.getBoundingClientRect();
        const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
        const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
        const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;

        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000';
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearSignature = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    const handleSaveSignature = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const blank = document.createElement('canvas');
        blank.width = canvas.width;
        blank.height = canvas.height;
        if (canvas.toDataURL() === blank.toDataURL()) {
            alert("Please sign before accepting.");
            return;
        }

        const dataUrl = canvas.toDataURL();
        setSignatureData(dataUrl);
        setShowSignatureModal(false);
        onAccept();
    };

    const isSigned = !!signatureData || estimate.status === 'Accepted';

    const navPositionClass = isEditor ? 'sticky top-0' : 'fixed top-0';
    const bottomBarClass = isEditor ? 'absolute bottom-0' : 'fixed bottom-0';
    const stickyHeaderClass = isEditor ? 'sticky top-0' : 'sticky top-14';

    // --- SECTION RENDERERS ---
    const renderSection = (sectionId: string) => {
        switch (sectionId) {
            case 'scope':
                return (
                    <section id="scope" key="scope" className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start scroll-fade-up" style={{ animationDelay: '0.2s' }}>
                        <div className="space-y-8">
                            <h2 className="text-3xl font-bold text-slate-900 border-l-4 border-primary pl-4">Executive Summary</h2>
                            <div className="prose prose-slate prose-lg text-slate-600 leading-relaxed whitespace-pre-wrap">
                                {settings.introMessage}
                            </div>
                        </div>

                        {settings.showCompanyProfile && (
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                                <div className="relative bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
                                    <div className="flex items-center gap-3 mb-6">
                                        {businessProfile?.logoUrl && <img src={businessProfile.logoUrl} className="w-12 h-12 rounded-full object-cover" />}
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900">{businessProfile?.businessName}</h3>
                                            <div className="flex text-amber-400">
                                                {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                                            </div>
                                        </div>
                                    </div>
                                    <p className="space-y-4 text-slate-600 leading-relaxed text-sm">
                                        {settings.companyProfileText || "We are dedicated to providing top-tier service with a focus on quality, reliability, and customer satisfaction."}
                                    </p>

                                    <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100">
                                        {businessProfile?.email && <div className="text-xs text-slate-500 flex items-center"><Mail size={12} className="mr-2 text-primary" /> {businessProfile.email}</div>}
                                        {businessProfile?.phone && <div className="text-xs text-slate-500 flex items-center"><Phone size={12} className="mr-2 text-primary" /> {businessProfile.phone}</div>}
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>
                );
            case 'gallery':
                if (!settings.showGallery || !settings.galleryImages?.length) return null;
                return (
                    <section id="gallery" key="gallery" className="space-y-12 scroll-fade-up">
                        <div className="text-center space-y-2">
                            <h2 className="text-3xl font-bold text-slate-900">Visualizing the Dream</h2>
                            <div className="h-1 w-20 bg-primary mx-auto rounded-full"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {settings.galleryImages.map((src, i) => (
                                <div key={i} className={`rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group relative ${i === 0 ? 'md:col-span-2 md:row-span-2 aspect-video' : 'aspect-square'}`}>
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10"></div>
                                    <img src={src} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000" alt="Gallery" />
                                </div>
                            ))}
                        </div>
                    </section>
                );
            case 'pricing':
                return (
                    <section id="pricing" key="pricing" className="space-y-10 scroll-fade-up">
                        <div className="text-center max-w-2xl mx-auto space-y-4">
                            <span className="text-primary font-bold tracking-wider uppercase text-xs bg-slate-50 px-3 py-1 rounded-full">Investment Breakdown</span>
                            <h2 className="text-4xl font-bold text-slate-900">Project Estimate</h2>
                        </div>

                        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden ring-1 ring-slate-900/5">
                            {/* Header */}
                            <div className="bg-slate-50 border-b border-slate-200 p-6 flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                                <span>Service / Item</span>
                                {settings.showLineItemPricing && <span>Total</span>}
                            </div>

                            {/* Items */}
                            <div className="divide-y divide-slate-100">
                                {estimate.items.map((item, idx) => (
                                    <div key={item.id} className="p-6 hover:bg-slate-50/50 transition-colors flex justify-between items-start group relative">
                                        <div className="absolute bottom-0 left-0 h-0.5 bg-primary w-0 group-hover:w-full transition-all duration-700"></div>
                                        <div className="space-y-1 pr-4">
                                            <div className="font-bold text-slate-800 text-lg group-hover:text-emerald-700 transition-colors">{item.description}</div>
                                            <div className="text-sm text-slate-500 flex items-center gap-2">
                                                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-bold">{item.type}</span>
                                                <span>Qty: {item.quantity}</span>
                                            </div>
                                        </div>
                                        {settings.showLineItemPricing && (
                                            <div className="font-bold text-slate-900 font-mono text-lg">
                                                {formatCurrency(item.total)}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Upsells */}
                            {settings.upsells && settings.upsells.length > 0 && (
                                <div className="bg-slate-50/50 border-t border-slate-200 p-8 space-y-6 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                                        <Sparkles size={100} className="text-secondary" />
                                    </div>
                                    <h4 className="font-bold text-slate-800 flex items-center text-lg"><div className="w-2 h-8 rounded-full bg-secondary mr-3"></div> Recommended Add-ons</h4>
                                    <div className="grid gap-4">
                                        {settings.upsells.map(upsell => (
                                            <div key={upsell.id} className="flex justify-between items-center bg-white/80 backdrop-blur p-5 rounded-2xl border border-white shadow-sm hover:shadow-md transition-all">
                                                <div>
                                                    <div className="font-bold text-slate-800 text-base">{upsell.name}</div>
                                                    <p className="text-sm text-slate-500">{upsell.description}</p>
                                                </div>
                                                <div className="text-right pl-4">
                                                    <div className="font-bold text-secondary text-lg">{formatCurrency(upsell.price)}</div>
                                                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Optional</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Summary */}
                            {settings.showTotals && (
                                <div className="bg-slate-900 text-white p-8 md:p-12 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-20"></div>

                                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
                                        <div className="space-y-2 text-center md:text-left">
                                            <div className="text-slate-400 font-medium text-sm tracking-wide uppercase">Total Investment</div>
                                            <div className="text-5xl md:text-6xl font-bold tracking-tight text-white drop-shadow-lg">{formatCurrency(grandTotal)}</div>
                                            {(estimate.adjustments?.applyTax) && (
                                                <div className="text-slate-500 text-xs flex items-center gap-1">
                                                    <Check size={12} /> Includes applicable taxes and fees
                                                </div>
                                            )}
                                            {signatureData && (
                                                <div className="mt-4 p-4 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10 inline-block min-w-[200px]">
                                                    <div className="text-xs text-slate-400 uppercase font-bold mb-2">My Signature</div>
                                                    <img src={signatureData} alt="Signature" className="h-12 w-auto invert brightness-0 filter" />
                                                </div>
                                            )}
                                        </div>

                                        {!readOnly && estimate.status !== 'Accepted' && !signatureData && (
                                            <div className="flex flex-col gap-4 w-full md:w-auto min-w-[280px]">
                                                <button onClick={() => setShowSignatureModal(true)} style={{ backgroundColor: primaryColor }} className="text-white hover:brightness-110 px-8 py-5 rounded-2xl font-bold flex items-center justify-center transition-all hover:scale-105 shadow-lg shadow-primary/30 text-lg">
                                                    <Check className="mr-3" /> {buttonText}
                                                </button>

                                                <div className="flex gap-3">
                                                    <button onClick={onDecline} className="flex-1 bg-transparent hover:bg-white/5 border border-white/20 text-white/60 hover:text-white px-4 py-3 rounded-xl font-bold text-sm transition-colors">
                                                        Decline
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {(estimate.status === 'Accepted' || signatureData) && settings.paymentLink && (
                                            <div className="flex flex-col gap-4 w-full md:w-auto min-w-[280px] animate-in slide-in-from-bottom-5">
                                                <div className="bg-emerald-500/20 text-emerald-300 px-4 py-2 rounded-lg text-center text-sm font-bold border border-emerald-500/30 mb-2">
                                                    ✓ {label} Signed
                                                </div>
                                                <a href={settings.paymentLink} target="_blank" rel="noreferrer" className="group bg-white text-slate-900 hover:bg-slate-50 px-8 py-5 rounded-2xl font-bold flex items-center justify-center transition-all hover:scale-105 shadow-2xl text-lg">
                                                    <CreditCard className="mr-3 group-hover:text-primary transition-colors" /> Pay Deposit Now
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                );
            case 'terms':
                return (
                    <section id="terms" key="terms" className="max-w-3xl mx-auto space-y-8 pb-32 scroll-fade-up">
                        <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
                            <ShieldCheck size={24} className="text-slate-300" />
                            <h3 className="text-xl font-bold text-slate-900">Terms & Conditions</h3>
                        </div>
                        <div className="text-sm text-slate-500 leading-relaxed whitespace-pre-wrap font-serif">
                            {settings.customTerms || "Standard business terms apply. Please contact us for more details."}
                        </div>
                        <div className="pt-8 flex justify-center">
                            <div className="text-slate-300 flex items-center gap-2 text-xs font-mono uppercase tracking-widest">
                                Powered by Cruz Remodel
                            </div>
                        </div>
                    </section>
                );
            default:
                return null;
        }
    };

    return (
        <div className={`min-h-screen bg-white ${primaryFont} text-slate-800 selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden relative ${isEditor ? 'h-full' : ''}`}>
            <style>{customStyles}</style>

            {/* --- STICKY NAV --- */}
            <div className={`${navPositionClass} inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-100 py-3' : 'bg-transparent py-6'}`}>
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        {/* Logo */}
                        {businessProfile?.logoUrl && (
                            <img
                                src={businessProfile.logoUrl}
                                className={`rounded-full shadow-sm transition-all duration-300 ${scrolled ? 'w-8 h-8' : 'w-10 h-10 border-2 border-white/20'}`}
                                alt="Logo"
                            />
                        )}
                        <div className={`font-bold text-lg tracking-tight transition-colors ${scrolled ? 'text-slate-900' : 'text-white'}`}>
                            {businessProfile?.businessName || label}
                        </div>
                    </div>
                    {!readOnly && (
                        <div className="flex items-center gap-3">
                            <button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} className={`hidden md:block text-sm font-medium px-4 py-2 rounded-full transition-colors ${scrolled ? 'text-slate-600 hover:bg-slate-100' : 'text-white/80 hover:bg-white/10'}`}>
                                Review
                            </button>
                            {!isSigned ? (
                                <button onClick={() => setShowSignatureModal(true)} style={{ backgroundColor: primaryColor }} className="text-white px-5 py-2 rounded-full font-bold text-sm shadow-lg shadow-primary/30 transition-all hover:scale-105 active:scale-95">
                                    {buttonText}
                                </button>
                            ) : (
                                <button disabled className="bg-slate-100 text-slate-400 px-5 py-2 rounded-full font-bold text-sm cursor-not-allowed">
                                    Accepted
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* --- SIGNATURE MODAL --- */}
            {showSignatureModal && (
                <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-slate-800">Sign to Accept</h3>
                            <button onClick={() => setShowSignatureModal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                                <X size={20} />
                            </button>
                        </div>
                        <p className="text-sm text-slate-500 mb-4">
                            By signing below, you agree to the terms and conditions outlined in this {label.toLowerCase()}.
                        </p>

                        <div className="border border-slate-300 rounded-xl bg-slate-50 overflow-hidden touch-none relative">
                            <canvas
                                ref={canvasRef}
                                width={400}
                                height={200}
                                className="w-full h-48 cursor-crosshair"
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                                onTouchStart={startDrawing}
                                onTouchMove={draw}
                                onTouchEnd={stopDrawing}
                            />
                            <div className="absolute bottom-2 right-2 flex gap-2">
                                <button onClick={clearSignature} className="text-xs text-slate-400 hover:text-slate-600 bg-white/80 px-2 py-1 rounded shadow-sm border border-slate-200">
                                    Clear
                                </button>
                            </div>
                        </div>
                        <div className="mt-2 text-center text-xs text-slate-400 border-t border-slate-100 pt-2">
                            X {client?.name || 'Client Signature'}
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowSignatureModal(false)} className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleSaveSignature} style={{ backgroundColor: primaryColor }} className="flex-1 py-3 text-white font-bold rounded-xl hover:brightness-110 shadow-lg shadow-primary/20 transition-all active:scale-95">
                                Sign & Accept
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- HERO SECTION --- */}
            <header id="hero" className="relative h-[85vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img src={bgImage} className="w-full h-full object-cover" alt="Cover" />
                    <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${heroOpacity})` }}></div>
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent"></div>
                </div>

                <div className="relative z-20 text-center px-4 max-w-4xl mx-auto space-y-6">
                    {businessProfile?.logoUrl && (
                        <div className="mx-auto w-24 h-24 md:w-32 md:h-32 bg-white p-2 rounded-full shadow-2xl mb-6 animate-in zoom-in-50 duration-1000">
                            <img src={businessProfile.logoUrl} className="w-full h-full object-cover rounded-full" />
                        </div>
                    )}

                    <div className="inline-block border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full text-white/90 text-sm font-bold uppercase tracking-widest mb-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-100">
                        Prepared for {client?.name || 'Valued Client'}
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-tight drop-shadow-lg animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                        {settings.title}
                    </h1>

                    <p className="text-xl text-slate-200 font-light max-w-2xl mx-auto drop-shadow-md animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                        {label}
                    </p>

                    <div className="pt-12 animate-in fade-in delay-700 duration-1000">
                        <ChevronDown className="mx-auto text-white/70 animate-bounce" size={32} />
                    </div>
                </div>
            </header>

            {/* --- STATUS BAR --- */}
            {(estimate.status === 'Accepted' || signatureData) && (
                <div className={`bg-emerald-50 border-b border-emerald-100 p-4 text-center ${stickyHeaderClass} z-40 shadow-sm animate-in slide-in-from-top-2`}>
                    <span className="text-emerald-700 font-bold flex items-center justify-center gap-2">
                        <Check size={20} className="bg-emerald-200 rounded-full p-0.5" />
                        {signatureData ? `${label} Signed & Accepted` : `This ${label.toLowerCase()} has been accepted.`}
                    </span>
                </div>
            )}

            <main className="max-w-5xl mx-auto px-6 py-20 space-y-32">
                {sectionOrder.map(sectionId => renderSection(sectionId))}
            </main>

            {/* --- MOBILE ACTION BAR (Fixed Bottom) --- */}
            {!readOnly && estimate.status !== 'Accepted' && !signatureData && (
                <div className={`${bottomBarClass} inset-x-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 p-4 md:hidden z-50 flex gap-3 shadow-[0_-5px_30px_rgba(0,0,0,0.15)] animate-in slide-in-from-bottom-full duration-500`}>
                    <button onClick={() => setShowSignatureModal(true)} style={{ backgroundColor: primaryColor }} className="flex-1 text-white rounded-xl font-bold py-3.5 flex items-center justify-center shadow-lg shadow-primary/30 active:scale-95 transition-transform">
                        {buttonText}
                    </button>
                </div>
            )}

            {/* Pay Now Mobile Sticky */}
            {(estimate.status === 'Accepted' || signatureData) && settings.paymentLink && (
                <div className={`${bottomBarClass} inset-x-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 p-4 md:hidden z-50 flex gap-3 shadow-[0_-5px_30px_rgba(0,0,0,0.15)] animate-in slide-in-from-bottom-full duration-500`}>
                    <a href={settings.paymentLink} target="_blank" rel="noreferrer" className="flex-1 bg-slate-900 text-white rounded-xl font-bold py-3.5 flex items-center justify-center shadow-lg active:scale-95 transition-transform">
                        <CreditCard size={18} className="mr-2" /> Pay Deposit
                    </a>
                </div>
            )}

            {/* --- DECORATIVE BACKGROUND NOISE --- */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.015] z-[60] mix-blend-multiply" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

        </div>
    );
};

export default PremiumProposalView;
