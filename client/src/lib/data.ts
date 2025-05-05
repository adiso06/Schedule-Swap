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
 * Default schedule data in JSON format for loading as the baseline schedule.
 * This is the schedule data that will be shown if users don't upload their own.
 */
export const defaultScheduleJSON = [
    {
        "Name": "Aboseria, Ahmed",
        "PGY Level": "PGY1",
        "Apr-22": "NSLIJ:DM:IM:Team-NS-2-S",
        "Apr-23": "NSLIJ:DM:IM:Team-NS-2-L",
        "Apr-24": "NSLIJ:DM:IM:Team-NS-2-S",
        "Apr-25": "NSLIJ:DM:IM:Team-NS-2-S",
        "Apr-26": "OFF",
        "Apr-27": "NSLIJ:DM:IM:Team-NS-2-L",
        "Apr-28": "NSLIJ:DM:IM:Team-NS-2-S",
        "Apr-29": "NSLIJ:DM:IM:Team-NS-2-L",
        "Apr-30": "NSLIJ:DM:IM:Team-NS-2-S",
        "May-1": "NSLIJ:DM:IM:Team-NS-2-L",
        "May-2": "NSLIJ:DM:IM:Team-NS-2-S",
        "May-3": "NSLIJ:DM:IM:Team-NS-2-S",
        "May-4": "OFF",
        "May-5": "NSLIJ:DM:IM:Clinic-865",
        "May-6": "NSLIJ:DM:IM:Clinic-865",
        "May-7": "NSLIJ:DM:IM:Clinic-865",
        "May-8": "NSLIJ:DM:IM:Clinic-865",
        "May-9": "NSLIJ:DM:IM:Clinic-865",
        "May-10": "NSLIJ:DM:IM:Clinic-865",
        "May-11": "NSLIJ:DM:IM:Clinic-865",
        "May-12": "NSLIJ:DM:IM:Team-LIJ-1-L",
        "May-13": "NSLIJ:DM:IM:Team-LIJ-1-S",
        "May-14": "NSLIJ:DM:IM:Team-LIJ-1-L",
        "May-15": "NSLIJ:DM:IM:Team-LIJ-1-S"
    },
    {
        "Name": "Achuonjei, Joy",
        "PGY Level": "PGY1",
        "Apr-22": "NSLIJ:DM:PALL:El-Pall-LIJ",
        "Apr-23": "NSLIJ:DM:PALL:El-Pall-LIJ",
        "Apr-24": "NSLIJ:DM:PALL:El-Pall-LIJ",
        "Apr-25": "NSLIJ:DM:PALL:El-Pall-LIJ",
        "Apr-26": "NSLIJ:DM:PALL:El-Pall-LIJ",
        "Apr-27": "NSLIJ:DM:PALL:El-Pall-LIJ",
        "Apr-28": "NSLIJ:DM:GI:El-Hep-LIJ",
        "Apr-29": "NSLIJ:DM:GI:El-Hep-LIJ",
        "Apr-30": "NSLIJ:DM:GI:El-Hep-LIJ",
        "May-1": "NSLIJ:DM:GI:El-Hep-LIJ",
        "May-2": "NSLIJ:DM:GI:El-Hep-LIJ",
        "May-3": "NSLIJ:DM:GI:El-Hep-LIJ",
        "May-4": "NSLIJ:DM:GI:El-Hep-LIJ",
        "May-5": "NSLIJ:DM:IM:Team-LIJ-4-L",
        "May-6": "NSLIJ:DM:IM:Team-LIJ-4-S",
        "May-7": "NSLIJ:DM:IM:Team-LIJ-4-L",
        "May-8": "NSLIJ:DM:IM:Team-LIJ-4-S",
        "May-9": "NSLIJ:DM:IM:Team-LIJ-4-S",
        "May-10": "OFF",
        "May-11": "NSLIJ:DM:IM:Team-LIJ-4-L",
        "May-12": "NSLIJ:DM:IM:Team-LIJ-4-S",
        "May-13": "NSLIJ:DM:IM:Team-LIJ-4-L",
        "May-14": "NSLIJ:DM:IM:Team-LIJ-4-S",
        "May-15": "NSLIJ:DM:IM:Team-LIJ-4-L"
    },
    {
        "Name": "Annesi, Thomas",
        "PGY Level": "PGY1",
        "Apr-22": "NSLIJ:DM:IM:Team-NS-3-S",
        "Apr-23": "NSLIJ:DM:IM:Team-NS-3-S",
        "Apr-24": "NSLIJ:DM:IM:Team-NS-3-L",
        "Apr-25": "NSLIJ:DM:IM:Team-NS-3-S",
        "Apr-26": "NSLIJ:DM:IM:Team-NS-3-S",
        "Apr-27": "OFF",
        "Apr-28": "NSLIJ:DM:IM:Team-NS-3-L",
        "Apr-29": "NSLIJ:DM:IM:Team-NS-3-S",
        "Apr-30": "NSLIJ:DM:IM:Team-NS-3-L",
        "May-1": "NSLIJ:DM:IM:Team-NS-3-S",
        "May-2": "NSLIJ:DM:IM:Team-NS-3-L",
        "May-3": "NSLIJ:DM:IM:Team-NS-3-S",
        "May-4": "OFF",
        "May-5": "OFF",
        "May-6": "NSLIJ:DM:IM:Team-NS-3-L",
        "May-7": "NSLIJ:DM:IM:Team-NS-3-S",
        "May-8": "NSLIJ:DM:IM:Team-NS-3-L",
        "May-9": "NSLIJ:DM:IM:Team-NS-3-S",
        "May-10": "NSLIJ:DM:IM:Team-NS-3-L",
        "May-11": "NSLIJ:DM:IM:Team-NS-3-S",
        "May-12": "DPEDS:AI:El-AI",
        "May-13": "NSLIJ:DM:IM:Team-NS-8-L",
        "May-14": "DPEDS:AI:El-AI",
        "May-15": "DPEDS:AI:El-AI"
    },
    {
        "Name": "Babadzhanov, Marianna",
        "PGY Level": "PGY1",
        "Apr-22": "NSLIJ:DM:IM:Clinic-865",
        "Apr-23": "NSLIJ:DM:IM:Clinic-865",
        "Apr-24": "NSLIJ:DM:IM:Clinic-865",
        "Apr-25": "NSLIJ:DM:IM:Clinic-865",
        "Apr-26": "NSLIJ:DM:IM:Clinic-865",
        "Apr-27": "NSLIJ:DM:IM:Clinic-865",
        "Apr-28": "NSLIJ:DM:IM:NF-NS",
        "Apr-29": "NSLIJ:DM:IM:NF-NS",
        "Apr-30": "NSLIJ:DM:IM:NF-NS",
        "May-1": "NSLIJ:DM:IM:NF-NS",
        "May-2": "NSLIJ:DM:IM:NF-NS",
        "May-3": "NSLIJ:DM:IM:NF-NS",
        "May-4": "NSLIJ:DM:IM:NF-NS",
        "May-5": "NSLIJ:DM:IM:NF-NS",
        "May-6": "NSLIJ:DM:IM:NF-NS",
        "May-7": "NSLIJ:DM:IM:NF-NS",
        "May-8": "NSLIJ:DM:IM:NF-NS",
        "May-9": "NSLIJ:DM:IM:NF-NS",
        "May-10": "NSLIJ:DM:IM:NF-NS",
        "May-11": "NSLIJ:DM:IM:NF-NS",
        "May-12": "OFF",
        "May-13": "NSLIJ:DM:PULM:MICU-LIJ-N",
        "May-14": "OFF",
        "May-15": "NSLIJ:DM:PULM:MICU-LIJ-N"
    },
    {
        "Name": "Bevagna, Holly",
        "PGY Level": "PGY1",
        "Apr-22": "NSLIJ:DM:IM:Vacation",
        "Apr-23": "NSLIJ:DM:IM:Vacation",
        "Apr-24": "NSLIJ:DM:IM:Vacation",
        "Apr-25": "NSLIJ:DM:IM:Vacation",
        "Apr-26": "NSLIJ:DM:IM:Vacation",
        "Apr-27": "NSLIJ:DM:IM:Vacation",
        "Apr-28": "OFF",
        "Apr-29": "NSLIJ:DM:PULM:MICU-LIJ-N",
        "Apr-30": "OFF",
        "May-1": "NSLIJ:DM:PULM:MICU-LIJ-N",
        "May-2": "NSLIJ:DM:PULM:MICU-LIJ-N",
        "May-3": "NSLIJ:DM:PULM:MICU-LIJ-N",
        "May-4": "NSLIJ:DM:PULM:MICU-LIJ-N",
        "May-5": "MICU-LIJ-Shw-PM",
        "May-6": "OFF",
        "May-7": "MICU-LIJ-Shw-PM",
        "May-8": "OFF",
        "May-9": "OFF",
        "May-10": "MICU-LIJ-Shw-Y",
        "May-11": "MICU-LIJ-Shw-G",
        "May-12": "NSLIJ:DM:IM:Clinic-865",
        "May-13": "NSLIJ:DM:IM:Clinic-865",
        "May-14": "NSLIJ:DM:IM:Clinic-865",
        "May-15": "NSLIJ:DM:IM:Clinic-865"
    }
];

