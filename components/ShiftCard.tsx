import React from 'react';
import type { Shift, User } from '../types';
import { TrashIcon } from './icons/TrashIcon';

interface ShiftCardProps {
  shift: Shift;
  user?: User;
  onDelete?: (shiftId: string) => void;
  areaColor?: string;
}

export const ShiftCard: React.FC<ShiftCardProps> = ({ shift, user, onDelete, areaColor }) => {
  const areaStyle = areaColor || 'bg-gray-100 text-gray-800 border-gray-300';

  return (
    <div className={`group relative p-1.5 rounded-md border text-xs shadow-sm flex items-center justify-center text-center ${areaStyle}`}>
      {user ? (
        <span className="truncate font-semibold">{user.name}</span>
      ) : (
        <span className="text-gray-500">Non assegnato</span>
      )}
       {onDelete && (
        <button 
          onClick={() => onDelete(shift.id)}
          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500"
          aria-label="Rimuovi turno"
        >
          <TrashIcon className="h-3 w-3" />
        </button>
      )}
    </div>
  );
};