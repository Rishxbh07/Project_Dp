// src/components/common/CredentialItem.jsx

import React, { useState } from 'react';
import { Copy, Check, Eye, ExternalLink } from 'lucide-react';

const isUrl = (string) => {
    try { new URL(string); return string.startsWith('http'); } catch (_) { return false; }
};

const CredentialItem = ({ label, value, sensitive = false }) => {
    const [copied, setCopied] = useState(false);
    const [isRevealed, setIsRevealed] = useState(!sensitive);

    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (isUrl(value)) {
        return (
            <div className="flex justify-between items-center py-3">
                <span className="text-sm text-gray-500 dark:text-slate-400 capitalize">{label.replace(/_/g, ' ')}</span>
                <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-blue-500 hover:underline flex items-center gap-1">
                    Open Link <ExternalLink className="w-4 h-4" />
                </a>
            </div>
        );
    }

    return (
        <div className="flex justify-between items-center py-3">
            <span className="text-sm text-gray-500 dark:text-slate-400 capitalize">{label.replace(/_/g, ' ')}</span>
            <div className="flex items-center gap-3">
                <span className={`font-mono text-sm ${!isRevealed ? 'blur-sm select-none' : ''}`}>{isRevealed ? value : '••••••••••'}</span>
                {sensitive && <button onClick={() => setIsRevealed(!isRevealed)}><Eye className="w-4 h-4 text-gray-400" /></button>}
                <button onClick={handleCopy}>
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
                </button>
            </div>
        </div>
    );
};

export default CredentialItem;