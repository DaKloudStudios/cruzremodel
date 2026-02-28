import React from 'react';
import { BusinessSettings } from '../types';
import { AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';

interface WizardSidebarProps {
  settings: BusinessSettings;
  step: number;
}

const WizardSidebar: React.FC<WizardSidebarProps> = ({ settings, step }) => {
  const { profile, season, employees, overhead, pricing, rules } = settings;

  // 1. Capacity Calculations
  const productionDays = season.weeksPerYear * season.daysPerWeek;
  const seasonHours = productionDays * season.hoursPerDay;
  
  // 2. Labor Calculations
  let totalBillableHours = 0;
  let totalGrossPayroll = 0;
  let totalBurdenCost = 0;

  employees.forEach(emp => {
    const annualHours = seasonHours; // simplified assumption: everyone works full season
    const grossPay = emp.payType === 'Hourly' ? emp.wage * annualHours : emp.wage;
    const burden = grossPay * (emp.laborBurdenPercent / 100);
    const billable = annualHours * (emp.utilizationPercent / 100);

    totalGrossPayroll += grossPay;
    totalBurdenCost += burden;
    totalBillableHours += billable;
  });

  // 3. Overhead Calculations
  const totalOverhead = overhead.reduce((sum, item) => {
    return sum + (item.frequency === 'Monthly' ? item.amount * 12 : item.amount);
  }, 0);

  // 4. Rate Calculations
  const totalCosts = totalGrossPayroll + totalBurdenCost + totalOverhead;
  const breakEvenRate = totalBillableHours > 0 ? totalCosts / totalBillableHours : 0;
  const targetRate = breakEvenRate > 0 ? breakEvenRate / (1 - (pricing.targetMarginPercent / 100)) : 0;
  const projectedRevenue = targetRate * totalBillableHours;
  const projectedProfit = projectedRevenue - totalCosts;

  // Helpers
  const formatMoney = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: profile.currency || 'USD' }).format(val);

  return (
    <div className="w-80 bg-slate-50 border-l border-slate-200 p-6 flex flex-col h-full overflow-y-auto">
      <div className="mb-6">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Live Business Model</h3>
        <p className="font-bold text-slate-800 text-lg">{profile.businessName || 'Your Business'}</p>
      </div>

      <div className="space-y-6 flex-1">
        {/* Season Stats */}
        {step >= 2 && (
           <div className="space-y-2 animate-in slide-in-from-right-4 fade-in duration-500">
             <div className="flex justify-between text-sm">
               <span className="text-slate-500">Production Days</span>
               <span className="font-medium">{productionDays} days</span>
             </div>
             <div className="flex justify-between text-sm">
               <span className="text-slate-500">Season Capacity</span>
               <span className="font-medium">{seasonHours.toLocaleString()} hrs</span>
             </div>
             {season.weeksPerYear < 20 && (
               <div className="bg-amber-50 text-amber-700 text-xs p-2 rounded flex items-start mt-1">
                 <AlertTriangle size={12} className="mt-0.5 mr-1 flex-shrink-0" />
                 Short season detected. Costs will be compressed.
               </div>
             )}
           </div>
        )}

        {/* Labor Stats */}
        {step >= 3 && (
          <div className="pt-4 border-t border-slate-200 animate-in slide-in-from-right-4 fade-in duration-500">
            <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Labor Metrics</h4>
             <div className="flex justify-between text-sm">
               <span className="text-slate-500">Billable Hours</span>
               <span className="font-medium">{Math.round(totalBillableHours).toLocaleString()} hrs</span>
             </div>
             <div className="flex justify-between text-sm mt-1">
               <span className="text-slate-500">Total Payroll</span>
               <span className="font-medium">{formatMoney(totalGrossPayroll)}</span>
             </div>
             <div className="flex justify-between text-sm mt-1">
               <span className="text-slate-500">Labor Burden</span>
               <span className="font-medium text-red-400">+{formatMoney(totalBurdenCost)}</span>
             </div>
             {employees.length === 0 && (
                <div className="bg-red-50 text-red-700 text-xs p-2 rounded flex items-start mt-2">
                 <AlertTriangle size={12} className="mt-0.5 mr-1 flex-shrink-0" />
                 Add employees to calculate costs.
               </div>
             )}
          </div>
        )}

        {/* Overhead & Break Even */}
        {step >= 4 && (
          <div className="pt-4 border-t border-slate-200 animate-in slide-in-from-right-4 fade-in duration-500">
             <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Overhead & BE</h4>
             <div className="flex justify-between text-sm">
               <span className="text-slate-500">Annual Overhead</span>
               <span className="font-medium text-slate-700">{formatMoney(totalOverhead)}</span>
             </div>
             <div className="flex justify-between text-sm mt-2 pt-2 border-t border-dashed border-slate-200">
               <span className="text-slate-500 font-medium">Break-Even / Hr</span>
               <span className="font-bold text-slate-700">{formatMoney(breakEvenRate)}</span>
             </div>
          </div>
        )}
        
        {/* Final Pricing */}
        {step >= 5 && (
          <div className="pt-4 border-t border-slate-200 animate-in slide-in-from-right-4 fade-in duration-500">
             <div className="bg-green-600 text-white p-4 rounded-xl shadow-lg transform transition-all hover:scale-105">
                <p className="text-green-100 text-xs uppercase font-bold mb-1">Target Hourly Rate</p>
                <div className="flex items-center text-3xl font-bold">
                  {formatMoney(targetRate)}
                  <span className="text-sm font-normal text-green-200 ml-1">/hr</span>
                </div>
                <div className="mt-2 text-xs text-green-100 flex justify-between">
                  <span>Profit Margin</span>
                  <span>{pricing.targetMarginPercent}%</span>
                </div>
             </div>
          </div>
        )}

        {/* Projections */}
        {step >= 5 && (
           <div className="mt-4 text-xs text-slate-400 text-center">
              Potential Profit: <span className="text-green-600 font-bold">{formatMoney(projectedProfit)}</span> /yr
           </div>
        )}

        {/* Job Minima */}
        {step >= 6 && (
          <div className="pt-4 border-t border-slate-200 animate-in slide-in-from-right-4 fade-in duration-500">
             <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Job Minimums</h4>
             <div className="flex justify-between text-sm text-slate-600">
               <span>Trip Charge</span>
               <span>{formatMoney(rules.tripCharge)}</span>
             </div>
             <div className="flex justify-between text-sm text-slate-600 mt-1">
               <span>Min Service</span>
               <span>{formatMoney(rules.minServiceCall)}</span>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WizardSidebar;
