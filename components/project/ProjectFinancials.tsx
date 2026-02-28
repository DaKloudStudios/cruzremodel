
import React, { useState } from 'react';
import { Project, ProjectExpense, ProjectInvoice } from '../../types';
import { DollarSign, TrendingUp, Plus, FileText, Trash2, Receipt } from 'lucide-react';

interface ProjectFinancialsProps {
    project: Project;
    onUpdate: (updates: Partial<Project>) => void;
    metrics: any;
    settings: any;
}

const ProjectFinancials: React.FC<ProjectFinancialsProps> = ({ project, onUpdate, metrics, settings }) => {
    const [activeTab, setActiveTab] = useState<'Analysis' | 'Expenses' | 'Invoices'>('Analysis');

    // Expense Form
    const [newExpense, setNewExpense] = useState<Partial<ProjectExpense>>({ category: 'Material' });
    const [isAddingExpense, setIsAddingExpense] = useState(false);

    // Invoice Form
    const [newInvoiceAmount, setNewInvoiceAmount] = useState<number | ''>('');
    const [isAddingInvoice, setIsAddingInvoice] = useState(false);

    // --- ACTIONS ---
    const addExpense = () => {
        if (!newExpense.amount || !newExpense.description) return;
        const expense: ProjectExpense = {
            id: Math.random().toString(36).substr(2, 9),
            date: new Date().toISOString(),
            vendor: newExpense.vendor || '',
            category: newExpense.category || 'Other',
            amount: Number(newExpense.amount),
            description: newExpense.description || ''
        };
        onUpdate({ expenses: [expense, ...(project.expenses || [])] });
        setNewExpense({ category: 'Material' });
        setIsAddingExpense(false);
    };

    const removeExpense = (id: string) => {
        onUpdate({ expenses: (project.expenses || []).filter(e => e.id !== id) });
    };

    const addInvoice = () => {
        if (!newInvoiceAmount) return;
        const invoice: ProjectInvoice = {
            id: Math.random().toString(36).substr(2, 9),
            date: new Date().toISOString(),
            dueDate: new Date(Date.now() + 14 * 86400000).toISOString(),
            amount: Number(newInvoiceAmount),
            status: 'Draft',
            items: []
        };
        onUpdate({ invoices: [invoice, ...(project.invoices || [])] });
        setNewInvoiceAmount('');
        setIsAddingInvoice(false);
    };

    const toggleInvoiceStatus = (id: string) => {
        const invoices = (project.invoices || []).map(inv => {
            if (inv.id !== id) return inv;
            const nextStatus = inv.status === 'Draft' ? 'Sent' : inv.status === 'Sent' ? 'Paid' : 'Paid';
            return { ...inv, status: nextStatus as any };
        });
        onUpdate({ invoices });
    };

    // --- CALCS ---
    const laborCostRate = metrics.avgHourlyWage * (1 + metrics.avgLaborBurdenPercent / 100) + metrics.overheadPerManHour;
    const actualLaborCost = (project.actualLaborHours || 0) * laborCostRate;

    const expensesTotal = (project.expenses || []).reduce((sum, e) => sum + e.amount, 0);
    const totalActualCost = actualLaborCost + expensesTotal;

    const revenue = project.revenue;
    const profit = revenue - totalActualCost;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

    const invoicedTotal = (project.invoices || []).reduce((sum, i) => sum + i.amount, 0);
    const paidTotal = (project.invoices || []).filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.amount, 0);

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-full flex flex-col animate-in fade-in">

            {/* Header Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50/50 overflow-x-auto">
                {['Analysis', 'Expenses', 'Invoices'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === tab ? 'border-slate-800 text-slate-800 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6">

                {activeTab === 'Analysis' && (
                    <div className="space-y-6">
                        {/* KPI Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-slate-900 text-white p-5 rounded-xl shadow-lg">
                                <p className="text-slate-400 text-xs font-bold uppercase mb-1">Contract Revenue</p>
                                <p className="text-3xl font-bold tracking-tight">${revenue.toLocaleString()}</p>
                                <div className="mt-2 text-xs text-slate-300 flex justify-between">
                                    <span>Invoiced: ${invoicedTotal.toLocaleString()}</span>
                                    <span className="text-green-400">Paid: ${paidTotal.toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                <p className="text-slate-500 text-xs font-bold uppercase mb-1">Real-Time Profit</p>
                                <p className={`text-3xl font-bold tracking-tight ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    ${profit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </p>
                                <p className="text-xs text-slate-400 mt-1">
                                    Net Margin: <span className={margin < settings.pricing.targetMarginPercent ? 'text-amber-500 font-bold' : 'text-green-600 font-bold'}>{margin.toFixed(1)}%</span>
                                </p>
                            </div>
                        </div>

                        {/* Breakdown */}
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                            <h4 className="font-bold text-slate-800 mb-4 flex items-center"><TrendingUp size={16} className="mr-2" /> Cost Breakdown</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Labor Burden ({(project.actualLaborHours || 0)} hrs)</span>
                                    <span className="font-bold">${actualLaborCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Expensed Materials</span>
                                    <span className="font-bold">${expensesTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                </div>
                                <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-bold text-slate-800">
                                    <span>Total Cost Basis</span>
                                    <span>${totalActualCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'Expenses' && (
                    <div className="space-y-4">
                        <button
                            onClick={() => setIsAddingExpense(!isAddingExpense)}
                            className="w-full py-2 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 font-bold hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center"
                        >
                            <Plus size={16} className="mr-2" /> Log Receipt / Expense
                        </button>

                        {isAddingExpense && (
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 animate-in slide-in-from-top-2">
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <input className="p-2 text-sm border rounded" placeholder="Description" value={newExpense.description || ''} onChange={e => setNewExpense({ ...newExpense, description: e.target.value })} />
                                    <input type="number" className="p-2 text-sm border rounded" placeholder="Amount ($)" value={newExpense.amount || ''} onChange={e => setNewExpense({ ...newExpense, amount: Number(e.target.value) })} />
                                    <input className="p-2 text-sm border rounded" placeholder="Vendor" value={newExpense.vendor || ''} onChange={e => setNewExpense({ ...newExpense, vendor: e.target.value })} />
                                    <select className="p-2 text-sm border rounded" value={newExpense.category} onChange={e => setNewExpense({ ...newExpense, category: e.target.value as any })}>
                                        <option value="Material">Material</option>
                                        <option value="Equipment">Equipment</option>
                                        <option value="Subcontractor">Subcontractor</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <button onClick={addExpense} className="w-full bg-slate-800 text-white py-2 rounded font-bold text-xs hover:bg-slate-900">Save Expense</button>
                            </div>
                        )}

                        <div className="space-y-2">
                            {(project.expenses || []).map(exp => (
                                <div key={exp.id} className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-lg shadow-sm group">
                                    <div>
                                        <p className="font-bold text-sm text-slate-800">{exp.description}</p>
                                        <p className="text-xs text-slate-500">{exp.vendor} • {exp.category} • {new Date(exp.date).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-mono font-bold text-slate-700">-${exp.amount.toFixed(2)}</span>
                                        <button onClick={() => removeExpense(exp.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'Invoices' && (
                    <div className="space-y-4">
                        <button
                            onClick={() => setIsAddingInvoice(!isAddingInvoice)}
                            className="w-full py-2 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 font-bold hover:border-green-300 hover:text-green-600 hover:bg-green-50 transition-all flex items-center justify-center"
                        >
                            <Plus size={16} className="mr-2" /> Create Invoice
                        </button>

                        {isAddingInvoice && (
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 animate-in slide-in-from-top-2 flex gap-2">
                                <input
                                    type="number"
                                    className="flex-1 p-2 text-sm border rounded"
                                    placeholder="Amount ($)"
                                    value={newInvoiceAmount}
                                    onChange={e => setNewInvoiceAmount(Number(e.target.value))}
                                />
                                <button onClick={addInvoice} className="bg-green-600 text-white px-4 rounded font-bold text-xs hover:bg-green-700">Add</button>
                            </div>
                        )}

                        <div className="space-y-2">
                            {(project.invoices || []).map(inv => (
                                <div key={inv.id} className="flex justify-between items-center p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${inv.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                            <Receipt size={18} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-slate-800">Invoice #{inv.id.slice(0, 6)}</p>
                                            <p className="text-xs text-slate-500">Due: {new Date(inv.dueDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="block font-bold text-slate-900">${inv.amount.toLocaleString()}</span>
                                        <button
                                            onClick={() => toggleInvoiceStatus(inv.id)}
                                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded cursor-pointer hover:opacity-80 ${inv.status === 'Paid' ? 'bg-green-100 text-green-700' : inv.status === 'Sent' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}
                                        >
                                            {inv.status}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default ProjectFinancials;
