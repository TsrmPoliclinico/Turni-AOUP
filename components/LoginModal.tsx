
import React, { useState } from 'react';
import type { User } from '../types';
import { KeyIcon } from './icons/KeyIcon';

interface LoginModalProps {
  user: User;
  onLogin: (password: string) => void;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ user, onLogin, onClose }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Inserisci la password.');
      return;
    }
    onLogin(password);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[9999] flex justify-center items-center p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-center mb-4 text-blue-600">
          <div className="bg-blue-100 p-3 rounded-full">
            <KeyIcon className="h-8 w-8" />
          </div>
        </div>
        
        <h2 className="text-xl font-bold text-gray-800 text-center mb-2">Autenticazione Richiesta</h2>
        <p className="text-sm text-gray-600 text-center mb-6">
          Inserisci la password per accedere come <span className="font-semibold text-gray-900">{user.name}</span>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="Password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            {error && <p className="text-xs text-red-500 mt-1 ml-1">{error}</p>}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              Accedi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
