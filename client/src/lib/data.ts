// data.ts

// --- Type Definitions ---

/**
 * Represents the PGY level of a resident.
 */
export type PGYLevel = 1 | 2 | 3 | number; // Using number for flexibility if needed

/**
 * Details about an assignment's classification and rules.
 */
export interface AssignmentDetails {
  type: "Required" | "Elective" | "Clinic" | "Status" | "Admin" | "TBD";
  swappable: "Yes" | "No" | "Conditional";
  pgyRules?: string; // Optional PGY rule text
  notes: string;
}

/**
 * Maps assignment patterns (strings) to their details.
 */
export interface AssignmentClassification {
  [pattern: string]: AssignmentDetails;
}

// --- Data Exports ---

/**
 * Placeholder for resident PGY level data.
 * Structure: { "Resident Name": PGYLevel, ... }
 * This should be populated based on actual resident data.
 */
export const residentsData: { [name: string]: PGYLevel } = {
  // Example (replace with actual data):
  // "Bulsara, Kishen": 2,
  // "Chen, Anne": 3,
  // ...
};

/**
 * Defines the rules for classifying and determining swappability of assignments.
 * Keys are patterns (often prefixes) used to match assignment codes from the schedule.
 * The matching logic should prioritize longer, more specific matches first.
 */
