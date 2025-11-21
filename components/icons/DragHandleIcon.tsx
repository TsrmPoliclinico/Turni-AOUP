import React from 'react';

export const DragHandleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <circle cx="10" cy="6" r="1.5" />
        <circle cx="14" cy="6" r="1.5" />
        <circle cx="10" cy="12" r="1.5" />
        <circle cx="14" cy="12" r="1.5" />
        <circle cx="10" cy="18" r="1.5" />
        <circle cx="14" cy="18" r="1.5" />
    </svg>
);
