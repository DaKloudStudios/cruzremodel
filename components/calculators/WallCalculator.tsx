import React, { useState, useMemo } from 'react';
import { Component, Mountain, Boxes, Ruler, Info, Plus, Layers } from 'lucide-react';
import { EstimateZone } from '../../types';
import { WALL_BLOCKS, WALL_CAPS, CONCRETE_MIXES } from '../../data/MaterialCatalog';

interface WallCalculatorProps {
    onAddItem: (item: any) => void;
    zones: EstimateZone[];
}

type WallType = 'block' | 'boulder' | 'concrete';

const WallCalculator: React.FC<WallCalculatorProps> = ({ onAddItem, zones }) => {
    const [wallType, setWallType] = useState<WallType>('block');
    const [activeSection, setActiveSection] = useState<WallType>('block'); // Keeping for compatibility if needed, but primary switch uses wallType now
    const [selectedZoneId, setSelectedZoneId] = useState<string>(zones[0]?.id || 'default');

    // Dimensions
    const [length, setLength] = useState(0);
    const [height, setHeight] = useState(0);
    const [thickness, setThickness] = useState(8); // Concrete Wall Thickness (IN)

    // Block State
    const [selectedBlock, setSelectedBlock] = useState('');
    const [selectedCap, setSelectedCap] = useState('');

    // Boulder State
    const [boulderSize, setBoulderSize] = useState('2ft');
    const [boulderMaterial, setBoulderMaterial] = useState('Granite');

    // Concrete State
    const [concreteMix, setConcreteMix] = useState('');

    const calculate = () => {
        if (length <= 0 || height <= 0) { alert("Please enter Length and Height"); return; }

        const itemsToAdd: any[] = [];
        const add = (name: string, qty: number, unit: string, price: number, cat: string = 'Walls', desc: string = '') => {
            itemsToAdd.push({
                name,
                description: desc || `Wall ${length}'x${height}'`,
                quantity: parseFloat(qty.toFixed(2)),
                unit,
                unitPrice: price,
                category: cat,
                zoneId: selectedZoneId
            });
        };

        if (activeSection === 'block') {
            if (!selectedBlock) { alert("Select a Block Type"); return; }

            const wallArea = length * height;
            const blockItem = WALL_BLOCKS.find(m => m.name === selectedBlock);
            const blockPrice = blockItem ? blockItem.price : 15.00;

            // Caps
            const capsCount = Math.ceil(length * 1.1);
            const capItem = WALL_CAPS.find(m => m.name === selectedCap);

            add(selectedBlock, wallArea * 1.05, 'SF', blockPrice);
            if (capItem) add(capItem.name, capsCount, 'EA', capItem.price);

            // Drainage
            const drainRockTons = ((length * height * 1) / 27) * 1.4; // 1ft thick drainage
            add("Drain Rock (3/4 Clean)", drainRockTons, 'TON', 28.00, "Walls & Caps", "Behind Wall Drainage");
            add("4\" Perforated Pipe", length, 'LF', 1.25, "Walls & Caps");

            if (height > 3) {
                const geogridSF = length * (height * 0.8) * 2;
                add("Geogrid Stabilization", geogridSF, 'SF', 1.50);
            }
        }
        else if (activeSection === 'boulder') {
            const avgDiameter = parseInt(boulderSize.replace('ft', ''));
            const rows = Math.ceil(height / avgDiameter);
            const cols = Math.ceil(length / avgDiameter);
            const totalBoulders = rows * cols;

            let pricePerBoulder = 75.00;
            if (boulderSize === '3ft') pricePerBoulder = 110.00;
            if (boulderSize === '4ft') pricePerBoulder = 180.00;
            if (boulderSize === '5ft') pricePerBoulder = 250.00;

            add(`${boulderSize} ${boulderMaterial} Boulder`, totalBoulders, 'EA', pricePerBoulder, "Boulders");
            add("Filter Fabric", length * height, 'SF', 0.15, "Boulders", "Behind Wall");
            add("Drain Rock (Backfill)", ((length * height * 1) / 27) * 1.4, 'TON', 28.00, "Boulders");
        }
        else if (activeSection === 'concrete') {
            if (!concreteMix) { alert("Select a Concrete Mix"); return; }
            const volCY = (length * height * (thickness / 12)) / 27;
            const rebarLF = (length * 2) + (height * 2) * (length / 1);

            const mixItem = CONCRETE_MIXES.find(m => m.name === concreteMix);
            add(concreteMix, volCY * 1.05, 'CY', mixItem ? mixItem.price : 200, "Concrete");
            add("#4 Rebar (Reinforcement)", Math.ceil(rebarLF / 20), 'EA', 10.00, "Concrete: Reinforcement");
            add("Concrete Form Rental", length * height * 2, 'SF', 1.50, "Concrete: Additives & Finish");
            add("Pump Truck", 1, 'EA', 900, "Concrete: Pumping & Services");
        }

        itemsToAdd.forEach(item => onAddItem(item));
        setLength(0); setHeight(0);
        alert(`Added ${itemsToAdd.length} items.`);
    };

    const inputClass = "w-full pt-5 pb-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-orange-400/20 focus:border-orange-400 transition-all peer placeholder-transparent";
    const labelClass = "absolute left-3 top-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-xs peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-orange-500 transition-all";

    return (
        <div className="space-y-6">
            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                <button onClick={() => setWallType('block')} className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${wallType === 'block' ? 'bg-white shadow text-orange-600' : 'text-slate-500 hover:text-slate-700'}`}>Block</button>
                <button onClick={() => setWallType('boulder')} className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${wallType === 'boulder' ? 'bg-white shadow text-orange-600' : 'text-slate-500 hover:text-slate-700'}`}>Boulder</button>
                <button onClick={() => setWallType('concrete')} className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${wallType === 'concrete' ? 'bg-white shadow text-orange-600' : 'text-slate-500 hover:text-slate-700'}`}>Concrete</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative group">
                    <select value={selectedZoneId} onChange={(e) => setSelectedZoneId(e.target.value)} className={`${inputClass} appearance-none`}>
                        {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                    </select>
                    <label className={labelClass}>Zone Assignment</label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                        <input type="number" id="length" placeholder="Length" value={length || ''} onChange={(e) => setLength(parseFloat(e.target.value))} className={inputClass} />
                        <label htmlFor="length" className={labelClass}>Length (LF)</label>
                    </div>
                    <div className="relative">
                        <input type="number" id="height" placeholder="Height" value={height || ''} onChange={(e) => setHeight(parseFloat(e.target.value))} className={inputClass} />
                        <label htmlFor="height" className={labelClass}>Avg Height (FT)</label>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm mt-6">
                <div className="flex items-center justify-between mb-4">
                    <h6 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center"><Layers size={14} className="mr-2" /> Wall Specs: {wallType}</h6>
                    {length > 0 && height > 0 && <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded">Face Area: {(length * height).toFixed(0)} SF</span>}
                </div>

                {wallType === 'block' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative group">
                            <select value={selectedBlock} onChange={(e) => setSelectedBlock(e.target.value)} className={`${inputClass} appearance-none`}>
                                <option value="">-- Select Block --</option>
                                {WALL_BLOCKS.map(m => <option key={m.name} value={m.name}>{m.name} (${m.price}/sf)</option>)}
                            </select>
                            <label className={labelClass}>Block Type</label>
                        </div>
                        <div className="relative group">
                            <select value={selectedCap} onChange={(e) => setSelectedCap(e.target.value)} className={`${inputClass} appearance-none`}>
                                <option value="">-- No Cap --</option>
                                {WALL_CAPS.map(m => <option key={m.name} value={m.name}>{m.name} (${m.price}/ea)</option>)}
                            </select>
                            <label className={labelClass}>Cap Type</label>
                        </div>
                    </div>
                )}

                {wallType === 'boulder' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative group">
                            <select value={boulderSize} onChange={(e) => setBoulderSize(e.target.value)} className={`${inputClass} appearance-none`}>
                                {['2ft', '3ft', '4ft', '5ft'].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <label className={labelClass}>Boulder Size</label>
                        </div>
                        <div className="relative group">
                            <select value={boulderMaterial} onChange={(e) => setBoulderMaterial(e.target.value)} className={`${inputClass} appearance-none`}>
                                {['Granite', 'Sandstone', 'Basalt', 'Limestone'].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <label className={labelClass}>Material</label>
                        </div>
                    </div>
                )}

                {wallType === 'concrete' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <input type="number" id="thickness" placeholder="Thick" value={thickness} onChange={(e) => setThickness(parseFloat(e.target.value))} className={inputClass} />
                            <label htmlFor="thickness" className={labelClass}>Wall Thickness (IN)</label>
                        </div>
                        <div className="relative group">
                            <select value={concreteMix} onChange={(e) => setConcreteMix(e.target.value)} className={`${inputClass} appearance-none`}>
                                <option value="">-- Select Mix --</option>
                                {CONCRETE_MIXES.map(m => <option key={m.name} value={m.name}>{m.name} (${m.price}/cy)</option>)}
                            </select>
                            <label className={labelClass}>Concrete Mix</label>
                        </div>
                    </div>
                )}
            </div>

            <button onClick={calculate} className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl font-black uppercase text-xs tracking-widest hover:opacity-90 transition-colors">
                Calculate Wall
            </button>
        </div>
    );
};

export default WallCalculator;
