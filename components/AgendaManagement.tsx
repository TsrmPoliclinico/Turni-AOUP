
import React, { useState, useMemo } from 'react';
import type { DiagnosticAreaInfo, AreaOpeningRules, WeeklyOpeningHours, DayOpeningHours } from '../types';
import { DiagnosticArea } from '../types';
import { SaveIcon } from './icons/SaveIcon';

interface AgendaManagementProps {
    diagnosticAreas: DiagnosticAreaInfo[];
    openingRules: AreaOpeningRules;
    onUpdateRules: (newRules: AreaOpeningRules) => void;
    onSave: () => void;
}

const DAYS_OF_WEEK = [
    { id: 1, name: 'Lunedì' },
    { id: 2, name: 'Martedì' },
    { id: 3, name: 'Mercoledì' },
    { id: 4, name: 'Giovedì' },
    { id: 5, name: 'Venerdì' },
    { id: 6, name: 'Sabato' },
    { id: 0, name: 'Domenica' },
];

const DEFAULT_DAY_RULE: DayOpeningHours = { morning: true, afternoon: true, night: true };

export const AgendaManagement: React.FC<AgendaManagementProps> = ({ diagnosticAreas, openingRules, onUpdateRules, onSave }) => {
    const [selectedAreaId, setSelectedAreaId] = useState<DiagnosticArea>(diagnosticAreas[0].id);

    const currentRules = useMemo(() => {
        return openingRules[selectedAreaId] || {};
    }, [openingRules, selectedAreaId]);

    const handleToggle = (dayId: number, slot: keyof DayOpeningHours) => {
        const newRules = { ...openingRules };
        if (!newRules[selectedAreaId]) {
            newRules[selectedAreaId] = {};
             for (let i = 0; i < 7; i++) {
                newRules[selectedAreaId][i] = { ...DEFAULT_DAY_RULE };
            }
        }

        const currentDayRule = newRules[selectedAreaId][dayId] || { ...DEFAULT_DAY_RULE };
        
        newRules[selectedAreaId] = {
            ...newRules[selectedAreaId],
            [dayId]: {
                ...currentDayRule,
                [slot]: !currentDayRule[slot]
            }
        };
        onUpdateRules(newRules);
    };

    const handleSetAll = (val: boolean) => {
         const newRules = { ...openingRules };
         const weeklyRules: WeeklyOpeningHours = {};
         for (let i = 0; i < 7; i++) {
             weeklyRules[i] = { morning: val, afternoon: val, night: val };
         }
         newRules[selectedAreaId] = weeklyRules;
         onUpdateRules(newRules);
    };

    const handleSetMorningOnly = () => {
        const newRules = { ...openingRules };
        const weeklyRules: WeeklyOpeningHours = {};
        for (let i = 0; i < 7; i++) {
            weeklyRules[i] = { morning: true, afternoon: false, night: false };
        }
        newRules[selectedAreaId] = weeklyRules;
        onUpdateRules(newRules);
    };
    
    const selectedAreaInfo = diagnosticAreas.find(a => a.id === selectedAreaId);

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Gestione Agenda Diagnostiche</h2>
                    <p className="text-sm text-gray-500">Definisci i giorni e gli orari di apertura per ogni area.</p>
                </div>
                 <button
                    onClick={onSave}
                    className="flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors duration-200 shadow-sm"
                >
                    <SaveIcon className="h-5 w-5" />
                    <span>Salva Modifiche</span>
                </button>
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Seleziona Area Diagnostica</label>
                <div className="relative">
                     <select
                        value={selectedAreaId}
                        onChange={(e) => setSelectedAreaId(e.target.value as DiagnosticArea)}
                        className={`block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border-2 ${selectedAreaInfo?.color?.split(' ')[2]}`}
                    >
                        {diagnosticAreas.map(area => (
                            <option key={area.id} value={area.id}>{area.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex gap-2 mb-4">
                <button onClick={() => handleSetAll(true)} className="px-3 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 text-xs font-semibold">Apri Tutto</button>
                <button onClick={() => handleSetMorningOnly()} className="px-3 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 text-xs font-semibold">Solo Mattina</button>
                <button onClick={() => handleSetAll(false)} className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-xs font-semibold">Chiudi Tutto</button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border rounded-lg">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giorno</th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Mattina (08-14)</th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Pomeriggio (14-20)</th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Notte (20-08)</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {DAYS_OF_WEEK.map(day => {
                            const dayRule = currentRules[day.id] || DEFAULT_DAY_RULE;
                            const isWeekend = day.id === 0 || day.id === 6;
                            
                            return (
                                <tr key={day.id} className={isWeekend ? 'bg-gray-50' : ''}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {day.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <input
                                            type="checkbox"
                                            checked={dayRule.morning}
                                            onChange={() => handleToggle(day.id, 'morning')}
                                            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <input
                                            type="checkbox"
                                            checked={dayRule.afternoon}
                                            onChange={() => handleToggle(day.id, 'afternoon')}
                                            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <input
                                            type="checkbox"
                                            checked={dayRule.night}
                                            onChange={() => handleToggle(day.id, 'night')}
                                            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <div className="mt-4 p-4 bg-blue-50 text-blue-800 rounded-md text-sm border border-blue-100">
                <p><strong>Nota:</strong> Queste impostazioni influenzeranno la generazione automatica dei turni. Le colonne nella vista pianificazione verranno nascoste automaticamente per gli orari chiusi.</p>
            </div>
        </div>
    );
};
