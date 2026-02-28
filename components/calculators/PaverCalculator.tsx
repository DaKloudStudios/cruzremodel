import React, { useState, useMemo } from 'react';
import { LayoutGrid, Grid, Layers, Hexagon, Package, Plus } from 'lucide-react';
import { EstimateZone } from '../../types';
import { PAVERS_STANDARD, PAVERS_PREMIUM } from '../../data/MaterialCatalog';

interface PaverCalculatorProps {
    onAddItem: (item: any) => void;
    zones: EstimateZone[];
}

const PaverCalculator: React.FC<PaverCalculatorProps> = ({ onAddItem, zones }) => {
    const [activeMode, setActiveMode] = useState<'paver' | 'flagstone'>('paver');
    const [selectedZoneId, setSelectedZoneId] = useState<string>(zones[0]?.id || 'default');

    // Input State
    const [area, setArea] = useState(0);
    const [perimeter, setPerimeter] = useState(0);
    const [depth, setDepth] = useState(6); // Base Depth
    const [selectedMaterial, setSelectedMaterial] = useState('');

    // Complexity
    const [borderType, setBorderType] = useState<'none' | 'single' | 'double'>('single');
    const [designType, setDesignType] = useState<'none' | 'simple' | 'complex'>('none');
    const [complexity, setComplexity] = useState<'simple' | 'moderate' | 'complex'>('simple');
    const [edgeRestraint, setEdgeRestraint] = useState<string>('none');

    const options = useMemo(() => {
        if (activeMode === 'paver') {
            return [...PAVERS_STANDARD, ...PAVERS_PREMIUM];
        }
        // Flagstone mock for now if not in catalog
        return [
            { name: "Silver Quartzite Flagstone", price: 9.50, unit: "SF", category: "Flagstone" },
            { name: "Gold Quartzite Flagstone", price: 9.50, unit: "SF", category: "Flagstone" },
            { name: "Oklahoma Brown Flagstone", price: 8.00, unit: "SF", category: "Flagstone" },
        ];
    }, [activeMode]);

    const calculate = () => {
        if (area <= 0) { alert("Please enter Area"); return; }
        if (!selectedMaterial) { alert("Please select a Material"); return; }

        // 1. Material Calculation
        // Base: Volume * Density (1.5 tons/cy)
        const baseTons = ((area * (depth / 12)) / 27) * 1.5;

        // Sand: 1 inch depth approx
        const sandTons = ((area * 0.083) / 27) * 1.4;

        // Poly Sand / Joint Material
        const coveragePerBag = activeMode === 'paver' ? 60 : 30;
        const polyBags = Math.ceil(area / coveragePerBag);

        // Edging
        const edgePieces = Math.ceil(perimeter / 7.5);
        const spikes = Math.ceil(edgePieces / 10); // Box of 50, but let's count individual spikes if needed or boxes? Catalog has BOX.
        const spikeBoxes = Math.ceil(spikes / 50) || 1;

        const selectedItem = options.find(p => p.name === selectedMaterial);
        const itemPrice = selectedItem ? selectedItem.price : 5.00;
        const categoryName = activeMode === 'paver' ? 'Pavers' : 'Flagstone';

        // Description for Labor Context (although labor is calculated elsewhere in ProjectTime usually, 
        // we can add a labor item or just description/instruction)
        let description = `${activeMode === 'paver' ? 'Paver' : 'Flagstone'} Patio/Walkway`;
        if (borderType !== 'none') description += `, ${borderType} border`;
        if (designType !== 'none') description += `, ${designType} pattern`;

        const itemsToAdd: any[] = [];
        const add = (name: string, qty: number, unit: string, price: number, cat: string = 'Hardscape') => {
            itemsToAdd.push({
                name,
                description,
                quantity: parseFloat(qty.toFixed(2)),
                unit,
                unitPrice: price,
                category: cat,
                zoneId: selectedZoneId
            });
        };

        // Main Item
        const wasteFactor = activeMode === 'paver' ? 1.05 : 1.10;
        add(selectedMaterial, area * wasteFactor, "SF", itemPrice, categoryName);

        // Base Construction
        add("Roadbase (1\" Minus)", baseTons, "TON", 10.50, "Hardscape: Base & Bedding");
        add("Bedding Sand", sandTons, "TON", 22.00, "Hardscape: Base & Bedding");
        add("Landscape Fabric", area * 1.1, "SF", 0.15, "Hardscape: Base & Bedding");

        // Edging
        if (perimeter > 0) {
            add("Snap Edge", edgePieces, "EA", 13.50, "Hardscape: Poly Sand & Edge");
            add("10\" Spikes (Box 50)", spikeBoxes, "BOX", 45.00, "Hardscape: Poly Sand & Edge");
        }

        // Joint Sand
        const jointName = activeMode === 'paver' ? "Poly Sand (Paver)" : "Gator Dust (Flagstone)";
        const jointPrice = activeMode === 'paver' ? 36.89 : 42.00;
        add(jointName, polyBags, "BAG", jointPrice, "Hardscape: Poly Sand & Edge");

        // Add Items
        itemsToAdd.forEach(item => onAddItem(item));

        // Reset
        setArea(0); setPerimeter(0);
        alert(`Added ${itemsToAdd.length} items to estimate.`);
    };

    const inputClass = "w-full pt-5 pb-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all peer placeholder-transparent";
    const labelClass = "absolute left-3 top-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-xs peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-amber-500 transition-all";

    return (
        <div className="space-y-6">
            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                <button onClick={() => { setActiveMode('paver'); setSelectedMaterial(''); }} className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeMode === 'paver' ? 'bg-white shadow-sm text-amber-600' : 'text-slate-500 hover:text-slate-700'}`}>
                    Pavers (5% Waste)
                </button>
                <button onClick={() => { setActiveMode('flagstone'); setSelectedMaterial(''); }} className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeMode === 'flagstone' ? 'bg-white shadow-sm text-amber-600' : 'text-slate-500 hover:text-slate-700'}`}>
                    Flagstone (12% Waste)
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative group">
                    <select value={selectedZoneId} onChange={(e) => setSelectedZoneId(e.target.value)} className={`${inputClass} appearance-none`}>
                        {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                    </select>
                    <label className={labelClass}>Zone Assignment</label>
                </div>
                <div className="relative group">
                    <select value={selectedMaterial} onChange={(e) => setSelectedMaterial(e.target.value)} className={`${inputClass} appearance-none`}>
                        <option value="">-- Select Material --</option>
                        {options.map(m => <option key={m.name} value={m.name}>{m.name} (${m.price}/sf)</option>)}
                    </select>
                    <label className={labelClass}>Material Selection</label>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h6 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center"><Grid size={14} className="mr-2" /> Dimensions & Specs</h6>
                    {area > 0 && <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">Total: {(area * (activeMode === 'paver' ? 1.05 : 1.12)).toFixed(0)} SF</span>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                        <input type="number" id="area" placeholder="Area" value={area || ''} onChange={e => setArea(parseFloat(e.target.value))} className={inputClass} />
                        <label htmlFor="area" className={labelClass}>Total Area (SF)</label>
                    </div>
                    <div className="relative">
                        <input type="number" id="perimeter" placeholder="Perimeter" value={perimeter || ''} onChange={e => setPerimeter(parseFloat(e.target.value))} className={inputClass} />
                        <label htmlFor="perimeter" className={labelClass}>Perimeter (LF)</label>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-4">
                    <div className="relative group">
                        <select value={complexity} onChange={(e) => setComplexity(e.target.value as any)} className={`${inputClass} appearance-none`}>
                            <option value="simple">Simple (x1.0)</option>
                            <option value="moderate">Moderate (x1.1)</option>
                            <option value="complex">Complex (x1.25)</option>
                        </select>
                        <label className={labelClass}>Pattern Complexity</label>
                    </div>
                    <div className="relative group col-span-2">
                        <select value={edgeRestraint} onChange={(e) => setEdgeRestraint(e.target.value)} className={`${inputClass} appearance-none`}>
                            <option value="none">None</option>
                            <option value="Plastic Edging">Plastic Edging ($2.50/lf)</option>
                            <option value="Concrete Bond Beam">Concrete Bond Beam ($12.00/lf)</option>
                        </select>
                        <label className={labelClass}>Edge Restraint</label>
                    </div>
                </div>
            </div>

            <button onClick={calculate} disabled={!selectedMaterial || area <= 0} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold uppercase text-sm tracking-widest shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group">
                <Plus size={18} className="text-amber-400 group-hover:rotate-90 transition-transform" /> Add to Estimate
            </button>
        </div>
    );
};

export default PaverCalculator;
