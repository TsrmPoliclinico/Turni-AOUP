import React, { useState, useMemo } from 'react';
import type { User, VacationRequest, VacationRequestStatus } from '../types';
import { VacationRequestStatus as StatusEnum } from '../types';

interface VacationManagementProps {
  requests: VacationRequest[];
  users: User[];
  onUpdateRequestStatus: (requestId: string, status: VacationRequestStatus) => void;
}

const getStatusChipClass = (status: VacationRequestStatus) => {
    switch (status) {
      case StatusEnum.APPROVED: return 'bg-green-100 text-green-800';
      case StatusEnum.REJECTED: return 'bg-red-100 text-red-800';
      case StatusEnum.PENDING: return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
};

export const VacationManagement: React.FC<VacationManagementProps> = ({ requests, users, onUpdateRequestStatus }) => {
  const [filter, setFilter] = useState<VacationRequestStatus | 'All'>('All');
  const userMap = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);

  const filteredRequests = useMemo(() => {
    if (filter === 'All') return requests;
    return requests.filter(r => r.status === filter);
  }, [requests, filter]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-gray-800">Gestione Richieste Ferie</h2>
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Filtra per stato:</span>
            <select 
              value={filter} 
              onChange={e => setFilter(e.target.value as any)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
            >
                <option value="All">Tutte</option>
                <option value={StatusEnum.PENDING}>In attesa</option>
                <option value={StatusEnum.APPROVED}>Approvate</option>
                <option value={StatusEnum.REJECTED}>Respinte</option>
            </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dipendente</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Periodo</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motivo</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Stato</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Azioni</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRequests.length > 0 ? filteredRequests.map(request => {
              const user = userMap.get(request.userId);
              return (
                <tr key={request.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {new Date(request.startDate).toLocaleDateString('it-IT')} - {new Date(request.endDate).toLocaleDateString('it-IT')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">{request.reason || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusChipClass(request.status)}`}>
                        {request.status}
                     </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {request.status === StatusEnum.PENDING && (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => onUpdateRequestStatus(request.id, StatusEnum.APPROVED)} className="text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded-md text-xs">Approva</button>
                        <button onClick={() => onUpdateRequestStatus(request.id, StatusEnum.REJECTED)} className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md text-xs">Respingi</button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            }) : (
                <tr>
                    <td colSpan={5} className="text-center py-10 text-gray-500">Nessuna richiesta trovata per questo filtro.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};