export const assignmentClassification: AssignmentClassification = {
  // --- Explicitly Non-Swappable (Rule C2) ---
  "NSLIJ:DM:IM:Vacation": {
    type: "Status",
    swappable: "No",
    notes: "Cannot be swapped (C2). Not a working day.",
  },
  "NSLIJ:DM:IM:LOA-Medical": {
    type: "Status",
    swappable: "No",
    notes: "Cannot be swapped (C2). Not a working day.",
  },
  "NSLIJ:DM:IM:Clinic-": {
    // Prefix Match
    type: "Clinic", // Corrected Type
    swappable: "No",
    notes: "Cannot be swapped (C2). Is a working day.",
  },

  // --- Status Assignments ---
  OFF: {
    type: "Status",
    swappable: "Yes", // Swappable per C6, subject to C7 compatibility
    notes: "Can be swapped with Elective/Status per C7. Not a working day.",
  },
  "NSLIJ:DM:IM:Board-Prep": {
    type: "Status",
    swappable: "Conditional", // Swappable per C6, subject to C5 and C7
    pgyRules: "Both residents must be PGY3",
    notes:
      "Can swap with Elective/Status per C7. Not a working day. Requires PGY3.",
  },

  // --- Required Assignments (Conditionally Swappable with Electives - Rule C7) ---
  "NSLIJ:DM:PULM:MICU-": {
    // Prefix Match
    type: "Required",
    swappable: "Conditional",
    notes:
      "Can only swap with Elective (C7). **Confirm Type.** Assumed working day.",
  },
  "NSLIJ:DM:IM:Team-": {
    // Prefix Match
    type: "Required",
    swappable: "Conditional",
    notes: "Can only swap with Elective (C7). Is a working day.",
  },
  "NSLIJ:DM:IM:MAR-": {
    // Prefix Match
    type: "Required",
    swappable: "Conditional",
    pgyRules: "Recipient must be PGY3.", // Specific PGY rule (C4)
    notes:
      "Can only swap with Elective (C7). Is a working day. Requires PGY3 recipient.",
  },
  "DN:Neuro": {
    // Prefix Match (covers DN:Neuro and DN:Neuro-Consult)
    type: "Required",
    swappable: "Conditional", // Corrected Swappable status
    notes:
      "Can only swap with Elective (C7). **Confirm Type.** Assumed working day.",
  },
  "NSLIJ:DM:IM:Chief": {
    type: "Required", // Corrected Type
    swappable: "Conditional", // Corrected Swappable status
    notes:
      "Can only swap with Elective (C7). **Confirm Type.** Assumed working day.",
  },

  // --- Elective Assignments (Generally Swappable - Rule C7) ---
  "El-": {
    // Prefix Match (e.g., El-Research)
    type: "Elective",
    swappable: "Yes",
    notes:
      "Can swap with Elective/Required/Status per C7. Working day (Mon-Fri).",
  },
  "EI-": {
    // Prefix Match (e.g., EI-Pulm-LIJ)
    type: "Elective",
    swappable: "Yes",
    notes:
      "Can swap with Elective/Required/Status per C7. Working day (Mon-Fri).",
  },
  "CARD:El-": {
    // Prefix Match
    type: "Elective",
    swappable: "Yes",
    notes:
      "Can swap with Elective/Required/Status per C7. Working day (Mon-Fri).",
  },
  "CARD:CCU-": {
    // Prefix Match
    type: "Elective",
    swappable: "Yes",
    notes:
      "Can swap with Elective/Required/Status per C7. **Confirm Sat/Sun working.**",
  },
  "NSLIJ:DM:IM:Uganda": {
    type: "Elective", // Assumed
    swappable: "Yes", // Assumed
    notes:
      "**Confirm Type.** Can swap with Elective/Required/Status per C7. Working (M-F).",
  },
  "NSLIJ:DM:GERI:El-Geri": {
    type: "Elective",
    swappable: "Yes",
    notes:
      "Can swap with Elective/Required/Status per C7. Working day (Mon-Fri).",
  },
  "NSLIJ:DM:GI:El-GI-": {
    // Prefix Match
    type: "Elective",
    swappable: "Yes",
    notes:
      "Can swap with Elective/Required/Status per C7. Working day (Mon-Fri).",
  },
  "NSLIJ:DM:HO:El-HemOnc-NS": {
    type: "Elective",
    swappable: "Yes",
    notes:
      "Can swap with Elective/Required/Status per C7. Working day (Mon-Fri).",
  },
  "NSLIJ:DM:ID:El-ID-NS": {
    type: "Elective",
    swappable: "Yes",
    notes:
      "Can swap with Elective/Required/Status per C7. Working day (Mon-Fri).",
  },
  "NSLIJ:DM:IM:El-Procedure-LIJ": {
    type: "Elective",
    swappable: "Yes",
    notes:
      "Can swap with Elective/Required/Status per C7. Working day (Mon-Fri).",
  },
  "NSLIJ:DM:IM:El-Pri-Care": {
    type: "Elective",
    swappable: "Yes",
    notes:
      "Can swap with Elective/Required/Status per C7. Working day (Mon-Fri).",
  },
  "NSLIJ:DM:IM:Valley-Stream": {
    // Prefix Match
    type: "Elective", // Assumed
    swappable: "Yes", // Assumed
    notes:
      "**Confirm Type.** Can swap with Elective/Required/Status per C7. Working (M-F).",
  },
  "NSLIJ:DM:PULM:El-Pulm-NS": {
    type: "Elective",
    swappable: "Yes",
    notes:
      "Can swap with Elective/Required/Status per C7. Working day (Mon-Fri).",
  },
  // Add entries for any other unique codes encountered ('TBD' type initially if unsure)
};

/**
 * Placeholder for demo schedule HTML string.
 * This should be replaced with the actual HTML table string or loaded dynamically.
 */
/**
 * Default schedule data in tab-delimited format for loading as the baseline schedule.
 * This is the schedule data that will be shown if users don't upload their own.
 */
