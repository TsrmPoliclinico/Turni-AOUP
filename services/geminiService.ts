
import { GoogleGenAI, Type } from "@google/genai";
// FIX: 'DiagnosticArea' is an enum used as a value, so it cannot be a type-only import.
import type { User, Shift, DiagnosticAreaInfo, VacationRequest, AreaOpeningRules } from '../types';
import { DiagnosticArea } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

// Helper function to break the date range into smaller, manageable chunks (e.g., 7 days)
const getChunkedDateRanges = (startDate: Date, endDate: Date): { dateStrings: string[] }[] => {
    const ranges: { dateStrings: string[] }[] = [];
    let currentDate = new Date(startDate.toISOString().split('T')[0]); // Normalize to start of day

    while (currentDate <= endDate) {
        const chunk: string[] = [];
        // Create a chunk of up to 7 days (Weekly batching reduces API calls drastically)
        for (let i = 0; i < 7 && currentDate <= endDate; i++) {
            chunk.push(currentDate.toISOString().split('T')[0]);
            currentDate.setDate(currentDate.getDate() + 1);
        }
        ranges.push({ dateStrings: chunk });
    }
    return ranges;
};

const getOpeningRulesDescription = (diagnosticAreas: DiagnosticAreaInfo[], openingRules: AreaOpeningRules): string => {
    let description = "REGOLE DI APERTURA SETTIMANALE (DA RISPETTARE RIGOROSAMENTE):\n";
    const dayNames = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];
    const slotNames = { morning: "Mattina", afternoon: "Pomeriggio", night: "Notte" };

    diagnosticAreas.forEach(area => {
        const rule = openingRules[area.id];
        if (!rule) return;

        let openTimes: string[] = [];
        for (let i = 0; i < 7; i++) {
            const dayRule = rule[i];
            const dayName = dayNames[i];
            if (dayRule.morning) openTimes.push(`${dayName} Mattina`);
            if (dayRule.afternoon) openTimes.push(`${dayName} Pomeriggio`);
            if (dayRule.night) openTimes.push(`${dayName} Notte`);
        }

        if (openTimes.length === 0) {
            description += `- ${area.name} (${area.id}): SEMPRE CHIUSO. Non assegnare turni.\n`;
        } else if (openTimes.length === 21) {
             // If open 24/7 (3 slots * 7 days = 21)
             // description += `- ${area.name} (${area.id}): Sempre aperto (tutti i giorni, tutti gli orari).\n`;
             // Optimization: Don't list fully open areas to save tokens, explicit rules are more important for restriction.
        } else {
            description += `- ${area.name} (${area.id}): APERTO SOLO: ${openTimes.join(', ')}. CHIUSO in tutti gli altri orari.\n`;
        }
    });
    return description;
};


