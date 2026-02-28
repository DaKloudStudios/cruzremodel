import React from 'react';
import { CreditCard, Download, FileText, CheckCircle } from 'lucide-react';

const ClientBillingView: React.FC = () => {
    // Mock data for MVP
    const balance = 1250.00;
    const unpaidInvoices = [
        { id: 'INV-2023-001', date: 'Oct 15, 2023', amount: 850.00, status: 'Overdue' },
        { id: 'INV-2023-002', date: 'Nov 01, 2023', amount: 400.00, status: 'Unpaid' }
    ];
    const paidInvoices = [
        { id: 'INV-2023-000', date: 'Sep 15, 2023', amount: 1500.00, status: 'Paid' }
    ];

    const handlePayNow = () => {
        alert("This feature is currently in development. In a production environment, this would open a Stripe Checkout session to complete the payment of $" + balance.toFixed(2));
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-stone-800">Billing & Invoices</h1>
                    <p className="text-stone-500 mt-1">Manage your account balance and payment history.</p>
                </div>
            </div>

            {/* Balance Overview Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden flex flex-col md:flex-row">
                <div className="p-8 md:w-1/2 flex flex-col justify-center">
                    <p className="font-bold text-stone-500 uppercase tracking-widest text-xs mb-2">Total Amount Due</p>
                    <h2 className="text-5xl font-bold text-stone-900 mb-6">${balance.toFixed(2)}</h2>
                    <button
                        onClick={handlePayNow}
                        className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold transition-all shadow-md focus:ring-4 focus:ring-emerald-200"
                    >
                        <CreditCard size={18} /> Pay via Stripe
                    </button>
                    <p className="text-center text-xs text-stone-400 mt-3 flex items-center justify-center gap-1">
                        Secure payments processed by Stripe <CreditCard size={12} className="inline opacity-50" />
                    </p>
                </div>
                <div className="bg-stone-50 p-8 md:w-1/2 border-t md:border-t-0 md:border-l border-stone-200">
                    <h3 className="font-bold text-stone-800 mb-4 text-sm uppercase tracking-wider">Unpaid Invoices</h3>
                    <div className="space-y-3">
                        {unpaidInvoices.map(inv => (
                            <div key={inv.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-stone-200 shadow-sm">
                                <div>
                                    <div className="font-bold text-stone-800 text-sm flex items-center gap-2">
                                        <FileText size={14} className="text-stone-400" /> {inv.id}
                                    </div>
                                    <div className="text-xs text-stone-500 mt-0.5">{inv.date}</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-stone-900">${inv.amount.toFixed(2)}</div>
                                    <div className={`text-[10px] uppercase tracking-wider font-bold mt-1 ${inv.status === 'Overdue' ? 'text-red-600' : 'text-amber-600'}`}>{inv.status}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Billing History */}
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                <div className="p-6 border-b border-stone-100 bg-stone-50/50">
                    <h3 className="font-bold text-stone-800">Payment History</h3>
                </div>
                <div>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-stone-100 text-xs uppercase tracking-wider text-stone-400 font-bold bg-white">
                                <th className="px-6 py-4">Invoice</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                                <th className="px-6 py-4 text-center">Receipt</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {paidInvoices.map(inv => (
                                <tr key={inv.id} className="hover:bg-stone-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-stone-800 text-sm flex items-center gap-2">
                                            <FileText size={16} className="text-stone-400" /> {inv.id}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-stone-600">{inv.date}</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                                            <CheckCircle size={12} /> Paid
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-stone-800">${inv.amount.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors">
                                            <Download size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default ClientBillingView;