export const defaultScheduleData = `-\t-\tTue\tWed\tThu\tFri\tSat\tSun\tMon\tTue\tWed\tThu\tFri\tSat\tSun\tMon\tTue\tWed\tThu\tFri\tSat\tSun\tMon\tTue\tWed\tThu\tFri\tSat\tSun\tMon\tTue\tWed\tThu\tFri\tSat\tSun\tMon\tTue\tWed\tThu\tFri\tSat\tSun\tMon\tTue\tWed\tThu\tFri\tSat\tSun\tMon\tTue\tWed\tThu\tFri\tSat\tSun\tMon\tTue\tWed\tThu\tFri\tSat\tSun\tMon\tTue
Name\tPGY Level\tApr-22\tApr-23\tApr-24\tApr-25\tApr-26\tApr-27\tApr-28\tApr-29\tApr-30\t05-Jan\t05-Feb\t05-Mar\t05-Apr\t05-May\t05-Jun\t05-Jul\t05-Aug\t05-Sep\t05-Oct\t05-Nov\t05-Dec\tMay-13\tMay-14\tMay-15\tMay-16\tMay-17\tMay-18\tMay-19\tMay-20\tMay-21\tMay-22\tMay-23\tMay-24\tMay-25\tMay-26\tMay-27\tMay-28\tMay-29\tMay-30\tMay-31\t06-Jan\t06-Feb\t06-Mar\t06-Apr\t06-May\t06-Jun\t06-Jul\t06-Aug\t06-Sep\t06-Oct\t06-Nov\t06-Dec\tJun-13\tJun-14\tJun-15\tJun-16\tJun-17\tJun-18\tJun-19\tJun-20\tJun-21\tJun-22\tJun-23\tJun-24
Aboseria, Ahmed\tPGY-1\tNSLIJ:DM:IM:Team-NS-2-S\tNSLIJ:DM:IM:Team-NS-2-L\tNSLIJ:DM:IM:Team-NS-2-S\tNSLIJ:DM:IM:Team-NS-2-S\tOFF\tNSLIJ:DM:IM:Team-NS-2-L\tNSLIJ:DM:IM:Team-NS-2-S\tNSLIJ:DM:IM:Team-NS-2-L\tNSLIJ:DM:IM:Team-NS-2-S\tNSLIJ:DM:IM:Team-NS-2-L\tNSLIJ:DM:IM:Team-NS-2-S\tNSLIJ:DM:IM:Team-NS-2-S\tOFF\tNSLIJ:DM:IM:Clinic-865\tNSLIJ:DM:IM:Clinic-865\tNSLIJ:DM:IM:Clinic-865\tNSLIJ:DM:IM:Clinic-865\tNSLIJ:DM:IM:Clinic-865\tNSLIJ:DM:IM:Clinic-865\tNSLIJ:DM:IM:Clinic-865\tNSLIJ:DM:IM:Team-LIJ-1-L\tNSLIJ:DM:IM:Team-LIJ-1-S\tNSLIJ:DM:IM:Team-LIJ-1-L\tNSLIJ:DM:IM:Team-LIJ-1-S\tNSLIJ:DM:IM:Team-LIJ-1-L\tNSLIJ:DM:IM:Team-LIJ-1-S\tOFF\tNSLIJ:DM:IM:Team-LIJ-1-L\tNSLIJ:DM:IM:Team-LIJ-1-S\tNSLIJ:DM:IM:Team-LIJ-1-L\tNSLIJ:DM:IM:Team-LIJ-1-S\tNSLIJ:DM:IM:Team-LIJ-1-L\tOFF\tNSLIJ:DM:IM:Team-LIJ-1-S\tNSLIJ:DM:ID:El-ID-LIJ\tNSLIJ:DM:ID:El-ID-LIJ\tNSLIJ:DM:ID:El-ID-LIJ\tNSLIJ:DM:ID:El-ID-LIJ\tNSLIJ:DM:ID:El-ID-LIJ\tNSLIJ:DM:ID:El-ID-LIJ\tNSLIJ:DM:ID:El-ID-LIJ\tNSLIJ:DM:ID:El-ID-LIJ\tNSLIJ:DM:ID:El-ID-LIJ\tNSLIJ:DM:ID:El-ID-LIJ\tNSLIJ:DM:ID:El-ID-LIJ\tNSLIJ:DM:ID:El-ID-LIJ\tNSLIJ:DM:ID:El-ID-LIJ\tNSLIJ:DM:IM:Vacation\tNSLIJ:DM:IM:Vacation\tNSLIJ:DM:IM:Vacation\tNSLIJ:DM:IM:Vacation\tNSLIJ:DM:IM:Vacation\tNSLIJ:DM:IM:Vacation\tNSLIJ:DM:IM:Vacation\tNSLIJ:DM:IM:Vacation\tNSLIJ:DM:IM:Vacation\tNSLIJ:DM:IM:Vacation\tNSLIJ:DM:IM:Vacation\tNSLIJ:DM:IM:Vacation\tNSLIJ:DM:IM:Vacation\tNSLIJ:DM:IM:Vacation
Achuonjei, Joy\tPGY-1\tNSLIJ:DM:PALL:El-Pall-LIJ\tNSLIJ:DM:PALL:El-Pall-LIJ\tNSLIJ:DM:PALL:El-Pall-LIJ\tNSLIJ:DM:PALL:El-Pall-LIJ\tNSLIJ:DM:PALL:El-Pall-LIJ\tNSLIJ:DM:PALL:El-Pall-LIJ\tNSLIJ:DM:GI:El-Hep-LIJ\tNSLIJ:DM:GI:El-Hep-LIJ\tNSLIJ:DM:GI:El-Hep-LIJ\tNSLIJ:DM:GI:El-Hep-LIJ\tNSLIJ:DM:GI:El-Hep-LIJ\tNSLIJ:DM:GI:El-Hep-LIJ\tNSLIJ:DM:GI:El-Hep-LIJ\tNSLIJ:DM:IM:Team-LIJ-4-L\tNSLIJ:DM:IM:Team-LIJ-4-S\tNSLIJ:DM:IM:Team-LIJ-4-L\tNSLIJ:DM:IM:Team-LIJ-4-S\tNSLIJ:DM:IM:Team-LIJ-4-S\tOFF\tNSLIJ:DM:IM:Team-LIJ-4-L\tNSLIJ:DM:IM:Team-LIJ-4-S\tNSLIJ:DM:IM:Team-LIJ-4-L\tNSLIJ:DM:IM:Team-LIJ-4-S\tNSLIJ:DM:IM:Team-LIJ-4-L\tNSLIJ:DM:IM:Team-LIJ-4-S\tOFF\tNSLIJ:DM:IM:Team-LIJ-4-S\tNSLIJ:DM:IM:NF-LIJ\tNSLIJ:DM:IM:NF-LIJ\tNSLIJ:DM:IM:NF-LIJ\tNSLIJ:DM:IM:NF-LIJ\tNSLIJ:DM:IM:NF-LIJ\tNSLIJ:DM:IM:NF-LIJ\tNSLIJ:DM:IM:NF-LIJ\tNSLIJ:DM:IM:NF-NS\tNSLIJ:DM:IM:NF-NS\tNSLIJ:DM:IM:NF-NS\tNSLIJ:DM:IM:NF-NS\tNSLIJ:DM:IM:NF-NS\tNSLIJ:DM:IM:NF-NS\tNSLIJ:DM:IM:NF-NS\tNSLIJ:DM:IM:Vacation\tNSLIJ:DM:IM:Vacation\tNSLIJ:DM:IM:Vacation\tNSLIJ:DM:IM:Vacation\tNSLIJ:DM:IM:Vacation\tNSLIJ:DM:IM:Vacation\tNSLIJ:DM:IM:Vacation\tNSLIJ:DM:IM:Clinic-865\tNSLIJ:DM:IM:Clinic-865\tNSLIJ:DM:IM:Clinic-865\tNSLIJ:DM:IM:Clinic-865\tNSLIJ:DM:IM:Clinic-865\tNSLIJ:DM:IM:Clinic-865\tNSLIJ:DM:IM:Clinic-865\tELECTIVE_NSUH\tELECTIVE_NSUH\tELECTIVE_NSUH\tELECTIVE_NSUH\tELECTIVE_NSUH\tELECTIVE_NSUH\tELECTIVE_NSUH
Annesi, Thomas\tPGY-1\tNSLIJ:DM:IM:Team-NS-3-S\tNSLIJ:DM:IM:Team-NS-3-S\tNSLIJ:DM:IM:Team-NS-3-L\tNSLIJ:DM:IM:Team-NS-3-S\tNSLIJ:DM:IM:Team-NS-3-S\tOFF\tNSLIJ:DM:IM:Team-NS-3-L\tNSLIJ:DM:IM:Team-NS-3-S\tNSLIJ:DM:IM:Team-NS-3-L\tNSLIJ:DM:IM:Team-NS-3-S\tNSLIJ:DM:IM:Team-NS-3-L\tNSLIJ:DM:IM:Team-NS-3-S\tOFF\tOFF\tNSLIJ:DM:IM:Team-NS-3-L\tNSLIJ:DM:IM:Team-NS-3-S\tNSLIJ:DM:IM:Team-NS-3-L\tNSLIJ:DM:IM:Team-NS-3-S\tNSLIJ:DM:IM:Team-NS-3-L\tNSLIJ:DM:IM:Team-NS-3-S\tDPEDS:AI:El-AI\tNSLIJ:DM:IM:Team-NS-8-L\tDPEDS:AI:El-AI\tDPEDS:AI:El-AI\tDPEDS:AI:El-AI\tDPEDS:AI:El-AI\tDPEDS:AI:El-AI\tDPEDS:AI:El-AI\tDPEDS:AI:El-AI\tDPEDS:AI:El-AI\tDPEDS:AI:El-AI\tDPEDS:AI:El-AI\tDPEDS:AI:El-AI\tDPEDS:AI:El-AI\tNSLIJ:DM:IM:Clinic-865\tNSLIJ:DM:IM:Clinic-865\tNSLIJ:DM:IM:Clinic-865\tNSLIJ:DM:IM:Clinic-865\tNSLIJ:DM:IM:Clinic-865\tNSLIJ:DM:IM:Clinic-865\tNSLIJ:DM:IM:Clinic-865\tNSLIJ:DM:IM:NF-LIJ\tNSLIJ:DM:IM:NF-LIJ\tNSLIJ:DM:IM:NF-LIJ\tNSLIJ:DM:IM:NF-LIJ\tNSLIJ:DM:IM:NF-LIJ\tNSLIJ:DM:IM:NF-LIJ\tNSLIJ:DM:IM:NF-LIJ\tNSLIJ:DM:IM:NF-NS\tNSLIJ:DM:IM:NF-NS\tNSLIJ:DM:IM:NF-NS\tNSLIJ:DM:IM:NF-NS\tNSLIJ:DM:IM:NF-NS\tNSLIJ:DM:IM:NF-NS\tNSLIJ:DM:IM:NF-NS\tNSLIJ:DM:PULM:MICU-NS-G1-L\tNSLIJ:DM:PULM:MICU-NS-G1-Sh\tNSLIJ:DM:PULM:MICU-NS-G1-L\tNSLIJ:DM:PULM:MICU-NS-G1-Sh\tNSLIJ:DM:PULM:MICU-NS-G1-L\tOFF
Babadzhanov, Marianna\tPGY-1\tNSLIJ:DM:IM:Clinic-865\tNSLIJ:DM:IM:Clinic-865\tNSLIJ:DM:IM:Clinic-865\tNSLIJ:DM:IM:Clinic-865\tNSLIJ:DM:IM:Clinic-865\tNSLIJ:DM:IM:Clinic-865\tNSLIJ:DM:IM:NF-NS\tNSLIJ:DM:IM:NF-NS\tNSLIJ:DM:IM:NF-NS\tNSLIJ:DM:IM:NF-NS\tNSLIJ:DM:IM:NF-NS\tNSLIJ:DM:IM:NF-NS\tNSLIJ:DM:IM:NF-NS\tNSLIJ:DM:IM:NF-NS\tNSLIJ:DM:IM:NF-NS\tNSLIJ:DM:IM:NF-NS\tNSLIJ:DM:IM:NF-NS\tNSLIJ:DM:IM:NF-NS\tNSLIJ:DM:IM:NF-NS\tNSLIJ:DM:IM:NF-NS\tOFF\tNSLIJ:DM:PULM:MICU-LIJ-N\tOFF\tNSLIJ:DM:PULM:MICU-LIJ-N\tNSLIJ:DM:PULM:MICU-LIJ-N\tNSLIJ:DM:PULM:MICU-LIJ-N\tNSLIJ:DM:PULM:MICU-LIJ-N\tMICU-LIJ-Shw-PM\tOFF\tMICU-LIJ-Shw-PM\tOFF\tOFF\tMICU-LIJ-Shw-Y\tMICU-LIJ-Shw-G\tNSLIJ:DM:IM:Team-LIJ-8-L\tNSLIJ:DM:IM:Team-LIJ-8-S\tNSLIJ:DM:IM:Team-LIJ-8-L\tNSLIJ:DM:IM:Team-LIJ-8-S\tNSLIJ:DM:IM:Team-LIJ-8-L\tOFF\tNSLIJ:DM:IM:Team-LIJ-8-L\tNSLIJ:DM:IM:Team-LIJ-8-S\tNSLIJ:DM:IM:Team-LIJ-8-L\tNSLIJ:DM:IM:Team-LIJ-8-S\tNSLIJ:DM:IM:Team-LIJ-8-L\tNSLIJ:DM:IM:Team-LIJ-8-S\tOFF\tNSLIJ:DM:IM:Team-LIJ-8-S\tNSLIJ:DM:IM:Vacation\tNSLIJ:DM:IM:Vacation\tNSLIJ:DM:IM:Vacation\tNSLIJ:DM:IM:Vacation\tNSLIJ:DM:IM:Vacation\tNSLIJ:DM:IM:Vacation\tNSLIJ:DM:IM:Vacation\tNSLIJ:DM:ID:El-ID-LIJ\tNSLIJ:DM:ID:El-ID-LIJ\tNSLIJ:DM:ID:El-ID-LIJ\tNSLIJ:DM:ID:El-ID-LIJ\tNSLIJ:DM:ID:El-ID-LIJ\tNSLIJ:DM:ID:El-ID-LIJ\tNSLIJ:DM:ID:El-ID-LIJ
Bevagna, Holly\tPGY-1\tNSLIJ:DM:IM:Vacation\tNSLIJ:DM:IM:Vacation\tNSLIJ:DM:IM:Vacation\tNSLIJ:DM:IM:Vacation\tNSLIJ:DM:IM:Vacation\tNSLIJ:DM:IM:Vacation\tOFF\tNSLIJ:DM:PULM:MICU-LIJ-N\tOFF\tNSLIJ:DM:PULM:MICU-LIJ-N\tNSLIJ:DM:PULM:MICU-LIJ-N\tNSLIJ:DM:PULM:MICU-LIJ-N\tNSLIJ:DM:PULM:MICU-LIJ-N\tMICU-LIJ-Shw-PM\tOFF\tMICU-LIJ-Shw-PM\tOFF\tOFF\tMICU-LIJ-Shw-Y\tMICU-LIJ-Shw-G\tNSLIJ:DM:IM:Clinic-865\tNSLIJ:DM:IM:Clinic-865\tNSLIJ:DM:IM:Clinic-865\tNSLIJ:DM:IM:Clinic-865\tNSLIJ:DM:IM:Clinic-865\tNSLIJ:DM:IM:Clinic-865\tNSLIJ:DM:IM:Clinic-865\tNSLIJ:DM:IM:Team-LIJ-6-L\tNSLIJ:DM:IM:Team-LIJ-6-S\tNSLIJ:DM:IM:Team-LIJ-6-L\tNSLIJ:DM:IM:Team-LIJ-6-S\tNSLIJ:DM:IM:Team-LIJ-6-L\tOFF\tNSLIJ:DM:IM:Team-LIJ-6-L\tNSLIJ:DM:IM:Team-LIJ-6-S\tNSLIJ:DM:IM:Team-LIJ-6-L\tNSLIJ:DM:IM:Team-LIJ-6-S\tNSLIJ:DM:IM:Team-LIJ-6-L\tNSLIJ:DM:IM:Team-LIJ-6-S\tOFF\tNSLIJ:DM:IM:Team-LIJ-6-S\tNSLIJ:DM:IM:Team-NS-5-L\tNSLIJ:DM:IM:Team-NS-5-S\tNSLIJ:DM:IM:Team-NS-5-L\tNSLIJ:DM:IM:Team-NS-5-S\tNSLIJ:DM:IM:Team-NS-5-L\tOFF\tNSLIJ:DM:IM:Team-NS-5-L\tNSLIJ:DM:IM:Team-NS-5-S\tNSLIJ:DM:IM:Team-NS-5-L\tNSLIJ:DM:IM:Team-NS-5-S\tNSLIJ:DM:IM:Team-NS-5-L\tNSLIJ:DM:IM:Team-NS-5-S\tOFF\tNSLIJ:DM:IM:Team-NS-5-S\tNSLIJ:DM:IM:Team-NS-5-L\tNSLIJ:DM:IM:Team-NS-5-S\tNSLIJ:DM:IM:Team-NS-5-L\tNSLIJ:DM:IM:Team-NS-5-L\tNSLIJ:DM:IM:Team-NS-5-L`;

