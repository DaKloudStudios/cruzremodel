import React, { useState } from 'react';
import { Hammer, Trash2 } from 'lucide-react';
import { EstimateZone } from '../../types';
import { MATERIAL_CATALOG } from '../../data/MaterialCatalog';

interface DemoCalculatorProps {
    onAddItem: (item: any) => void;
    zones: EstimateZone[];
}

const DemoCalculator: React.FC<DemoCalculatorProps> = ({ onAddItem, zones }) => {
    const [selectedZoneId, setSelectedZoneId] = useState<string>(zones[0]?.id || 'default');

    const [demoType, setDemoType] = useState('Dirt');
    const [area, setArea] = useState(0);
    const [depth, setDepth] = useState(3); // inches
    const [isHardDigging, setIsHardDigging] = useState(false);
    const [accessDifficulty, setAccessDifficulty] = useState('easy');
    const [includeDumpFees, setIncludeDumpFees] = useState(false);
    const [volume, setVolume] = useState(0);

    const calculate = () => {
        if (area <= 0) { alert("Please enter Area"); return; }

        const itemsToAdd: any[] = [];
        const add = (name: string, qty: number, unit: string, price: number, cat: string = 'Site Prep & Demo', desc: string = '') => {
            itemsToAdd.push({
                name,
                description: desc || name,
                quantity: parseFloat(qty.toFixed(2)),
                unit,
                unitPrice: price,
                category: cat,
                zoneId: selectedZoneId
            });
        };

        if (demoType === 'excavation') {
            const volCY = (area * (depth / 12)) / 27;
            const swell = isHardDigging ? 1.3 : 1.2;
            const totalCY = volCY * swell;
            let calculatedVolume = totalCY;
            setVolume(calculatedVolume);

            // Material Item (Excavation Cost)
            const dirtItem = MATERIAL_CATALOG.find(m => m.name.includes('Excavation')) || { name: 'Dirt Excavation', price: 15 };
            let price = dirtItem.price;
            if (isHardDigging) price *= 1.5;

            // Adjust price based on access difficulty
            if (accessDifficulty === 'medium') price *= 1.5;
            if (accessDifficulty === 'hard') price *= 2.0;

            add(dirtItem.name, calculatedVolume, 'CY', price, "Site Prep & Demo", `${depth}" Depth ${isHardDigging ? '+ Hard Dig' : ''}`);

            // Disposal
            if (includeDumpFees) {
                add("Disposal Fee (Wait Based)", calculatedVolume * 1.5, 'TON', 30.00, "Disposal Services");
            }
        }
        else if (demoType === 'concrete_demo') {
            // Concrete Demo
            const concItem = MATERIAL_CATALOG.find(m => m.name.includes('Concrete Demo')) || { name: 'Concrete Demo', price: 2.50 };
            add(concItem.name, area, 'SF', concItem.price);

            // Disposal
            if (includeDumpFees) {
                const volCY = (area * (4 / 12)) / 27; // Assuming 4" concrete for disposal volume
                const calculatedVolume = volCY;
                setVolume(calculatedVolume);
                add("Disposal: Clean Concrete", Math.ceil(volCY / 5), 'LOAD', 60.00, "Disposal Services", "Dump Trailer Load");
            } else {
                setVolume(0);
            }
        }
        else if (demoType === 'sod_removal') {
            const sodItem = MATERIAL_CATALOG.find(m => m.name.includes('Sod Removal')) || { name: 'Sod Removal', price: 0.10 };
            add(sodItem.name, area, 'SF', sodItem.price);
            setVolume(0); // Sod removal typically not volume-based for disposal
        }

        itemsToAdd.forEach(item => onAddItem(item));
        setArea(0);
        setDepth(3);
        alert(`Added ${itemsToAdd.length} demo items.`);
    };

    const inputClass = "w-full pt-5 pb-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-400 transition-all peer placeholder-transparent";
    const labelClass = "absolute left-3 top-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-xs peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-slate-500 transition-all";

    return (
        <div className="space-y-6">
            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                <button onClick={() => setDemoType('excavation')} className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${demoType === 'excavation' ? 'bg-white shadow text-slate-700' : 'text-slate-500 hover:text-slate-700'}`}>Dirt Excavation</button>
                <button onClick={() => setDemoType('concrete_demo')} className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${demoType === 'concrete_demo' ? 'bg-white shadow text-slate-700' : 'text-slate-500 hover:text-slate-700'}`}>Concrete Demo</button>
                <button onClick={() => setDemoType('sod_removal')} className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${demoType === 'sod_removal' ? 'bg-white shadow text-slate-700' : 'text-slate-500 hover:text-slate-700'}`}>Sod Removal</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative group">
                    <select value={selectedZoneId} onChange={(e) => setSelectedZoneId(e.target.value)} className={`${inputClass} appearance-none`}>
                        {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                    </select>
                    <label className={labelClass}>Zone Assignment</label>
                </div>
                <div className="relative group">
                    <select value={accessDifficulty} onChange={(e) => setAccessDifficulty(e.target.value)} className={`${inputClass} appearance-none`}>
                        <option value="easy">Easy Access (Machine)</option>
                        <option value="medium">Medium (Tight Machine)</option>
                        <option value="hard">Hard (Hand Labor x2)</option>
                    </select>
                    <label className={labelClass}>Access Difficulty</label>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h6 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center"><Hammer size={14} className="mr-2" /> Demo Specs</h6>
                    {volume > 0 && <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">Vol: {volume.toFixed(1)} CY</span>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <input type="number" id="area" placeholder="Area" value={area || ''} onChange={(e) => setArea(parseFloat(e.target.value))} className={inputClass} />
                        <label htmlFor="area" className={labelClass}>Area (SF)</label>
                    </div>
                    <div className="relative">
                        <input type="number" id="depth" placeholder="Depth" value={depth || ''} onChange={(e) => setDepth(parseFloat(e.target.value))} className={inputClass} />
                        <label htmlFor="depth" className={labelClass}>Depth (IN)</label>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase">Dump Fees</span>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={includeDumpFees} onChange={(e) => setIncludeDumpFees(e.target.checked)} className="peer sr-only" />
                            <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-slate-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-800"></div>
                            <span className="text-xs font-bold text-slate-700">Include Haul Off</span>
                        </label>
                    </div>
                </div>
            </div>

            <button onClick={calculate} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold uppercase text-sm tracking-widest shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group">
                <Trash2 size={18} className="text-slate-400 group-hover:rotate-12 transition-transform" /> Add to Estimate
            </button>
        </div>
    );
};

export default DemoCalculator;
