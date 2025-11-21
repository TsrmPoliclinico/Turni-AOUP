
import React from 'react';
import type { View, User } from '../types';
import { CalendarIcon } from './icons/CalendarIcon';
import { UsersIcon } from './icons/UsersIcon';
import { BellIcon } from './icons/BellIcon';
import { ClipboardCheckIcon } from './icons/ClipboardCheckIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { SaveIcon } from './icons/SaveIcon';
import { TrashIcon } from './icons/TrashIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { UploadIcon } from './icons/UploadIcon';

interface HeaderProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  currentUser: User | null;
  users: User[];
  onSwitchUser: (userId: string | null) => void;
  onSave?: () => void;
  onReset?: () => void;
  onExport?: () => void;
  onImport?: () => void;
}

const NavButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
    className?: string;
}> = ({ icon, label, isActive, onClick, className }) => (
    <button
        onClick={onClick}
        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
        isActive
            ? 'bg-blue-600 text-white'
            : 'text-white hover:bg-blue-700'
        } ${className || ''}`}
    >
        {icon}
        <span className="hidden sm:inline">{label}</span>
    </button>
);

const RefreshIcon: React.FC<{className?: string}> = ({className = "h-5 w-5"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
);

const ClockIcon: React.FC<{className?: string}> = ({className = "h-5 w-5"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView, currentUser, users, onSwitchUser, onSave, onReset, onExport, onImport }) => {
  const isAdmin = currentUser?.isAdmin === true;
  const showManagerNav = !currentUser || isAdmin;

  return (
    <header className="bg-blue-800 text-white shadow-md no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:p-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">Gestore Turni Radiologia</h1>
          </div>
          
          <div className="flex items-center gap-4">
                <nav className="hidden sm:flex space-x-2 sm:space-x-4">
                    {showManagerNav ? (
                        <>
                            <NavButton 
                            icon={<CalendarIcon />} 
                            label="Pianificazione" 
                            isActive={currentView === 'schedule'} 
                            onClick={() => setCurrentView('schedule')} 
                            />
                            {isAdmin && (
                                <>
                                    <NavButton 
                                        icon={<ClockIcon />} 
                                        label="Agenda" 
                                        isActive={currentView === 'agenda'} 
                                        onClick={() => setCurrentView('agenda')} 
                                    />
                                    <NavButton 
                                        icon={<UsersIcon />} 
                                        label="Utenti" 
                                        isActive={currentView === 'users'} 
                                        onClick={() => setCurrentView('users')} 
                                    />
                                    <NavButton 
                                    icon={<ClipboardCheckIcon />} 
                                    label="Ferie" 
                                    isActive={currentView === 'vacations'} 
                                    onClick={() => setCurrentView('vacations')} 
                                    />
                                     <NavButton 
                                    icon={<RefreshIcon />} 
                                    label="Scambi" 
                                    isActive={currentView === 'shift-changes'} 
                                    onClick={() => setCurrentView('shift-changes')} 
                                    />
                                    <NavButton
                                    icon={<ChartBarIcon />}
                                    label="Report"
                                    isActive={currentView === 'analytics'}
                                    onClick={() => setCurrentView('analytics')}
                                    />
                                    <NavButton 
                                    icon={<BellIcon />} 
                                    label="Notifiche" 
                                    isActive={currentView === 'notifications'} 
                                    onClick={() => setCurrentView('notifications')} 
                                    />
                                    {onSave && (
                                        <button
                                            onClick={onSave}
                                            className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors duration-200 shadow-sm"
                                            title="Salva modifiche"
                                        >
                                            <SaveIcon className="h-5 w-5" />
                                            <span className="hidden sm:inline">Salva Dati</span>
                                        </button>
                                    )}
                                    {onExport && (
                                        <button
                                            onClick={onExport}
                                            className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200 shadow-sm"
                                            title="Esporta Dati"
                                        >
                                            <DownloadIcon className="h-5 w-5" />
                                            <span className="hidden sm:inline">Esporta</span>
                                        </button>
                                    )}
                                    {onImport && (
                                        <button
                                            onClick={onImport}
                                            className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200 shadow-sm"
                                            title="Importa Dati"
                                        >
                                            <UploadIcon className="h-5 w-5" />
                                            <span className="hidden sm:inline">Importa</span>
                                        </button>
                                    )}
                                    {onReset && (
                                        <button
                                            onClick={onReset}
                                            className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors duration-200 shadow-sm"
                                            title="Reset ai dati iniziali"
                                        >
                                            <TrashIcon className="h-5 w-5" />
                                            <span className="hidden sm:inline">Reset</span>
                                        </button>
                                    )}
                                </>
                            )}
                        </>
                    ) : (
                         // User Nav
                         <>
                             <NavButton 
                            icon={<CalendarIcon />} 
                            label="Dashboard" 
                            isActive={currentView === 'schedule'} 
                            onClick={() => setCurrentView('schedule')} 
                            />
                             <NavButton 
                                icon={<RefreshIcon />} 
                                label="Scambio Turni" 
                                isActive={currentView === 'shift-changes'} 
                                onClick={() => setCurrentView('shift-changes')} 
                                />
                         </>
                    )}
                </nav>
              <div className="flex items-center">
                 <div className="relative">
                  <select
                    value={currentUser?.id || ''}
                    onChange={(e) => onSwitchUser(e.target.value)}
                    className="appearance-none bg-blue-700 hover:bg-blue-600 text-white font-medium py-1.5 pl-3 pr-8 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-white"
                    aria-label="Seleziona utente"
                  >
                    <option value="" disabled>Seleziona Utente</option>
                    {users.sort((a,b) => a.name.localeCompare(b.name)).map(user => (
                    <option key={user.id} value={user.id} className="text-gray-800 bg-white">{user.name}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>
          </div>
        </div>
      </div>
    </header>
  );
};