/**
 * Basic demo schedule HTML string.
 * Used for quick testing and demonstration purposes.
 */
export const demoScheduleHTML = `
<table border="1">
  <tr>
    <th>Resident</th>
    <th>Mon 5/1</th>
    <th>Tue 5/2</th>
    </tr>
  <tr>
    <td>Bulsara, Kishen</td>
    <td>NSLIJ:DM:IM:Team-NS-2-S</td>
    <td>NSLIJ:DM:IM:Team-NS-2-S</td>
    </tr>
  </table>
`;

/**
 * Placeholder for demo PGY data.
 * Structure: { "Resident Name": PGYLevel, ... }
 * This should be replaced with actual PGY data corresponding to the schedule.
 */
export const demoPGYData: { [name: string]: PGYLevel } = {
  // Example (replace with actual data matching demoScheduleHTML or your actual schedule):
  // "Bulsara, Kishen": 2,
  // ...
};

// --- Helper Functions ---

/**
 * Function to get the classification details for a specific assignment code.
 * Handles prefix matching based on the keys in assignmentClassification.
 * Prioritizes longer matches first.
 *
 * @param {string} assignmentCode - The assignment code from the schedule (e.g., "NSLIJ:DM:IM:Team-NS-2-S").
 * @returns {AssignmentDetails} The details object for the assignment, or a default 'TBD' object if no match found.
 */
