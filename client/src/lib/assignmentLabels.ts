/**
 * This file provides user-friendly interpretations for schedule assignment codes
 */

type AssignmentInterpretation = {
  pattern: string; // The code or prefix to match
  label: string; // The user-friendly label
  isPrefix?: boolean; // Indicates if this is a prefix match
  extractSuffix?: "Team" | "Clinic"; // Specifies special suffix handling
};

// --- Mappings ---
// ORDER MATTERS: More specific patterns must come before less specific ones.
// Exact matches first, then longer prefixes, then shorter prefixes.
export const assignmentMappings: AssignmentInterpretation[] = [
  // --- Exact Matches (Most Specific First) ---
  { pattern: "OFF", label: "OFF" },
  { pattern: "NSLIJ:DM:IM:Vacation", label: "Vacation" },
  { pattern: "NSLIJ:DM:IM:LOA-Medical", label: "LOA (Medical)" },
  { pattern: "NSLIJ:DM:IM:Board-Prep", label: "Board Prep" },
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
  // Specific Team patterns need to be matched before the generic Team prefix
  {
    pattern: "NSLIJ:DM:IM:Team-NS-S",
    label: "NS Team [Num] Short",
    isPrefix: true,
    extractSuffix: "Team",
  }, // Placeholder, handled by prefix below if number varies
  {
    pattern: "NSLIJ:DM:IM:Team-NS-L",
    label: "NS Team [Num] Long",
    isPrefix: true,
    extractSuffix: "Team",
  }, // Placeholder, handled by prefix below if number varies
  {
    pattern: "NSLIJ:DM:IM:Team-NS-SO",
    label: "NS Team [Num] Short (SO typo)",
    isPrefix: true,
    extractSuffix: "Team",
  }, // Placeholder, handled by prefix below if number varies
  {
    pattern: "NSLIJ:DM:IM:Team-LIJ-S",
    label: "LIJ Team [Num] Short",
    isPrefix: true,
    extractSuffix: "Team",
  }, // Placeholder, handled by prefix below if number varies
  {
    pattern: "NSLIJ:DM:IM:Team-LIJ-L",
    label: "LIJ Team [Num] Long",
    isPrefix: true,
    extractSuffix: "Team",
  }, // Placeholder, handled by prefix below if number varies
  {
    pattern: "NSLIJ:DM:IM:Team-LIJ-SO",
    label: "LIJ Team [Num] Short (SO typo)",
    isPrefix: true,
    extractSuffix: "Team",
  }, // Placeholder, handled by prefix below if number varies
  { pattern: "NSLIJ:DM:IM:MAR-NS-AM", label: "NS MAR Days" },
  { pattern: "NSLIJ:DM:IM:MAR-NS-PM", label: "NS MAR Nights" },
  { pattern: "NSLIJ:DM:IM:MAR-NS-Sw-AM", label: "NS MAR Swing Days" },
  { pattern: "NSLIJ:DM:IM:MAR-NS-Sw-PM", label: "NS MAR Swing Nights" },
  { pattern: "NSLIJ:DM:IM:MAR-LIJ-AM", label: "LIJ MAR Days" },
  { pattern: "NSLIJ:DM:IM:MAR-LIJ-PM", label: "LIJ MAR Nights" },
  { pattern: "NSLIJ:DM:IM:MAR-LIJ-Sw-AM", label: "LIJ MAR Swing Days" },
  { pattern: "NSLIJ:DM:IM:MAR-LIJ-Sw-PM", label: "LIJ MAR Swing Nights" },
  { pattern: "DN:Neuro", label: "Neuro" }, // Exact match before prefix
  { pattern: "DN:Neuro-Consult", label: "Neuro Consult" },
  { pattern: "ENT", label: "ENT" },
  { pattern: "NSLIJ:DM:IM:Chief", label: "Chief Duty" },
  { pattern: "NSLIJ:DM:IM:Night-Ad-LIJ", label: "LIJ Night Admin" },
  { pattern: "NSLIJ:DM:IM:Night-Ad-NS", label: "NS Night Admin" },
  { pattern: "NSLIJ:DM:IM:Advocacy", label: "Advocacy" },
  { pattern: "NSLIJ:DM:IM:NF-LIJ", label: "LIJ Night Float" },
  { pattern: "NSLIJ:DM:IM:NF-NS", label: "NS Night Float" },
  { pattern: "NSLIJ:DM:ID:El-ID-LIJ", label: "LIJ ID Elective" },
  { pattern: "NSLIJ:DM:ID:El-ID-NS", label: "NS ID Elective" },
  { pattern: "NSLIJ:DM:GI:El-Hep-NS", label: "NS Hepatology Elective" },
  { pattern: "NSLIJ:DM:GI:El-Hep-LIJ", label: "LIJ Hepatology Elective" },
  { pattern: "NSLIJ:DM:PULM:El-US-NS", label: "NS US Elective" },
  { pattern: "NSLIJ:DM:PULM:El-Sleep-NS", label: "NS Sleep Elective" },
  { pattern: "NSLIJ:DM:PALL:El-Pall-NSUH", label: "NSUH Palliative Care Elective" },
  { pattern: "NSLIJ:DE:ER-LIJ", label: "LIJ ER" },
  { pattern: "NSLIJ:DE:ER-NS", label: "NS ER" },
  { pattern: "ER:ER-LIJ", label: "LIJ ER" },
  { pattern: "DPEDS:AI:El-AI", label: "AI Elective" },
  { pattern: "MICU-NS-Shw-PM", label: "NS MICU Swing Night" },
  { pattern: "MICU-NS-Shw-Y", label: "NS MICU Swing Yellow" },
  { pattern: "MICU-LIJ-Shw-PM", label: "LIJ MICU Swing Night" },
  { pattern: "MICU-LIJ-Shw-Y", label: "LIJ MICU Swing Yellow" },
  { pattern: "MICU-LIJ-Shw-G", label: "LIJ MICU Swing Green" },
  { pattern: "0", label: "Off" },
  { pattern: "El-Research", label: "Research Elective" }, // Specific electives before generic El-
  { pattern: "EI-Pulm-LIJ", label: "LIJ Pulm Elective" },
  { pattern: "EI-Pulm-NS", label: "NS Pulm Elective" },
  { pattern: "EI-Rheum-LIJ", label: "LIJ Rheum Elective" },
  { pattern: "EI-Rheum-NS", label: "NS Rheum Elective" },
  { pattern: "NSLIJ:DM:IM:El-Rheum-LIJ", label: "LIJ Rheum Elective" },
  { pattern: "EI-Endo-LIJ", label: "LIJ Endo Elective" },
  { pattern: "EI-Endo-NS", label: "NS Endo Elective" },
  { pattern: "EI-Renal-LIJ", label: "LIJ Renal Elective" },
  { pattern: "EI-Renal-NS", label: "NS Renal Elective" },
  { pattern: "EI-US-NS", label: "NS Ultrasound Elective" },
  { pattern: "CARD:El-Cards-LIJ", label: "LIJ Cards Elective" },
  { pattern: "CARD:El-Cards-Ep", label: "Cards EP Elective" },
  { pattern: "CARD:El-Cath", label: "Cards Cath Elective" },
  { pattern: "CARD:CCU-NS-D", label: "NS CCU (Day)" },
  { pattern: "NSLIJ:DM:IM:Uganda", label: "Uganda Elective" },
  { pattern: "NSLIJ:DM:GERI:El-Geri", label: "Geri Elective" },
  { pattern: "NSLIJ:DM:GI:El-GI-LIJ", label: "LIJ GI Elective" },
  { pattern: "NSLIJ:DM:GI:El-GI-NS", label: "NS GI Elective" },
  { pattern: "NSLIJ:DM:HO:El-HemOnc-NS", label: "NS Hem/Onc Elective" },
  { pattern: "NSLIJ:DM:ID:El-ID-NS", label: "NS ID Elective" },
  { pattern: "NSLIJ:DM:IM:El-Procedure-LIJ", label: "LIJ Procedure Elective" },
  { pattern: "NSLIJ:DM:IM:El-Pri-Care", label: "Primary Care Elective" },
  {
    pattern: "NSLIJ:DM:IM:Valley-Stream-pulm-elective",
    label: "Valley Stream Pulm Elective",
  }, // Exact match if code is always this
  { pattern: "NSLIJ:DM:PULM:El-Pulm-NS", label: "NS Pulm Elective" },
  { pattern: "NSLIJ:DM:PULM:El-Pulm-LIJ", label: "LIJ Pulm Elective" },
  { pattern: "NSLIJ:DM:PULM:El-US-LIJ", label: "LIJ US Elective" },
  { pattern: "NSLIJ:DM:NEPH:El-Renal-LIJ", label: "LIJ Nephro Elective" },
  { pattern: "NSLIJ:DM:ENDO:El-Endo-LIJ", label: "LIJ Endo Elective" },
  { pattern: "Paternity", label: "Paternity Leave" },

  // --- Prefixes (Longer Before Shorter) ---
  // Note: Specific MICU/MAR/Team codes above will match before these prefixes
  {
    pattern: "NSLIJ:DM:IM:Valley-Stream-",
    label: "Valley Stream Pulm Elective",
    isPrefix: true,
  }, // Corrected prefix
  {
    pattern: "NSLIJ:DM:IM:Team-NS-",
    label: "NS Team",
    isPrefix: true,
    extractSuffix: "Team",
  },
  {
    pattern: "NSLIJ:DM:IM:Team-LIJ-",
    label: "LIJ Team",
    isPrefix: true,
    extractSuffix: "Team",
  },
  {
    pattern: "NSLIJ:DM:IM:Clinic-",
    label: "Clinic",
    isPrefix: true,
    extractSuffix: "Clinic",
  },
  { pattern: "NSLIJ:DM:PULM:MICU-LIJ-", label: "LIJ MICU", isPrefix: true }, // Generic fallback if specific shift not listed
  { pattern: "NSLIJ:DM:PULM:MICU-NS-", label: "NS MICU", isPrefix: true }, // Generic fallback
  { pattern: "NSLIJ:DM:IM:MAR-NS-", label: "NS MAR", isPrefix: true }, // Generic fallback
  { pattern: "NSLIJ:DM:IM:MAR-LIJ-", label: "LIJ MAR", isPrefix: true }, // Generic fallback
  { pattern: "CARD:El-", label: "Cards Elective", isPrefix: true }, // Generic Cards El fallback
  { pattern: "CARD:CCU-", label: "CCU", isPrefix: true }, // Generic CCU fallback
  { pattern: "EI-", label: "Elective", isPrefix: true }, // Generic EI fallback
  { pattern: "El-", label: "Elective", isPrefix: true }, // Generic El fallback (should be last elective type)

  // Avoid overly broad prefixes unless absolutely necessary and placed last
  // { pattern: "NSLIJ:DM:", label: "NSLIJ DM" },
  // { pattern: "CARD:", label: "Cardiology" },
];

