
import { User, Shift, DiagnosticArea, VacationRequest, VacationRequestStatus, DiagnosticAreaInfo, ShiftChangeRequest, WeeklyOpeningHours } from './types';

// FIX: Renamed to INITIAL_DIAGNOSTIC_AREAS to fix import error in App.tsx.
export const INITIAL_DIAGNOSTIC_AREAS: DiagnosticAreaInfo[] = [
  { id: DiagnosticArea.TC1, name: 'TC1', color: 'bg-blue-200 text-blue-900 border-blue-400' },
  { id: DiagnosticArea.TC2, name: 'TC2', color: 'bg-sky-200 text-sky-900 border-sky-400' },
  { id: DiagnosticArea.RM1, name: 'RM1', color: 'bg-indigo-200 text-indigo-900 border-indigo-400' },
  { id: DiagnosticArea.RM2, name: 'RM2', color: 'bg-teal-200 text-teal-900 border-teal-400' },
  { id: DiagnosticArea.RM3, name: 'RM3', color: 'bg-cyan-200 text-cyan-900 border-cyan-400' },
  { id: DiagnosticArea.DIAGNOSTICA, name: 'Diagnostica', color: 'bg-green-200 text-green-900 border-green-400' },
  { id: DiagnosticArea.SENOLOGIA, name: 'Senologia', color: 'bg-pink-200 text-pink-900 border-pink-400' },
  { id: DiagnosticArea.PS, name: 'Pronto Soccorso', color: 'bg-red-200 text-red-900 border-red-400' },
  { id: DiagnosticArea.UROLOGIA, name: 'Urologia', color: 'bg-amber-200 text-amber-900 border-amber-400' },
  { id: DiagnosticArea.NEUROCHIRURGIA, name: 'Neurochirurgia', color: 'bg-gray-200 text-gray-900 border-gray-400' },
  { id: DiagnosticArea.CH_PLASTICA, name: 'Ch. Plastica', color: 'bg-rose-200 text-rose-900 border-rose-400' },
  { id: DiagnosticArea.ORTOPEDIA, name: 'Ortopedia', color: 'bg-lime-200 text-lime-900 border-lime-400' },
  { id: DiagnosticArea.CH_DURGENZA, name: "Ch. D'Urgenza", color: 'bg-yellow-200 text-yellow-900 border-yellow-400' },
  { id: DiagnosticArea.VILLA_BELMONTE, name: 'Villa Belmonte', color: 'bg-fuchsia-200 text-fuchsia-900 border-fuchsia-400' },
  { id: DiagnosticArea.MOC, name: 'MOC', color: 'bg-orange-200 text-orange-900 border-orange-400' },
  { id: DiagnosticArea.SALA_OP_CCH, name: 'Sala Op. CCH', color: 'bg-emerald-200 text-emerald-900 border-emerald-400' },
  { id: DiagnosticArea.PRESIDI_ESTERNI, name: 'Presidi Esterni', color: 'bg-stone-200 text-stone-900 border-stone-400' },
  { id: DiagnosticArea.REPERIBILITA_ISTITUTO, name: "Reperibilità d'istituto", color: 'bg-slate-200 text-slate-900 border-slate-400' },
  { id: DiagnosticArea.PRIMA_REPERIBILITA_SALA, name: "Prima reperibilità di sala", color: 'bg-zinc-200 text-zinc-900 border-zinc-400' },
  { id: DiagnosticArea.SECONDA_REPERIBILITA_SALA, name: "Seconda reperibilità di sala", color: 'bg-neutral-200 text-neutral-900 border-neutral-400' },
  { id: DiagnosticArea.URGENZE_SALE_OPERATORIE, name: 'Urgenze sale operatorie', color: 'bg-violet-200 text-violet-900 border-violet-400' },
  { id: DiagnosticArea.CONE_BEAM_OPT, name: 'Cone Beam- OPT', color: 'bg-teal-300 text-teal-900 border-teal-500' },
];

