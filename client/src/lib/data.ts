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
 * Assignment classification rules for determining type and swappability
 */
export const assignmentClassification: AssignmentClassification = {
  // Basic status assignments
  "OFF": { type: "Status", swappable: "Yes", notes: "Regular day off" },
  "0": { type: "Status", swappable: "Yes", notes: "Day off (alternative notation)" },
  
  // Leave and vacation
  "NSLIJ:DM:IM:Vacation": { type: "Status", swappable: "Yes", notes: "Vacation time" },
  "NSLIJ:DM:IM:LOA-Medical": { type: "Admin", swappable: "No", notes: "Medical leave of absence" },
  "Paternity": { type: "Admin", swappable: "No", notes: "Paternity leave" },
  
  // Administrative assignments
  "NSLIJ:DM:IM:Chief": { type: "Admin", swappable: "No", notes: "Chief duty" },
  "NSLIJ:DM:IM:Advocacy": { type: "Admin", swappable: "No", notes: "Advocacy work" },
  "NSLIJ:DM:IM:Board-Prep": { type: "Elective", swappable: "Yes", pgyRules: "PGY3 only", notes: "Board preparation" },
  
  // Required rotations
  "NSLIJ:DM:IM:Team-": { type: "Required", swappable: "Yes", notes: "Internal medicine team rotation" },
  "NSLIJ:DM:IM:MAR-": { type: "Required", swappable: "Yes", pgyRules: "PGY3 only", notes: "MAR duty rotation" },
  "NSLIJ:DM:IM:NF-": { type: "Required", swappable: "Yes", notes: "Night float" },
  "NSLIJ:DM:IM:Night-Ad-": { type: "Required", swappable: "Yes", notes: "Night admin" },
  
  // MICU assignments
  "NSLIJ:DM:PULM:MICU-": { type: "Required", swappable: "Yes", notes: "Medical ICU rotation" },
  "MICU-": { type: "Required", swappable: "Yes", notes: "Medical ICU rotation (short form)" },
  
  // Clinic assignments (marked as non-swappable by default but type allows some swaps)
  "NSLIJ:DM:IM:Clinic-": { type: "Clinic", swappable: "No", notes: "Clinic assignment" },
  
  // Elective assignments - general patterns first, then specific ones
  "El-": { type: "Elective", swappable: "Yes", notes: "General elective" },
  "EI-": { type: "Elective", swappable: "Yes", notes: "Elective internal medicine" },
  
  // Specific electives
  "NSLIJ:DM:PULM:El-US-LIJ": { type: "Elective", swappable: "Yes", notes: "LIJ US Elective" },
  "NSLIJ:DM:NEPH:El-Renal-LIJ": { type: "Elective", swappable: "Yes", notes: "LIJ Nephro Elective" },
  "NSLIJ:DM:NEPH:El-Renal-NS": { type: "Elective", swappable: "Yes", notes: "NS Nephro Elective" },
  "NSLIJ:DM:ENDO:El-Endo-LIJ": { type: "Elective", swappable: "Yes", notes: "LIJ Endo Elective" },
  "NSLIJ:DM:PULM:El-US-NS": { type: "Elective", swappable: "Yes", notes: "NS US Elective" },
  "NSLIJ:DM:PULM:El-Sleep-NS": { type: "Elective", swappable: "Yes", notes: "NS Sleep Elective" },
  "NSLIJ:DM:PULM:El-Pulm-NS": { type: "Elective", swappable: "Yes", notes: "NS Pulm Elective" },
  "NSLIJ:DM:PULM:El-Pulm-LIJ": { type: "Elective", swappable: "Yes", notes: "LIJ Pulm Elective" },
  "NSLIJ:DM:ID:El-ID-LIJ": { type: "Elective", swappable: "Yes", notes: "LIJ ID Elective" },
  "NSLIJ:DM:ID:El-ID-NS": { type: "Elective", swappable: "Yes", notes: "NS ID Elective" },
  "NSLIJ:DM:GI:El-Hep-NS": { type: "Elective", swappable: "Yes", notes: "NS Hepatology Elective" },
  "NSLIJ:DM:GI:El-Hep-LIJ": { type: "Elective", swappable: "Yes", notes: "LIJ Hepatology Elective" },
  "NSLIJ:DM:GI:El-GI-LIJ": { type: "Elective", swappable: "Yes", notes: "LIJ GI Elective" },
  "NSLIJ:DM:GI:El-GI-NS": { type: "Elective", swappable: "Yes", notes: "NS GI Elective" },
  "NSLIJ:DM:HO:El-HemOnc-NS": { type: "Elective", swappable: "Yes", notes: "NS Hem/Onc Elective" },
  "NSLIJ:DM:HO:El-HemOnc-LIJ": { type: "Elective", swappable: "Yes", notes: "LIJ Hem/Onc Elective" },
  "NSLIJ:DM:IM:El-Procedure-LIJ": { type: "Elective", swappable: "Yes", notes: "LIJ Procedure Elective" },
  "NSLIJ:DM:IM:El-Pri-Care": { type: "Elective", swappable: "Yes", notes: "Primary Care Elective" },
  "NSLIJ:DM:IM:El-Rheum-LIJ": { type: "Elective", swappable: "Yes", notes: "LIJ Rheum Elective" },
  "NSLIJ:DM:GERI:El-Geri": { type: "Elective", swappable: "Yes", notes: "Geri Elective" },
  "NSLIJ:DM:PALL:El-Pall-NSUH": { type: "Elective", swappable: "Yes", notes: "NSUH Palliative Care Elective" },
  "NSLIJ:DM:IM:Uganda": { type: "Elective", swappable: "Yes", notes: "Uganda Elective" },
  
  // Cardiology
  "CARD:El-": { type: "Elective", swappable: "Yes", notes: "Cardiology elective" },
  "CARD:CCU-": { type: "Required", swappable: "Yes", notes: "Coronary care unit" },
  
  // Emergency department
  "NSLIJ:DE:ER-": { type: "Required", swappable: "Yes", notes: "Emergency department" },
  "ER:ER-": { type: "Required", swappable: "Yes", notes: "Emergency department (short form)" },
  
  // Subspecialty required rotations
  "DN:Neuro": { type: "Required", swappable: "Yes", notes: "Neurology rotation" },
  "DN:Neuro-Consult": { type: "Required", swappable: "Yes", notes: "Neurology consult service" },
  "ENT": { type: "Required", swappable: "Yes", notes: "ENT rotation" },
  
  // Research and other special assignments
  "El-Research": { type: "Elective", swappable: "Yes", notes: "Research elective" },
  "DPEDS:AI:El-AI": { type: "Elective", swappable: "Yes", notes: "AI Elective" },
  "Anesthesia:El-Anesthesia": { type: "Elective", swappable: "Yes", notes: "Anesthesia Elective" }
};



