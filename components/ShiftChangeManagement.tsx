
import React, { useState, useMemo } from 'react';
import type { User, Shift, ShiftChangeRequest, DiagnosticAreaInfo } from '../types';
import { ShiftChangeRequestStatus } from '../types';

interface ShiftChangeManagementProps {
  currentUser: User;
  users: User[];
  shifts: Shift[];
  requests: ShiftChangeRequest[];
  diagnosticAreas: DiagnosticAreaInfo[];
  onAddRequest: (request: Omit<ShiftChangeRequest, 'id' | 'status' | 'requestDate'>) => void;
  onProcessRequest: (requestId: string, status: ShiftChangeRequestStatus) => void;
}

export const ShiftChangeManagement: React.FC<ShiftChangeManagementProps> = ({
  currentUser,
  users,
  shifts,
  requests,
  diagnosticAreas,
  onAddRequest,
  onProcessRequest,
}) => {
  const [selectedShiftId, setSelectedShiftId] = useState('');
  const [targetUserId, setTargetUserId] = useState('');
  const [targetShiftId, setTargetShiftId] = useState('');
  const [reason, setReason] = useState('');
  const [activeTab, setActiveTab] = useState<'new' | 'my-requests' | 'incoming' | 'admin'>('new');

  const isAdmin = currentUser.isAdmin === true;

  // Filter shifts for the current user (removed future date constraint)
  const myShifts = useMemo(() => {
    return shifts
      .filter(s => s.userId === currentUser.id)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [shifts, currentUser.id]);

  // Filter shifts for the selected target user (removed future date constraint)
  const targetUserShifts = useMemo(() => {
    if (!targetUserId) return [];
    return shifts
        .filter(s => s.userId === targetUserId)
        .sort((a, b) => a.date.localeCompare(b.date));
  }, [shifts, targetUserId]);

  // Helper to format shift display
  const formatShiftDisplay = (shift: Shift) => {
    const areaName = diagnosticAreas.find(a => a.id === shift.area)?.name || shift.area;
    const date = new Date(shift.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${date} - ${areaName} (${shift.startTime}-${shift.endTime})`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShiftId) return;

    onAddRequest({
      requestingUserId: currentUser.id,
      shiftId: selectedShiftId,
      targetUserId: targetUserId || undefined,
      targetShiftId: targetShiftId || undefined,
      reason: reason,
    });

    setSelectedShiftId('');
    setTargetUserId('');
    setTargetShiftId('');
    setReason('');
    setActiveTab('my-requests');
  };

  const getStatusColor = (status: ShiftChangeRequestStatus) => {
    switch (status) {
      case ShiftChangeRequestStatus.APPROVED: return 'bg-green-100 text-green-800';
      case ShiftChangeRequestStatus.REJECTED: return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const renderRequestList = (list: ShiftChangeRequest[], showAdminControls: boolean) => {
    if (list.length === 0) {
      return <p className="text-gray-500 italic py-4">Nessuna richiesta trovata.</p>;
    }

    return (
      <div className="space-y-4">
        {list.map(req => {
          const shift = shifts.find(s => s.id === req.shiftId);
          const requester = users.find(u => u.id === req.requestingUserId);
          const target = users.find(u => u.id === req.targetUserId);
          const swapShift = req.targetShiftId ? shifts.find(s => s.id === req.targetShiftId) : null;
          
          // If shift is undefined (maybe deleted), handle gracefully
          if (!shift) return null;

          return (
            <div key={req.id} className="bg-white border rounded-lg p-4 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                     <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${getStatusColor(req.status)}`}>
                        {req.status}
                     </span>
                     <span className="text-xs text-gray-500">
                        {new Date(req.requestDate).toLocaleDateString('it-IT')}
                     </span>
                  </div>
                  <h4 className="font-bold text-gray-800">
                    {requester?.name} cede: <span className="text-red-600">{formatShiftDisplay(shift)}</span>
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    A: <span className="font-medium">{target ? target.name : 'Chiunque disponibile'}</span>
                  </p>
                  {swapShift && (
                      <p className="text-sm text-gray-800 mt-1 font-medium">
                          <span className="text-green-600">Riceve in cambio: {formatShiftDisplay(swapShift)}</span>
                      </p>
                  )}
                  {req.reason && (
                    <p className="text-sm text-gray-500 italic mt-2">"{req.reason}"</p>
                  )}
                </div>

                {showAdminControls && req.status === ShiftChangeRequestStatus.PENDING && (
                  <div className="flex gap-2 mt-2 sm:mt-0">
                     <button 
                      onClick={() => onProcessRequest(req.id, ShiftChangeRequestStatus.REJECTED)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm font-medium"
                    >
                      Rifiuta
                    </button>
                    <button 
                      onClick={() => onProcessRequest(req.id, ShiftChangeRequestStatus.APPROVED)}
                      className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                    >
                      {swapShift ? 'Approva Scambio' : `Approva ${target ? '' : '(Manuale)'}`}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="border-b bg-gray-50">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('new')}
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'new' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Nuova Richiesta
          </button>
          <button
            onClick={() => setActiveTab('my-requests')}
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'my-requests' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Le mie Richieste
          </button>
           <button
            onClick={() => setActiveTab('incoming')}
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'incoming' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Richieste per Me
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'admin' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Gestione Amministratore
            </button>
          )}
        </nav>
      </div>

      <div className="p-6">
        {activeTab === 'new' && (
          <div className="max-w-2xl mx-auto">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Richiedi Cambio Turno</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seleziona il tuo turno da cedere</label>
                <select
                  required
                  value={selectedShiftId}
                  onChange={(e) => setSelectedShiftId(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
                >
                  <option value="">-- Seleziona un turno --</option>
                  {myShifts.map(shift => (
                    <option key={shift.id} value={shift.id}>
                      {formatShiftDisplay(shift)}
                    </option>
                  ))}
                </select>
                {myShifts.length === 0 && (
                  <p className="text-xs text-orange-600 mt-2 bg-orange-50 p-2 rounded border border-orange-200">
                    <strong>Attenzione:</strong> Non risultano turni assegnati al tuo utente. 
                    Verifica che la pianificazione sia stata generata o chiedi all'amministratore di assegnarti dei turni.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Collega proposto (Opzionale)</label>
                <select
                  value={targetUserId}
                  onChange={(e) => {
                      setTargetUserId(e.target.value);
                      setTargetShiftId(''); // Reset shift swap when user changes
                  }}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
                >
                  <option value="">-- Nessuno specifico (Cerca sostituto) --</option>
                  {users
                    .filter(u => u.id !== currentUser.id && u.isActive)
                    .sort((a,b) => a.name.localeCompare(b.name))
                    .map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Se lasci vuoto, la richiesta sarà visibile a tutti come "Cercasi sostituto".</p>
              </div>

              {targetUserId && (
                  <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                      <label className="block text-sm font-medium text-blue-900 mb-1">Richiedi turno in cambio (Opzionale)</label>
                      <select
                          value={targetShiftId}
                          onChange={(e) => setTargetShiftId(e.target.value)}
                          className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
                      >
                          <option value="">-- Solo cessione (Nessun cambio) --</option>
                          {targetUserShifts.map(shift => (
                              <option key={shift.id} value={shift.id}>
                                  {formatShiftDisplay(shift)}
                              </option>
                          ))}
                      </select>
                      <p className="text-xs text-blue-700 mt-1">
                          Seleziona un turno di {users.find(u => u.id === targetUserId)?.name} se vuoi effettuare uno <strong>scambio incrociato</strong>.
                      </p>
                  </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motivo / Note</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
                  placeholder="Es. Impegno imprevisto, cambio concordato con..."
                />
              </div>

              <button
                type="submit"
                disabled={!selectedShiftId}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed font-medium"
              >
                Invia Richiesta
              </button>
            </form>
          </div>
        )}

        {activeTab === 'my-requests' && (
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Le mie richieste inviate</h3>
            {renderRequestList(requests.filter(r => r.requestingUserId === currentUser.id).sort((a,b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime()), false)}
          </div>
        )}

        {activeTab === 'incoming' && (
             <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">Richieste dirette a te</h3>
                {renderRequestList(requests.filter(r => r.targetUserId === currentUser.id).sort((a,b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime()), false)}
             </div>
        )}

        {activeTab === 'admin' && isAdmin && (
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Gestione Richieste (Amministratore)</h3>
            <div className="mb-6">
                <h4 className="text-md font-semibold text-blue-800 mb-2 uppercase tracking-wide">In Attesa di Approvazione</h4>
                {renderRequestList(requests.filter(r => r.status === ShiftChangeRequestStatus.PENDING).sort((a,b) => new Date(a.requestDate).getTime() - new Date(b.requestDate).getTime()), true)}
            </div>
            <div className="opacity-75">
                 <h4 className="text-md font-semibold text-gray-600 mb-2 uppercase tracking-wide">Storico Recente</h4>
                 {renderRequestList(requests.filter(r => r.status !== ShiftChangeRequestStatus.PENDING).slice(0, 5), false)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