/**
 * Gets a user-friendly label for an assignment code based on the mappings.
 * Prioritizes exact matches, then the longest matching prefix.
 * Handles specific suffix extraction for Team and Clinic codes.
 *
 * @param assignmentCode The raw assignment code from the schedule
 * @returns A user-friendly label for display
 */
export function getUserFriendlyLabel(
  assignmentCode: string | null | undefined,
): string {
  if (!assignmentCode) return assignmentCode ?? ""; // Return empty string for null/undefined

  const trimmedCode = assignmentCode.trim();
  if (!trimmedCode) return ""; // Return empty string for empty/whitespace

  let bestMatch: AssignmentInterpretation | null = null;
  let bestMatchLength = 0;

  for (const mapping of assignmentMappings) {
    // Check for exact match first
    if (trimmedCode === mapping.pattern) {
      bestMatch = mapping;
      bestMatchLength = mapping.pattern.length;
      break; // Exact match is always the best, stop searching
    }

    // Check for prefix match if applicable
    if (mapping.isPrefix && trimmedCode.startsWith(mapping.pattern)) {
      // If this prefix is longer than the current best match, it's better
      if (mapping.pattern.length > bestMatchLength) {
        bestMatch = mapping;
        bestMatchLength = mapping.pattern.length;
      }
    }
  }

  // Process the best match found
  if (bestMatch) {
    let label = bestMatch.label;
    const patternLength = bestMatch.pattern.length;

    // Handle specific suffix extraction
    if (bestMatch.extractSuffix === "Team") {
      // Extract Team Number and S/L/SO suffix
      // Regex: Match Team pattern, capture number (\d+), capture suffix ([SL]O?)
      const teamRegex = /Team-(?:NS|LIJ)-(\d+)-?([SL]O?)?$/;
      const match = trimmedCode.match(teamRegex);
      const teamNum = match?.[1] ?? "[Num]"; // Use captured number or placeholder
      const suffixCode = match?.[2] ?? ""; // Captured suffix (S, L, SO)

      let callType = "";
      if (suffixCode === "S" || suffixCode === "SO") {
        callType = " Short";
      } else if (suffixCode === "L") {
        callType = " Long";
      }
      // Construct label like "NS Team 5 Short" or "LIJ Team 1 Long"
      label = `${bestMatch.label} ${teamNum}${callType}`;
    } else if (bestMatch.extractSuffix === "Clinic") {
      // Extract Clinic Number/Name (everything after the prefix)
      if (trimmedCode.length > patternLength) {
        const clinicIdentifier = trimmedCode.substring(patternLength);
        label = `${bestMatch.label} ${clinicIdentifier}`; // e.g., "Clinic 865" or "Clinic MSGO"
      }
    } else if (bestMatch.isPrefix && bestMatch.label === "Elective") {
      // For generic El- or EI- prefixes, append the specific part
      if (trimmedCode.length > patternLength) {
        const electiveName = trimmedCode.substring(patternLength);
        // Basic capitalization for display
        const formattedName =
          electiveName.charAt(0).toUpperCase() +
          electiveName.slice(1).toLowerCase();
        label = `${label} (${formattedName})`; // e.g., "Elective (Palliative)"
      }
    }
    // Add other specific suffix handling here if needed

    return label;
  }

  // If no match, return the original code
  console.warn(`No interpretation mapping found for: ${trimmedCode}`);
  return trimmedCode;
}

// --- Example Usage ---
// console.log(getUserFriendlyLabel("NSLIJ:DM:IM:Team-NS-5-S")); // Expected: NS Team 5 Short
// console.log(getUserFriendlyLabel("NSLIJ:DM:IM:Team-LIJ-10-L")); // Expected: LIJ Team 10 Long
// console.log(getUserFriendlyLabel("NSLIJ:DM:IM:Team-NS-8-SO")); // Expected: NS Team 8 Short (SO typo)
// console.log(getUserFriendlyLabel("NSLIJ:DM:IM:Clinic-865")); // Expected: Clinic 865
// console.log(getUserFriendlyLabel("NSLIJ:DM:IM:Clinic-MSGO")); // Expected: Clinic MSGO
// console.log(getUserFriendlyLabel("El-Palliative")); // Expected: Elective (Palliative)
// console.log(getUserFriendlyLabel("NSLIJ:DM:IM:Vacation")); // Expected: Vacation
// console.log(getUserFriendlyLabel("OFF")); // Expected: OFF
// console.log(getUserFriendlyLabel("UNKNOWN_CODE")); // Expected: UNKNOWN_CODE (with console warning)
