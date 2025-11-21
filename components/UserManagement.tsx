
import React, { useState, useMemo } from 'react';
import type { User } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { SearchIcon } from './icons/SearchIcon';
import { SaveIcon } from './icons/SaveIcon';

interface UserManagementProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  onDeleteUser: (userId: string) => void;
  addNotification: (message: string) => void;
  onSave: () => void;
}

interface DeleteConfirmationModalProps {
    user: User;
    onConfirm: () => void;
    onCancel: () => void;
}

type UserAbilityKey = Exclude<keyof User, 'id' | 'name' | 'isAdmin' | 'isActive' | 'password'>;
const ABILITY_KEYS: UserAbilityKey[] = [
    'canDoInternalOnCall', 'canDoFirstOnCall', 'canDoSecondOnCall', 'canDoNightShiftsInER',
    'canWorkInRM1', 'canWorkInRM2', 'canWorkInRM3', 'canWorkInTC1', 'canWorkInTC2',
    'canWorkInMOC', 'canWorkInSenologia', 'canWorkInDiagnostica', 'canWorkInPresidiEsterni',
    'canWorkInConeBeam', 'canWorkInVillaBelmonte', 'canWorkInPS', 'canWorkInUrologia',
    'canWorkInOrtopedia', 'canWorkInNeurochirurgia', 'canWorkInChPlastica', 'canWorkInChDUrgenza',
    'canWorkInSalaOpCCH'
];

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ user, onConfirm, onCancel }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center" onClick={onCancel} role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md m-4 transform transition-all animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">Elimina Utente</h3>
                        <div className="mt-2">
                            <p className="text-sm text-gray-500">
                                Sei sicuro di voler eliminare l'utente <strong className="font-semibold text-gray-800">{user.name}</strong>?
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                                Questa azione è <strong className="font-semibold text-red-700">irreversibile</strong>. Tutti i turni e le richieste di ferie associate a questo utente verranno rimossi permanentemente.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:w-auto sm:text-sm transition-colors"
                    >
                        Elimina
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm transition-colors"
                    >
                        Annulla
                    </button>
                </div>
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


