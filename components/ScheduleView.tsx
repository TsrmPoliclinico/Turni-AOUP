
import React, { useState, useMemo, useEffect } from 'react';
import type { Shift, User, VacationRequest, DiagnosticAreaInfo } from '../types';
import { DiagnosticArea } from '../types';
import { ShiftCard } from './ShiftCard';
import { MagicWandIcon } from './icons/MagicWandIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { VacationRequestStatus } from '../types';
import { PrinterIcon } from './icons/PrinterIcon';
import { DragHandleIcon } from './icons/DragHandleIcon';
import { PencilIcon } from './icons/PencilIcon';

type TimeSlot = 'morning' | 'afternoon' | 'night';

interface ScheduleViewProps {
  shifts: Shift[];
  users: User[];
  vacationRequests: VacationRequest[];
  diagnosticAreas: DiagnosticAreaInfo[];
  onGenerate: (startDate: Date, endDate: Date) => void;
  isGenerating: boolean;
  canGenerate: boolean;
  isManager: boolean;
  onAddShift: (date: string, area: DiagnosticArea, timeSlot: TimeSlot, userId: string) => void;
  onDeleteShift: (shiftId: string) => void;
  onUpdateAreaName: (areaId: DiagnosticArea, newName: string) => void;
  onReorderAreas?: (newOrder: DiagnosticAreaInfo[]) => void;
}

const PlusIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
);


interface AddShiftModalProps {
  date: Date;
  area: DiagnosticArea;
  timeSlot: TimeSlot;
  users: User[];
  diagnosticAreas: DiagnosticAreaInfo[];
  onAddShift: (userId: string) => void;
  onClose: () => void;
}

