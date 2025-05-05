/**
 * This file provides user-friendly interpretations for schedule assignment codes
 */

type AssignmentInterpretation = {
  pattern: string;
  label: string;
  extractNumber?: boolean; // Whether to extract a number from the code
};

/**
 * Mapping of assignment code patterns to their user-friendly interpretations
 */
export const assignmentMappings: AssignmentInterpretation[] = [
  // Basic statuses
  { pattern: "OFF", label: "OFF" },
  { pattern: "NSLIJ:DM:IM:Vacation", label: "Vacation" },
  { pattern: "NSLIJ:DM:IM:LOA-Medical", label: "LOA (Medical)" },
  { pattern: "NSLIJ:DM:IM:Clinic-", label: "Clinic", extractNumber: true },
  { pattern: "NSLIJ:DM:IM:Board-Prep", label: "Board Prep" },
  
  // ICU rotations
  { pattern: "NSLIJ:DM:PULM:MICU-LIJ-N", label: "LIJ MICU Night" },
  { pattern: "NSLIJ:DM:PULM:MICU-LIJ-Sw-PM", label: "LIJ MICU Swing Night" },
  { pattern: "NSLIJ:DM:PULM:MICU-LIJ-Sw-G", label: "LIJ MICU Swing Green" },
  { pattern: "NSLIJ:DM:PULM:MICU-LIJ-Sw-Y", label: "LIJ MICU Swing Yellow" },
  { pattern: "NSLIJ:DM:PULM:MICU-LIJ-G2-Sh", label: "LIJ MICU Green 2 Short" },
  { pattern: "NSLIJ:DM:PULM:MICU-LIJ-G2-L", label: "LIJ MICU Green 2 Long" },
  { pattern: "NSLIJ:DM:PULM:MICU-NS-N", label: "NS MICU Night" },
  { pattern: "NSLIJ:DM:PULM:MICU-NS-Sw-PM", label: "NS MICU Swing Night" },
  { pattern: "NSLIJ:DM:PULM:MICU-NS-Sw-G", label: "NS MICU Swing Green" },
  { pattern: "NSLIJ:DM:PULM:MICU-NS-Sw-Y", label: "NS MICU Swing Yellow" },
  { pattern: "NSLIJ:DM:PULM:MICU-NS-G2-Sh", label: "NS MICU Green 2 Short" },
  { pattern: "NSLIJ:DM:PULM:MICU-NS-G2-L", label: "NS MICU Green 2 Long" },
  { pattern: "NSLIJ:DM:PULM:MICU-NS-Y2-Sh", label: "NS MICU Yellow 2 Short" },
  { pattern: "NSLIJ:DM:PULM:MICU-NS-Y2-L", label: "NS MICU Yellow 2 Long" },
  
  // Teams
  { pattern: "NSLIJ:DM:IM:Team-NS-S", label: "NS Team", extractNumber: true },
  { pattern: "NSLIJ:DM:IM:Team-NS-L", label: "NS Team", extractNumber: true },
  { pattern: "NSLIJ:DM:IM:Team-NS-SO", label: "NS Team", extractNumber: true },
  { pattern: "NSLIJ:DM:IM:Team-LIJ-S", label: "LIJ Team", extractNumber: true },
  { pattern: "NSLIJ:DM:IM:Team-LIJ-L", label: "LIJ Team", extractNumber: true },
  { pattern: "NSLIJ:DM:IM:Team-LIJ-SO", label: "LIJ Team", extractNumber: true },
  
  // Medicine Admitting Resident (MAR)
  { pattern: "NSLIJ:DM:IM:MAR-NS-AM", label: "NS MAR Days" },
  { pattern: "NSLIJ:DM:IM:MAR-NS-PM", label: "NS MAR Nights" },
  { pattern: "NSLIJ:DM:IM:MAR-NS-Sw-AM", label: "NS MAR Swing Days" },
  { pattern: "NSLIJ:DM:IM:MAR-NS-Sw-PM", label: "NS MAR Swing Nights" },
  { pattern: "NSLIJ:DM:IM:MAR-LIJ-AM", label: "LIJ MAR Days" },
  { pattern: "NSLIJ:DM:IM:MAR-LIJ-PM", label: "LIJ MAR Nights" },
  { pattern: "NSLIJ:DM:IM:MAR-LIJ-Sw-AM", label: "LIJ MAR Swing Days" },
  { pattern: "NSLIJ:DM:IM:MAR-LIJ-Sw-PM", label: "LIJ MAR Swing Nights" },
  
  // Neurology
  { pattern: "DN:Neuro", label: "Neuro" },
  { pattern: "DN:Neuro-Consult", label: "Neuro Consult" },
  
  // Administrative
  { pattern: "NSLIJ:DM:IM:Chief", label: "Chief Duty" },
  
  // Electives
  { pattern: "El-Research", label: "Research Elective" },
  { pattern: "EI-Pulm-LIJ", label: "LIJ Pulm Elective" },
  { pattern: "EI-Pulm-NS", label: "NS Pulm Elective" },
  { pattern: "EI-Rheum-LIJ", label: "LIJ Rheum Elective" },
  { pattern: "EI-Rheum-NS", label: "NS Rheum Elective" },
  { pattern: "EI-Endo-LIJ", label: "LIJ Endo Elective" },
  { pattern: "EI-Endo-NS", label: "NS Endo Elective" },
  { pattern: "EI-Renal-LIJ", label: "LIJ Renal Elective" },
  { pattern: "EI-Renal-NS", label: "NS Renal Elective" },
  { pattern: "EI-US-NS", label: "NS Ultrasound Elective" },
  
  // Cardiology
  { pattern: "CARD:El-Cards-LIJ", label: "LIJ Cards Elective" },
  { pattern: "CARD:El-Cards-Ep", label: "Cards EP Elective" },
  { pattern: "CARD:El-Cath", label: "Cards Cath Elective" },
  { pattern: "CARD:CCU-NS-D", label: "NS CCU (Day)" },
  
  // International and special rotations
  { pattern: "NSLIJ:DM:IM:Uganda", label: "Uganda Elective" },
  
  // Specialized departments
  { pattern: "NSLIJ:DM:GERI:El-Geri", label: "Geri Elective" },
  { pattern: "NSLIJ:DM:GI:El-GI-LIJ", label: "LIJ GI Elective" },
  { pattern: "NSLIJ:DM:GI:El-GI-NS", label: "NS GI Elective" },
  { pattern: "NSLIJ:DM:HO:El-HemOnc-NS", label: "NS Hem/Onc Elective" },
  { pattern: "NSLIJ:DM:ID:El-ID-NS", label: "NS ID Elective" },
  { pattern: "NSLIJ:DM:IM:El-Procedure-LIJ", label: "LIJ Procedure Elective" },
  { pattern: "NSLIJ:DM:IM:El-Pri-Care", label: "Primary Care Elective" },
  { pattern: "NSLIJ:DM:IM:Valley-Stream-...", label: "Valley Stream Pulm Elective" },
  { pattern: "NSLIJ:DM:PULM:El-Pulm-NS", label: "NS Pulm Elective" },
  
  // Generic pattern matching for common prefixes
  { pattern: "NSLIJ:DM:", label: "NSLIJ DM" },
  { pattern: "CARD:", label: "Cardiology" },
  { pattern: "El-", label: "Elective" }
];

/**
 * Gets a user-friendly label for an assignment code
 * 
 * @param assignmentCode The raw assignment code from the schedule
 * @returns A user-friendly label for display
 */
export function getUserFriendlyLabel(assignmentCode: string): string {
  if (!assignmentCode) return assignmentCode;
  
  const trimmedCode = assignmentCode.trim();
  
  for (const mapping of assignmentMappings) {
    // Exact match
    if (trimmedCode === mapping.pattern) {
      return mapping.label;
    }
    
    // Prefix match
    if (trimmedCode.startsWith(mapping.pattern)) {
      if (mapping.extractNumber) {
        // Extract the team number and append it to the label
        const match = trimmedCode.match(/(\d+)(?:-[SL]O?)?$/);
        if (match && match[1]) {
          return `${mapping.label} ${match[1]}${getShortLongSuffix(trimmedCode)}`;
        }
      }
      return mapping.label;
    }
  }
  
  // If no match, return the original code
  return assignmentCode;
}

/**
 * Extracts the short/long suffix from the assignment code
 */
function getShortLongSuffix(code: string): string {
  if (code.endsWith("-S") || code.endsWith("-SO")) {
    return " (Short)";
  } else if (code.endsWith("-L")) {
    return " (Long)";
  }
  return "";
}