/**
 * This is backward compatibility for the old tab-delimited format
 */
export const defaultScheduleData = `Name\tPGY Level\tApr-22\tApr-23\tApr-24\tApr-25\tApr-26\tApr-27\tApr-28\tApr-29\tApr-30\tMay-1\tMay-2\tMay-3\tMay-4\tMay-5\tMay-6\tMay-7\tMay-8\tMay-9\tMay-10\tMay-11\tMay-12\tMay-13\tMay-14\tMay-15
Aboseria, Ahmed\tPGY1\tNSLIJ:DM:IM:Team-NS-2-S\tNSLIJ:DM:IM:Team-NS-2-L\tNSLIJ:DM:IM:Team-NS-2-S\tNSLIJ:DM:IM:Team-NS-2-S\tOFF\tNSLIJ:DM:IM:Team-NS-2-L\tNSLIJ:DM:IM:Team-NS-2-S\tNSLIJ:DM:IM:Team-NS-2-L\tNSLIJ:DM:IM:Team-NS-2-S\tNSLIJ:DM:IM:Team-NS-2-L\tNSLIJ:DM:IM:Team-NS-2-S\tNSLIJ:DM:IM:Team-NS-2-S\tOFF\tNSLIJ:DM:IM:Clinic-865\tNSLIJ:DM:IM:Clinic-865\tNSLIJ:DM:IM:Clinic-865\tNSLIJ:DM:IM:Clinic-865\tNSLIJ:DM:IM:Clinic-865\tNSLIJ:DM:IM:Clinic-865\tNSLIJ:DM:IM:Clinic-865\tNSLIJ:DM:IM:Team-LIJ-1-L\tNSLIJ:DM:IM:Team-LIJ-1-S\tNSLIJ:DM:IM:Team-LIJ-1-L\tNSLIJ:DM:IM:Team-LIJ-1-S`;

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