const AddShiftModal: React.FC<AddShiftModalProps> = ({ date, area, timeSlot, users, diagnosticAreas, onAddShift, onClose }) => {
  const [userId, setUserId] = useState('');
  const areaInfo = useMemo(() => diagnosticAreas.find(a => a.id === area), [area, diagnosticAreas]);
  const timeSlotName = timeSlot === 'morning' ? 'Mattina' : timeSlot === 'afternoon' ? 'Pomeriggio' : 'Notte';

  const availableUsers = useMemo(() => {
    // Filter out admin users from manual assignment
    const assignableUsers = users.filter(u => !u.isAdmin);

    if (area === DiagnosticArea.PS && timeSlot === 'night') {
        return assignableUsers.filter(u => u.canDoNightShiftsInER);
    }
    return assignableUsers;
  }, [users, area, timeSlot]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      alert('Selezionare un utente.');
      return;
    }
    onAddShift(userId);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md m-4 transform transition-all animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-xl font-bold text-gray-800">
             Aggiungi Turno: <span className='font-normal capitalize'>{areaInfo?.name} / {date.toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })} / {timeSlotName}</span>
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none" aria-label="Chiudi">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="user-select" className="block text-sm font-medium text-gray-700">Utente</label>
            <select id="user-select" value={userId} onChange={e => setUserId(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
              <option value="" disabled>Seleziona un utente</option>
              {availableUsers.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
            </select>
             {availableUsers.length === 0 && (
                <p className="mt-2 text-sm text-red-600">Nessun utente abilitato o disponibile per questo turno.</p>
            )}
          </div>
          
          <div className="mt-6 flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors">Annulla</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">Aggiungi Turno</button>
          </div>
        </form>
      </div>
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

const getDaysInMonth = (date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days: Date[] = [];
    const lastDay = new Date(year, month + 1, 0).getDate();
    for(let i=1; i<=lastDay; i++) {
        days.push(new Date(year, month, i));
    }
    return days;
};

const MIN_ROW_HEIGHT = 80;

const morningOnlyAreas = [DiagnosticArea.UROLOGIA, DiagnosticArea.NEUROCHIRURGIA, DiagnosticArea.CH_PLASTICA, DiagnosticArea.SENOLOGIA, DiagnosticArea.VILLA_BELMONTE, DiagnosticArea.CONE_BEAM_OPT, DiagnosticArea.URGENZE_SALE_OPERATORIE, DiagnosticArea.DIAGNOSTICA, DiagnosticArea.MOC, DiagnosticArea.REPERIBILITA_ISTITUTO, DiagnosticArea.PRIMA_REPERIBILITA_SALA, DiagnosticArea.SECONDA_REPERIBILITA_SALA];

export const ScheduleView: React.FC<ScheduleViewProps> = ({ shifts, users, vacationRequests, diagnosticAreas, onGenerate, isGenerating, canGenerate, isManager, onAddShift, onDeleteShift, onUpdateAreaName, onReorderAreas }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [shiftModalInfo, setShiftModalInfo] = useState<{ date: Date; area: DiagnosticArea; timeSlot: TimeSlot } | null>(null);
  const [orderedAreas, setOrderedAreas] = useState(diagnosticAreas);

  const [draggedColumnIndex, setDraggedColumnIndex] = useState<number | null>(null);
  const [dragOverColumnIndex, setDragOverColumnIndex] = useState<number | null>(null);

  const [editingAreaId, setEditingAreaId] = useState<DiagnosticArea | null>(null);
  const [editingAreaName, setEditingAreaName] = useState('');

  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string>('all');


  const totalDataColumns = useMemo(() => orderedAreas.reduce((acc, area) => {
    if (area.id === DiagnosticArea.PS) return acc + 3;
    if (morningOnlyAreas.includes(area.id)) return acc + 1;
    return acc + 2;
  }, 0), [orderedAreas]);


  const [columnWidths, setColumnWidths] = useState<number[]>(() => 
    Array(totalDataColumns).fill(120)
  );

  const [rowHeights, setRowHeights] = useState<Record<string, number>>({});
  
  const [resizingColState, setResizingColState] = useState<{
    index: number;
    startX: number;
    startWidth: number;
  } | null>(null);

  const [resizingRowState, setResizingRowState] = useState<{
    dateString: string;
    startY: number;
    startHeight: number;
  } | null>(null);
  
  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (!isManager) return;
    e.dataTransfer.setData("draggedColumnIndex", index.toString());
    e.dataTransfer.effectAllowed = 'move';
    setDraggedColumnIndex(index);
  };
  
  const handleDragOver = (e: React.DragEvent, index: number) => {
      if (!isManager) return;
      e.preventDefault();
      if (draggedColumnIndex !== null && draggedColumnIndex !== index) {
          setDragOverColumnIndex(index);
      }
  };
  
  const handleDragLeave = () => {
      if (!isManager) return;
      setDragOverColumnIndex(null);
  };
  
  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    if (!isManager) return;
    e.preventDefault();
    if (draggedColumnIndex === null) return;
    
    if (draggedColumnIndex !== dropIndex) {
        const newOrderedAreas = [...orderedAreas];
        const [draggedItem] = newOrderedAreas.splice(draggedColumnIndex, 1);
        newOrderedAreas.splice(dropIndex, 0, draggedItem);
        setOrderedAreas(newOrderedAreas);
        if (onReorderAreas) {
            onReorderAreas(newOrderedAreas);
        }
    }
    
    handleDragEnd();
  };
  
  const handleDragEnd = () => {
      if (!isManager) return;
      setDraggedColumnIndex(null);
      setDragOverColumnIndex(null);
  };

  useEffect(() => {
    // Sync with parent state (e.g., name changes) while preserving local order.
    setOrderedAreas(currentOrder => {
        const newAreaMap = new Map(diagnosticAreas.map(a => [a.id, a]));
        // If an area was deleted from parent, it will be undefined and filtered out.
        const updatedAndFiltered = currentOrder
            .map(areaInOrder => newAreaMap.get(areaInOrder.id))
            .filter((area): area is DiagnosticAreaInfo => !!area);
        
        const currentIds = new Set(updatedAndFiltered.map(a => a.id));
        const newlyAdded = diagnosticAreas.filter(a => !currentIds.has(a.id));

        return [...updatedAndFiltered, ...newlyAdded];
    });
  }, [diagnosticAreas]);

  useEffect(() => {
    if (draggedColumnIndex !== null && isManager) {
      document.body.style.cursor = 'grabbing';
    } else {
      document.body.style.cursor = 'default';
    }
    return () => {
      document.body.style.cursor = 'default';
    };
  }, [draggedColumnIndex, isManager]);


  const handleColMouseDown = (e: React.MouseEvent, index: number) => {
    if (!isManager) return;
    e.preventDefault();
    setResizingColState({
        index,
        startX: e.clientX,
        startWidth: columnWidths[index],
    });
  };

  const handleRowMouseDown = (e: React.MouseEvent, dateString: string) => {
    if (!isManager) return;
    e.preventDefault();
    const targetElement = e.currentTarget.parentElement as HTMLElement;
    if (!targetElement) return;

    setResizingRowState({
        dateString,
        startY: e.clientY,
        startHeight: targetElement.offsetHeight,
    });
  };

  useEffect(() => {
    if (resizingColState === null || !isManager) return;

    const handleMouseMove = (e: MouseEvent) => {
        if (resizingColState === null) return;
        
        const currentX = e.clientX;
        const diffX = currentX - resizingColState.startX;
        const newWidth = Math.max(resizingColState.startWidth + diffX, 100); // Minimum width 100px

        setColumnWidths(prevWidths => {
            const newWidths = [...prevWidths];
            newWidths[resizingColState.index] = newWidth;
            return newWidths;
        });
    };

    const handleMouseUp = () => {
        setResizingColState(null);
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingColState, isManager]);

  useEffect(() => {
    if (resizingRowState === null || !isManager) return;

    const handleMouseMove = (e: MouseEvent) => {
        if (resizingRowState === null) return;
        
        const currentY = e.clientY;
        const diffY = currentY - resizingRowState.startY;
        const newHeight = Math.max(resizingRowState.startHeight + diffY, MIN_ROW_HEIGHT);

        setRowHeights(prev => ({
            ...prev,
            [resizingRowState.dateString]: newHeight
        }));
    };

    const handleMouseUp = () => {
        setResizingRowState(null);
    };

    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingRowState, isManager]);

  const handleAreaNameChange = (areaId: DiagnosticArea, newName: string) => {
    if (newName.trim()) {
        onUpdateAreaName(areaId, newName.trim());
    }
    setEditingAreaId(null);
  };

  const daysInMonth = useMemo(() => getDaysInMonth(currentDate), [currentDate]);

  useEffect(() => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    setCustomStartDate(startOfMonth.toISOString().split('T')[0]);
    setCustomEndDate(endOfMonth.toISOString().split('T')[0]);
  }, [currentDate]);

  const handleGenerate = () => {
    if (selectedUserId !== 'all') {
        alert("Per generare una pianificazione AI, rimuovi il filtro utente per visualizzare tutti i turni.");
        return;
    }
    if (customStartDate && customEndDate) {
      // Add T00:00:00 to avoid timezone issues where the date might be interpreted as the previous day
      const start = new Date(customStartDate + "T00:00:00");
      const end = new Date(customEndDate + "T00:00:00");
      if (end < start) {
        alert("La data di fine non può essere precedente alla data di inizio.");
        return;
      }
      onGenerate(start, end);
    } else {
       // Fallback to current month
       const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
       const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
       onGenerate(start, end);
    }
  };
  
  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const handleToday = () => setCurrentDate(new Date());

  return (
    <div className="flex flex-col h-full space-y-4">
      {shiftModalInfo && (
        <AddShiftModal
          date={shiftModalInfo.date}
          area={shiftModalInfo.area}
          timeSlot={shiftModalInfo.timeSlot}
          users={users}
          diagnosticAreas={diagnosticAreas}
          onAddShift={(userId) => {
            const dateStr = shiftModalInfo.date.toISOString().split('T')[0];
            onAddShift(dateStr, shiftModalInfo.area, shiftModalInfo.timeSlot, userId);
            setShiftModalInfo(null);
          }}
          onClose={() => setShiftModalInfo(null)}
        />
      )}

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-lg shadow-md flex flex-col lg:flex-row items-center justify-between gap-4 printable-content">
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2">
              <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-full no-print" aria-label="Mese precedente">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <h2 className="text-xl font-bold text-gray-800 min-w-[180px] text-center">
                {currentDate.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}
              </h2>
              <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-full no-print" aria-label="Mese successivo">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </button>
           </div>
           <button onClick={handleToday} className="text-sm text-blue-600 hover:underline font-medium no-print">Oggi</button>
        </div>

        <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 no-print">
            {/* User Filter */}
            <div className="relative">
                <select 
                    value={selectedUserId} 
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-blue-500 text-sm"
                >
                    <option value="all">Tutti gli utenti</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
            </div>

            {/* Generate AI Controls */}
            {canGenerate && (
                <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-md">
                     <input 
                        type="date" 
                        value={customStartDate} 
                        onChange={e => setCustomStartDate(e.target.value)}
                        className="text-xs border-gray-300 rounded px-2 py-1"
                        title="Inizio generazione"
                    />
                    <span className="text-gray-500 text-xs">-</span>
                     <input 
                        type="date" 
                        value={customEndDate} 
                        onChange={e => setCustomEndDate(e.target.value)}
                        className="text-xs border-gray-300 rounded px-2 py-1"
                        title="Fine generazione"
                    />
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-bold text-white shadow-sm transition-all ${
                        isGenerating ? 'bg-purple-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
                        }`}
                    >
                        {isGenerating ? <SpinnerIcon className="h-4 w-4" /> : <MagicWandIcon />}
                        <span>{isGenerating ? 'Generazione...' : 'Genera Turni AI'}</span>
                    </button>
                </div>
            )}
            
             <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm font-medium"
                title="Stampa pianificazione"
            >
                <PrinterIcon />
                <span className="hidden sm:inline">Stampa</span>
            </button>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="flex-1 bg-white rounded-lg shadow overflow-hidden flex flex-col printable-content">
        <div className="flex-1 overflow-auto relative" style={{ maxHeight: 'calc(100vh - 250px)' }}>
           <table className="min-w-full border-collapse">
             <thead className="bg-gray-100 sticky top-0 z-20 shadow-sm">
                <tr>
                   <th className="sticky left-0 z-30 bg-gray-100 border-b border-r border-gray-200 p-2 w-24 min-w-[6rem] text-xs font-bold text-gray-500 uppercase tracking-wider">
                       Data
                   </th>
                   {orderedAreas.map((area, index) => {
                        // Calculate colspan based on area type
                        let colSpan = 2; // Default (Morning, Afternoon)
                        if (area.id === DiagnosticArea.PS) colSpan = 3; // + Night
                        else if (morningOnlyAreas.includes(area.id)) colSpan = 1; // Morning only
                        
                        return (
                           <th 
                                key={area.id} 
                                colSpan={colSpan}
                                draggable={isManager}
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDrop={(e) => handleDrop(e, index)}
                                onDragEnd={handleDragEnd}
                                className={`border-b border-r border-gray-200 text-center relative group transition-colors duration-200 ${
                                    dragOverColumnIndex === index ? 'bg-blue-100 border-l-4 border-l-blue-500' : ''
                                }`}
                           >
                                <div className={`p-2 text-sm font-bold text-white ${area.color.split(' ')[0].replace('bg-', 'bg-opacity-90 bg-')} mx-1 rounded-t-md flex items-center justify-center gap-2`}>
                                    {isManager && <DragHandleIcon className="h-3 w-3 text-white/50 cursor-grab" />}
                                    
                                    {editingAreaId === area.id ? (
                                        <input
                                            type="text"
                                            value={editingAreaName}
                                            onChange={(e) => setEditingAreaName(e.target.value)}
                                            onBlur={() => handleAreaNameChange(area.id, editingAreaName)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAreaNameChange(area.id, editingAreaName)}
                                            autoFocus
                                            className="text-xs text-gray-800 px-1 py-0.5 rounded"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    ) : (
                                        <span className="truncate">{area.name}</span>
                                    )}
                                    
                                    {isManager && (
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingAreaId(area.id);
                                                setEditingAreaName(area.name);
                                            }}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <PencilIcon className="h-3 w-3 text-white/70 hover:text-white" />
                                        </button>
                                    )}
                                </div>
                                
                                {/* Sub-headers for slots */}
                                <div className="flex text-[10px] text-gray-500 font-medium uppercase tracking-wide mt-1">
                                    <div className="flex-1 border-r border-gray-200 last:border-0 py-1">Mattina</div>
                                    {!morningOnlyAreas.includes(area.id) && (
                                        <div className="flex-1 border-r border-gray-200 last:border-0 py-1">Pom</div>
                                    )}
                                    {area.id === DiagnosticArea.PS && (
                                        <div className="flex-1 py-1">Notte</div>
                                    )}
                                </div>

                                {isManager && (
                                    <div 
                                        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 z-10"
                                        onMouseDown={(e) => handleColMouseDown(e, index)} 
                                    />
                                )}
                           </th>
                        );
                   })}
                </tr>
             </thead>
             <tbody className="bg-white divide-y divide-gray-200">
                {daysInMonth.map(day => {
                    const dateStr = day.toISOString().split('T')[0];
                    const dayOfWeek = day.getDay();
                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                    const isToday = dateStr === new Date().toISOString().split('T')[0];

                    return (
                        <tr key={dateStr} style={{ height: rowHeights[dateStr] || MIN_ROW_HEIGHT }} className="relative group/row">
                             {/* Date Column */}
                             <td className={`sticky left-0 z-10 border-r border-gray-200 p-2 text-sm ${isToday ? 'bg-blue-50' : 'bg-white'} ${isWeekend ? 'text-red-600 font-medium' : 'text-gray-700'}`}>
                                <div className="flex flex-col items-center justify-center h-full relative">
                                     <span className="text-lg font-bold">{day.getDate()}</span>
                                     <span className="text-xs uppercase">{day.toLocaleDateString('it-IT', { weekday: 'short' })}</span>
                                     
                                     {isManager && (
                                         <div 
                                            className="absolute bottom-0 left-0 right-0 h-1 cursor-row-resize hover:bg-blue-400"
                                            onMouseDown={(e) => handleRowMouseDown(e, dateStr)}
                                         />
                                     )}
                                </div>
                             </td>

                             {/* Data Columns */}
                             {orderedAreas.map(area => {
                                const areaSlots: TimeSlot[] = ['morning'];
                                if (!morningOnlyAreas.includes(area.id)) areaSlots.push('afternoon');
                                if (area.id === DiagnosticArea.PS) areaSlots.push('night');

                                return (
                                    <td key={`${dateStr}-${area.id}`} className={`border-r border-gray-200 p-0 align-top ${isWeekend ? 'bg-gray-50' : ''}`}>
                                        <div className="flex h-full w-full">
                                            {areaSlots.map(slot => {
                                                // Find shifts for this specific slot
                                                const slotShifts = shifts.filter(s => 
                                                    s.date === dateStr && 
                                                    s.area === area.id && 
                                                    (
                                                        (slot === 'morning' && s.startTime === '08:00') ||
                                                        (slot === 'afternoon' && s.startTime === '14:00') ||
                                                        (slot === 'night' && s.startTime === '20:00')
                                                    )
                                                );
                                                
                                                // Filter by selected user if filter active
                                                const visibleShifts = selectedUserId === 'all' 
                                                    ? slotShifts 
                                                    : slotShifts.filter(s => s.userId === selectedUserId);

                                                return (
                                                    <div key={slot} className="flex-1 flex flex-col border-r border-gray-100 last:border-0 p-1 min-w-[60px] relative hover:bg-gray-100 transition-colors">
                                                        {visibleShifts.map(shift => {
                                                            const user = users.find(u => u.id === shift.userId);
                                                            // Check for vacation
                                                            const onVacation = vacationRequests.some(v => 
                                                                v.userId === shift.userId && 
                                                                v.status === VacationRequestStatus.APPROVED && 
                                                                new Date(v.startDate) <= new Date(dateStr) && 
                                                                new Date(v.endDate) >= new Date(dateStr)
                                                            );
                                                            
                                                            return (
                                                                <div key={shift.id} className="mb-1 last:mb-0">
                                                                    <ShiftCard 
                                                                        shift={shift} 
                                                                        user={user} 
                                                                        onDelete={isManager ? onDeleteShift : undefined}
                                                                        areaColor={onVacation ? 'bg-red-100 border-red-300' : undefined}
                                                                    />
                                                                </div>
                                                            );
                                                        })}
                                                        
                                                        {/* Add Button (only visible on hover if manager) */}
                                                        {isManager && selectedUserId === 'all' && (
                                                            <button 
                                                                onClick={() => setShiftModalInfo({ date: day, area: area.id, timeSlot: slot })}
                                                                className="mt-auto w-full flex items-center justify-center py-1 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors opacity-0 group-hover/row:opacity-100 focus:opacity-100"
                                                                title="Aggiungi turno"
                                                            >
                                                                <PlusIcon />
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </td>
                                );
                             })}
                        </tr>
                    );
                })}
             </tbody>
           </table>
        </div>
      </div>
    </div>
  );
};