export const MOCK_USERS: User[] = [
  {
    id: 'admin-1',
    name: 'Amministratore',
    password: 'Marco@09081979',
    isAdmin: true,
    isActive: true,
    canDoInternalOnCall: true,
    canDoFirstOnCall: true,
    canDoSecondOnCall: true,
    canDoNightShiftsInER: true,
    canWorkInRM1: true,
    canWorkInRM2: true,
    canWorkInRM3: true,
    canWorkInTC1: true,
    canWorkInTC2: true,
    canWorkInMOC: true,
    canWorkInSenologia: true,
    canWorkInDiagnostica: true,
    canWorkInPresidiEsterni: true,
    canWorkInConeBeam: true,
    canWorkInVillaBelmonte: true,
    canWorkInPS: true,
    canWorkInUrologia: true,
    canWorkInOrtopedia: true,
    canWorkInNeurochirurgia: true,
    canWorkInChPlastica: true,
    canWorkInChDUrgenza: true,
    canWorkInSalaOpCCH: true,
  }
];

// Helper to get date string
const getDateString = (offset: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().split('T')[0];
};

export const INITIAL_SHIFTS: Shift[] = [
  // Today
  { id: 'shift-1', userId: 'user-1', area: DiagnosticArea.TC1, date: getDateString(0), startTime: '08:00', endTime: '14:00' },
  { id: 'shift-2', userId: 'user-2', area: DiagnosticArea.RM1, date: getDateString(0), startTime: '08:00', endTime: '20:00' },
  { id: 'shift-3', userId: 'user-3', area: DiagnosticArea.PS, date: getDateString(0), startTime: '14:00', endTime: '20:00' },
  { id: 'shift-4', userId: 'user-4', area: DiagnosticArea.DIAGNOSTICA, date: getDateString(0), startTime: '08:00', endTime: '14:00' },
  // Tomorrow
  { id: 'shift-5', userId: 'user-5', area: DiagnosticArea.TC1, date: getDateString(1), startTime: '08:00', endTime: '20:00' },
  { id: 'shift-6', userId: 'user-6', area: DiagnosticArea.SENOLOGIA, date: getDateString(1), startTime: '08:00', endTime: '14:00' },
  { id: 'shift-8', userId: 'user-8', area: DiagnosticArea.RM1, date: getDateString(1), startTime: '14:00', endTime: '20:00' },
   // Yesterday
  { id: 'shift-9', userId: 'user-1', area: DiagnosticArea.PS, date: getDateString(-1), startTime: '20:00', endTime: '08:00' }, // Night shift
  { id: 'shift-10', userId: 'user-3', area: DiagnosticArea.TC1, date: getDateString(-1), startTime: '08:00', endTime: '14:00' },
];

export const INITIAL_VACATION_REQUESTS: VacationRequest[] = [
  { id: 'vac-1', userId: 'user-2', startDate: getDateString(10), endDate: getDateString(14), status: VacationRequestStatus.PENDING, reason: 'Vacanza famiglia' },
  { id: 'vac-2', userId: 'user-4', startDate: getDateString(2), endDate: getDateString(2), status: VacationRequestStatus.APPROVED, reason: 'Visita medica' },
  { id: 'vac-3', userId: 'user-1', startDate: getDateString(25), endDate: getDateString(28), status: VacationRequestStatus.REJECTED, reason: 'Motivi personali' },
];

export const INITIAL_SHIFT_CHANGE_REQUESTS: ShiftChangeRequest[] = [];

// Helper per creare orari di apertura di default (tutto aperto)
export const createDefaultWeeklyOpeningHours = (): WeeklyOpeningHours => {
    const hours: any = {};
    for (let i = 0; i < 7; i++) {
        hours[i] = { morning: true, afternoon: true, night: true };
    }
    return hours;
};
