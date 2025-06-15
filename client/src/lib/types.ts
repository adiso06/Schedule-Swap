// Assignment classifications
export type AssignmentType = 
  | "Required" 
  | "Elective" 
  | "Status"
  | "Admin"
  | "Clinic"
  | "Vacation"
  | "TBD";

// PGY levels
export type PGYLevel = 1 | 2 | 3;

// Assignment swappability status
// Define as string enum to make assignment easier
export enum SwappableStatus {
  Yes = "Yes",
  No = "No",
  Conditional = "Conditional"
}

// Type aliases for string literals to make them compatible with the enum
export type SwappableStatusString = "Yes" | "No" | "Conditional";

// Assignment rule
export interface AssignmentRule {
  type: AssignmentType;
  swappable: SwappableStatusString; // Allow string literals for easier data entry
  pgyRules?: string;
  notes?: string;
}

// Assignment classification mapping
export interface AssignmentClassification {
  [patternOrCode: string]: AssignmentRule;
}

// Resident data
export interface Resident {
  name: string;
  pgyLevel: PGYLevel;
}

// Assignment data for a single day
export interface Assignment {
  code: string;
  type: AssignmentType;
  swappable: SwappableStatus;
  isWeekend: boolean;
  isWorkingDay: boolean;
}

// Daily schedule for a resident
export interface ResidentSchedule {
  [date: string]: Assignment;
}

// Complete schedule data
export interface ScheduleData {
  [residentName: string]: ResidentSchedule;
}

// Schedule metadata
export interface ScheduleMetadata {
  startDate: Date;
  endDate: Date;
  residents: string[];
  dates: string[];
  isLoaded: boolean;
  rawInput?: string; // Store the original input HTML/Excel data
  isExcelFormat?: boolean; // Flag to indicate if this was from Excel or HTML
}

// Potential swap between residents
export interface PotentialSwap {
  residentA: string;
  residentB: string;
  pgyA: PGYLevel;
  pgyB: PGYLevel;
  assignmentA: Assignment;
  assignmentB: Assignment;
  date: string;
  validationResults: ValidationResult;
  isHypothetical?: boolean; // Added for simulation mode
}

// Validation result for a potential swap
export interface ValidationResult {
  isPgyCompatible: boolean;
  isSevenDayRuleValid: boolean;
  isAssignmentSwappable: boolean;
  isMarRestrictionValid: boolean;
  isBoardPrepRestrictionValid: boolean;
  isAssignmentTypeCompatible: boolean; // Added for rule C7
  isValid: boolean;
  isHypothetical?: boolean; // Added for simulation mode
  reason?: string;
}

// Payback swap options
export interface PaybackSwap {
  date: string;
  residentAElectiveAssignment: Assignment;
  residentBRequiredAssignment: Assignment;
}

// Schedule state in context
export interface ScheduleState {
  residents: { [name: string]: Resident };
  schedule: ScheduleData;
  metadata: ScheduleMetadata;
  currentResident: string | null;
  currentDate: string | null;
  validSwaps: PotentialSwap[];
  invalidReason: string | null;
  isSimulationModeActive: boolean; // Added for simulation mode
  // Filter state
  selectedPgyLevels: string[];
  // Payback context
  currentPaybackResidentA: string | null;
  currentPaybackResidentB: string | null;
  isPaybackModeActive: boolean;
}
