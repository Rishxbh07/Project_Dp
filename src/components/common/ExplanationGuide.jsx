import React, { useState } from 'react';
import { Baby, Sparkles, Crown, Zap, Star, Flame, ShieldCheck, ZapOff, Globe, Lock, ChevronDown } from 'lucide-react';

const ExplanationGuide = () => {
    const [openIndex, setOpenIndex] = useState(null);

    // --- UPDATED ORDER + FIXED TEXT CLIPPING ---
    const sections = [
        {
            title: 'Plan Age & Badges',
            description: 'Badges show how long community plans have been active on DapBuddy.',
            items: [
                {
                    icon: (
                        <div className="flex items-center gap-1.5 text-xs font-bold rounded-lg px-2 py-1 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-purple-700 text-white shadow-md">
                            <Crown className="w-3 h-3" /> Daddy
                        </div>
                    ),
                    explanation:
                        "Active for over a year. He's the man of the house now! These are very rare to witness — you should aspire to be a daddy yourself one day."
                },
                { icon: <div className="flex items-center gap-1.5 text-xs font-bold rounded-lg px-2 py-1 bg-gradient-to-r from-cyan-400 to-blue-500 text-white"><Baby className="w-3 h-3" /> Newborn</div>, explanation: 'Active for the last 7 days.' },
                { icon: <div className="flex items-center gap-1.5 text-xs font-bold rounded-lg px-2 py-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white"><Sparkles className="w-3 h-3" /> Toddler</div>, explanation: 'Active for 7-30 days.' },
                { icon: <div className="flex items-center gap-1.5 text-xs font-bold rounded-lg px-2 py-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-white"><Zap className="w-3 h-3" /> Teen</div>, explanation: 'Active for 30-90 days.' },
                { icon: <div className="flex items-center gap-1.5 text-xs font-bold rounded-lg px-2 py-1 bg-gradient-to-r from-orange-400 to-red-500 text-white"><Star className="w-3 h-3" /> Adult</div>, explanation: 'Active for 90-180 days.' },
                { icon: <div className="flex items-center gap-1.5 text-xs font-bold rounded-lg px-2 py-1 bg-gradient-to-r from-red-500 to-pink-600 text-white"><Flame className="w-3 h-3" /> Legend</div>, explanation: 'Active for 180-365 days.' },
            ]
        },
        {
            title: 'Joining Methods',
            description: 'Indicates how you will get access to the plan after payment.',
            items: [
                { icon: <Zap className="w-5 h-5 text-yellow-500" />, explanation: 'Instant Joining: Get access immediately.' },
                { icon: <ZapOff className="w-5 h-5 text-gray-500" />, explanation: 'Manual Invite: Host sends details within hours.' }
            ]
        },
        {
            title: 'Ratings Explained',
            description: 'Ratings help you choose reliable hosts and plans.',
            items: [
                { icon: <Star className="w-5 h-5 text-yellow-400" fill="currentColor" />, explanation: "Host Rating: The host's overall score." },
                { icon: <Star className="w-5 h-5 text-blue-400" fill="currentColor" />, explanation: "Plan Rating: This specific group's rating." }
            ]
        },
        {
            title: 'Plan Labels',
            description: "Quick info about the plan's visibility and management.",
            items: [
                { icon: <Globe className="w-5 h-5 text-green-500" />, explanation: 'Public Group: Visible to everyone on the marketplace.' },
                { icon: <Lock className="w-5 h-5 text-gray-500" />, explanation: 'Private Group: Only accessible via a direct link from the host.' },
                { icon: <ShieldCheck className="w-5 h-5 text-purple-500" />, explanation: 'DapBuddy Plan: An official plan managed directly by DapBuddy.' }
            ]
        }
    ];

    return (
        <div className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-200 px-1">Feature Guide</h2>
            {sections.map((section, index) => (
                <div
                    key={section.title}
                    className="bg-white dark:bg-slate-800/50 rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700"
                >
                    <button
                        onClick={() => setOpenIndex(openIndex === index ? null : index)}
                        className="w-full flex justify-between items-center p-3 text-left font-semibold text-gray-800 dark:text-slate-200"
                    >
                        <span>{section.title}</span>
                        <ChevronDown
                            className={`w-5 h-5 transition-transform duration-300 ${
                                openIndex === index ? 'rotate-180' : ''
                            }`}
                        />
                    </button>
                    {/* --- FIXED: Removed hard max height constraint --- */}
                    <div
                        className={`transition-all duration-300 ${
                            openIndex === index ? 'max-h-none' : 'max-h-0 overflow-hidden'
                        }`}
                    >
                        <div className="p-3 pt-0 text-xs text-gray-500 dark:text-slate-400 space-y-3">
                            <p className="mb-3">{section.description}</p>
                            <div className="space-y-3">
                                {section.items.map((item, idx) => {
                                    if (section.title === 'Plan Age & Badges') {
                                        return (
                                            <div
                                                key={idx}
                                                className="flex flex-col items-start gap-2 p-2 bg-gray-100 dark:bg-slate-900/50 rounded-md"
                                            >
                                                {item.badge || item.icon}
                                                <p className="text-gray-600 dark:text-slate-300 pl-1 leading-relaxed">
                                                    {item.explanation}
                                                </p>
                                            </div>
                                        );
                                    }
                                    return (
                                        <div key={idx} className="flex items-center gap-3">
                                            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                                                {item.badge || item.icon}
                                            </div>
                                            <p className="text-gray-600 dark:text-slate-300 leading-relaxed">
                                                {item.explanation}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ExplanationGuide;
