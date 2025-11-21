
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ScheduleView } from './components/ScheduleView';
import { UserManagement } from './components/UserManagement';
import { NotificationPanel } from './components/NotificationPanel';
import { VacationManagement } from './components/VacationManagement';
import { ShiftChangeManagement } from './components/ShiftChangeManagement';
import { Header } from './components/Header';
import { UserDashboard } from './components/UserDashboard';
import { LoginModal } from './components/LoginModal';
import { AgendaManagement } from './components/AgendaManagement';
// FIX: Corrected typo in imported constant name.
import { MOCK_USERS, INITIAL_SHIFTS, INITIAL_VACATION_REQUESTS, INITIAL_DIAGNOSTIC_AREAS, INITIAL_SHIFT_CHANGE_REQUESTS, createDefaultWeeklyOpeningHours } from './constants';
import type { User, Shift, Notification, View, DiagnosticArea, VacationRequest, DiagnosticAreaInfo, ShiftChangeRequest, AreaOpeningRules } from './types';
import { VacationRequestStatus, ShiftChangeRequestStatus } from './types';
import { generateScheduleSuggestion } from './services/geminiService';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { SpinnerIcon } from './components/icons/SpinnerIcon';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading, message = 'Caricamento...' }) => {
  if (!isLoading) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-[9999] flex justify-center items-center"
      aria-modal="true"
      role="dialog"
      aria-labelledby="loading-message"
    >
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-sm m-4 flex flex-col items-center gap-4 transform transition-all animate-fade-in-up">
        <SpinnerIcon className="h-12 w-12 text-blue-600" />
        <p id="loading-message" className="text-lg font-medium text-gray-700 text-center">{message}</p>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2 overflow-hidden">
          <div className="bg-blue-600 h-2.5 rounded-full w-1/2 animate-progress-indeterminate"></div>
        </div>
      </div>
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
        
        @keyframes progress-indeterminate {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-progress-indeterminate {
          animation: progress-indeterminate 1.5s infinite linear;
        }
      `}</style>
    </div>
  );
};

// Hook personalizzato per gestire il localStorage
function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.error(error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.error(error);
    }
  };
  return [storedValue, setValue];
}

const App: React.FC = () => {
  // Utilizza useLocalStorage invece di useState per la persistenza
  const [users, setUsers] = useLocalStorage<User[]>('gtr_users', MOCK_USERS);
  const [shifts, setShifts] = useLocalStorage<Shift[]>('gtr_shifts', INITIAL_SHIFTS);
  const [vacationRequests, setVacationRequests] = useLocalStorage<VacationRequest[]>('gtr_vacation_requests', INITIAL_VACATION_REQUESTS);
  const [shiftChangeRequests, setShiftChangeRequests] = useLocalStorage<ShiftChangeRequest[]>('gtr_shift_change_requests', INITIAL_SHIFT_CHANGE_REQUESTS);
  const [notifications, setNotifications] = useLocalStorage<Notification[]>('gtr_notifications', []);
  const [diagnosticAreas, setDiagnosticAreas] = useLocalStorage<DiagnosticAreaInfo[]>('gtr_diagnostic_areas', INITIAL_DIAGNOSTIC_AREAS);
  
  // Initialize opening rules. If not present, map all areas to default "Open"
  const initialOpeningRules = {} as AreaOpeningRules;
  INITIAL_DIAGNOSTIC_AREAS.forEach(area => {
      initialOpeningRules[area.id] = createDefaultWeeklyOpeningHours();
  });

  const [areaOpeningRules, setAreaOpeningRules] = useLocalStorage<AreaOpeningRules>('gtr_area_opening_rules', initialOpeningRules);

  // Effect to ensure all current diagnostic areas have a rule in the state
  useEffect(() => {
      let hasChanges = false;
      const newRules = { ...areaOpeningRules };
      diagnosticAreas.forEach(area => {
          if (!newRules[area.id]) {
              newRules[area.id] = createDefaultWeeklyOpeningHours();
              hasChanges = true;
          }
      });
      if (hasChanges) {
          setAreaOpeningRules(newRules);
      }
  }, [diagnosticAreas, areaOpeningRules, setAreaOpeningRules]);

  const [currentView, setCurrentView] = useState<View>('schedule');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Stati per la gestione del login modale
  const [pendingLoginUser, setPendingLoginUser] = useState<User | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userMap = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);

  const addNotification = (message: string) => {
    const newNotification: Notification = {
      id: `notif-${Date.now()}`,
      message: message,
      timestamp: new Date(),
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const handleGenerateSchedule = async (startDate: Date, endDate: Date) => {
    setIsGenerating(true);
    setLoadingMessage(`Generazione della pianificazione per il periodo dal ${startDate.toLocaleDateString('it-IT')} al ${endDate.toLocaleDateString('it-IT')}... L'operazione potrebbe richiedere alcuni secondi.`);
    setError(null);
    addNotification(`Generazione pianificazione AI avviata per il periodo ${startDate.toLocaleDateString('it-IT')} - ${endDate.toLocaleDateString('it-IT')}.`);
    try {
      // Exclude any user who is an admin from scheduling to prevent them from being assigned shifts
      const activeUsers = users.filter(u => u.isActive && !u.isAdmin);
      
      if (activeUsers.length === 0) {
        setError("Nessun utente attivo disponibile per generare la pianificazione.");
        addNotification("Errore: Impossibile generare la pianificazione AI. Nessun utente attivo.");
        setIsGenerating(false);
        return;
      }
      
      const approvedVacations = vacationRequests.filter(req => req.status === VacationRequestStatus.APPROVED);
      // Pass areaOpeningRules to the generator service
      const suggestedShifts = await generateScheduleSuggestion(activeUsers, startDate, endDate, diagnosticAreas, approvedVacations, areaOpeningRules);
      
      const startTime = startDate.getTime();
      const endTime = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59, 999).getTime();

      const existingShifts = shifts.filter(shift => {
        const shiftTime = new Date(shift.date).getTime();
        return shiftTime < startTime || shiftTime > endTime;
      });

      setShifts([...existingShifts, ...suggestedShifts]);
      addNotification("Pianificazione per il periodo selezionato generata con AI e applicata con successo!");
    } catch (e) {
      console.error("Failed to generate schedule:", e);
      const errorMessage = e instanceof Error ? e.message : "Si è verificato un errore sconosciuto.";
      setError(`Impossibile generare la pianificazione: ${errorMessage}`);
      addNotification(`Errore: Impossibile generare la pianificazione AI. ${errorMessage}`);
    } finally {
      setIsGenerating(false);
      setLoadingMessage('');
    }
  };

  const addShift = (date: string, area: DiagnosticArea, timeSlot: 'morning' | 'afternoon' | 'night', userId: string) => {
    const newShift: Shift = {
      id: `shift-${Date.now()}`,
      userId,
      area,
      date,
      startTime: timeSlot === 'morning' ? '08:00' : (timeSlot === 'afternoon' ? '14:00' : '20:00'),
      endTime: timeSlot === 'morning' ? '14:00' : (timeSlot === 'afternoon' ? '20:00' : '08:00'),
    };
    setShifts(prev => [...prev, newShift]);
    const user = userMap.get(userId);
    const areaInfo = diagnosticAreas.find(a => a.id === area);
    const formattedDate = new Date(date).toLocaleDateString('it-IT');
    if (user && areaInfo) {
        addNotification(`Nuovo turno assegnato manualmente a ${user.name} il ${formattedDate} nell'area ${areaInfo.name}.`);
    }
  };

  const deleteShift = (shiftId: string) => {
    const shiftToDelete = shifts.find(s => s.id === shiftId);
    if (shiftToDelete) {
        const user = userMap.get(shiftToDelete.userId);
        const areaInfo = diagnosticAreas.find(a => a.id === shiftToDelete.area);
        const formattedDate = new Date(shiftToDelete.date).toLocaleDateString('it-IT');
        if (user && areaInfo) {
            addNotification(`Turno di ${user.name} del ${formattedDate} (${areaInfo.name}) rimosso manualmente.`);
        }
    }
    setShifts(prev => prev.filter(s => s.id !== shiftId));
  };
  
  const handleSwitchUser = (userId: string | null) => {
    setError(null);
    if (userId === null) {
      setCurrentUser(null);
      setCurrentView('schedule');
    } else {
      const user = users.find(u => u.id === userId);
      if (user) {
        if (!user.isActive) {
          setError("Questo account è stato disattivato. Contattare l'amministratore.");
          setCurrentUser(null);
          return;
        }

        // Se l'utente ha una password, apri il modale di login
        if (user.password && user.password.trim() !== '') {
          setPendingLoginUser(user);
          setIsLoginModalOpen(true);
          return;
        }

        // Altrimenti accedi direttamente
        setCurrentUser(user);
        if (!user.isAdmin) {
          setCurrentView('schedule');
        }
      }
    }
  };

  const handleLoginSubmit = (password: string) => {
    if (pendingLoginUser && pendingLoginUser.password === password) {
      setCurrentUser(pendingLoginUser);
      setIsLoginModalOpen(false);
      setPendingLoginUser(null);
      if (!pendingLoginUser.isAdmin) {
        setCurrentView('schedule');
      }
    } else {
      alert("Password errata.");
    }
  };

  const addVacationRequest = (request: Omit<VacationRequest, 'id' | 'status'>) => {
    const newRequest: VacationRequest = {
      ...request,
      id: `vac-${Date.now()}`,
      status: VacationRequestStatus.PENDING,
    };
    setVacationRequests(prev => [newRequest, ...prev]);
    addNotification(`Nuova richiesta di ferie inviata da ${userMap.get(request.userId)?.name}.`);
  };

  const updateVacationRequestStatus = (requestId: string, status: VacationRequestStatus) => {
    setVacationRequests(prev => prev.map(req => req.id === requestId ? { ...req, status } : req));
    const user = userMap.get(vacationRequests.find(r => r.id === requestId)?.userId || '');
    addNotification(`Richiesta di ferie di ${user?.name} è stata ${status.toLowerCase()}.`);
  };

  const handleAddShiftChangeRequest = (request: Omit<ShiftChangeRequest, 'id' | 'status' | 'requestDate'>) => {
    const newRequest: ShiftChangeRequest = {
      ...request,
      id: `sc-${Date.now()}`,
      status: ShiftChangeRequestStatus.PENDING,
      requestDate: new Date().toISOString(),
    };
    setShiftChangeRequests(prev => [newRequest, ...prev]);
    addNotification(`Nuova richiesta di cambio turno inserita da ${userMap.get(request.requestingUserId)?.name}.`);
  };

  const handleProcessShiftChangeRequest = (requestId: string, status: ShiftChangeRequestStatus) => {
    const request = shiftChangeRequests.find(r => r.id === requestId);
    if (!request) return;

    setShiftChangeRequests(prev => prev.map(req => req.id === requestId ? { ...req, status } : req));

    const requestingUser = userMap.get(request.requestingUserId);

    if (status === ShiftChangeRequestStatus.APPROVED) {
      // If approved and there is a target user, swap the shift
      if (request.targetUserId) {
        const targetUser = userMap.get(request.targetUserId);
        
        setShifts(prevShifts => prevShifts.map(shift => {
          // Assign the requesting user's shift to the target user
          if (shift.id === request.shiftId) {
            return { ...shift, userId: request.targetUserId! };
          }
          // If a cross-swap was requested (targetShiftId exists), assign that shift to the requesting user
          if (request.targetShiftId && shift.id === request.targetShiftId) {
              return { ...shift, userId: request.requestingUserId };
          }
          return shift;
        }));

        if (request.targetShiftId) {
             addNotification(`Scambio incrociato approvato tra ${requestingUser?.name} e ${targetUser?.name}. Pianificazione aggiornata.`);
        } else {
             addNotification(`Cessione turno approvata: ${requestingUser?.name} -> ${targetUser?.name}. Pianificazione aggiornata.`);
        }
      } else {
        addNotification(`Richiesta di cambio turno per ${requestingUser?.name} approvata. (Sostituzione manuale richiesta).`);
      }
    } else {
      addNotification(`Richiesta di cambio turno di ${requestingUser?.name} è stata rifiutata.`);
    }
  };


  const deleteUserAndShifts = (userId: string) => {
    const userToDelete = userMap.get(userId);
    if (!userToDelete) {
      setError("Impossibile trovare l'utente da eliminare.");
      return;
    }

    setUsers(prev => prev.filter(u => u.id !== userId));
    setShifts(prev => prev.filter(s => s.userId !== userId));
    setVacationRequests(prev => prev.filter(vr => vr.userId !== userId));
    setShiftChangeRequests(prev => prev.filter(req => req.requestingUserId !== userId && req.targetUserId !== userId));
    addNotification(`Utente ${userToDelete.name} e tutti i dati associati sono stati eliminati.`);
  };

  const handleUpdateAreaName = (areaId: DiagnosticArea, newName: string) => {
    const oldArea = diagnosticAreas.find(a => a.id === areaId);
    setDiagnosticAreas(prevAreas =>
      prevAreas.map(area =>
        area.id === areaId ? { ...area, name: newName } : area
      )
    );
    addNotification(`L'area "${oldArea?.name}" è stata rinominata in "${newName}".`);
  };

  const handleReorderAreas = (newOrder: DiagnosticAreaInfo[]) => {
    setDiagnosticAreas(newOrder);
  };

  const handleManualSave = () => {
    // Since we are using useLocalStorage, data is effectively saved on every change.
    // This manual action serves to reassure the user.
    addNotification("Salvataggio dati completato con successo!");
    alert("Dati salvati correttamente nella memoria locale del browser.");
  };

  const handleResetData = () => {
    if (window.confirm("Sei sicuro di voler resettare tutti i dati? Questa azione è irreversibile e ripristinerà i dati di esempio iniziali.")) {
      localStorage.clear();
      window.location.reload();
    }
  };
  
  // Export Data Functionality
  const handleExportData = () => {
      const dataToExport = {
          users,
          shifts,
          vacationRequests,
          shiftChangeRequests,
          diagnosticAreas,
          areaOpeningRules,
          exportDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const dateStr = new Date().toISOString().split('T')[0];
      link.download = `backup_turni_${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      addNotification("Esportazione dati completata.");
  };

  // Import Data Functionality
  const handleImportClick = () => {
      if (fileInputRef.current) {
          fileInputRef.current.click();
      }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
          try {
              const content = e.target?.result as string;
              const data = JSON.parse(content);
              
              if (data.users && Array.isArray(data.users)) setUsers(data.users);
              if (data.shifts && Array.isArray(data.shifts)) setShifts(data.shifts);
              if (data.vacationRequests && Array.isArray(data.vacationRequests)) setVacationRequests(data.vacationRequests);
              if (data.shiftChangeRequests && Array.isArray(data.shiftChangeRequests)) setShiftChangeRequests(data.shiftChangeRequests);
              if (data.diagnosticAreas && Array.isArray(data.diagnosticAreas)) setDiagnosticAreas(data.diagnosticAreas);
              if (data.areaOpeningRules) setAreaOpeningRules(data.areaOpeningRules);
              
              addNotification("Importazione dati completata con successo! La pagina verrà ricaricata.");
              setTimeout(() => window.location.reload(), 1500);
          } catch (error) {
              console.error("Errore durante l'importazione:", error);
              setError("Il file selezionato non è valido o è corrotto.");
          }
      };
      reader.readAsText(file);
      // Reset input value so the same file can be selected again if needed
      event.target.value = ''; 
  };

  const renderManagerView = () => {
    const isAdmin = currentUser?.isAdmin === true;

    // Se un utente non admin (es. guest) tenta di accedere a una vista protetta, mostra la schedule read-only.
    const readOnlyScheduleView = <ScheduleView 
        shifts={shifts} 
        users={users} 
        vacationRequests={vacationRequests}
        diagnosticAreas={diagnosticAreas}
        onGenerate={handleGenerateSchedule} 
        isGenerating={isGenerating}
        canGenerate={false} // Non può generare
        isManager={false} // Non può gestire (add/delete/drag)
        onAddShift={addShift}
        onDeleteShift={deleteShift}
        onUpdateAreaName={handleUpdateAreaName}
      />;

    switch (currentView) {
      case 'users':
        // SOLO l'amministratore può vedere UserManagement
        return isAdmin ? (
            <UserManagement 
                users={users} 
                setUsers={setUsers} 
                onDeleteUser={deleteUserAndShifts} 
                addNotification={addNotification}
                onSave={handleManualSave}
            />
        ) : readOnlyScheduleView;
      case 'agenda':
        // SOLO l'amministratore può vedere AgendaManagement
        return isAdmin ? (
            <AgendaManagement
                diagnosticAreas={diagnosticAreas}
                openingRules={areaOpeningRules}
                onUpdateRules={setAreaOpeningRules}
                onSave={handleManualSave}
            />
        ) : readOnlyScheduleView;
      case 'notifications':
        return isAdmin ? <NotificationPanel notifications={notifications} /> : readOnlyScheduleView;
      case 'vacations':
        return isAdmin ? <VacationManagement requests={vacationRequests} users={users} onUpdateRequestStatus={updateVacationRequestStatus} /> : readOnlyScheduleView;
      case 'analytics':
        return isAdmin ? <AnalyticsDashboard users={users} shifts={shifts} /> : readOnlyScheduleView;
      case 'shift-changes':
        if (currentUser) {
          return <ShiftChangeManagement 
                  currentUser={currentUser}
                  users={users}
                  shifts={shifts}
                  requests={shiftChangeRequests}
                  diagnosticAreas={diagnosticAreas}
                  onAddRequest={handleAddShiftChangeRequest}
                  onProcessRequest={handleProcessShiftChangeRequest}
                 />;
        }
        return readOnlyScheduleView;
      case 'schedule':
      default:
        return <ScheduleView 
                  shifts={shifts} 
                  users={users} 
                  vacationRequests={vacationRequests}
                  diagnosticAreas={diagnosticAreas}
                  onGenerate={handleGenerateSchedule} 
                  isGenerating={isGenerating}
                  canGenerate={isAdmin} // Solo l'admin può generare
                  isManager={isAdmin} // Solo l'admin può gestire
                  onAddShift={addShift}
                  onDeleteShift={deleteShift}
                  onUpdateAreaName={handleUpdateAreaName}
                  onReorderAreas={handleReorderAreas}
                />;
    }
  };

  const isAdmin = currentUser?.isAdmin === true;
  const isStandardUser = currentUser && !isAdmin;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <LoadingOverlay isLoading={isGenerating} message={loadingMessage} />
      
      {isLoginModalOpen && pendingLoginUser && (
        <LoginModal 
          user={pendingLoginUser} 
          onLogin={handleLoginSubmit} 
          onClose={() => { setIsLoginModalOpen(false); setPendingLoginUser(null); }} 
        />
      )}
      
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept=".json" 
        onChange={handleFileChange} 
      />

      <Header 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        currentUser={currentUser}
        users={users}
        onSwitchUser={handleSwitchUser}
        onSave={handleManualSave}
        onReset={handleResetData}
        onExport={handleExportData}
        onImport={handleImportClick}
      />
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 no-print" role="alert">
            <strong className="font-bold">Errore! </strong>
            <span className="block sm:inline">{error}</span>
             <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3" aria-label="Chiudi">
              <span className="text-2xl leading-none">&times;</span>
            </button>
          </div>
        )}
        
        {isStandardUser ? (
          currentView === 'shift-changes' ? (
             <ShiftChangeManagement 
                currentUser={currentUser}
                users={users}
                shifts={shifts}
                requests={shiftChangeRequests}
                diagnosticAreas={diagnosticAreas}
                onAddRequest={handleAddShiftChangeRequest}
                onProcessRequest={handleProcessShiftChangeRequest}
             />
          ) : (
            // L'utente standard non ha accesso a 'users' o 'agenda', quindi defaulta alla dashboard
            <UserDashboard 
              user={currentUser}
              shifts={shifts.filter(s => s.userId === currentUser.id)}
              vacationRequests={vacationRequests.filter(vr => vr.userId === currentUser.id)}
              onAddVacationRequest={addVacationRequest}
              diagnosticAreas={diagnosticAreas}
            />
          )
        ) : (
          // Vista per Admin (loggato) e Guest (non loggato)
          renderManagerView()
        )}

      </main>
    </div>
  );
};

export default App;
