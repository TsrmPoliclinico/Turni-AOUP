import React, { useState, useMemo } from 'react';
import type { User, Shift } from '../types';
import { DiagnosticArea } from '../types';
import { PrinterIcon } from './icons/PrinterIcon';

const calculateShiftDuration = (shift: Shift): number => {
    const start = new Date(`1970-01-01T${shift.startTime}:00`);
    let end = new Date(`1970-01-01T${shift.endTime}:00`);

    // Handle overnight shifts that cross midnight
    if (end < start) {
        end.setDate(end.getDate() + 1);
    }

    const diffMs = end.getTime() - start.getTime();
    return parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
};

const ON_CALL_AREAS = [
    DiagnosticArea.REPERIBILITA_ISTITUTO,
    DiagnosticArea.PRIMA_REPERIBILITA_SALA,
    DiagnosticArea.SECONDA_REPERIBILITA_SALA
];

export const AnalyticsDashboard: React.FC<{ users: User[], shifts: Shift[] }> = ({ users, shifts }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const handlePrevMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    const handleToday = () => setCurrentDate(new Date());

    const monthYearString = currentDate.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });

    const { userStats, totalDepartmentHours, totalDepartmentShifts } = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const shiftsInMonth = shifts.filter(shift => {
            const shiftDate = new Date(shift.date);
            return shiftDate.getFullYear() === year && shiftDate.getMonth() === month;
        });

        const userStats = users.map(user => {
            const userShifts = shiftsInMonth.filter(s => s.userId === user.id);
            const totalHours = userShifts.reduce((acc, shift) => acc + calculateShiftDuration(shift), 0);
            
            const shiftCounts = userShifts.reduce((acc, shift) => {
                if (ON_CALL_AREAS.includes(shift.area)) {
                    acc.onCallShifts++;
                }
                switch (shift.startTime) {
                    case '08:00':
                        acc.morningShifts++;
                        break;
                    case '14:00':
                        acc.afternoonShifts++;
                        break;
                    case '20:00':
                        acc.nightShifts++;
                        break;
                    default:
                        break;
                }
                return acc;
            }, { morningShifts: 0, afternoonShifts: 0, nightShifts: 0, onCallShifts: 0 });

            return {
                ...user,
                shiftCount: userShifts.length,
                totalHours: totalHours,
                ...shiftCounts
            };
        }).sort((a, b) => b.totalHours - a.totalHours); // Sort by hours descending
        
        const totalDepartmentHours = userStats.reduce((acc, user) => acc + user.totalHours, 0);

        return { userStats, totalDepartmentHours, totalDepartmentShifts: shiftsInMonth.length };
    }, [currentDate, users, shifts]);

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert("Impossibile aprire la finestra di stampa. Disattiva il blocco popup e riprova.");
            return;
        }

        const cardsHtml = `
            <div class="cards-container">
                <div class="card">
                    <h3>Turni Totali nel Mese</h3>
                    <p>${totalDepartmentShifts}</p>
                </div>
                <div class="card">
                    <h3>Ore Totali Lavorate</h3>
                    <p>${totalDepartmentHours.toFixed(2)}</p>
                </div>
            </div>
        `;

        let tableHtml = `<table class="stats-table">`;
        tableHtml += `
            <thead>
                <tr>
                    <th>Dipendente</th>
                    <th style="text-align: center;">Stato</th>
                    <th style="text-align: center;">Ore Tot.</th>
                    <th style="text-align: center;">Mattine</th>
                    <th style="text-align: center;">Pomeriggi</th>
                    <th style="text-align: center;">Notti</th>
                    <th style="text-align: center;">Reperibilità</th>
                </tr>
            </thead>
        `;
        
        tableHtml += `<tbody>`;
        userStats.forEach(user => {
            tableHtml += `
                <tr class="${!user.isActive ? 'inactive-row' : ''}">
                    <td>
                        <div>
                            <strong>${user.name}</strong>
                        </div>
                    </td>
                    <td style="text-align: center;">
                        <span class="status-chip ${user.isActive ? 'active' : 'inactive'}">
                            ${user.isActive ? 'Attivo' : 'Inattivo'}
                        </span>
                    </td>
                    <td style="text-align: center; font-weight: 600;">${user.totalHours.toFixed(2)}</td>
                    <td style="text-align: center;">${user.morningShifts}</td>
                    <td style="text-align: center;">${user.afternoonShifts}</td>
                    <td style="text-align: center;">${user.nightShifts}</td>
                    <td style="text-align: center;">${user.onCallShifts}</td>
                </tr>
            `;
        });
        
        if (userStats.length === 0) {
            tableHtml += `<tr><td colspan="7" style="text-align: center; padding: 2rem;">Nessun turno trovato per questo mese.</td></tr>`;
        }
        tableHtml += `</tbody></table>`;
        
        const styles = `
            <style>
                @media print {
                    @page { size: A4 landscape; margin: 0.75in; }
                }
                body { 
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    margin: 20px;
                    color: #333;
                }
                h1 {
                    text-align: center;
                    color: #1e3a8a;
                    font-size: 1.5rem;
                    margin-bottom: 0.5rem;
                }
                 h2 {
                    text-align: center;
                    color: #555;
                    font-size: 1.1rem;
                    font-weight: 400;
                    margin-top: 0;
                    margin-bottom: 1.5rem;
                }
                .cards-container {
                    display: flex;
                    gap: 1rem;
                    justify-content: center;
                    margin-bottom: 1.5rem;
                }
                .card {
                    flex: 1;
                    max-width: 300px;
                    padding: 0.75rem;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    text-align: center;
                    background-color: #f9fafb;
                }
                .card h3 {
                    margin: 0 0 0.5rem 0;
                    font-size: 0.8rem;
                    color: #4b5563;
                    font-weight: 500;
                }
                .card p {
                    margin: 0;
                    font-size: 2rem;
                    font-weight: 700;
                    color: #111827;
                }
                .stats-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 0.8rem;
                }
                .stats-table th, .stats-table td {
                    border: 1px solid #e5e7eb;
                    padding: 8px;
                    text-align: left;
                    vertical-align: middle;
                }
                .stats-table th {
                    background-color: #f9fafb;
                    font-weight: 600;
                    color: #374151;
                }
                .user-info strong {
                    font-weight: 500;
                    color: #111827;
                }
                .user-info span {
                    font-size: 0.75rem;
                    color: #6b7280;
                }
                .inactive-row {
                    background-color: #f3f4f6;
                    opacity: 0.7;
                }
                .status-chip {
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 0.7rem;
                    font-weight: 600;
                }
                .status-chip.active {
                    background-color: #d1fae5;
                    color: #065f46;
                }
                .status-chip.inactive {
                    background-color: #fee2e2;
                    color: #991b1b;
                }
            </style>
        `;

        const printHtml = `
            <!DOCTYPE html>
            <html lang="it">
            <head>
                <meta charset="UTF-8">
                <title>Stampa Report - ${monthYearString}</title>
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
                ${styles}
            </head>
            <body>
                <h1>Report Mensile Dipendenti</h1>
                <h2>${monthYearString}</h2>
                ${cardsHtml}
                ${tableHtml}
                <script>
                    window.onload = function() {
                        window.print();
                        window.onafterprint = function() { window.close(); }
                    }
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(printHtml);
        printWindow.document.close();
    };

    return (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg printable-content">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4 no-print">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Report Mensile</h2>
                    <p className="text-sm text-gray-500 capitalize">{monthYearString}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handlePrevMonth} className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition">&lt; Prec</button>
                    <button onClick={handleToday} className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition">Questo Mese</button>
                    <button onClick={handleNextMonth} className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition">Succ &gt;</button>
                </div>
                 <button
                    onClick={handlePrint}
                    className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    <PrinterIcon />
                    <span className="ml-2">Stampa</span>
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="text-sm font-medium text-blue-800">Turni Totali nel Mese</h3>
                    <p className="text-3xl font-bold text-blue-900">{totalDepartmentShifts}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h3 className="text-sm font-medium text-green-800">Ore Totali Lavorate</h3>
                    <p className="text-3xl font-bold text-green-900">{totalDepartmentHours.toFixed(2)}</p>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dipendente</th>
                            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Stato</th>
                            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ore Tot.</th>
                            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Mattine</th>
                            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Pomeriggi</th>
                            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Notti</th>
                            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Reperibilità</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {userStats.map(user => (
                            <tr key={user.id} className={!user.isActive ? 'bg-gray-50 opacity-70' : ''}>
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-center">
                                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {user.isActive ? 'Attivo' : 'Inattivo'}
                                     </span>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-semibold text-gray-800">{user.totalHours.toFixed(2)}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-600">{user.morningShifts}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-600">{user.afternoonShifts}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-600">{user.nightShifts}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-600">{user.onCallShifts}</td>
                            </tr>
                        ))}
                         {userStats.length === 0 && (
                            <tr>
                                <td colSpan={7} className="text-center py-10 text-gray-500">Nessun turno trovato per questo mese.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};