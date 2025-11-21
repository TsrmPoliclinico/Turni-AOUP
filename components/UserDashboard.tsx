import React from 'react';
import type { User, Shift, VacationRequest, DiagnosticAreaInfo } from '../types';
import { VacationRequestForm } from './VacationRequestForm';
import { VacationRequestList } from './VacationRequestList';

interface UserDashboardProps {
  user: User;
  shifts: Shift[];
  vacationRequests: VacationRequest[];
  onAddVacationRequest: (request: Omit<VacationRequest, 'id' | 'status'>) => void;
  diagnosticAreas: DiagnosticAreaInfo[];
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ user, shifts, vacationRequests, onAddVacationRequest, diagnosticAreas }) => {

  const upcomingShifts = shifts
    .filter(s => new Date(s.date) >= new Date(new Date().toDateString()))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">I miei Prossimi Turni</h2>
        <div className="bg-white p-4 rounded-lg shadow-md">
          {upcomingShifts.length > 0 ? (
            <ul className="space-y-3">
              {upcomingShifts.slice(0, 5).map(shift => {
                const area = diagnosticAreas.find(a => a.id === shift.area);
                return (
                  <li key={shift.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {new Date(shift.date).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </p>
                      <p className="text-sm text-gray-600">{shift.startTime} - {shift.endTime}</p>
                    </div>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${area?.color}`}>
                      {area?.name}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-gray-500">Nessun turno imminente pianificato.</p>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Le mie Richieste di Ferie</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
             <VacationRequestForm userId={user.id} onSubmit={onAddVacationRequest} />
          </div>
          <div className="lg:col-span-2">
             <VacationRequestList requests={vacationRequests} />
          </div>
        </div>
      </div>
    </div>
  );
};