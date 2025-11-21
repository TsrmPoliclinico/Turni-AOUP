import React from 'react';

export const KeyIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.629 5.655l-2.066 2.066a2 2 0 01-2.828 0l-1.414-1.414a2 2 0 010-2.828l2.066-2.066A6 6 0 0112 7a6 6 0 013-1.75V4a2 2 0 114 0v1.25zM12 12a3 3 0 100-6 3 3 0 000 6z" />
    </svg>
);
