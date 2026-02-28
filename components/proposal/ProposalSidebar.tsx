import React, { useState, useEffect } from 'react';
import { ProposalSettings, EstimateItem, ProposalUpsell } from '../../types';
import { GoogleGenAI } from "@google/genai";
import {
    Settings, Palette, Eye, Share2, LayoutTemplate,
    Image as ImageIcon, Type, CheckSquare, Copy, ExternalLink, Mail,
    FileText, Layout, Plus, Trash2, Wand2, Sparkles, PlayCircle, PlusSquare,
    Move, GripVertical, ChevronUp, ChevronDown
} from 'lucide-react';

interface ProposalSidebarProps {
    settings: ProposalSettings;
    estimateItems?: EstimateItem[]; // Optional, needed for AI gen
    onUpdateSettings: (updates: Partial<ProposalSettings>) => void;
    publicLink: string;
    clientEmail?: string;
    businessName?: string;
    onPreviewClient: () => void;
    onSave: () => void;
}

type Tab = 'Branding' | 'Content' | 'Layout' | 'Marketing' | 'Share';

const ProposalSidebar: React.FC<ProposalSidebarProps> = ({
    settings, estimateItems, onUpdateSettings, publicLink, clientEmail, businessName, onPreviewClient, onSave
}) => {
    const [activeTab, setActiveTab] = useState<Tab>('Content');
    const [newImageUrl, setNewImageUrl] = useState('');
    const [aiLoading, setAiLoading] = useState(false);

    // Upsell Form State
    const [upsellName, setUpsellName] = useState('');
    const [upsellPrice, setUpsellPrice] = useState('');
    const [upsellDesc, setUpsellDesc] = useState('');

    // Default Section Order if not set
    const DEFAULT_SECTIONS = ['scope', 'gallery', 'pricing', 'terms'];
    const [localSectionOrder, setLocalSectionOrder] = useState<string[]>(settings.sectionOrder || DEFAULT_SECTIONS);

    // Sync section order to settings when changed locally (debounced or strictly on change)
    useEffect(() => {
        if (!settings.sectionOrder) {
            onUpdateSettings({ sectionOrder: DEFAULT_SECTIONS });
        } else {
            setLocalSectionOrder(settings.sectionOrder);
        }
    }, [settings.sectionOrder]);

    const handleSectionReorder = (index: number, direction: 'up' | 'down') => {
        const newOrder = [...localSectionOrder];
        if (direction === 'up' && index > 0) {
            [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
        } else if (direction === 'down' && index < newOrder.length - 1) {
            [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
        }
        setLocalSectionOrder(newOrder);
        onUpdateSettings({ sectionOrder: newOrder });
    };

    const THEMES = [
        { id: 'Modern', label: 'Modern', color: 'bg-slate-900' },
        { id: 'Natural', label: 'Natural', color: 'bg-emerald-700' },
        { id: 'Elegant', label: 'Elegant', color: 'bg-slate-600' },
        { id: 'Custom', label: 'Custom URL', color: 'bg-indigo-600' }
    ];

    const PRESET_COLORS = [
        '#0f172a', // Slate 900
        '#059669', // Emerald 600
        '#2563eb', // Blue 600
        '#d97706', // Amber 600
        '#7c3aed', // Violet 600
        '#dc2626', // Red 600
        '#000000', // Black
    ];

    const FONTS = [
        { id: 'Sans', label: 'Modern Sans' },
        { id: 'Serif', label: 'Classic Serif' },
        { id: 'Mono', label: 'Technical Mono' },
    ];

    const ANIMATIONS = [
        { id: 'None', label: 'None' },
        { id: 'Fade', label: 'Fade In' },
        { id: 'Slide', label: 'Slide Up' },
        { id: 'Zoom', label: 'Zoom' },
    ];

    const addGalleryImage = () => {
        if (!newImageUrl) return;
        const current = settings.galleryImages || [];
        onUpdateSettings({ galleryImages: [...current, newImageUrl] });
        setNewImageUrl('');
    };

    const removeGalleryImage = (index: number) => {
        const current = settings.galleryImages || [];
        onUpdateSettings({ galleryImages: current.filter((_, i) => i !== index) });
    };

    const addUpsell = () => {
        if (!upsellName || !upsellPrice) return;
        const newUpsell: ProposalUpsell = {
            id: Math.random().toString(36).substr(2, 9),
            name: upsellName,
            price: Number(upsellPrice),
            description: upsellDesc
        };
        const current = settings.upsells || [];
        onUpdateSettings({ upsells: [...current, newUpsell] });
        // Reset form
        setUpsellName('');
        setUpsellPrice('');
        setUpsellDesc('');
    };

    const removeUpsell = (id: string) => {
        const current = settings.upsells || [];
        onUpdateSettings({ upsells: current.filter(u => u.id !== id) });
    };

    const handleGenerateScope = async () => {
        if (!estimateItems || estimateItems.length === 0) {
            alert("Please ensure the estimate has items before generating a scope.");
            return;
        }
        setAiLoading(true);
        try {
            const itemList = estimateItems.map(i => `- ${i.quantity}x ${i.description}`).join('\n');
            const prompt = `
            Act as a professional estimator. Write a persuasive and clear "Scope of Work" / Executive Summary for a landscaping proposal based on these items:
            ${itemList}

            Keep it professional, outlining the value we bring. Do not include prices. Use paragraphs and bullet points where appropriate.
          `;

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
            const response = await ai.models.generateContent({ model: 'gemini-2.0-flash', contents: prompt }); // Updated model name if needed, assuming gemini-2.0 or similar

            onUpdateSettings({ introMessage: response.text.trim() });
        } catch (e) {
            console.error("AI Generation Error", e);
            alert("Failed to generate text. Please ensure API Key is set.");
        } finally {
            setAiLoading(false);
        }
    };

    // --- NEON INPUT STYLE ---
    // Explicitly forcing white bg, black text, and neon border on focus/active
    const neonInputClass = "w-full p-3 !bg-white !text-black border border-slate-300 rounded-lg text-sm focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14] focus:shadow-[0_0_15px_rgba(57,255,20,0.3)] outline-none transition-all placeholder:text-slate-400";
    const labelClass = "block text-[10px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider";

    return (
        <div className="w-[360px] bg-slate-50 border-l border-slate-200 flex flex-col h-full shrink-0 shadow-xl z-30">

            {/* TAB NAV */}
            <div className="flex border-b border-slate-200 bg-white overflow-x-auto no-scrollbar">
                {[
                    { id: 'Content', icon: <FileText size={18} />, label: 'Content' },
                    { id: 'Branding', icon: <Palette size={18} />, label: 'Design' },
                    { id: 'Layout', icon: <Layout size={18} />, label: 'Layout' },
                    { id: 'Marketing', icon: <Sparkles size={18} />, label: 'Upsells' },
                    { id: 'Share', icon: <Share2 size={18} />, label: 'Share' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as Tab)}
                        className={`flex-1 min-w-[64px] py-3 flex flex-col gap-1 justify-center items-center text-[10px] font-medium transition-colors relative ${activeTab === tab.id ? 'text-blue-600 bg-blue-50/50' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                        title={tab.label}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                        {activeTab === tab.id && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-blue-600"></div>}
                    </button>
                ))}
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">

                {activeTab === 'Content' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">Content & Messaging</h3>

                        <div>
                            <label className={labelClass}>Proposal Title</label>
                            <input
                                className={neonInputClass}
                                value={settings.title}
                                onChange={(e) => onUpdateSettings({ title: e.target.value })}
                                placeholder="e.g. Backyard Renovation"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={labelClass}>Document Label</label>
                                <input
                                    className={neonInputClass}
                                    value={settings.proposalLabel || 'Proposal'}
                                    onChange={(e) => onUpdateSettings({ proposalLabel: e.target.value })}
                                    placeholder="Proposal"
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Action Button</label>
                                <input
                                    className={neonInputClass}
                                    value={settings.buttonText || 'Sign & Accept'}
                                    onChange={(e) => onUpdateSettings({ buttonText: e.target.value })}
                                    placeholder="Sign & Accept"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className={labelClass}>Executive Summary</label>
                                <button
                                    onClick={handleGenerateScope}
                                    disabled={aiLoading}
                                    className="text-[10px] bg-purple-100 text-purple-700 px-2 py-1 rounded-md font-bold flex items-center hover:bg-purple-200 transition-colors disabled:opacity-50"
                                >
                                    {aiLoading ? 'Writing...' : <><Wand2 size={10} className="mr-1" /> AI Generate</>}
                                </button>
                            </div>
                            <textarea
                                className={`${neonInputClass} h-64 resize-none leading-relaxed`}
                                value={settings.introMessage}
                                onChange={(e) => onUpdateSettings({ introMessage: e.target.value })}
                                placeholder="Write a personal note or generate one using AI..."
                            />
                            <p className="text-[10px] text-slate-400 mt-2 text-right">Markdown supported</p>
                        </div>

                        <div>
                            <label className={labelClass}>Legal Terms</label>
                            <textarea
                                className={`${neonInputClass} h-32 resize-none leading-relaxed text-xs`}
                                value={settings.customTerms || ''}
                                onChange={(e) => onUpdateSettings({ customTerms: e.target.value })}
                                placeholder="Override default terms..."
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'Branding' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                        <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">Design & Branding</h3>

                        {/* Colors */}
                        <div>
                            <label className={labelClass}>Brand Colors</label>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-xs text-slate-500 mb-1">Primary</div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            className="w-8 h-8 p-0 border-0 rounded cursor-pointer shadow-sm"
                                            value={settings.primaryColor || '#0f172a'}
                                            onChange={(e) => onUpdateSettings({ primaryColor: e.target.value, accentColor: e.target.value })}
                                        />
                                        <span className="text-xs font-mono text-slate-600">{settings.primaryColor || '#0f172a'}</span>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500 mb-1">Secondary (Accent)</div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            className="w-8 h-8 p-0 border-0 rounded cursor-pointer shadow-sm"
                                            value={settings.secondaryColor || '#10b981'}
                                            onChange={(e) => onUpdateSettings({ secondaryColor: e.target.value })}
                                        />
                                        <span className="text-xs font-mono text-slate-600">{settings.secondaryColor || '#10b981'}</span>
                                    </div>
                                </div>
                            </div>
                            {/* Presets */}
                            <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-slate-100">
                                {PRESET_COLORS.map(color => (
                                    <button
                                        key={color}
                                        onClick={() => onUpdateSettings({ primaryColor: color, accentColor: color })}
                                        className={`w-6 h-6 rounded-full border border-slate-200 hover:scale-110 transition-transform ${settings.primaryColor === color ? 'ring-2 ring-slate-400' : ''}`}
                                        style={{ backgroundColor: color }}
                                        title={color}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Hero Image Selector */}
                        <div>
                            <label className={labelClass}>Cover Image</label>
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                {THEMES.map(theme => (
                                    <button
                                        key={theme.id}
                                        onClick={() => onUpdateSettings({ coverImageTheme: theme.id as any })}
                                        className={`relative h-16 rounded-xl overflow-hidden border-2 transition-all group ${settings.coverImageTheme === theme.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-slate-200 opacity-80 hover:opacity-100'}`}
                                    >
                                        <div className={`absolute inset-0 ${theme.color}`}></div>
                                        <span className="relative z-10 text-white font-bold text-xs drop-shadow-md">{theme.label}</span>
                                    </button>
                                ))}
                            </div>

                            {settings.coverImageTheme === 'Custom' && (
                                <div className="mt-3 animate-in fade-in">
                                    <input
                                        className={neonInputClass}
                                        placeholder="https://example.com/image.jpg"
                                        value={settings.customCoverImageUrl || ''}
                                        onChange={(e) => onUpdateSettings({ customCoverImageUrl: e.target.value })}
                                    />
                                </div>
                            )}

                            <div className="mt-4">
                                <label className="flex justify-between text-xs text-slate-500 mb-1">
                                    <span>Overlay Opacity</span>
                                    <span>{(settings.heroOverlayOpacity ?? 0.4) * 100}%</span>
                                </label>
                                <input
                                    type="range"
                                    min="0" max="0.9" step="0.1"
                                    value={settings.heroOverlayOpacity ?? 0.4}
                                    onChange={(e) => onUpdateSettings({ heroOverlayOpacity: parseFloat(e.target.value) })}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                            </div>
                        </div>

                        {/* Font Family */}
                        <div>
                            <label className={labelClass}>Typography</label>
                            <div className="flex bg-white rounded-lg border border-slate-200 p-1">
                                {FONTS.map(font => (
                                    <button
                                        key={font.id}
                                        onClick={() => onUpdateSettings({ fontFamily: font.id as any })}
                                        className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${settings.fontFamily === font.id
                                            ? 'bg-slate-100 text-slate-900 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                    >
                                        {font.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Animations */}
                        <div>
                            <label className={labelClass}>Entry Animation</label>
                            <div className="grid grid-cols-2 gap-2">
                                {ANIMATIONS.map(anim => (
                                    <button
                                        key={anim.id}
                                        onClick={() => onUpdateSettings({ animationStyle: anim.id as any })}
                                        className={`py-2 text-xs font-medium rounded-md border transition-all ${(settings.animationStyle || 'Fade') === anim.id
                                            ? 'bg-slate-800 text-white border-slate-800'
                                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                            }`}
                                    >
                                        {anim.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'Layout' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">Structure & Sections</h3>

                        {/* Section Visibility Toggles */}
                        <div className="space-y-3">
                            <label className={labelClass}>Visible Sections</label>

                            {['showGallery:Image Gallery', 'showCompanyProfile:Company Profile', 'showLineItemPricing:Line Item Pricing', 'showTotals:Total Summary'].map(item => {
                                const [key, label] = item.split(':');
                                return (
                                    <label key={key} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-blue-300 transition-all">
                                        <span className="text-sm font-medium text-slate-700">{label}</span>
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 accent-blue-600"
                                            checked={(settings as any)[key]}
                                            onChange={(e) => onUpdateSettings({ [key]: e.target.checked })}
                                        />
                                    </label>
                                )
                            })}
                        </div>

                        {/* Section Order */}
                        <div className="pt-4 border-t border-slate-200">
                            <label className={labelClass}>Section Order</label>
                            <div className="space-y-2">
                                {localSectionOrder.map((sectionId, index) => (
                                    <div key={sectionId} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                                        <div className="flex items-center gap-2">
                                            <GripVertical size={14} className="text-slate-400 cursor-move" />
                                            <span className="text-sm font-medium capitalize text-slate-700">{sectionId}</span>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => handleSectionReorder(index, 'up')}
                                                disabled={index === 0}
                                                className="p-1 hover:bg-slate-100 rounded disabled:opacity-30"
                                            >
                                                <ChevronUp size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleSectionReorder(index, 'down')}
                                                disabled={index === localSectionOrder.length - 1}
                                                className="p-1 hover:bg-slate-100 rounded disabled:opacity-30"
                                            >
                                                <ChevronDown size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Specific Content Editors if enabled */}
                        {settings.showGallery && (
                            <div className="pt-4 border-t border-slate-200">
                                <label className={labelClass}>Gallery Images</label>
                                <div className="flex gap-2 mb-3">
                                    <input
                                        className={neonInputClass}
                                        placeholder="Image URL..."
                                        value={newImageUrl}
                                        onChange={(e) => setNewImageUrl(e.target.value)}
                                    />
                                    <button onClick={addGalleryImage} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                                        <Plus size={16} />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {(settings.galleryImages || []).map((url, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded text-xs">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <img src={url} className="w-6 h-6 rounded object-cover bg-slate-100" />
                                                <span className="truncate max-w-[150px]">{url}</span>
                                            </div>
                                            <button onClick={() => removeGalleryImage(idx)} className="text-red-400 hover:text-red-600">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {settings.showCompanyProfile && (
                            <div className="pt-4 border-t border-slate-200">
                                <label className={labelClass}>Company Profile Text</label>
                                <textarea
                                    className={`${neonInputClass} h-24 resize-none`}
                                    value={settings.companyProfileText || ''}
                                    onChange={(e) => onUpdateSettings({ companyProfileText: e.target.value })}
                                    placeholder="Tell your story here..."
                                />
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'Marketing' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">Upsells & Add-ons</h3>
                        <div className="space-y-4">
                            <h4 className={labelClass}>Add New Option</h4>
                            <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 space-y-3">
                                <input
                                    className={neonInputClass}
                                    placeholder="Option Name (e.g. Mulch Upgrade)"
                                    value={upsellName}
                                    onChange={(e) => setUpsellName(e.target.value)}
                                />
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-slate-400 text-sm z-10">$</span>
                                    <input
                                        type="number"
                                        className={`${neonInputClass} pl-6`}
                                        placeholder="Price"
                                        value={upsellPrice}
                                        onChange={(e) => setUpsellPrice(e.target.value)}
                                    />
                                </div>
                                <textarea
                                    className={`${neonInputClass} resize-none`}
                                    placeholder="Description (Optional)"
                                    rows={2}
                                    value={upsellDesc}
                                    onChange={(e) => setUpsellDesc(e.target.value)}
                                />
                                <button
                                    onClick={addUpsell}
                                    disabled={!upsellName || !upsellPrice}
                                    className="w-full bg-slate-900 text-white py-2 rounded-lg font-bold text-sm hover:bg-slate-800 transition-colors disabled:opacity-50"
                                >
                                    Add Option
                                </button>
                            </div>

                            <div className="pt-2">
                                <h4 className={labelClass}>Current Add-ons</h4>
                                <div className="space-y-3">
                                    {(settings.upsells || []).map((upsell) => (
                                        <div key={upsell.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm relative group">
                                            <button
                                                onClick={() => removeUpsell(upsell.id)}
                                                className="absolute top-2 right-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                            <div className="flex justify-between font-bold text-slate-800 text-sm mb-1 pr-6">
                                                <span>{upsell.name}</span>
                                                <span className="text-green-600">+${upsell.price}</span>
                                            </div>
                                            <p className="text-xs text-slate-500">{upsell.description}</p>
                                        </div>
                                    ))}
                                    {(settings.upsells || []).length === 0 && (
                                        <p className="text-center text-slate-400 text-xs py-4 border-2 border-dashed border-slate-200 rounded-lg">
                                            No upsells added yet.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'Share' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">Sharing & Payment</h3>
                        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                            <label className={labelClass}>Public Link</label>
                            <div className="flex gap-2">
                                <input
                                    readOnly
                                    value={publicLink}
                                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-600 font-mono select-all"
                                />
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(publicLink);
                                        alert("Link copied to clipboard!");
                                    }}
                                    className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
                                    title="Copy"
                                >
                                    <Copy size={16} />
                                </button>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-2">
                                Anyone with this link can view and accept the proposal.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm mb-4">
                                <label className={labelClass}>Payment Link</label>
                                <input
                                    className={neonInputClass}
                                    placeholder="https://stripe.com/..."
                                    value={settings.paymentLink || ''}
                                    onChange={(e) => onUpdateSettings({ paymentLink: e.target.value })}
                                />
                                <p className="text-[10px] text-slate-400 mt-2">
                                    Paste a link to your payment processor (Stripe, PayPal, etc.). A "Pay Now" button will appear on the proposal.
                                </p>
                            </div>

                            <button
                                onClick={onPreviewClient}
                                className="w-full py-3 bg-slate-900 text-white rounded-lg font-bold flex items-center justify-center hover:bg-slate-800 transition-colors shadow-md"
                            >
                                <ExternalLink size={16} className="mr-2" /> Open Client View
                            </button>

                            <button
                                onClick={() => {
                                    const subject = encodeURIComponent(`${settings.proposalLabel || 'Proposal'}: ${settings.title}`);
                                    const body = encodeURIComponent(`Hi,\n\nPlease review your proposal here:\n${publicLink}\n\nThanks,\n${businessName}`);
                                    window.location.href = `mailto:${clientEmail || ''}?subject=${subject}&body=${body}`;
                                }}
                                className="w-full py-3 bg-white border border-slate-300 text-slate-700 rounded-lg font-bold flex items-center justify-center hover:bg-slate-50 transition-colors"
                            >
                                <Mail size={16} className="mr-2" /> Draft Email
                            </button>
                        </div>
                    </div>
                )}

            </div>

            {/* FOOTER ACTIONS */}
            <div className="p-4 border-t border-slate-200 bg-white shadow-[0_-5px_15px_rgba(0,0,0,0.05)] z-40">
                <button
                    onClick={onSave}
                    className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                >
                    <CheckSquare size={18} className="mr-2" /> Save Changes
                </button>
            </div>
        </div>
    );
};

export default ProposalSidebar;