export const UserManagement: React.FC<UserManagementProps> = ({ users, setUsers, onDeleteUser, addNotification, onSave }) => {
  const [newUserName, setNewUserName] = useState('');
  const [newUserIsAdmin, setNewUserIsAdmin] = useState(false);
  const [newUserCanDoInternal, setNewUserCanDoInternal] = useState(false);
  const [newUserCanDoFirst, setNewUserCanDoFirst] = useState(false);
  const [newUserCanDoSecondOnCall, setNewUserCanDoSecondOnCall] = useState(false);
  const [newUserCanDoNightER, setNewUserCanDoNightER] = useState(false);
  const [newUserCanWorkInTC1, setNewUserCanWorkInTC1] = useState(false);
  const [newUserCanWorkInTC2, setNewUserCanWorkInTC2] = useState(false);
  const [newUserCanWorkInRM1, setNewUserCanWorkInRM1] = useState(false);
  const [newUserCanWorkInRM2, setNewUserCanWorkInRM2] = useState(false);
  const [newUserCanWorkInRM3, setNewUserCanWorkInRM3] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [newUserCanWorkInMOC, setNewUserCanWorkInMOC] = useState(false);
  const [newUserCanWorkInSenologia, setNewUserCanWorkInSenologia] = useState(false);
  const [newUserCanWorkInDiagnostica, setNewUserCanWorkInDiagnostica] = useState(false);
  const [newUserCanWorkInPresidiEsterni, setNewUserCanWorkInPresidiEsterni] = useState(false);
  const [newUserCanWorkInConeBeam, setNewUserCanWorkInConeBeam] = useState(false);
  const [newUserCanWorkInVillaBelmonte, setNewUserCanWorkInVillaBelmonte] = useState(false);
  const [newUserCanWorkInPS, setNewUserCanWorkInPS] = useState(false);
  const [newUserCanWorkInUrologia, setNewUserCanWorkInUrologia] = useState(false);
  const [newUserCanWorkInOrtopedia, setNewUserCanWorkInOrtopedia] = useState(false);
  const [newUserCanWorkInNeurochirurgia, setNewUserCanWorkInNeurochirurgia] = useState(false);
  const [newUserCanWorkInChPlastica, setNewUserCanWorkInChPlastica] = useState(false);
  const [newUserCanWorkInChDUrgenza, setNewUserCanWorkInChDUrgenza] = useState(false);
  const [newUserCanWorkInSalaOpCCH, setNewUserCanWorkInSalaOpCCH] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = useMemo(() => {
    if (!searchTerm) {
        return users;
    }
    return users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUserName.trim() === '') return;

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: newUserName.trim(),
      isActive: true,
      isAdmin: newUserIsAdmin,
      canDoInternalOnCall: newUserCanDoInternal,
      canDoFirstOnCall: newUserCanDoFirst,
      canDoSecondOnCall: newUserCanDoSecondOnCall,
      canDoNightShiftsInER: newUserCanDoNightER,
      canWorkInTC1: newUserCanWorkInTC1,
      canWorkInTC2: newUserCanWorkInTC2,
      canWorkInRM1: newUserCanWorkInRM1,
      canWorkInRM2: newUserCanWorkInRM2,
      canWorkInRM3: newUserCanWorkInRM3,
      canWorkInMOC: newUserCanWorkInMOC,
      canWorkInSenologia: newUserCanWorkInSenologia,
      canWorkInDiagnostica: newUserCanWorkInDiagnostica,
      canWorkInPresidiEsterni: newUserCanWorkInPresidiEsterni,
      canWorkInConeBeam: newUserCanWorkInConeBeam,
      canWorkInVillaBelmonte: newUserCanWorkInVillaBelmonte,
      canWorkInPS: newUserCanWorkInPS,
      canWorkInUrologia: newUserCanWorkInUrologia,
      canWorkInOrtopedia: newUserCanWorkInOrtopedia,
      canWorkInNeurochirurgia: newUserCanWorkInNeurochirurgia,
      canWorkInChPlastica: newUserCanWorkInChPlastica,
      canWorkInChDUrgenza: newUserCanWorkInChDUrgenza,
      canWorkInSalaOpCCH: newUserCanWorkInSalaOpCCH,
    };
    setUsers(prev => [...prev, newUser]);
    addNotification(`Nuovo utente ${newUser.name} aggiunto.`);
    
    setNewUserName('');
    setNewUserIsAdmin(false);
    setNewUserCanDoInternal(false);
    setNewUserCanDoFirst(false);
    setNewUserCanDoSecondOnCall(false);
    setNewUserCanDoNightER(false);
    setNewUserCanWorkInTC1(false);
    setNewUserCanWorkInTC2(false);
    setNewUserCanWorkInRM1(false);
    setNewUserCanWorkInRM2(false);
    setNewUserCanWorkInRM3(false);
    setNewUserCanWorkInMOC(false);
    setNewUserCanWorkInSenologia(false);
    setNewUserCanWorkInDiagnostica(false);
    setNewUserCanWorkInPresidiEsterni(false);
    setNewUserCanWorkInConeBeam(false);
    setNewUserCanWorkInVillaBelmonte(false);
    setNewUserCanWorkInPS(false);
    setNewUserCanWorkInUrologia(false);
    setNewUserCanWorkInOrtopedia(false);
    setNewUserCanWorkInNeurochirurgia(false);
    setNewUserCanWorkInChPlastica(false);
    setNewUserCanWorkInChDUrgenza(false);
    setNewUserCanWorkInSalaOpCCH(false);
  };
  
  const handleDeleteConfirm = () => {
    if (userToDelete) {
        onDeleteUser(userToDelete.id);
        setUserToDelete(null);
    }
  };

  const handleAbilityChange = (userId: string, ability: UserAbilityKey, value: boolean) => {
    setUsers(prevUsers => prevUsers.map(user => 
        user.id === userId ? { ...user, [ability]: value } : user
    ));
  };
  
  const handleSelectAllAbilities = (userId: string) => {
      setUsers(prevUsers => prevUsers.map(user => {
          if (user.id === userId) {
              const updatedUser = { ...user };
              ABILITY_KEYS.forEach(key => { updatedUser[key] = true; });
              return updatedUser;
          }
          return user;
      }));
      addNotification("Selezionate tutte le abilità per l'utente.");
  };

  const handleDeselectAllAbilities = (userId: string) => {
      setUsers(prevUsers => prevUsers.map(user => {
          if (user.id === userId) {
              const updatedUser = { ...user };
              ABILITY_KEYS.forEach(key => { updatedUser[key] = false; });
              return updatedUser;
          }
          return user;
      }));
      addNotification("Deselezionate tutte le abilità per l'utente.");
  };

  const handleToggleStatus = (userId: string) => {
    setUsers(prev =>
      prev.map(user =>
        user.id === userId ? { ...user, isActive: !user.isActive } : user
      )
    );
    const user = users.find(u => u.id === userId);
    if (user) {
        addNotification(`Stato di ${user.name} aggiornato a ${!user.isActive ? 'Attivo' : 'Inattivo'}.`);
    }
  };

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
            <h2 className="text-xl font-bold text-gray-800">Gestione Utenti</h2>
            <button
                onClick={onSave}
                className="flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors duration-200 shadow-sm w-full sm:w-auto justify-center"
            >
                <SaveIcon className="h-5 w-5" />
                <span>Salva tutte le modifiche</span>
            </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Aggiungi Nuovo Utente</h3>
            <form onSubmit={handleAddUser} className="flex flex-col gap-3">
              <input
                type="text"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="Nome completo"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
               <div className="border-t pt-3 mt-1 space-y-2">
                    <h4 className="text-xs font-semibold text-gray-600 uppercase">Abilità Generali</h4>
                     <label className="flex items-center gap-2 text-sm text-gray-700 font-bold text-blue-700">
                        <input type="checkbox" checked={newUserIsAdmin} onChange={e => setNewUserIsAdmin(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        Utente Amministratore (Gestione completa)
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input type="checkbox" checked={newUserCanDoInternal} onChange={e => setNewUserCanDoInternal(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        Abilitato a reperibilità di istituto
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input type="checkbox" checked={newUserCanDoFirst} onChange={e => setNewUserCanDoFirst(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        Abilitato a prima reperibilità di sala
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input type="checkbox" checked={newUserCanDoSecondOnCall} onChange={e => setNewUserCanDoSecondOnCall(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        Abilitato a seconda reperibilità di sala
                    </label>
                     <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input type="checkbox" checked={newUserCanDoNightER} onChange={e => setNewUserCanDoNightER(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        Abilitato a turni di notte in PS
                    </label>
                </div>
                 <div className="border-t pt-3 mt-1 space-y-2">
                    <h4 className="text-xs font-semibold text-gray-600 uppercase">Abilità TC</h4>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input type="checkbox" checked={newUserCanWorkInTC1} onChange={e => setNewUserCanWorkInTC1(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        Abilitato a TC1
                    </label>
                     <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input type="checkbox" checked={newUserCanWorkInTC2} onChange={e => setNewUserCanWorkInTC2(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        Abilitato a TC2
                    </label>
                </div>
                 <div className="border-t pt-3 mt-1 space-y-2">
                    <h4 className="text-xs font-semibold text-gray-600 uppercase">Abilità RM</h4>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input type="checkbox" checked={newUserCanWorkInRM1} onChange={e => setNewUserCanWorkInRM1(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        Abilitato a RM1
                    </label>
                     <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input type="checkbox" checked={newUserCanWorkInRM2} onChange={e => setNewUserCanWorkInRM2(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        Abilitato a RM2
                    </label>
                     <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input type="checkbox" checked={newUserCanWorkInRM3} onChange={e => setNewUserCanWorkInRM3(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        Abilitato a RM3
                    </label>
                </div>
                 <div className="border-t pt-3 mt-1 space-y-2">
                    <h4 className="text-xs font-semibold text-gray-600 uppercase">Altre Abilità</h4>
                     <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input type="checkbox" checked={newUserCanWorkInPS} onChange={e => setNewUserCanWorkInPS(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        Pronto Soccorso
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input type="checkbox" checked={newUserCanWorkInMOC} onChange={e => setNewUserCanWorkInMOC(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        MOC
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input type="checkbox" checked={newUserCanWorkInSenologia} onChange={e => setNewUserCanWorkInSenologia(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        Senologia
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input type="checkbox" checked={newUserCanWorkInDiagnostica} onChange={e => setNewUserCanWorkInDiagnostica(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        Diagnostica
                    </label>
                     <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input type="checkbox" checked={newUserCanWorkInPresidiEsterni} onChange={e => setNewUserCanWorkInPresidiEsterni(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        Presidi Esterni
                    </label>
                     <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input type="checkbox" checked={newUserCanWorkInConeBeam} onChange={e => setNewUserCanWorkInConeBeam(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        Cone Beam- OPT
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input type="checkbox" checked={newUserCanWorkInVillaBelmonte} onChange={e => setNewUserCanWorkInVillaBelmonte(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        Villa Belmonte
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input type="checkbox" checked={newUserCanWorkInUrologia} onChange={e => setNewUserCanWorkInUrologia(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        Urologia
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input type="checkbox" checked={newUserCanWorkInOrtopedia} onChange={e => setNewUserCanWorkInOrtopedia(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        Ortopedia
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input type="checkbox" checked={newUserCanWorkInNeurochirurgia} onChange={e => setNewUserCanWorkInNeurochirurgia(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        Neurochirurgia
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input type="checkbox" checked={newUserCanWorkInChPlastica} onChange={e => setNewUserCanWorkInChPlastica(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        Ch. Plastica
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input type="checkbox" checked={newUserCanWorkInChDUrgenza} onChange={e => setNewUserCanWorkInChDUrgenza(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        Ch. D'Urgenza
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input type="checkbox" checked={newUserCanWorkInSalaOpCCH} onChange={e => setNewUserCanWorkInSalaOpCCH(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        Sala Op. CCH
                    </label>
                </div>
              <button
                type="submit"
                className="self-start px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Aggiungi Utente
              </button>
            </form>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Utenti Esistenti</h3>
            <div className="mb-3 relative">
                <input
                    type="text"
                    placeholder="Cerca utente per nome..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    aria-label="Cerca utente"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon />
                </div>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {filteredUsers.length > 0 ? filteredUsers.map(user => (
                <details key={user.id} className="p-3 border rounded-md group">
                  <summary className="flex justify-between items-center cursor-pointer list-none">
                    <span className="font-semibold">{user.name} {user.isAdmin && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">Admin</span>}</span>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer" onClick={e => e.stopPropagation()}>
                            <input
                                type="checkbox"
                                checked={user.isActive}
                                onChange={() => handleToggleStatus(user.id)}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                             <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {user.isActive ? 'Attivo' : 'Inattivo'}
                             </span>
                        </label>
                      <button onClick={(e) => { e.preventDefault(); setUserToDelete(user); }} className="text-red-500 hover:text-red-700 transition-colors" aria-label={`Elimina ${user.name}`}>
                        <TrashIcon />
                      </button>
                      <span className="text-gray-400 transform transition-transform duration-200 group-open:rotate-90">&#9656;</span>
                    </div>
                  </summary>
                  <div className="mt-4 border-t pt-4">
                     <div className="mb-4">
                        <label className="flex items-center gap-2 text-sm text-gray-700 font-bold text-blue-700">
                            <input 
                                type="checkbox" 
                                checked={!!user.isAdmin} 
                                onChange={e => {
                                    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isAdmin: e.target.checked } : u));
                                }} 
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                            />
                            Amministratore (Gestione completa)
                        </label>
                     </div>
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-4">
                        <div className="col-span-full flex items-center justify-between mb-1">
                            <h4 className="text-xs font-semibold text-gray-600 uppercase">Abilità</h4>
                            <div className="flex gap-2">
                                <button 
                                    onClick={(e) => { e.preventDefault(); handleSelectAllAbilities(user.id); }} 
                                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    Seleziona tutto
                                </button>
                                <button 
                                    onClick={(e) => { e.preventDefault(); handleDeselectAllAbilities(user.id); }} 
                                    className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                                >
                                    Deseleziona tutto
                                </button>
                            </div>
                        </div>
                        {ABILITY_KEYS.map(key => {
                            let label = key.replace(/can(Do|WorkIn)/, '').replace(/([A-Z])/g, ' $1').trim();
                            if (key === 'canDoInternalOnCall') label = "Reperibilità di istituto";
                            else if (key === 'canDoFirstOnCall') label = "Prima reperibilità di sala";
                            else if (key === 'canDoSecondOnCall') label = "Seconda reperibilità di sala";
                            else if (key === 'canDoNightShiftsInER') label = "Turni di notte in PS";
                            
                            return (
                                <label key={key} className="flex items-center gap-2 text-sm text-gray-700 capitalize">
                                    <input type="checkbox" checked={!!user[key]} onChange={e => handleAbilityChange(user.id, key, e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                    {label}
                                </label>
                            );
                        })}
                     </div>
                  </div>
                </details>
              )) : (
                 <p className="text-gray-500 text-center py-4">Nessun utente trovato.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      {userToDelete && <DeleteConfirmationModal user={userToDelete} onConfirm={handleDeleteConfirm} onCancel={() => setUserToDelete(null)} />}
    </>
  );
};