/**
 * Default schedule data in JSON format for loading as the baseline schedule.
 * This is the schedule data that will be shown if users don't upload their own.
 */
// Import the default schedule data from JSON file
import defaultScheduleDataJSON from './defaultScheduleData.json';

// Export it for use in the application - use type assertion to avoid strict typing issues
// This allows us to use any array of objects with the needed properties
export const defaultScheduleJSON = defaultScheduleDataJSON as any[];

/**
 * This is backward compatibility for the old tab-delimited format
 * Generated from the defaultScheduleJSON data
 */
export const defaultScheduleData = (() => {
  const headers = ['Name', 'PGY Level'];
  const dateHeaders: string[] = [];
  
  // Get all date headers from the first resident
  if (defaultScheduleJSON.length > 0) {
    Object.keys(defaultScheduleJSON[0]).forEach(key => {
      if (key !== 'Name' && key !== 'PGY Level') {
        dateHeaders.push(key);
      }
    });
  }
  
  // Add date headers to main headers array
  headers.push(...dateHeaders);
  
  // Convert headers to tab-delimited format
  let result = headers.join('\t') + '\n';
  
  // Add each resident's data
  defaultScheduleJSON.forEach(resident => {
    const rowData = [resident['Name'], resident['PGY Level']];
    
    // Add each date's data
    dateHeaders.forEach(date => {
      // Type safe access with key indexing
      const value = date in resident ? (resident as any)[date] : '';
      rowData.push(value || '');
    });
    
    result += rowData.join('\t') + '\n';
  });
  
  return result.trim();
})();

/**
 * Placeholder for demo schedule HTML string.
 * This should be replaced with the actual HTML table string or loaded dynamically.
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
  "Achuonjei, Joy": 1 as PGYLevel,
  "Annesi, Thomas": 2 as PGYLevel,
  "Babadzhanov, Marianna": 3 as PGYLevel,
  "Bevagna, Holly": 1 as PGYLevel,
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
