import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from './AuthContext';
import { BusinessSettings, BusinessMetrics } from '../types';

const DEFAULT_SETTINGS: BusinessSettings = {
    profile: { businessName: '', currency: 'USD', serviceArea: '' },
    season: { weeksPerYear: 35, daysPerWeek: 5, hoursPerDay: 8 },
    employees: [],
    overhead: [],
    pricing: { targetMarginPercent: 20, defaultMaterialMarkupPercent: 30, taxLaborDefault: false },
    rules: { minServiceCall: 50, minHours: 1, tripCharge: 15, emergencySurchargePercent: 50 },
    defaultTerms: "1. Payment Terms: A 50% deposit is required to schedule the project. The remaining balance is due upon completion.\n\n2. Scheduling: Dates provided are estimates and subject to weather delays.\n\n3. Warranty: We guarantee workmanship for 1 year from the date of completion. Plant material is guaranteed for 30 days unless an automatic irrigation system is installed.",
    isSetupComplete: false
};

// --- HELPER: Normalize Objects to Arrays ---
const normalizeArray = (data: any): any[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === 'object') {
        return Object.values(data);
    }
    return [];
};

// --- PRICING ENGINE LOGIC ---
export const calculateBusinessMetrics = (settings: BusinessSettings): BusinessMetrics => {
    const { season, pricing } = settings;
    const employees = normalizeArray(settings.employees);
    const overhead = normalizeArray(settings.overhead);

    // A. Capacity
    const productionDays = season.weeksPerYear * season.daysPerWeek;
    const seasonHours = productionDays * season.hoursPerDay;

    // B. Labor
    let totalBillableHours = 0;
    let totalGrossPayroll = 0;
    let totalBurdenCost = 0;
    let totalWageSum = 0;
    let empCount = 0;

    employees.forEach((emp: any) => {
        const annualHours = seasonHours;
        const grossPay = emp.payType === 'Hourly' ? emp.wage * annualHours : emp.wage;
        const burden = grossPay * (emp.laborBurdenPercent / 100);
        const billable = annualHours * (emp.utilizationPercent / 100);

        totalGrossPayroll += grossPay;
        totalBurdenCost += burden;
        totalBillableHours += billable;

        if (emp.payType === 'Hourly') {
            totalWageSum += emp.wage;
            empCount++;
        }
    });

    const avgHourlyWage = empCount > 0 ? totalWageSum / empCount : 0;
    const avgLaborBurdenPercent = totalGrossPayroll > 0 ? (totalBurdenCost / totalGrossPayroll) * 100 : 0;

    // C. Overhead
    const totalOverhead = overhead.reduce((sum: number, item: any) => {
        return sum + (item.frequency === 'Monthly' ? item.amount * 12 : item.amount);
    }, 0);

    const overheadPerManHour = totalBillableHours > 0 ? totalOverhead / totalBillableHours : 0;

    // D. Rates
    const totalAnnualCost = totalGrossPayroll + totalBurdenCost + totalOverhead;
    const breakEvenRate = totalBillableHours > 0 ? totalAnnualCost / totalBillableHours : 0;

    const targetMarginDecimal = pricing.targetMarginPercent / 100;
    const targetHourlyRate = breakEvenRate > 0 ? breakEvenRate / (1 - targetMarginDecimal) : 0;

    return {
        productionDays,
        seasonHours,
        totalBillableHours,
        totalAnnualCost,
        totalOverhead,
        overheadPerManHour,
        breakEvenRate,
        targetHourlyRate,
        avgHourlyWage,
        avgLaborBurdenPercent
    };
};

interface SettingsContextType {
    settings: BusinessSettings;
    metrics: BusinessMetrics;
    settingsLoading: boolean;
    updateSettings: (settings: BusinessSettings) => Promise<void>;
    completeSetup: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { isAuthorized, currentUser } = useAuth();

    const [settings, setSettingsState] = useState<BusinessSettings>(DEFAULT_SETTINGS);
    const [settingsLoading, setSettingsLoading] = useState(true);
    const [metrics, setMetrics] = useState<BusinessMetrics>(calculateBusinessMetrics(DEFAULT_SETTINGS));

