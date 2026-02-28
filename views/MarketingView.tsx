import React from 'react';
import { Megaphone, MessageSquare, Star, Share2 } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const MarketingView: React.FC = () => {
    const { settings } = useSettings();

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif text-charcoal">Marketing Hub</h1>
                    <p className="text-gray-500 mt-1">Manage campaigns, reviews, and social media.</p>
                </div>
                <div className="flex gap-3">
                    <button className="btn btn-primary flex items-center gap-2">
                        <Megaphone className="w-4 h-4" />
                        <span>New Campaign</span>
                    </button>
                </div>
            </div>

            {/* Integration Status (Mock) */}
            <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm">
                        <Share2 className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-charcoal">Headless Marketing Engine</h3>
                        <p className="text-gray-600 mt-1 max-w-2xl">
                            Your marketing is powered by our enterprise integration.
                            Campaigns, automations, and messaging are synchronized in real-time.
                        </p>
                        <div className="flex gap-4 mt-4 text-sm font-medium text-emerald-700">
                            <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                SMS Gateway Active
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                Email Engine Ready
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Unified Inbox */}
                <div className="card hover:shadow-lg transition-all cursor-pointer group">
                    <div className="p-6">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <MessageSquare className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-medium text-charcoal mb-2">Unified Inbox</h3>
                        <p className="text-gray-500 text-sm">
                            Manage SMS, Email, Facebook, and Instagram messages in one place.
                        </p>
                    </div>
                </div>

                {/* Reputation / Reviews */}
                <div className="card hover:shadow-lg transition-all cursor-pointer group">
                    <div className="p-6">
                        <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Star className="w-6 h-6 text-amber-600" />
                        </div>
                        <h3 className="text-xl font-medium text-charcoal mb-2">Reputation</h3>
                        <p className="text-gray-500 text-sm">
                            Automated review requests and monitoring for Google & Facebook.
                        </p>
                    </div>
                </div>

                {/* Social Planner */}
                <div className="card hover:shadow-lg transition-all cursor-pointer group">
                    <div className="p-6">
                        <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Share2 className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-medium text-charcoal mb-2">Social Planner</h3>
                        <p className="text-gray-500 text-sm">
                            Schedule posts and upload "Before & After" photos to all channels.
                        </p>
                    </div>
                </div>
            </div>

            <div className="text-center py-12 text-gray-400">
                <p>Select a module to get started.</p>
            </div>
        </div>
    );
};

export default MarketingView;