export const generateScheduleSuggestion = async (users: User[], startDate: Date, endDate: Date, diagnosticAreas: DiagnosticAreaInfo[], vacationRequests: VacationRequest[], openingRules: AreaOpeningRules): Promise<Shift[]> => {
  // FIX: Sanitize user names to remove characters that might confuse the model.
  const userList = users.map(u => {
    const sanitizedName = u.name.replace(/'|"/g, ''); // Remove both single and double quotes.
    return `id: ${u.id}, name: ${sanitizedName}, può fare reperibilità interna: ${u.canDoInternalOnCall}, può fare prima reperibilità di sala: ${u.canDoFirstOnCall}, può fare seconda reperibilità di sala: ${u.canDoSecondOnCall}, può fare turni di notte in PS: ${u.canDoNightShiftsInER}, abilitato RM1: ${u.canWorkInRM1}, abilitato RM2: ${u.canWorkInRM2}, abilitato RM3: ${u.canWorkInRM3}, abilitato TC1: ${u.canWorkInTC1}, abilitato TC2: ${u.canWorkInTC2}, abilitato MOC: ${u.canWorkInMOC}, abilitato Senologia: ${u.canWorkInSenologia}, abilitato Diagnostica: ${u.canWorkInDiagnostica}, abilitato Presidi Esterni: ${u.canWorkInPresidiEsterni}, abilitato Cone Beam: ${u.canWorkInConeBeam}, abilitato Villa Belmonte: ${u.canWorkInVillaBelmonte}, abilitato PS: ${u.canWorkInPS}, abilitato Urologia: ${u.canWorkInUrologia}, abilitato Ortopedia: ${u.canWorkInOrtopedia}, abilitato Neurochirurgia: ${u.canWorkInNeurochirurgia}, "abilitato Ch. Plastica": ${u.canWorkInChPlastica}, "abilitato Ch. D'Urgenza": ${u.canWorkInChDUrgenza}, "abilitato Sala Op. CCH": ${u.canWorkInSalaOpCCH}`;
  }).join('; ');
  
  const areaList = diagnosticAreas.map(a => a.id).join(', ');

  const openingRulesDescription = getOpeningRulesDescription(diagnosticAreas, openingRules);

  const dateRanges = getChunkedDateRanges(startDate, endDate);
  const allGeneratedShifts: any[] = [];
  
  const userMap = new Map(users.map(u => [u.id, u]));
  const vacationList = vacationRequests.map(req => {
    const user = userMap.get(req.userId);
    if (!user) return '';
    const sanitizedName = user.name.replace(/'|"/g, '');
    return `L'utente ${sanitizedName} (id: ${req.userId}) è in ferie approvate dal ${req.startDate} al ${req.endDate}.`;
  }).filter(Boolean).join('; ');


  try {
    for (const range of dateRanges) {
        const dateStrings = range.dateStrings;
        const prompt = `
            OBIETTIVO: Creare una pianificazione di turni JSON completa per un reparto di radiologia per il periodo specifico dal ${dateStrings[0]} al ${dateStrings[dateStrings.length - 1]}.

            DATI DI INPUT:
            - Utenti disponibili (con le loro abilità specifiche): ${userList}
            - Aree diagnostiche da coprire: ${areaList}
            - Giorni da pianificare ESCLUSIVAMENTE: ${dateStrings.join(', ')}.
            - Ferie approvate: ${vacationList || 'Nessuna'}

            ${openingRulesDescription}

            REGOLE FONDAMENTALI DI COPERTURA (BEST EFFORT):
            L'obiettivo è coprire tutti i turni "APERTI" secondo le regole di apertura specificate sopra.
            TUTTAVIA, se per un determinato turno NON ci sono utenti disponibili che rispettano TUTTE le regole (ferie, riposo, competenze specifiche), NON generare quel turno. 
            È PREFERIBILE AVERE UN TURNO VUOTO (MANCANTE NEL JSON) PIUTTOSTO CHE UN UTENTE NON IDONEO O IN FERIE.

            REGOLE OBBLIGATORIE:

            0.  **RISPETTO FERIE, RIPOSO E CARICO DI LAVORO:** 
                - Non assegnare MAI un turno a un utente durante il suo periodo di ferie approvato. 
                - Non assegnare turni consecutivi massacranti (es. notte e poi mattina successiva).
                - **LIMITE GIORNALIERO:** Un singolo utente NON può fare più di 2 turni nello stesso giorno (Max 12 ore).
                - **NO SOVRAPPOSIZIONI:** Un singolo utente NON può essere assegnato a più aree diverse nello STESSO slot orario (es. non può fare TC1 Mattina e RM1 Mattina contemporaneamente). Una persona, un posto alla volta.

            1.  **ORARI E SLOT (SECONDO APERTURE):**
                - Mattina: 08:00 - 14:00
                - Pomeriggio: 14:00 - 20:00
                - Notte: 20:00 - 08:00
                **IMPORTANTE:** Genera turni SOLO se l'area è indicata come APERTA in quel giorno e fascia oraria nelle "REGOLE DI APERTURA SETTIMANALE". Se un'area non è menzionata esplicitamente come "CHIUSA" o "APERTA SOLO", assumi che sia aperta Mattina e Pomeriggio.

            2.  **NUMERO PERSONE PER TURNO:**
                - Pronto Soccorso (PS): 2 utenti per ogni slot aperto.
                - Tutte le altre aree: 1 utente per ogni slot aperto.

            3.  **COPERTURA PRONTO SOCCORSO (PS):**
                - Richiede 'abilitato PS: true'.
                - Notte richiede anche 'può fare turni di notte in PS: true'.

            4.  **REGOLE COMPETENZE SPECIFICHE (RIGOROSE):**
                Un utente DEVE avere la proprietà specifica 'true' per essere assegnato a queste aree. Se nessuno è disponibile con la competenza, lascia vuoto.
                - '${DiagnosticArea.REPERIBILITA_ISTITUTO}': 'può fare reperibilità interna'
                - '${DiagnosticArea.PRIMA_REPERIBILITA_SALA}': 'può fare prima reperibilità di sala'
                - '${DiagnosticArea.SECONDA_REPERIBILITA_SALA}': 'può fare seconda reperibilità di sala'
                - '${DiagnosticArea.RM1}': 'abilitato RM1'
                - '${DiagnosticArea.RM2}': 'abilitato RM2'
                - '${DiagnosticArea.RM3}': 'abilitato RM3'
                - '${DiagnosticArea.TC1}': 'abilitato TC1'
                - '${DiagnosticArea.TC2}': 'abilitato TC2'
                - '${DiagnosticArea.MOC}': 'abilitato MOC'
                - '${DiagnosticArea.SENOLOGIA}': 'abilitato Senologia'
                - '${DiagnosticArea.DIAGNOSTICA}': 'abilitato Diagnostica'
                - '${DiagnosticArea.PRESIDI_ESTERNI}': 'abilitato Presidi Esterni'
                - '${DiagnosticArea.CONE_BEAM_OPT}': 'abilitato Cone Beam'
                - '${DiagnosticArea.VILLA_BELMONTE}': 'abilitato Villa Belmonte'
                - '${DiagnosticArea.UROLOGIA}': 'abilitato Urologia'
                - '${DiagnosticArea.ORTOPEDIA}': 'abilitato Ortopedia'
                - '${DiagnosticArea.NEUROCHIRURGIA}': 'abilitato Neurochirurgia'
                - '${DiagnosticArea.CH_PLASTICA}': "abilitato Ch. Plastica"
                - "${DiagnosticArea.CH_DURGENZA}": "abilitato Ch. D'Urgenza"
                - '${DiagnosticArea.SALA_OP_CCH}': "abilitato Sala Op. CCH"

            5.  **ASSEGNAZIONE UTENTI:**
                - Distribuisci i turni equamente tra chi è disponibile.
                - I due utenti assegnati allo stesso turno 'PS' devono essere diversi.

            6.  **FORMATO OUTPUT:**
                - L'output deve essere **SOLO E SOLTANTO** un array JSON valido.
                - Ogni elemento dell'array JSON deve avere queste proprietà: "userId", "area", "date", "startTime", "endTime".
                - **IMPORTANTE**: Tutte le chiavi (proprietà) negli oggetti JSON DEVONO essere racchiuse tra doppi apici.
      `;
    
      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: prompt,
        config: {
          maxOutputTokens: 8192,
          // FIX: Added thinkingBudget to reserve tokens for the JSON output.
          // This prevents the model from using all available tokens for "thinking" and
          // failing to generate the actual schedule due to a MAX_TOKENS error.
          thinkingConfig: { thinkingBudget: 4096 },
          // FIX: Removed responseSchema and responseMimeType to simplify the API request
          // and potentially avoid proxy-related XHR errors. We will rely on prompt engineering
          // and manual JSON parsing instead.
        }
      });

      // FIX: Added a robust check to ensure the response text exists before processing.
      // This prevents crashes when the API returns a blocked or empty response.
      const rawText = response?.text;

      if (!rawText) {
          console.error(`AI response was empty or blocked for date range starting ${dateStrings[0]}.`, JSON.stringify(response, null, 2));
          const finishReason = response?.candidates?.[0]?.finishReason;
          if (finishReason && finishReason !== 'STOP') {
              throw new Error(`La generazione AI per il periodo che inizia il ${dateStrings[0]} è stata interrotta. Motivo: ${finishReason}.`);
          }
          throw new Error(`La risposta del modello AI per il periodo che inizia il ${dateStrings[0]} era vuota o non valida.`);
      }
      
      let weeklyShifts: any[];
      try {
          // FIX: Manually parse the JSON from the raw text response, cleaning up markdown code fences if present.
          const jsonText = rawText.trim().replace(/^```json\s*/, '').replace(/```$/, '');
          weeklyShifts = JSON.parse(jsonText);
      } catch(e) {
          console.error(`Failed to parse JSON for date range starting ${dateStrings[0]}. Raw text:`, rawText);
          throw new Error(`La risposta del modello AI per il periodo che inizia il ${dateStrings[0]} non era un JSON valido. Dettaglio: ${e instanceof Error ? e.message : String(e)}`);
      }
      allGeneratedShifts.push(...weeklyShifts);
    }
    
    // Validazione rimossa come richiesto: ora accettiamo pianificazioni parziali se mancano risorse.
    // L'AI farà del suo meglio (Best Effort), ma lascerà buchi se necessario.

    return allGeneratedShifts.map((s: any, index: number) => ({
      ...s,
      id: `ai-${startDate.getTime()}-${index}`,
      area: s.area as DiagnosticArea,
    }));

  } catch (error) {
    console.error("Error calling Gemini API or validating the response:", error);
    const errorMessage = error instanceof Error ? error.message : "Il modello AI non è riuscito a generare una pianificazione valida. Riprova.";
    throw new Error(errorMessage);
  }
};
