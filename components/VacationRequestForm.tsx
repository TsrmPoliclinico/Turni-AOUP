import React, { useState } from 'react';

interface VacationRequestFormProps {
  userId: string;
  onSubmit: (request: { userId: string, startDate: string, endDate: string, reason?: string }) => void;
}

export const VacationRequestForm: React.FC<VacationRequestFormProps> = ({ userId, onSubmit }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!startDate || !endDate) {
      setError('Entrambe le date sono obbligatorie.');
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setError('La data di fine non può precedere la data di inizio.');
      return;
    }

    onSubmit({ userId, startDate, endDate, reason });
    setStartDate('');
    setEndDate('');
    setReason('');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Invia Nuova Richiesta</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Data Inizio</label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            min={today}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Data Fine</label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            min={startDate || today}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Motivo (opzionale)</label>
          <textarea
            id="reason"
            rows={3}
            value={reason}
            onChange={e => setReason(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Es. Vacanza, visita medica..."
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Invia Richiesta
        </button>
      </form>
    </div>
  );
};