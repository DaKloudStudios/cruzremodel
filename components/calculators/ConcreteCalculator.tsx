
import React, { useState } from 'react';
import { Box, Component, Footprints, Truck, Plus } from 'lucide-react';
import { CONCRETE_MIXES, PUMP_SERVICES } from '../../data/MaterialCatalog';
import { EstimateZone } from '../../types';

interface ConcreteCalculatorProps {
    onAddItem: (item: any) => void;
    zones: EstimateZone[];
}

type ConcreteSection = 'flatwork' | 'foundation' | 'city_curb' | 'landscape_curb' | 'steps';
type FinishType = 'standard' | 'stamped' | 'exposed' | 'sand';

const ConcreteCalculator: React.FC<ConcreteCalculatorProps> = ({ onAddItem, zones }) => {
    const [activeSection, setActiveSection] = useState<ConcreteSection>('flatwork');
    const [selectedZoneId, setSelectedZoneId] = useState<string>(zones[0]?.id || 'default');

    // Global Config
    const [selectedMix, setSelectedMix] = useState('');
    const [pumpType, setPumpType] = useState<string>('none');
    const [finishType, setFinishType] = useState<FinishType>('standard');

    // Additives
    const [hasFiber, setHasFiber] = useState(false);
    const [hasColor, setHasColor] = useState(false);
    const [hasSealer, setHasSealer] = useState(false);
    const [hasCure, setHasCure] = useState(false);

    // Dimensions
    const [area, setArea] = useState(0); // SF
    const [thickness, setThickness] = useState(4); // IN
    const [length, setLength] = useState(0); // LF
    const [width, setWidth] = useState(0); // IN
    const [height, setHeight] = useState(0); // IN (Depth/Height)

    // Steps Specific
    const [stepCount, setStepCount] = useState(3);
    const [stepWidth, setStepWidth] = useState(4); // FT
    const [stepRise, setStepRise] = useState(7); // IN
    const [stepRun, setStepRun] = useState(12); // IN
    const [landingDepth, setLandingDepth] = useState(3); // FT
    const [isLandingSolid, setIsLandingSolid] = useState(false);

    // Thickened Edge (Flatwork)
    const [hasThickenedEdge, setHasThickenedEdge] = useState(false);
    const [edgeLength, setEdgeLength] = useState(0); // LF
    const [edgeWidth, setEdgeWidth] = useState(12); // IN
    const [edgeDepth, setEdgeDepth] = useState(8); // IN

    const calculate = () => {
        if (!selectedMix) { alert("Please select a Concrete Mix."); return; }

        const mixItem = CONCRETE_MIXES.find(m => m.name === selectedMix);
        const mixPrice = mixItem ? mixItem.price : 200;

        let volCY = 0;
        let baseTons = 0;
        let description = '';

        // --- CALCULATIONS ---
        if (activeSection === 'flatwork') {
            if (area <= 0) { alert("Please enter Area"); return; }
            volCY = ((area * (thickness / 12)) / 27) * 1.05; // 5% Waste
            baseTons = ((area * (4 / 12)) / 27) * 1.5; // 4" Base standard
            description = `Flatwork (${thickness}" Thick)`;

            if (hasThickenedEdge && edgeLength > 0) {
                const edgeVolCY = ((edgeLength * (edgeWidth / 12) * (edgeDepth / 12)) / 27) * 1.10;
                volCY += edgeVolCY;
                description += ` w/ Thickened Edge`;
            }
        }
        else if (activeSection === 'foundation') {
            if (length <= 0 || width <= 0 || height <= 0) { alert("Please enter Length, Width, and Height"); return; }
            const volCF = length * (width / 12) * (height / 12);
            volCY = (volCF / 27) * 1.05;
            description = `Foundation/Wall (${length}' x ${width}" x ${height}")`;
        }
        else if (activeSection === 'city_curb') {
            if (length <= 0) { alert("Please enter Length"); return; }
            volCY = (length * 0.07) * 1.05;
            baseTons = (length * 0.05);
            description = `City Curb & Gutter`;
        }
        else if (activeSection === 'landscape_curb') {
            if (length <= 0) { alert("Please enter Length"); return; }
            volCY = ((length * 0.25) / 27) * 1.10;
            description = `Landscape Curbing (Mow Strip)`;
        }
        else if (activeSection === 'steps') {
            if (stepCount <= 0) { alert("Please enter Step Count"); return; }

            const runFt = stepRun / 12;
            const riseFt = stepRise / 12;
            const totalRiseFt = riseFt * stepCount;
            const oneStepVolCF = stepWidth * runFt * riseFt;
            const totalStairsCF = oneStepVolCF * (stepCount * (stepCount + 1) / 2);

            let landingVolCF = isLandingSolid ? (stepWidth * landingDepth) * totalRiseFt : (stepWidth * landingDepth) * (4 / 12);

            volCY = ((totalStairsCF + landingVolCF) / 27) * 1.10;
            baseTons = ((stepWidth * (stepRun / 12 * stepCount + landingDepth)) * (4 / 12) / 27) * 1.5;

            description = `Steps: ${stepCount} Risers + ${landingDepth}' ${isLandingSolid ? 'Solid' : 'Slab'} Landing`;
        }

        // --- COMPILE ITEMS ---
        const itemsToAdd: any[] = [];
        const add = (name: string, qty: number, unit: string, price: number, cat: string = 'Concrete') => {
            itemsToAdd.push({
                name,
                description: cat === 'Concrete' ? description : name,
                quantity: parseFloat(qty.toFixed(2)),
                unit,
                unitPrice: price,
                category: cat,
                zoneId: selectedZoneId
            });
        };

        add(`${selectedMix}`, volCY, 'CY', mixPrice);
        if (baseTons > 0) add("Roadbase Prep", baseTons, 'TON', 10.50, "Concrete: Base & Prep");

        if (pumpType !== 'none') {
            const pumpItem = PUMP_SERVICES.find(p => p.name === pumpType) || { name: 'Pump', price: 900 };
            add(pumpItem.name, 1, 'EA', pumpItem.price, "Concrete: Pumping & Services");
        }

        if (hasFiber) add("Fiber Mesh Additive", volCY, 'CY', 9.00, "Concrete: Additives & Finish");
        if (hasColor) add("Integral Color", volCY, 'CY', 95.00, "Concrete: Additives & Finish");
        if (hasSealer) add("Acrylic Sealer", Math.ceil(volCY * 150), 'SF', 0.25, "Concrete: Additives & Finish"); // Approx coverage
        if (hasCure) add("Cure & Seal", Math.ceil(volCY * 150), 'SF', 0.15, "Concrete: Additives & Finish");

        // Add all items
        itemsToAdd.forEach(item => onAddItem(item));

        // Reset inputs
        setArea(0); setLength(0); setEdgeLength(0);
        alert(`Added ${itemsToAdd.length} items to estimate.`);
    };

    const inputClass = "w-full pt-5 pb-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 transition-all peer placeholder-transparent";
    const labelClass = "absolute left-3 top-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-xs peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-blue-500 transition-all";

    return (
        <div className="space-y-6">
            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl overflow-x-auto">
                {[
                    { id: 'flatwork', label: 'Flatwork', icon: Box },
                    { id: 'foundation', label: 'Footings', icon: Component },
                    { id: 'city_curb', label: 'City Curb', icon: Truck },
                    { id: 'landscape_curb', label: 'Mow Strip', icon: Plus },
                    { id: 'steps', label: 'Steps', icon: Footprints },
                ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveSection(tab.id as ConcreteSection)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase whitespace-nowrap transition-all ${activeSection === tab.id ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
                        <tab.icon size={14} /> {tab.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative group">
                    <select value={selectedZoneId} onChange={(e) => setSelectedZoneId(e.target.value)} className={`${inputClass} appearance-none`}>
                        {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                    </select>
                    <label className={labelClass}>Zone Assignment</label>
                </div>
                <div className="relative group">
                    <select value={selectedMix} onChange={(e) => setSelectedMix(e.target.value)} className={`${inputClass} appearance-none`}>
                        <option value="">-- Select Mix --</option>
                        {CONCRETE_MIXES.map(m => <option key={m.name} value={m.name}>{m.name} (${m.price}/cy)</option>)}
                    </select>
                    <label className={labelClass}>Concrete Mix</label>
                </div>
            </div>

            {/* MAIN INPUTS */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h6 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center"><Box size={14} className="mr-2" /> Dimensions: {activeSection}</h6>
                    {activeSection === 'flatwork' && area > 0 && <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">Volume: {(((area * (thickness / 12)) / 27) * 1.05).toFixed(2)} CY</span>}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {activeSection === 'flatwork' && (
                        <>
                            <div className="relative">
                                <input type="number" id="area" placeholder="Area" value={area || ''} onChange={e => setArea(parseFloat(e.target.value))} className={inputClass} />
                                <label htmlFor="area" className={labelClass}>Area (SF)</label>
                            </div>
                            <div className="relative">
                                <input type="number" id="thickness" placeholder="Thick" value={thickness || ''} onChange={e => setThickness(parseFloat(e.target.value))} className={inputClass} />
                                <label htmlFor="thickness" className={labelClass}>Thickness (IN)</label>
                            </div>
                            <div className="col-span-2 md:col-span-3 pt-4 border-t border-slate-100 mt-2">
                                <label className="flex items-center gap-3 cursor-pointer p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors w-fit">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${hasThickenedEdge ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-300'}`}>
                                        {hasThickenedEdge && <Plus size={12} />}
                                    </div>
                                    <input type="checkbox" className="hidden" checked={hasThickenedEdge} onChange={e => setHasThickenedEdge(e.target.checked)} />
                                    <span className="text-xs font-bold uppercase text-slate-600">Thickened Edge</span>
                                </label>
                                {hasThickenedEdge && (
                                    <div className="grid grid-cols-3 gap-3 mt-3 animate-in fade-in slide-in-from-top-2">
                                        <div className="relative"><input type="number" placeholder="L" value={edgeLength || ''} onChange={e => setEdgeLength(parseFloat(e.target.value))} className={inputClass} /><label className={labelClass}>Length (LF)</label></div>
                                        <div className="relative"><input type="number" placeholder="W" value={edgeWidth || ''} onChange={e => setEdgeWidth(parseFloat(e.target.value))} className={inputClass} /><label className={labelClass}>Width (IN)</label></div>
                                        <div className="relative"><input type="number" placeholder="D" value={edgeDepth || ''} onChange={e => setEdgeDepth(parseFloat(e.target.value))} className={inputClass} /><label className={labelClass}>Depth (IN)</label></div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                    {activeSection === 'foundation' && (
                        <>
                            <div className="relative"><input type="number" placeholder="L" value={length || ''} onChange={e => setLength(parseFloat(e.target.value))} className={inputClass} /><label className={labelClass}>Length (LF)</label></div>
                            <div className="relative"><input type="number" placeholder="W" value={width || ''} onChange={e => setWidth(parseFloat(e.target.value))} className={inputClass} /><label className={labelClass}>Width (IN)</label></div>
                            <div className="relative"><input type="number" placeholder="H" value={height || ''} onChange={e => setHeight(parseFloat(e.target.value))} className={inputClass} /><label className={labelClass}>Height (IN)</label></div>
                        </>
                    )}
                    {activeSection === 'steps' && (
                        <>
                            <div className="relative"><input type="number" placeholder="#" value={stepCount} onChange={e => setStepCount(parseFloat(e.target.value))} className={inputClass} /><label className={labelClass}>Count</label></div>
                            <div className="relative"><input type="number" placeholder="W" value={stepWidth} onChange={e => setStepWidth(parseFloat(e.target.value))} className={inputClass} /><label className={labelClass}>Width (FT)</label></div>
                            <div className="relative"><input type="number" placeholder="R" value={stepRise} onChange={e => setStepRise(parseFloat(e.target.value))} className={inputClass} /><label className={labelClass}>Rise (IN)</label></div>
                            <div className="relative"><input type="number" placeholder="Run" value={stepRun} onChange={e => setStepRun(parseFloat(e.target.value))} className={inputClass} /><label className={labelClass}>Run (IN)</label></div>
                            <div className="relative"><input type="number" placeholder="L" value={landingDepth} onChange={e => setLandingDepth(parseFloat(e.target.value))} className={inputClass} /><label className={labelClass}>Landing (FT)</label></div>
                        </>
                    )}
                    {(activeSection === 'city_curb' || activeSection === 'landscape_curb') && (
                        <div className="relative col-span-2"><input type="number" placeholder="L" value={length || ''} onChange={e => setLength(parseFloat(e.target.value))} className={inputClass} /><label className={labelClass}>Total Length (LF)</label></div>
                    )}
                </div>
            </div>

            {/* EXTRAS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative group">
                    <select value={pumpType} onChange={(e) => setPumpType(e.target.value)} className={`${inputClass} appearance-none`}>
                        <option value="none">No Pump Required</option>
                        {PUMP_SERVICES.map(p => <option key={p.name} value={p.name}>{p.name} (${p.price})</option>)}
                    </select>
                    <label className={labelClass}>Pump Service</label>
                </div>
                <div className="relative group">
                    <select value={finishType} onChange={(e) => setFinishType(e.target.value as any)} className={`${inputClass} appearance-none`}>
                        <option value="standard">Standard Broom Finish</option>
                        <option value="stamped">Stamped (+20%)</option>
                        <option value="exposed">Exposed Aggregate (+15%)</option>
                        <option value="sand">Sand Finish (+10%)</option>
                    </select>
                    <label className={labelClass}>Finish Type</label>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
                {[
                    { state: hasFiber, set: setHasFiber, label: 'Fiber' },
                    { state: hasColor, set: setHasColor, label: 'Color' },
                    { state: hasSealer, set: setHasSealer, label: 'Sealer' },
                    { state: hasCure, set: setHasCure, label: 'Cure' }
                ].map((opt, i) => (
                    <button key={i} onClick={() => opt.set(!opt.state)}
                        className={`py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border-2 ${opt.state ? 'bg-blue-500 text-white border-blue-500 shadow-md transform scale-105' : 'bg-white text-slate-400 border-slate-100 hover:border-blue-200'}`}>
                        {opt.label}
                    </button>
                ))}
            </div>

            <button onClick={calculate} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold uppercase text-sm tracking-widest shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group">
                <Plus size={18} className="text-blue-400 group-hover:rotate-90 transition-transform" /> Add to Estimate
            </button>
        </div>
    );
};

export default ConcreteCalculator;
