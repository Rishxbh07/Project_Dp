import React from 'react';
import { Trash2 } from 'lucide-react';

const DeleteListing = ({ onDelete, isActiveMembers }) => (
    <div className="mt-8 border-t border-red-500/20 pt-6">
         <button 
            onClick={onDelete} 
            disabled={isActiveMembers}
            className="w-full bg-red-600/10 text-red-500 font-semibold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-red-600/20 disabled:bg-gray-100 dark:disabled:bg-slate-700 disabled:text-gray-400 dark:disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
        >
            <Trash2 className="w-4 h-4" /> Archive Listing
        </button>
        {isActiveMembers && (
            <p className="text-xs text-center text-gray-500 dark:text-slate-400 mt-2">You cannot archive a listing with active members.</p>
        )}
    </div>
);

export default DeleteListing;