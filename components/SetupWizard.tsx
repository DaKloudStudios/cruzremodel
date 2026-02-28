
import React, { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useNavigation } from '../contexts/NavigationContext';
import WizardSidebar from './WizardSidebar';
import { Check, ChevronRight, Plus, Trash2, HelpCircle, X, Save, AlertTriangle } from 'lucide-react';
import { Employee, OverheadItem } from '../types';

interface SetupWizardProps {
    isInitialSetup?: boolean;
}

const Tooltip: React.FC<{ text: string }> = ({ text }) => (
  <div className="group relative inline-block ml-2 cursor-help text-slate-400 hover:text-slate-600">
    <HelpCircle size={14} />
    <div className="invisible group-hover:visible absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 bg-slate-800 text-white text-xs rounded p-2 z-50 text-center shadow-lg">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
    </div>
  </div>
);

const SetupWizard: React.FC<SetupWizardProps> = ({ isInitialSetup = false }) => {
  const { settings, updateSettings, completeSetup } = useSettings();
    const { closeSettings } = useNavigation();
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const isEditMode = !isInitialSetup;

  const inputClass = "w-full p-3 border border-slate-300 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all placeholder:text-slate-400";

  const handleSave = async (isCompletion: boolean) => {
      setSaving(true);
      setError(null);
      try {
          if (isCompletion) {
              await completeSetup();
          } else {
              await updateSettings(settings); 
              closeSettings();
          }
      } catch (e: any) {
          console.error(e);
          setError(e.message || "Failed to save settings. You may not have permission.");
      } finally {
          setSaving(false);
      }
  };

  // --- Step Content Renderers ---

  const renderStep1 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
      <h2 className="text-2xl font-bold text-slate-900">{isEditMode ? 'Business Profile' : "Let's get started."}</h2>
      <p className="text-slate-600">{isEditMode ? 'Update your basic business information.' : 'Tell us a bit about your business to configure your pricing model.'}</p>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-slate-800 mb-1">Business Name</label>
          <input 
            type="text" 
            className={inputClass}
            placeholder="e.g. Green Valley Landscaping"
            value={settings.profile.businessName}
            onChange={e => updateSettings({ ...settings, profile: { ...settings.profile, businessName: e.target.value } })}
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-800 mb-1">Currency</label>
          <select 
            className={inputClass}
            value={settings.profile.currency}
            onChange={e => updateSettings({ ...settings, profile: { ...settings.profile, currency: e.target.value } })}
          >
            <option value="USD">USD ($)</option>
            <option value="CAD">CAD ($)</option>
            <option value="GBP">GBP (£)</option>
            <option value="EUR">EUR (€)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-800 mb-1">Primary Service Area</label>
          <input 
            type="text" 
            className={inputClass}
            placeholder="Zip Code or City"
            value={settings.profile.serviceArea}
            onChange={e => updateSettings({ ...settings, profile: { ...settings.profile, serviceArea: e.target.value } })}
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
      <h2 className="text-2xl font-bold text-slate-900">Season Settings</h2>
      <p className="text-slate-600">We need to know your total capacity to calculate overhead recovery.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="flex items-center text-sm font-bold text-slate-800 mb-1">
            Weeks per Year <Tooltip text="How many weeks are you operational? Exclude winter shutdown." />
          </label>
          <input 
            type="number" 
            className={inputClass}
            value={settings.season.weeksPerYear}
            onChange={e => updateSettings({ ...settings, season: { ...settings.season, weeksPerYear: Number(e.target.value) } })}
          />
        </div>
        <div>
          <label className="flex items-center text-sm font-bold text-slate-800 mb-1">
            Working Days / Week <Tooltip text="How many days do crews go out?" />
          </label>
          <input 
            type="number" 
            max={7}
            className={inputClass}
            value={settings.season.daysPerWeek}
            onChange={e => updateSettings({ ...settings, season: { ...settings.season, daysPerWeek: Number(e.target.value) } })}
          />
        </div>
        <div>
          <label className="flex items-center text-sm font-bold text-slate-800 mb-1">
            Crew Hours / Day <Tooltip text="Total shift length (e.g. 8am to 5pm = 9 hours)" />
          </label>
          <input 
            type="number" 
            max={24}
            className={inputClass}
            value={settings.season.hoursPerDay}
            onChange={e => updateSettings({ ...settings, season: { ...settings.season, hoursPerDay: Number(e.target.value) } })}
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => {
    const addEmployee = () => {
      const newEmp: Employee = {
        id: Math.random().toString(36).substr(2, 9),
        name: '',
        role: 'Crew Member',
        payType: 'Hourly',
        wage: 18,
        laborBurdenPercent: 15,
        utilizationPercent: 85
      };
      updateSettings({ ...settings, employees: [...settings.employees, newEmp] });
    };

    const updateEmployee = (id: string, field: keyof Employee, value: any) => {
      const updated = settings.employees.map(e => e.id === id ? { ...e, [field]: value } : e);
      updateSettings({ ...settings, employees: updated });
    };

    const removeEmployee = (id: string) => {
      updateSettings({ ...settings, employees: settings.employees.filter(e => e.id !== id) });
    };

    const smallInputClass = "w-full p-2 border border-slate-300 rounded text-sm bg-white text-black focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-400 transition-all";

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Employees</h2>
            <p className="text-slate-600 text-sm">Add everyone who does billable work (including yourself).</p>
          </div>
          <button onClick={addEmployee} className="flex items-center text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg transition-colors border border-slate-200">
            <Plus size={16} className="mr-1" /> Add
          </button>
        </div>

        <div className="space-y-4">
          {settings.employees.map((emp, index) => (
            <div key={emp.id} className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-slate-500 mb-1">Name</label>
                <input type="text" placeholder="Name" className={smallInputClass} value={emp.name} onChange={e => updateEmployee(emp.id, 'name', e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 mb-1">Role</label>
                <input type="text" placeholder="Role" className={smallInputClass} value={emp.role} onChange={e => updateEmployee(emp.id, 'role', e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 mb-1">Wage ($)</label>
                <input type="number" className={smallInputClass} value={emp.wage} onChange={e => updateEmployee(emp.id, 'wage', Number(e.target.value))} />
              </div>
              <div className="md:col-span-2">
                 <label className="flex items-center text-xs font-bold text-slate-500 mb-1">Burden % <Tooltip text="Taxes, WorkComp, etc." /></label>
                <input type="number" className={smallInputClass} value={emp.laborBurdenPercent} onChange={e => updateEmployee(emp.id, 'laborBurdenPercent', Number(e.target.value))} />
              </div>
               <div className="md:col-span-2">
                 <label className="flex items-center text-xs font-bold text-slate-500 mb-1">Util % <Tooltip text="% Time spent on billable work" /></label>
                <input type="number" className={smallInputClass} value={emp.utilizationPercent} onChange={e => updateEmployee(emp.id, 'utilizationPercent', Number(e.target.value))} />
              </div>
              <div className="md:col-span-1 flex justify-center pb-2">
                <button onClick={() => removeEmployee(emp.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
          {settings.employees.length === 0 && (
            <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
              No employees added yet. Click "Add" to start.
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderStep4 = () => {
     const addOverhead = () => {
      const newItem: OverheadItem = {
        id: Math.random().toString(36).substr(2, 9),
        name: '',
        amount: 0,
        frequency: 'Monthly'
      };
      updateSettings({ ...settings, overhead: [...settings.overhead, newItem] });
    };

    const updateOverhead = (id: string, field: keyof OverheadItem, value: any) => {
      const updated = settings.overhead.map(i => i.id === id ? { ...i, [field]: value } : i);
      updateSettings({ ...settings, overhead: updated });
    };

    const removeOverhead = (id: string) => {
      updateSettings({ ...settings, overhead: settings.overhead.filter(i => i.id !== id) });
    };

    const defaults = ["Rent", "Insurance", "Marketing", "Fuel", "Software"];
    const smallInputClass = "w-full p-2 border border-slate-300 rounded text-sm bg-white text-black focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-400 transition-all";

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
        <div className="flex justify-between items-center">
          <div>
             <h2 className="text-2xl font-bold text-slate-900">Overhead</h2>
             <p className="text-slate-600 text-sm">Fixed costs that exist even if you have no work.</p>
          </div>
          <div className="space-x-2">
             {defaults.map(d => (
               <button key={d} onClick={() => updateSettings({ ...settings, overhead: [...settings.overhead, { id: Math.random().toString(), name: d, amount: 0, frequency: 'Monthly' }]})} className="text-xs bg-slate-100 hover:bg-white border border-slate-200 px-2 py-1 rounded transition-colors text-slate-700">
                 + {d}
               </button>
             ))}
             <button onClick={addOverhead} className="text-sm bg-slate-800 text-white px-3 py-2 rounded-lg hover:bg-slate-900 ml-2">Custom</button>
          </div>
        </div>

        <div className="space-y-3">
           {settings.overhead.map(item => (
             <div key={item.id} className="flex items-center space-x-4 p-3 bg-white border border-slate-200 rounded-lg">
               <input 
                  type="text" 
                  className={`flex-1 ${smallInputClass}`}
                  placeholder="Expense Name"
                  value={item.name}
                  onChange={e => updateOverhead(item.id, 'name', e.target.value)}
               />
               <div className="relative w-32">
                  <span className="absolute left-3 top-2 text-slate-400">$</span>
                  <input 
                    type="number" 
                    className={`pl-6 ${smallInputClass}`}
                    value={item.amount}
                    onChange={e => updateOverhead(item.id, 'amount', Number(e.target.value))}
                  />
               </div>
               <select 
                  className={`w-28 ${smallInputClass}`}
                  value={item.frequency}
                  onChange={e => updateOverhead(item.id, 'frequency', e.target.value)}
               >
                 <option value="Monthly">Monthly</option>
                 <option value="Annual">Annual</option>
               </select>
               <button onClick={() => removeOverhead(item.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={18} /></button>
             </div>
           ))}
        </div>
      </div>
    );
  };

  const renderStep5 = () => {
    const margins = [10, 20, 30, 40, 50];
    
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
        <h2 className="text-2xl font-bold text-slate-900">Pricing Goals</h2>
        <p className="text-slate-600">How much net profit do you want to make on top of your costs?</p>

        <div className="grid grid-cols-5 gap-2">
           {margins.map(m => (
             <button
               key={m}
               onClick={() => updateSettings({ ...settings, pricing: { ...settings.pricing, targetMarginPercent: m } })}
               className={`py-4 rounded-xl border-2 transition-all duration-200 ${
                 settings.pricing.targetMarginPercent === m 
                   ? 'border-green-500 bg-green-50 text-green-700 shadow-md transform scale-105' 
                   : 'border-slate-200 bg-white text-slate-600 hover:border-green-200'
               }`}
             >
               <div className="text-xl font-bold">{m}%</div>
               <div className="text-[10px] uppercase font-bold mt-1">
                 {m <= 10 ? 'Survival' : m <= 20 ? 'Growth' : m <= 30 ? 'Strong' : 'Aggressive'}
               </div>
             </button>
           ))}
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <label className="block text-sm font-bold text-slate-700 mb-4">Target Net Profit: {settings.pricing.targetMarginPercent}%</label>
            <input 
                type="range" 
                min="0" 
                max="60" 
                step="1"
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                value={settings.pricing.targetMarginPercent}
                onChange={e => updateSettings({ ...settings, pricing: { ...settings.pricing, targetMarginPercent: Number(e.target.value) } })}
            />
            <div className="flex justify-between text-xs text-slate-400 mt-2">
                <span>0% (Breakeven)</span>
                <span>60% (Premium)</span>
            </div>
           </div>
           
           <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <label className="block text-sm font-bold text-slate-700 mb-2">Default Material Markup</label>
            <p className="text-xs text-slate-500 mb-3">Standard markup added to plants/materials.</p>
            <div className="relative">
              <input 
                  type="number"
                  className={inputClass}
                  value={settings.pricing.defaultMaterialMarkupPercent}
                  onChange={e => updateSettings({ ...settings, pricing: { ...settings.pricing, defaultMaterialMarkupPercent: Number(e.target.value) } })}
              />
               <span className="absolute right-3 top-4 text-slate-500">%</span>
            </div>
           </div>
        </div>
      </div>
    );
  };

  const renderStep6 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
      <h2 className="text-2xl font-bold text-slate-900">Minimum Job Rules</h2>
      <p className="text-slate-600">Set guardrails so you never lose money on small jobs.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="flex items-center text-sm font-bold text-slate-700 mb-1">
            Min Service Call ($) <Tooltip text="The absolute lowest amount an invoice can be." />
          </label>
          <input 
            type="number" 
            className={inputClass}
            value={settings.rules.minServiceCall}
            onChange={e => updateSettings({ ...settings, rules: { ...settings.rules, minServiceCall: Number(e.target.value) } })}
          />
        </div>
        <div>
          <label className="flex items-center text-sm font-bold text-slate-700 mb-1">
            Trip Charge ($) <Tooltip text="Flat fee added to every visit for fuel/wear." />
          </label>
          <input 
            type="number" 
            className={inputClass}
            value={settings.rules.tripCharge}
            onChange={e => updateSettings({ ...settings, rules: { ...settings.rules, tripCharge: Number(e.target.value) } })}
          />
        </div>
        <div>
           <label className="flex items-center text-sm font-bold text-slate-700 mb-1">
            Minimum Man-Hours <Tooltip text="Minimum labor hours charged per visit." />
          </label>
          <input 
            type="number" 
            className={inputClass}
            value={settings.rules.minHours}
            onChange={e => updateSettings({ ...settings, rules: { ...settings.rules, minHours: Number(e.target.value) } })}
          />
        </div>
        <div>
           <label className="flex items-center text-sm font-bold text-slate-700 mb-1">
            Rush Surcharge (%) 
          </label>
          <input 
            type="number" 
            className={inputClass}
            value={settings.rules.emergencySurchargePercent}
            onChange={e => updateSettings({ ...settings, rules: { ...settings.rules, emergencySurchargePercent: Number(e.target.value) } })}
          />
        </div>
      </div>
    </div>
  );
  
  const renderSummary = () => (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="text-center">
         <h2 className="text-3xl font-bold text-slate-900 mb-2">{isEditMode ? 'Settings Review' : "You're All Set!"}</h2>
         <p className="text-slate-500">{isEditMode ? 'Review your updated business metrics.' : 'Your financial blueprint has been generated.'}</p>
      </div>

      <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl text-center">
        <p className="text-slate-400 uppercase text-xs font-bold tracking-widest mb-2">Your Target Rate</p>
        <div className="text-6xl font-bold text-green-400 mb-2">
          {/* We calculate simply here for display, real calc is in Sidebar logic */}
          {(function() {
             // Quick Recalc for display (duplicated logic, ideally shared hook)
             const prodDays = settings.season.weeksPerYear * settings.season.daysPerWeek;
             const hrs = prodDays * settings.season.hoursPerDay;
             let billable = 0, costs = 0;
             settings.employees.forEach(e => {
                billable += hrs * (e.utilizationPercent / 100);
                const pay = e.payType === 'Hourly' ? e.wage * hrs : e.wage;
                costs += pay * (1 + e.laborBurdenPercent / 100);
             });
             const overhead = settings.overhead.reduce((s, i) => s + (i.frequency === 'Monthly' ? i.amount * 12 : i.amount), 0);
             const breakEven = billable ? (costs + overhead) / billable : 0;
             const target = breakEven / (1 - settings.pricing.targetMarginPercent / 100);
             return new Intl.NumberFormat('en-US', { style: 'currency', currency: settings.profile.currency }).format(target);
          })()}
          <span className="text-2xl text-slate-500 font-normal">/hr</span>
        </div>
        <p className="text-slate-400 text-sm">Charge this for every man-hour on the job.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
           <div className="text-2xl font-bold text-slate-800">{settings.pricing.targetMarginPercent}%</div>
           <div className="text-xs text-slate-500 uppercase font-bold">Profit Margin</div>
        </div>
        <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
           <div className="text-2xl font-bold text-slate-800">{settings.season.weeksPerYear}</div>
           <div className="text-xs text-slate-500 uppercase font-bold">Active Weeks</div>
        </div>
        <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
           <div className="text-2xl font-bold text-slate-800">{settings.employees.length}</div>
           <div className="text-xs text-slate-500 uppercase font-bold">Crew Size</div>
        </div>
      </div>
    </div>
  );

  const steps = [
    { num: 1, title: 'Profile', render: renderStep1 },
    { num: 2, title: 'Season', render: renderStep2 },
    { num: 3, title: 'Employees', render: renderStep3 },
    { num: 4, title: 'Overhead', render: renderStep4 },
    { num: 5, title: 'Pricing', render: renderStep5 },
    { num: 6, title: 'Rules', render: renderStep6 },
    { num: 7, title: 'Summary', render: renderSummary },
  ];

  // Base layout classes depending on mode
  const containerClasses = isEditMode
    ? "fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    : "w-full max-w-6xl mx-auto h-[80vh]"; // Standalone mode: relative, no fixed overlay

  const cardClasses = "bg-white w-full rounded-2xl shadow-2xl flex overflow-hidden relative h-full";

  return (
    <div className={containerClasses}>
      <div className={cardClasses}>
        
        {/* Close Button (Edit Mode Only) */}
        {isEditMode && (
           <button 
             onClick={closeSettings}
             className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full z-50"
           >
             <X size={24} />
           </button>
        )}

        {/* LEFT: Navigation */}
        <div className="w-64 bg-slate-50 border-r border-slate-200 p-8 hidden md:block">
          <h1 className="text-xl font-bold text-slate-800 mb-8">{isEditMode ? 'Business Settings' : 'Setup Wizard'}</h1>
          <div className="space-y-1">
            {steps.slice(0, 6).map((s) => (
              <div 
                key={s.num} 
                onClick={() => isEditMode && setCurrentStep(s.num)}
                className={`flex items-center p-2 rounded-lg transition-all ${isEditMode ? 'cursor-pointer hover:bg-slate-200' : ''}`}
              >
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3 transition-colors ${
                   currentStep > s.num || (isEditMode && currentStep !== s.num) ? 'bg-green-500 text-white' : 
                   currentStep === s.num ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-500'
                 }`}>
                   {(currentStep > s.num || (isEditMode && currentStep !== s.num)) ? <Check size={16} /> : s.num}
                 </div>
                 <span className={`text-sm font-medium ${currentStep === s.num ? 'text-slate-900' : 'text-slate-500'}`}>
                   {s.title}
                 </span>
              </div>
            ))}
            {/* Connector Lines */}
            <div className="ml-6 h-4 border-l-2 border-slate-200 last:hidden"></div>
          </div>
        </div>

        {/* CENTER: Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 p-8 overflow-y-auto relative">
             {error && (
                 <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4 flex items-start">
                     <AlertTriangle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
                     <span>{error}</span>
                 </div>
             )}
             {steps[currentStep - 1].render()}
          </div>
          
          <div className="p-6 border-t border-slate-100 flex justify-between bg-white">
            {(currentStep > 1 && !isEditMode) && (
              <button 
                disabled={saving}
                onClick={() => setCurrentStep(c => c - 1)}
                className="px-6 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors"
              >
                Back
              </button>
            )}
            
            <div className="ml-auto flex space-x-3">
              {currentStep < 7 ? (
                <>
                  {isEditMode && (
                     <button 
                        disabled={saving}
                        onClick={closeSettings}
                        className="px-6 py-2 text-slate-500 hover:text-slate-700 font-medium"
                      >
                        Cancel
                      </button>
                  )}
                  <button 
                    disabled={saving}
                    onClick={() => setCurrentStep(c => c + 1)}
                    className="px-6 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Next Step <ChevronRight size={18} className="ml-1" />
                  </button>
                </>
              ) : (
                <button 
                  disabled={saving}
                  onClick={() => handleSave(true)}
                  className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors shadow-lg hover:shadow-green-200 transform hover:-translate-y-0.5 flex items-center disabled:opacity-70 disabled:cursor-wait"
                >
                  {isEditMode ? (
                      <>
                        <Save size={18} className="mr-2" /> {saving ? 'Saving...' : 'Save & Close'}
                      </>
                  ) : (
                      <>
                        {saving ? 'Initializing...' : 'Complete Setup & Launch'}
                      </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Live Sidebar */}
        {currentStep < 7 && <WizardSidebar settings={settings} step={currentStep} />}
      </div>
    </div>
  );
};

export default SetupWizard;
