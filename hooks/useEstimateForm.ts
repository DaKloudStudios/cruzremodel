import { useState, useEffect } from 'react';
import { Estimate, EstimateItem, EstimateAdjustments, PricingSnapshot, ProposalSettings, PricebookItem, ServiceTemplate, SiteConditions, EstimateZone } from '../types';
import { useSettings } from '../contexts/SettingsContext';

interface UseEstimateFormProps {
    initialEstimate: Estimate;
}

export const useEstimateForm = ({ initialEstimate }: UseEstimateFormProps) => {
    const { settings, metrics } = useSettings();

    // --- STATE ---
    const [items, setItems] = useState<EstimateItem[]>(initialEstimate.items || []);
    const [adjustments, setAdjustments] = useState<EstimateAdjustments>({
        tripCharge: initialEstimate.adjustments?.tripCharge || false,
        emergencySurcharge: initialEstimate.adjustments?.emergencySurcharge || false,
        applyTax: initialEstimate.adjustments?.applyTax || false,
        taxLabor: initialEstimate.adjustments?.taxLabor ?? (settings.pricing.taxLaborDefault ?? false),
        taxRate: initialEstimate.adjustments?.taxRate || 8.25,
        minJobFeeApplied: initialEstimate.adjustments?.minJobFeeApplied || false
    });
    const [proposalSettings, setProposalSettings] = useState<ProposalSettings>(initialEstimate.proposalSettings || {
        title: `Estimate for ${initialEstimate.clientName}`,
        introMessage: 'Please find our detailed estimate below.',
        coverImageTheme: 'Modern',
        showLineItemPricing: true,
        showTotals: true
    });
    const [siteConditions, setSiteConditions] = useState<SiteConditions>(initialEstimate.siteConditions || {
        accessWidthInches: 48,
        soilType: 'Sand',
        slopePercent: 0,
        difficultyFactor: 1.0,
        distanceToStreetFt: 20
    });
    const [zones, setZones] = useState<EstimateZone[]>(initialEstimate.zones || []);

    // Use existing snapshot or current metrics if new
    const [snapshot] = useState<PricingSnapshot>(initialEstimate.pricingSnapshot || {
        overheadPerManHour: metrics.overheadPerManHour,
        laborBurdenPercent: metrics.avgLaborBurdenPercent,
        targetMarginPercent: settings.pricing.targetMarginPercent,
        baseLaborCost: metrics.avgHourlyWage,
        targetHourlyRate: metrics.targetHourlyRate,
        materialMarkupPercent: settings.pricing.defaultMaterialMarkupPercent
    });

    // --- ACTIONS ---

    const addItem = (item: EstimateItem) => {
        setItems(prev => [...prev, item]);
    };

    const addZone = (zone: EstimateZone) => setZones(prev => [...prev, zone]);
    const updateZone = (id: string, updates: Partial<EstimateZone>) => {
        setZones(prev => prev.map(z => z.id === id ? { ...z, ...updates } : z));
    };
    const removeZone = (id: string) => {
        setZones(prev => prev.filter(z => z.id !== id));
        // Also clear zoneId from items? Or move to default?
        setItems(prev => prev.map(i => i.zoneId === id ? { ...i, zoneId: undefined } : i));
    };

    const updateItem = (id: string, updates: Partial<EstimateItem>) => {
        setItems(prev => prev.map(item => {
            if (item.id !== id) return item;

            // Create provisional item with updates applied
            const updated = { ...item, ...updates };

            // 1. Quantity Change: Update Total
            if (updates.quantity !== undefined) {
                updated.total = updated.quantity * updated.rate;
                if (item.calcBasis) updated.isOverridden = true;
            }

            // 2. Cost Change: Maintain Margin, Update Rate & Total
            if (updates.cost !== undefined && item.type !== 'Labor') {
                const currentMarginDecimal = (updated.marginPercent || 0) / 100;
                // Prevent divide by zero or extreme margins
                const safeMargin = Math.min(Math.max(currentMarginDecimal, 0), 0.99);

                const newRate = updated.cost / (1 - safeMargin);
                updated.rate = newRate;
                updated.total = updated.quantity * newRate;
                updated.markupPercent = ((newRate - updated.cost) / updated.cost) * 100;
            }

            // 3. Margin Change: Update Rate & Total & Markup
            if (updates.marginPercent !== undefined) {
                const safeMargin = Math.min(Math.max(updates.marginPercent, 0), 99) / 100;

                if (item.type === 'Labor') {
                    // For Labor, margin is applied to the Loaded Cost (Wage + Overhead)
                    const laborCostPerHour = (snapshot.baseLaborCost * (1 + snapshot.laborBurdenPercent / 100)) + snapshot.overheadPerManHour;
                    const newRate = laborCostPerHour / (1 - safeMargin);
                    updated.rate = newRate;
                    updated.total = updated.quantity * newRate;
                    updated.cost = laborCostPerHour; // Track the effective cost basis
                } else {
                    // For Materials
                    if (updated.cost > 0) {
                        const newRate = updated.cost / (1 - safeMargin);
                        updated.rate = newRate;
                        updated.total = updated.quantity * newRate;
                        updated.markupPercent = ((newRate - updated.cost) / updated.cost) * 100;
                    }
                }
            }

            // 4. Rate Change: Back-calculate Margin & Markup
            if (updates.rate !== undefined) {
                updated.total = updated.quantity * updated.rate;

                if (item.type !== 'Labor' && updated.cost > 0) {
                    updated.markupPercent = ((updated.rate - updated.cost) / updated.cost) * 100;
                    updated.marginPercent = ((updated.rate - updated.cost) / updated.rate) * 100;
                } else if (item.type === 'Labor') {
                    // Infer Labor Margin based on Rate vs Linked Cost
                    const laborCostPerHour = (snapshot.baseLaborCost * (1 + snapshot.laborBurdenPercent / 100)) + snapshot.overheadPerManHour;
                    updated.marginPercent = ((updated.rate - laborCostPerHour) / updated.rate) * 100;
                }
            }

            return updated;
        }));
    };

    const removeItem = (id: string) => {
        setItems(prev => prev.filter(i => i.id !== id));
    };

    /**
     * Recalculates the rate for EVERY item to achieve a specific aggregate Net Profit Margin.
     * Rate = Cost / (1 - TargetMargin)
     */
    const applyMargin = (targetMargin: number) => {
        // Cap at 99% to prevent divide by zero
        const safeMargin = Math.min(Math.max(targetMargin, 0), 99);
        const marginDecimal = safeMargin / 100;

        setItems(prevItems => prevItems.map(item => {
            // 1. Determine True Cost Basis for this item
            let itemCost = 0;
            if (item.type === 'Labor') {
                // Reconstruct loaded labor cost (Wage + Burden + Overhead)
                const laborCostPerHour = (snapshot.baseLaborCost * (1 + snapshot.laborBurdenPercent / 100)) + snapshot.overheadPerManHour;
                itemCost = laborCostPerHour;
            } else {
                itemCost = item.cost;
            }

            // 2. Calculate New Sell Rate
            const newRate = itemCost > 0 ? itemCost / (1 - marginDecimal) : 0;

            const updates: Partial<EstimateItem> = {
                rate: newRate,
                total: newRate * item.quantity,
                marginPercent: targetMargin
            };

            // 3. Update Metadata (Markup %)
            if (item.type !== 'Labor' && item.cost > 0) {
                updates.markupPercent = ((newRate - item.cost) / item.cost) * 100;
            }

            return { ...item, ...updates };
        }));
    };

    // --- CALCULATIONS ---

    // 1. Base Totals
    const itemsTotal = items.reduce((acc, curr) => acc + curr.total, 0);
    const laborItemsTotal = items.filter(i => i.type === 'Labor').reduce((acc, curr) => acc + curr.total, 0);
    const nonLaborItemsTotal = items.filter(i => i.type !== 'Labor').reduce((acc, curr) => acc + curr.total, 0);

    // 2. Adjustments
    const laborSurcharge = adjustments.emergencySurcharge ? laborItemsTotal * (settings.rules.emergencySurchargePercent / 100) : 0;
    const tripFee = adjustments.tripCharge ? settings.rules.tripCharge : 0;

    const subTotal = itemsTotal + tripFee + laborSurcharge;
    const minJobGap = Math.max(0, settings.rules.minServiceCall - subTotal);
    const finalMinFee = adjustments.minJobFeeApplied ? minJobGap : 0;

    // 3. Tax
    const taxableAmount = adjustments.taxLabor ? (subTotal + finalMinFee) : nonLaborItemsTotal;
    const taxAmount = adjustments.applyTax ? taxableAmount * (adjustments.taxRate / 100) : 0;

    // 4. Grand Total
    const grandTotal = subTotal + finalMinFee + taxAmount;

    // 5. Cost & Profit Analysis
    const calculateCostBasis = () => {
        let totalCost = 0;
        items.forEach(item => {
            if (item.type === 'Labor') {
                // Reconstruct loaded labor cost
                const laborCostPerHour = (snapshot.baseLaborCost * (1 + snapshot.laborBurdenPercent / 100)) + snapshot.overheadPerManHour;
                totalCost += item.quantity * laborCostPerHour;
            } else {
                totalCost += item.cost * item.quantity;
            }
        });
        if (adjustments.tripCharge) totalCost += settings.rules.tripCharge * 0.5; // Assume 50% of trip charge is vehicle cost
        if (adjustments.emergencySurcharge) totalCost += laborSurcharge * 0.66; // Assume 66% of surcharge is OT pay
        return totalCost;
    };

    const totalCost = calculateCostBasis();
    const revenuePreTax = subTotal + finalMinFee;
    const netProfit = revenuePreTax - totalCost;
    const marginPercent = revenuePreTax > 0 ? (netProfit / revenuePreTax) * 100 : 0;

    return {
        // State
        items,
        adjustments,
        proposalSettings,
        snapshot,
        // Computed
        totals: {
            itemsTotal,
            laborSurcharge,
            tripFee,
            subTotal,
            minJobGap,
            finalMinFee,
            taxAmount,
            grandTotal,
            totalCost,
            netProfit,
            marginPercent
        },
        // Setters
        setAdjustments,
        setProposalSettings,
        // Actions
        addItem,
        updateItem,
        removeItem,
        applyMargin,
        // New Hooks
        siteConditions,
        setSiteConditions,
        zones,
        addZone,
        updateZone,
        removeZone
    };
};