import { AssignmentClassification, PGYLevel } from "./types";

// PGY level data for residents
export const residentsData: { [name: string]: PGYLevel } = {
  // This is just initial data - will be populated from the imported schedule
  // and can be overridden by the user
};

// Assignment classification based on the requirements document
export const assignmentClassification: AssignmentClassification = {
  // Basic statuses
  "OFF": {
    type: "Status",
    swappable: "Yes",
    notes: "Can be swapped if rules met. Not a working day."
  },
  "NSLIJ:DM:IM:Vacation": {
    type: "Status",
    swappable: "No",
    notes: "Cannot be swapped. Not a working day."
  },
  
  // MAR assignments - swappable with PGY restrictions (this will be used as a prefix match)
  "NSLIJ:DM:IM:LOA-Medical": {
    type: "Status",
    swappable: "No",
    notes: "Cannot be swapped. Not a working day."
  },
  "NSLIJ:DM:IM:Clinic-": {
    type: "Required",
    swappable: "No",
    notes: "Cannot be swapped. Is a working day."
  },
  "NSLIJ:DM:PULM:MICU-": {
    type: "Required",
    swappable: "Conditional",
    notes: "Can only swap with Elective (C7). Is a working day."
  },
  "NSLIJ:DM:IM:Team-": {
    type: "Required",
    swappable: "Conditional",
    notes: "Can only swap with Elective (C7). Is a working day."
  },
  "El-": {
    type: "Elective",
    swappable: "Yes",
    notes: "Standard elective. Working day (Mon-Fri)."
  },
  "EI-": {
    type: "Elective",
    swappable: "Yes",
    notes: "Assumed Elective. Working day (Mon-Fri)."
  },
  "CARD:El-": {
    type: "Elective",
    swappable: "Yes",
    notes: "Cardiology Elective. Working day (Mon-Fri)."
  },
  "CARD:CCU-": {
    type: "Elective",
    swappable: "Yes",
    notes: "CCU Elective. Confirm Sat/Sun working status. Default: Mon-Fri work."
  },
  "NSLIJ:DM:IM:MAR-": {
    type: "Required",
    swappable: "Conditional",
    pgyRules: "Recipient must be PGY3.",
    notes: "Medical Admitting Resident shifts. Is a working day."
  },
  "DN:Neuro": {
    type: "Required",
    swappable: "No",
    notes: "Neurology. Assumed not swappable. Assumed working day."
  },
  "NSLIJ:DM:IM:Board-Prep": {
    type: "Status",
    swappable: "Conditional",
    pgyRules: "Both residents must be PGY3",
    notes: "Can be swapped by PGY3s with PGY3s. Not a working day."
  },
  "NSLIJ:DM:IM:Uganda": {
    type: "Elective",
    swappable: "Yes",
    notes: "International Elective. Assumed working day (Mon-Fri)."
  },
  "NSLIJ:DM:IM:Chief": {
    type: "Admin",
    swappable: "No",
    notes: "Chief Resident duties. Assumed not swappable. Assumed working day."
  },
  "NSLIJ:DM:GERI:El-Geri": {
    type: "Elective",
    swappable: "Yes",
    notes: "Geriatrics Elective. Working day (Mon-Fri)."
  },
  "NSLIJ:DM:GI:El-GI-": {
    type: "Elective",
    swappable: "Yes",
    notes: "GI Elective. Working day (Mon-Fri)."
  },
  "NSLIJ:DM:HO:El-HemOnc-NS": {
    type: "Elective",
    swappable: "Yes",
    notes: "Hem/Onc Elective. Working day (Mon-Fri)."
  },
  "NSLIJ:DM:ID:El-ID-NS": {
    type: "Elective",
    swappable: "Yes",
    notes: "ID Elective. Working day (Mon-Fri)."
  },
  "NSLIJ:DM:IM:El-Procedure-LIJ": {
    type: "Elective",
    swappable: "Yes",
    notes: "Procedure Elective. Working day (Mon-Fri)."
  },
  "NSLIJ:DM:IM:El-Pri-Care": {
    type: "Elective",
    swappable: "Yes",
    notes: "Primary Care Elective. Working day (Mon-Fri)."
  },
  "NSLIJ:DM:IM:Valley-Stream": {
    type: "Elective",
    swappable: "Yes",
    notes: "VS Elective. Assumed working day (Mon-Fri)."
  },
  "NSLIJ:DM:PULM:El-Pulm-NS": {
    type: "Elective",
    swappable: "Yes",
    notes: "Pulm Elective. Working day (Mon-Fri)."
  }
};

// Demo data for schedule testing
export const demoScheduleHTML = `<table border="1">
  <tr>
    <th>Resident</th>
    <th>Mon 5/1</th>
    <th>Tue 5/2</th>
    <th>Wed 5/3</th>
    <th>Thu 5/4</th>
    <th>Fri 5/5</th>
    <th bgcolor="#ffdc64">Sat 5/6</th>
    <th bgcolor="#ffdc64">Sun 5/7</th>
  </tr>
  <tr>
    <td>Bulsara, Kishen</td>
    <td>NSLIJ:DM:IM:Team-NS-2-S</td>
    <td>NSLIJ:DM:IM:Team-NS-2-S</td>
    <td>NSLIJ:DM:IM:Team-NS-2-S</td>
    <td>NSLIJ:DM:IM:Team-NS-2-S</td>
    <td>NSLIJ:DM:IM:Team-NS-2-S</td>
    <td>OFF</td>
    <td>OFF</td>
  </tr>
  <tr>
    <td>Wong, Kevin</td>
    <td>CARD:El-Cards-LIJ</td>
    <td>CARD:El-Cards-LIJ</td>
    <td>CARD:El-Cards-LIJ</td>
    <td>CARD:El-Cards-LIJ</td>
    <td>CARD:El-Cards-LIJ</td>
    <td>OFF</td>
    <td>OFF</td>
  </tr>
  <tr>
    <td>Patel, Anisha</td>
    <td>NSLIJ:DM:IM:Team-NS-1-L</td>
    <td>NSLIJ:DM:IM:Team-NS-1-L</td>
    <td>OFF</td>
    <td>NSLIJ:DM:IM:Team-NS-1-L</td>
    <td>NSLIJ:DM:IM:Team-NS-1-L</td>
    <td>NSLIJ:DM:IM:Team-NS-1-L</td>
    <td>OFF</td>
  </tr>
  <tr>
    <td>Johnson, Marcus</td>
    <td>El-Research</td>
    <td>El-Research</td>
    <td>El-Research</td>
    <td>El-Research</td>
    <td>El-Research</td>
    <td>OFF</td>
    <td>OFF</td>
  </tr>
  <tr>
    <td>Rodriguez, Elena</td>
    <td>OFF</td>
    <td>NSLIJ:DM:IM:MAR-Z</td>
    <td>NSLIJ:DM:IM:MAR-Z</td>
    <td>NSLIJ:DM:IM:MAR-Z</td>
    <td>OFF</td>
    <td>OFF</td>
    <td>OFF</td>
  </tr>
</table>`;

// Demo PGY data
export const demoPGYData = {
  "Bulsara, Kishen": 2,
  "Wong, Kevin": 3,
  "Patel, Anisha": 1,
  "Johnson, Marcus": 2,
  "Rodriguez, Elena": 3
};