    useEffect(() => {
        if (!isAuthorized || !currentUser) {
            setSettingsLoading(true);
            return;
        }

        setSettingsLoading(true);

        const unsubSettings = onSnapshot(doc(db, 'settings', 'main'),
            async (documentSnapshot) => {
                if (documentSnapshot.exists()) {
                    const data = documentSnapshot.data();

                    let pricing = data.pricing;

                    if (pricing && pricing.taxLaborDefault === undefined) {
                        pricing.taxLaborDefault = false;
                    }

                    if (!pricing && (data.targetMarginPercent !== undefined || data.defaultMaterialMarkupPercent !== undefined)) {
                        pricing = {
                            targetMarginPercent: data.targetMarginPercent || 20,
                            defaultMaterialMarkupPercent: data.defaultMaterialMarkupPercent || 30,
                            taxLaborDefault: false
                        };
                    }

                    const cleanSettings: BusinessSettings = {
                        profile: data.profile || DEFAULT_SETTINGS.profile,
                        season: data.season || DEFAULT_SETTINGS.season,
                        employees: normalizeArray(data.employees),
                        overhead: normalizeArray(data.overhead),
                        pricing: pricing || DEFAULT_SETTINGS.pricing,
                        rules: data.rules || DEFAULT_SETTINGS.rules,
                        defaultTerms: data.defaultTerms || DEFAULT_SETTINGS.defaultTerms,
                        isSetupComplete: true
                    };

                    setSettingsState(cleanSettings);
                    setMetrics(calculateBusinessMetrics(cleanSettings));
                } else {
                    // MIGRATION CHECK for legacy user-specific settings
                    if (currentUser?.uid) {
                        try {
                            const legacyDocRef = doc(db, 'settings', currentUser.uid);
                            const legacySnap = await getDoc(legacyDocRef);

                            if (legacySnap.exists()) {
                                const legacyData = legacySnap.data();

                                const pricing = legacyData.pricing || {
                                    targetMarginPercent: legacyData.targetMarginPercent || 20,
                                    defaultMaterialMarkupPercent: legacyData.defaultMaterialMarkupPercent || 30,
                                    taxLaborDefault: false
                                };

                                const newSettings: BusinessSettings = {
                                    profile: legacyData.profile || DEFAULT_SETTINGS.profile,
                                    season: legacyData.season || DEFAULT_SETTINGS.season,
                                    employees: normalizeArray(legacyData.employees),
                                    overhead: normalizeArray(legacyData.overhead),
                                    pricing: pricing,
                                    rules: legacyData.rules || DEFAULT_SETTINGS.rules,
                                    defaultTerms: legacyData.defaultTerms || DEFAULT_SETTINGS.defaultTerms,
                                    isSetupComplete: true
                                };

                                await setDoc(doc(db, 'settings', 'main'), newSettings);
                                setSettingsState(newSettings);
                                setMetrics(calculateBusinessMetrics(newSettings));
                            }
                        } catch (err) {
                            console.error("Migration check failed", err);
                        }
                    }
                }
                setSettingsLoading(false);
            },
            (error) => {
                console.error("Error reading settings/main:", error);
                setSettingsLoading(false);
            }
        );

        return () => unsubSettings();
    }, [isAuthorized, currentUser]);

    const updateSettings = async (newSettings: BusinessSettings) => {
        if (!currentUser) return;
        setSettingsState(newSettings);
        setMetrics(calculateBusinessMetrics(newSettings));
        try {
            await setDoc(doc(db, 'settings', 'main'), newSettings, { merge: true });
        } catch (e) {
            console.error("Error saving settings", e);
            throw e;
        }
    };

    const completeSetup = async () => {
        const newSettings = { ...settings, isSetupComplete: true };
        await updateSettings(newSettings);
    };

    return (
        <SettingsContext.Provider value={{ settings, metrics, settingsLoading, updateSettings, completeSetup }}>
            {children}
        </SettingsContext.Provider>
    );
};
