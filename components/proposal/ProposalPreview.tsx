
import React, { useState, useEffect, useRef } from 'react';
import { Estimate, ProposalSettings } from '../../types';
import {
    MapPin, Calendar, CreditCard, ShieldCheck, Leaf,
    PlusSquare, Check, Mail, Phone, Globe, CheckCircle, Image, ArrowRight
} from 'lucide-react';

interface ProposalPreviewProps {
    estimate: Estimate;
    settings: ProposalSettings;
    onUpdateSettings?: (updates: Partial<ProposalSettings>) => void;
    client?: any;
    businessProfile?: any;
    onAccept?: () => void;
    onDecline?: () => void;
    readOnly?: boolean;
}

// --- HELPER COMPONENT: Editable Element ---
interface EditableElementProps {
    value: string;
    onSave: (val: string) => void;
    readOnly?: boolean;
    className?: string;
    placeholder?: string;
    multiline?: boolean;
    style?: React.CSSProperties;
}

const EditableElement: React.FC<EditableElementProps> = ({ value, onSave, readOnly, className, placeholder, multiline, style }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState(value);
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

    useEffect(() => {
        setTempValue(value);
    }, [value]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleBlur = () => {
        setIsEditing(false);
        if (tempValue !== value) {
            onSave(tempValue);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !multiline) {
            handleBlur();
        }
        if (e.key === 'Escape') {
            setTempValue(value); // Revert
            setIsEditing(false);
        }
    };

    if (isEditing && !readOnly) {
        // Enforce White Background + Neon Border + Black Text
        const commonClasses = `w-full !bg-white !text-black border-2 border-[#39FF14] rounded-lg outline-none p-2 shadow-[0_0_15px_rgba(57,255,20,0.3)] ring-2 ring-[#39FF14]/20 ${className}`;

        if (multiline) {
            return (
                <textarea
                    ref={inputRef as any}
                    className={commonClasses}
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    rows={6}
                    style={{ ...style, resize: 'vertical' }}
                />
            );
        }
        return (
            <input
                ref={inputRef as any}
                className={commonClasses}
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                style={style}
            />
        );
    }

    return (
        <div
            onDoubleClick={() => !readOnly && setIsEditing(true)}
            className={`${className} ${!readOnly ? 'hover:ring-2 hover:ring-[#39FF14] hover:ring-offset-2 rounded-lg cursor-text transition-all duration-200' : ''}`}
            title={!readOnly ? "Double-click to edit" : undefined}
            style={style}
        >
            {value || <span className="opacity-50 italic">{placeholder}</span>}
        </div>
    );
};


const THEME_IMAGES: Record<string, string> = {
    'Modern': 'https://images.unsplash.com/photo-1628744876497-eb30460be9f6?q=80&w=2070&auto=format&fit=crop',
    'Natural': 'https://images.unsplash.com/photo-1558904541-efa843a96f01?q=80&w=2071&auto=format&fit=crop',
    'Elegant': 'https://images.unsplash.com/photo-1599818464309-8692794301cb?q=80&w=2070&auto=format&fit=crop',
    'Custom': '' // Handled by customCoverImageUrl
};

const ProposalPreview: React.FC<ProposalPreviewProps> = ({
    estimate, settings, onUpdateSettings, client, businessProfile, onAccept, onDecline, readOnly
}) => {

    const [selectedUpsells, setSelectedUpsells] = useState<Record<string, boolean>>({});

    const AVAILABLE_UPSELLS = settings.upsells || [];

    const calculateTotal = () => {
        let total = estimate.total;
        AVAILABLE_UPSELLS.forEach(u => {
            if (selectedUpsells[u.id]) total += u.price;
        });
        return total;
    };

    const formatPrice = (amount: number) => {
        return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const accentColor = settings.accentColor || '#0f172a'; // Default Slate 900
    const coverImage = settings.coverImageTheme === 'Custom'
        ? (settings.customCoverImageUrl || THEME_IMAGES['Modern'])
        : THEME_IMAGES[settings.coverImageTheme];

    const getFontClass = () => {
        switch (settings.fontFamily) {
            case 'Serif': return 'font-serif';
            case 'Mono': return 'font-mono';
            default: return 'font-sans';
        }
    };

    const getAnimationClass = (delay: number = 0) => {
        const delayStyle = delay === 1 ? 'delay-100' : delay === 2 ? 'delay-200' : delay === 3 ? 'delay-300' : '';
        switch (settings.animationStyle) {
            case 'Fade': return `animate-in fade-in duration-700 fill-mode-forwards ${delayStyle}`;
            case 'Slide': return `animate-in slide-in-from-bottom-8 duration-700 fill-mode-forwards ${delayStyle}`;
            case 'Zoom': return `animate-in zoom-in-95 duration-500 fill-mode-forwards ${delayStyle}`;
            case 'None': default: return '';
        }
    };

    // Safe wrapper for updates
    const updateSetting = (key: keyof ProposalSettings, val: any) => {
        if (onUpdateSettings) {
            onUpdateSettings({ [key]: val });
        }
    };

    return (
        <div className={`bg-white min-h-screen w-full relative flex flex-col ${getFontClass()} text-slate-800`}>

            {/* HERO SECTION */}
            <div className={`relative h-[60vh] md:h-[500px] w-full bg-slate-900 text-white flex flex-col justify-end shrink-0 print:h-[300px] overflow-hidden ${getAnimationClass(0)}`}>
                <div className="absolute inset-0">
                    <img
                        src={coverImage}
                        alt="Cover"
                        className="w-full h-full object-cover opacity-70"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
                </div>

                <div className="relative z-10 p-6 md:p-16 w-full">
                    <div className="flex flex-col md:flex-row justify-between items-center md:items-end text-center md:text-left">
                        <div className={`w-full max-w-3xl ${getAnimationClass(1)}`}>
                            <div
                                className="inline-flex items-center space-x-2 backdrop-blur-md px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider mb-4 border border-white/20 shadow-lg mx-auto md:mx-0"
                                style={{ backgroundColor: `${accentColor}90` }}
                            >
                                <span>Proposal #{estimate.id.slice(0, 6)}</span>
                            </div>

                            {/* EDITABLE TITLE */}
                            <div className="mb-4 md:mb-6">
                                <EditableElement
                                    value={settings.title}
                                    onSave={(val) => updateSetting('title', val)}
                                    readOnly={readOnly}
                                    placeholder="Proposal Title"
                                    className="text-3xl md:text-6xl font-bold leading-tight text-white drop-shadow-xl tracking-tight text-balance"
                                />
                            </div>

                            <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-6 text-xs md:text-sm text-slate-200 font-medium">
                                <span className="flex items-center bg-black/30 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/10"><Calendar size={14} className="mr-2 opacity-80" /> {new Date().toLocaleDateString()}</span>
                                {client && <span className="flex items-center bg-black/30 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/10"><MapPin size={14} className="mr-2 opacity-80" /> {client.address}</span>}
                            </div>
                        </div>

                        {/* Desktop Logo */}
                        <div className={`hidden md:block text-right ${getAnimationClass(1)}`}>
                            <div className="h-20 w-20 bg-white rounded-xl flex items-center justify-center text-slate-900 font-bold text-2xl shadow-2xl mb-3 overflow-hidden transform rotate-3">
                                {businessProfile?.logoUrl ? (
                                    <img src={businessProfile.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                                ) : (
                                    businessProfile?.businessName?.charAt(0) || 'B'
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CONTENT BODY */}
            <div className="flex-1 px-4 md:px-16 py-8 md:py-16 space-y-8 md:space-y-20 max-w-6xl mx-auto w-full">

                {/* EXECUTIVE SUMMARY */}
                <section className={`max-w-4xl mx-auto md:mx-0 ${getAnimationClass(1)}`}>
                    <h3 className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 md:mb-6 flex items-center">
                        <span className="w-8 h-[1px] bg-slate-400 mr-3"></span> Executive Summary
                    </h3>
                    <div className="prose prose-slate prose-p:text-slate-600 prose-p:leading-relaxed md:prose-lg max-w-none">
                        <EditableElement
                            value={settings.introMessage}
                            onSave={(val) => updateSetting('introMessage', val)}
                            readOnly={readOnly}
                            multiline
                            placeholder="Write your executive summary here..."
                            className="whitespace-pre-line text-sm md:text-lg"
                        />
                    </div>
                </section>

                {/* GALLERY SECTION */}
                {settings.showGallery && (settings.galleryImages || []).length > 0 && (
                    <section className={getAnimationClass(2)}>
                        <div className="flex items-center mb-4 md:mb-8 pb-2 md:pb-4 border-b border-slate-100">
                            <Image className="mr-3 text-slate-400" size={20} />
                            <h2 className="text-xl md:text-3xl font-bold text-slate-900">Inspiration</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {settings.galleryImages?.map((url, index) => (
                                <div key={index} className="aspect-video md:aspect-square bg-slate-100 rounded-xl overflow-hidden shadow-sm">
                                    <img src={url} alt={`Inspiration ${index + 1}`} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* SCOPE OF WORK (Optimized List) */}
                <section className={getAnimationClass(2)}>
                    <div className="flex items-center mb-4 md:mb-8 pb-2 md:pb-4 border-b border-slate-100">
                        <Leaf className="mr-3 text-slate-400" size={20} />
                        <h2 className="text-xl md:text-3xl font-bold text-slate-900">Scope of Work</h2>
                    </div>

                    <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-1 md:gap-4">
                        {estimate.items.map((item) => (
                            <div key={item.id} className="group p-4 md:p-6 bg-slate-50 md:bg-white md:border md:border-slate-100 rounded-xl transition-all hover:shadow-md">
                                {/* Mobile Layout: Row 1 = Title + Price */}
                                <div className="flex justify-between items-start mb-2 md:mb-0">
                                    <div className="flex-1 pr-4">
                                        <h4 className="font-bold text-base md:text-xl text-slate-900 leading-tight">{item.description}</h4>

                                        {/* Desktop details move here */}
                                        <div className="hidden md:flex items-center mt-2 gap-3 text-sm text-slate-500">
                                            <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide border border-slate-200">{item.type}</span>
                                            <span>•</span>
                                            <span>{item.quantity} units</span>
                                        </div>
                                    </div>

                                    {settings.showLineItemPricing ? (
                                        <div className="text-right">
                                            <span className="block font-bold text-lg md:text-xl text-slate-900">${formatPrice(item.total)}</span>
                                            <span className="text-xs text-slate-400 hidden md:block">
                                                {item.quantity} @ ${item.rate.toFixed(2)}
                                            </span>
                                        </div>
                                    ) : (
                                        <CheckCircle size={20} style={{ color: accentColor, opacity: 0.3 }} />
                                    )}
                                </div>

                                {/* Mobile Layout: Row 2 = Badge + Qty details */}
                                <div className="flex md:hidden justify-between items-center text-xs text-slate-500 mt-2 pt-2 border-t border-slate-200/50">
                                    <span className="bg-white border border-slate-200 px-2 py-0.5 rounded font-medium uppercase text-[10px] tracking-wide">
                                        {item.type}
                                    </span>
                                    <span>{item.quantity} units</span>
                                </div>

                                <p className="text-sm text-slate-500 mt-2 hidden md:block">
                                    Professional installation including all labor and materials.
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* UPSELLS */}
                {AVAILABLE_UPSELLS.length > 0 && (
                    <section className={`${getAnimationClass(3)} bg-white md:bg-slate-50 md:p-8 rounded-2xl md:border md:border-slate-200`}>
                        <div className="flex items-center mb-4 md:mb-6">
                            <PlusSquare className="mr-3 text-slate-400" size={20} />
                            <h2 className="text-xl md:text-2xl font-bold text-slate-900">Add-ons</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {AVAILABLE_UPSELLS.map(upsell => (
                                <label key={upsell.id} className="relative flex items-start p-4 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-slate-400 hover:shadow-md transition-all">
                                    <div className="mt-0.5 mr-3">
                                        <input
                                            type="checkbox"
                                            className="peer sr-only"
                                            checked={!!selectedUpsells[upsell.id]}
                                            onChange={(e) => !readOnly && setSelectedUpsells({ ...selectedUpsells, [upsell.id]: e.target.checked })}
                                            disabled={readOnly}
                                        />
                                        <div
                                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${selectedUpsells[upsell.id] ? 'border-transparent' : 'border-slate-300 bg-slate-50'}`}
                                            style={selectedUpsells[upsell.id] ? { backgroundColor: accentColor } : {}}
                                        >
                                            {selectedUpsells[upsell.id] && <Check size={12} className="text-white" />}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-bold text-slate-800 text-sm">{upsell.name}</span>
                                            <span className="font-bold text-sm" style={{ color: accentColor }}>+${formatPrice(upsell.price)}</span>
                                        </div>
                                        <span className="block text-xs text-slate-500 leading-snug">{upsell.description}</span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </section>
                )}

                {/* COMPANY PROFILE */}
                {settings.showCompanyProfile && (
                    <section className={`bg-slate-50 p-6 rounded-2xl ${getAnimationClass(3)}`}>
                        <div className="flex items-center mb-4">
                            <ShieldCheck className="mr-3 text-slate-400" size={20} />
                            <h2 className="text-lg font-bold text-slate-900">Why Us?</h2>
                        </div>
                        <div className="prose prose-sm text-slate-600">
                            <EditableElement
                                value={settings.companyProfileText || ''}
                                onSave={(val) => updateSetting('companyProfileText', val)}
                                readOnly={readOnly}
                                multiline
                                placeholder="Tell your story here..."
                                className="whitespace-pre-line"
                            />
                        </div>
                    </section>
                )}

                {/* FINANCIAL SUMMARY (Mobile Optimized) */}
                {settings.showTotals && (
                    <section className={`${getAnimationClass(3)} pt-4 md:pt-8 print:break-inside-avoid`}>
                        <div className="flex flex-col md:flex-row justify-end">
                            <div className="bg-slate-900 text-white rounded-2xl p-6 md:p-10 shadow-2xl w-full md:w-[450px] relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                                    <CreditCard size={100} />
                                </div>

                                <div className="relative z-10 space-y-3 mb-6 border-b border-white/10 pb-6 text-sm">
                                    <div className="flex justify-between text-white/70">
                                        <span>Subtotal</span>
                                        <span>${formatPrice(estimate.total)}</span>
                                    </div>
                                    {Object.keys(selectedUpsells).some(k => selectedUpsells[k]) && (
                                        <div className="flex justify-between text-green-400 font-medium">
                                            <span>Add-ons</span>
                                            <span>+${formatPrice(calculateTotal() - estimate.total)}</span>
                                        </div>
                                    )}
                                    {estimate.adjustments?.taxRate > 0 && estimate.adjustments?.applyTax && (
                                        <div className="flex justify-between text-white/70">
                                            <span>Tax ({estimate.adjustments.taxRate}%)</span>
                                            <span>${formatPrice(calculateTotal() * (estimate.adjustments.taxRate / 100))}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="relative z-10">
                                    <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1">Total Project Investment</p>
                                    <p className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                                        ${formatPrice(calculateTotal())}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* TERMS */}
                <section className={`text-xs text-slate-500 border-t border-slate-100 pt-8 leading-relaxed ${getAnimationClass(3)}`}>
                    <h4 className="font-bold text-slate-700 mb-2 uppercase tracking-wide">Terms & Conditions</h4>
                    {settings.customTerms ? (
                        <EditableElement
                            value={settings.customTerms}
                            onSave={(val) => updateSetting('customTerms', val)}
                            readOnly={readOnly}
                            multiline
                            className="whitespace-pre-line"
                        />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <p>1. <strong>Warranty:</strong> 1-year guarantee on workmanship and plant material (if irrigated).</p>
                            <p>2. <strong>Payment:</strong> 50% deposit to schedule, balance due upon completion.</p>
                            <p>3. <strong>Schedule:</strong> Dates are weather dependent.</p>
                            {!readOnly && (
                                <button
                                    onClick={() => updateSetting('customTerms', '1. Warranty: ...\n2. Payment: ...')}
                                    className="text-blue-600 hover:underline mt-2 text-left"
                                >
                                    Click to add custom terms
                                </button>
                            )}
                        </div>
                    )}
                </section>

                {/* FOOTER */}
                <footer className={`border-t border-slate-100 pt-8 pb-20 md:pb-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-400 ${getAnimationClass(3)}`}>
                    <div className="flex flex-col md:flex-row gap-3 mb-4 md:mb-0 text-center md:text-left">
                        {businessProfile?.website && <span className="flex items-center justify-center md:justify-start"><Globe size={12} className="mr-1" /> {businessProfile.website}</span>}
                        {businessProfile?.email && <span className="flex items-center justify-center md:justify-start"><Mail size={12} className="mr-1" /> {businessProfile.email}</span>}
                        {businessProfile?.phone && <span className="flex items-center justify-center md:justify-start"><Phone size={12} className="mr-1" /> {businessProfile.phone}</span>}
                    </div>
                    <div>Proposal generated by Cruz Remodel</div>
                </footer>
            </div>

            {/* FLOATING ACTION BAR (Mobile Only) */}
            {!readOnly && estimate.status !== 'Accepted' && estimate.status !== 'Declined' && (
                <div className="fixed bottom-4 left-4 right-4 md:hidden z-50 flex gap-3 animate-in slide-in-from-bottom-4 duration-500 delay-500">
                    <button
                        onClick={onDecline}
                        className="flex-1 bg-white text-slate-600 font-bold py-3 rounded-xl shadow-lg border border-slate-200"
                    >
                        Decline
                    </button>
                    <button
                        onClick={onAccept}
                        className="flex-[2] text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center"
                        style={{ backgroundColor: accentColor }}
                    >
                        Accept & Sign <ArrowRight size={16} className="ml-2" />
                    </button>
                </div>
            )}

            {/* DESKTOP STICKY BAR */}
            {!readOnly && estimate.status !== 'Accepted' && estimate.status !== 'Declined' && (
                <div className="hidden md:block sticky bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 p-6 z-50">
                    <div className="max-w-6xl mx-auto flex justify-between items-center">
                        <div>
                            <p className="font-bold text-slate-800">Ready to proceed?</p>
                            <p className="text-sm text-slate-500">Secure your spot on our schedule today.</p>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={onDecline} className="px-6 py-2.5 border border-slate-300 text-slate-600 font-bold rounded-lg hover:bg-slate-50 transition-colors">Decline</button>
                            <button onClick={onAccept} className="px-8 py-2.5 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center" style={{ backgroundColor: accentColor }}>
                                Accept Proposal <Check size={18} className="ml-2" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProposalPreview;