export function getAssignmentDetails(
  assignmentCode: string | null | undefined,
): AssignmentDetails {
  // Handle empty, null, or undefined codes gracefully
  if (!assignmentCode) {
    // Return a default object for 'OFF' or similar if empty cells should be treated as OFF
    // Or return a specific 'Empty' status if needed
    return {
      type: "Status",
      swappable: "No",
      notes: "Empty or invalid assignment code",
    };
  }

  // Trim whitespace which might exist in HTML table cells
  const trimmedCode = assignmentCode.trim();
  if (!trimmedCode) {
    return {
      type: "Status",
      swappable: "No",
      notes: "Empty or whitespace assignment code",
    };
  }

  // Get keys and sort by length descending to prioritize specific matches
  const patterns = Object.keys(assignmentClassification).sort(
    (a, b) => b.length - a.length,
  );

  for (const pattern of patterns) {
    // 1. Check for exact match first (most specific)
    if (trimmedCode === pattern) {
      return assignmentClassification[pattern];
    }
    // 2. Check for prefix match if pattern ends with '-'
    if (pattern.endsWith("-") && trimmedCode.startsWith(pattern.slice(0, -1))) {
      // Add extra checks here if a more specific non-prefix rule exists that might
      // otherwise be caught by this prefix rule.
      // Example: if "NSLIJ:DM:IM:Team-Special" existed with different rules than "NSLIJ:DM:IM:Team-"
      // if (pattern === "NSLIJ:DM:IM:Team-" && trimmedCode === "NSLIJ:DM:IM:Team-Special") continue;

      return assignmentClassification[pattern];
    }
  }

  // Default if no pattern matches
  console.warn(
    `No classification found for assignment code: "${trimmedCode}". Defaulting to TBD.`,
  );
  return {
    type: "TBD",
    swappable: "No", // Default to non-swappable if unknown
    notes: "Unknown assignment code - needs classification.",
  };
}
