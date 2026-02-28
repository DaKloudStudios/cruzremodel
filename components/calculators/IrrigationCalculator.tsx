import React, { useState, useMemo } from 'react';
import { Droplets, Plus } from 'lucide-react';
import { EstimateZone } from '../../types';
import { MATERIAL_CATALOG, MaterialCatalogItem } from '../../data/MaterialCatalog';

interface IrrigationCalculatorProps {
    onAddItem: (item: any) => void;
    zones: EstimateZone[];
}

const IrrigationCalculator: React.FC<IrrigationCalculatorProps> = ({ onAddItem, zones }) => {
    const [selectedZoneId, setSelectedZoneId] = useState<string>(zones[0]?.id || 'default');

    const groupedParts = useMemo(() => {
        const raw = MATERIAL_CATALOG.filter(m => m.category.includes('Irrigation'));
        return raw.reduce((acc, item) => {
            if (!acc[item.category]) acc[item.category] = [];
            acc[item.category].push(item);
            return acc;
        }, {} as Record<string, MaterialCatalogItem[]>);
    }, []);

    const addPart = (part: MaterialCatalogItem) => {
        onAddItem({
            name: part.name,
            description: 'Irrigation Component',
            quantity: 1,
            unit: part.unit,
            unitPrice: part.price,
            category: part.category,
            zoneId: selectedZoneId
        });
    };

    const inputClass = "w-full pt-5 pb-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-cyan-400/20 focus:border-cyan-400 transition-all peer placeholder-transparent";
    const labelClass = "absolute left-3 top-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-xs peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-cyan-500 transition-all";

    return (
        <div className="space-y-6">
            <div className="relative group">
                <select value={selectedZoneId} onChange={(e) => setSelectedZoneId(e.target.value)} className={`${inputClass} appearance-none`}>
                    {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                </select>
                <label className={labelClass}>Zone Assignment</label>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {Object.entries(groupedParts).map(([category, items]) => (
                    <div key={category} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all">
                        <h5 className="font-bold text-slate-700 mb-3 border-b border-slate-50 pb-2 flex items-center">
                            <Droplets size={16} className="mr-2 text-cyan-500" />
                            {category}
                        </h5>
                        <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                            {(items as MaterialCatalogItem[]).map(part => (
                                <div key={part.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors group">
                                    <div className="flex-1">
                                        <div className="text-xs font-bold text-slate-700">{part.name}</div>
                                        <div className="text-[10px] text-slate-400">${part.price.toFixed(2)} / {part.unit}</div>
                                    </div>
                                    <button
                                        onClick={() => addPart(part)}
                                        className="bg-slate-100 text-slate-400 group-hover:bg-cyan-500 group-hover:text-white p-2 rounded-lg transition-all"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default IrrigationCalculator;
