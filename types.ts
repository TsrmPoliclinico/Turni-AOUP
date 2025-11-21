
export enum DiagnosticArea {
  TC1 = 'TC1',
  TC2 = 'TC2',
  RM1 = 'RM1',
  RM2 = 'RM2',
  RM3 = 'RM3',
  DIAGNOSTICA = 'Diagnostica',
  SENOLOGIA = 'Senologia',
  PS = 'PS',
  UROLOGIA = 'Urologia',
  NEUROCHIRURGIA = 'Neurochirurgia',
  CH_PLASTICA = 'Ch. Plastica',
  ORTOPEDIA = 'Ortopedia',
  CH_DURGENZA = "Ch. D'Urgenza",
  VILLA_BELMONTE = "Villa Belmonte",
  MOC = 'MOC',
  SALA_OP_CCH = 'Sala Op. CCH',
  PRESIDI_ESTERNI = 'Presidi Esterni',
  REPERIBILITA_ISTITUTO = "Reperibilità d'istituto",
  PRIMA_REPERIBILITA_SALA = "Prima reperibilità di sala",
  SECONDA_REPERIBILITA_SALA = "Seconda reperibilità di sala",
  URGENZE_SALE_OPERATORIE = "Urgenze sale operatorie",
  CONE_BEAM_OPT = "Cone Beam- OPT",
}

export interface DiagnosticAreaInfo {
  id: DiagnosticArea;
  name: string;
  color: string;
}

export interface User {
  id: string;
  name: string;
  password?: string; // Password opzionale per l'autenticazione
  isAdmin?: boolean;
  isActive: boolean;
  canDoInternalOnCall: boolean;
  canDoFirstOnCall: boolean;
  canDoSecondOnCall: boolean;
  canDoNightShiftsInER: boolean;
  canWorkInRM1: boolean;
  canWorkInRM2: boolean;
  canWorkInRM3: boolean;
  canWorkInTC1: boolean;
  canWorkInTC2: boolean;
  canWorkInMOC: boolean;
  canWorkInSenologia: boolean;
  canWorkInDiagnostica: boolean;
  canWorkInPresidiEsterni: boolean;
  canWorkInConeBeam: boolean;
  canWorkInVillaBelmonte: boolean;
  canWorkInPS: boolean;
  canWorkInUrologia: boolean;
  canWorkInOrtopedia: boolean;
  canWorkInNeurochirurgia: boolean;
  canWorkInChPlastica: boolean;
  canWorkInChDUrgenza: boolean;
  canWorkInSalaOpCCH: boolean;
}

export interface Shift {
  id: string;
  userId: string;
  area: DiagnosticArea;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
}

export interface Notification {
  id: string;
  message: string;
  timestamp: Date;
}

export enum VacationRequestStatus {
  PENDING = 'In attesa',
  APPROVED = 'Approvata',
  REJECTED = 'Respinta',
}

export interface VacationRequest {
  id: string;
  userId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  status: VacationRequestStatus;
  reason?: string;
}

export enum ShiftChangeRequestStatus {
  PENDING = 'In attesa',
  APPROVED = 'Approvata',
  REJECTED = 'Respinta',
}

export interface ShiftChangeRequest {
  id: string;
  requestingUserId: string;
  shiftId: string;
  targetUserId?: string; // Optional: the user who will take the shift
  targetShiftId?: string; // Optional: the shift the requesting user wants in return
  status: ShiftChangeRequestStatus;
  reason?: string;
  requestDate: string; // ISO string
}

// 0 = Domenica, 1 = Lunedì, ..., 6 = Sabato
export interface DayOpeningHours {
    morning: boolean;
    afternoon: boolean;
    night: boolean;
}

export interface WeeklyOpeningHours {
    [dayOfWeek: number]: DayOpeningHours;
}

export type AreaOpeningRules = Record<DiagnosticArea, WeeklyOpeningHours>;

export type View = 'schedule' | 'users' | 'notifications' | 'vacations' | 'analytics' | 'shift-changes' | 'agenda';
