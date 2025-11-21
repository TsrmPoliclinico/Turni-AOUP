import React from 'react';
import type { VacationRequest, VacationRequestStatus } from '../types';
import { VacationRequestStatus as StatusEnum } from '../types';

interface VacationRequestListProps {
  requests: VacationRequest[];
}

const getStatusChipClass = (status: VacationRequestStatus) => {
    switch (status) {
      case StatusEnum.APPROVED: return 'bg-green-100 text-green-800 border-green-300';
      case StatusEnum.REJECTED: return 'bg-red-100 text-red-800 border-red-300';
      case StatusEnum.PENDING: return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
};

export const VacationRequestList: React.FC<VacationRequestListProps> = ({ requests }) => {
  const sortedRequests = [...requests].sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Storico Richieste</h3>
      <div className="space-y-3 max-h-[25rem] overflow-y-auto pr-2">
        {sortedRequests.length > 0 ? sortedRequests.map(request => (
          <div key={request.id} className={`p-3 rounded-md border-l-4 ${getStatusChipClass(request.status)}`}>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">
                  Dal {new Date(request.startDate).toLocaleDateString('it-IT')} al {new Date(request.endDate).toLocaleDateString('it-IT')}
                </p>
                {request.reason && <p className="text-sm text-gray-600 mt-1">{request.reason}</p>}
              </div>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusChipClass(request.status)}`}>
                {request.status}
              </span>
            </div>
          </div>
        )) : (
          <p className="text-gray-500 text-center pt-8">Nessuna richiesta di ferie inviata.</p>
        )}
      </div>
    </div>
  );
};