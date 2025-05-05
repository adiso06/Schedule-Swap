import React, { createContext, useReducer, ReactNode, useContext, useEffect } from "react";
import { 
  ScheduleState, 
  PotentialSwap, 
  ValidationResult,
  Assignment,
  PGYLevel,
  SwappableStatus,
  AssignmentType
} from "@/lib/types";
import { parseScheduleHTML, inferPGYLevels } from "@/lib/scheduleParser";
import { parseExcelData } from "@/lib/excelParser";
import { 
  checkConsecutiveWorkingDays, 
  getConsecutiveRanges, 
  createSimulatedSchedule,
  isWorkingDay
} from "@/lib/utils";
import { demoPGYData, defaultScheduleJSON, defaultScheduleData } from "@/lib/data";
import { 
  saveSchedule, 
  getAllSchedules, 
  getScheduleById, 
  deleteSchedule,
  updateSchedule,
  exportSchedules,
  importSchedules,
  SavedSchedule
} from "@/lib/storage";

// Define the context type
type ScheduleContextType = {
  state: ScheduleState;
  parseSchedule: (input: string, isExcelFormat?: boolean) => void;
  setPgyLevels: (pgyLevels: { [name: string]: PGYLevel }) => void;
  setCurrentResident: (residentName: string | null) => void;
  setCurrentDate: (date: string | null) => void;
  findValidSwaps: (residentName: string, date: string) => void;
  reset: () => void;
  // Persistence functions
  saveCurrentSchedule: (name: string) => SavedSchedule;
  loadSchedule: (id: string) => void;
  getAllSavedSchedules: () => SavedSchedule[];
  deleteSchedule: (id: string) => boolean;
  exportSchedules: () => void;
  importSchedulesFromJson: (jsonData: string) => boolean;
};

// Create the context with a default value that will be overridden
export const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

// Initial state
const initialState: ScheduleState = {
  residents: {},
  schedule: {},
  metadata: {
    startDate: new Date(),
    endDate: new Date(),
    residents: [],
    dates: [],
    isLoaded: false
  },
  currentResident: null,
  currentDate: null,
  validSwaps: [],
  invalidReason: null
};

// Action types
type Action =
  | { type: "PARSE_SCHEDULE"; payload: { 
      scheduleHtml: string, 
      parsedSchedule?: { [residentName: string]: { [date: string]: Assignment } }, 
      parsedMetadata?: { 
        startDate: Date; 
        endDate: Date; 
        residents: string[]; 
        dates: string[]; 
        isLoaded: boolean; 
        rawInput?: string;
        isExcelFormat?: boolean;
      },
      residents?: { [name: string]: { name: string; pgyLevel: PGYLevel } }
    } }
  | { type: "SET_PGY_LEVELS"; payload: { pgyLevels: { [name: string]: PGYLevel } } }
  | { type: "SET_CURRENT_RESIDENT"; payload: { residentName: string | null } }
  | { type: "SET_CURRENT_DATE"; payload: { date: string | null } }
  | { type: "SET_VALID_SWAPS"; payload: { validSwaps: PotentialSwap[], invalidReason: string | null } }
  | { type: "LOAD_SAVED_SCHEDULE"; payload: { 
      schedule: { [residentName: string]: { [date: string]: Assignment } }, 
      metadata: { 
        startDate: Date; 
        endDate: Date; 
        residents: string[]; 
        dates: string[]; 
        isLoaded: boolean; 
        rawInput?: string;
        isExcelFormat?: boolean;
      }, 
      residents: { [name: string]: { name: string; pgyLevel: PGYLevel } },
      rawInput: string
    } }
  | { type: "RESET" };

// Reducer function
function scheduleReducer(state: ScheduleState, action: Action): ScheduleState {
  switch (action.type) {
    case "PARSE_SCHEDULE": {
      try {
        // If we have pre-parsed data, use it directly
        if (action.payload.parsedSchedule && action.payload.parsedMetadata && action.payload.residents) {
          return {
            ...state,
            residents: action.payload.residents,
            schedule: action.payload.parsedSchedule,
            metadata: action.payload.parsedMetadata,
            currentResident: null,
            currentDate: null,
            validSwaps: [],
            invalidReason: null
          };
        }
        
        // Otherwise parse the HTML content
        const { schedule, metadata } = parseScheduleHTML(action.payload.scheduleHtml);
        
        // Preprocess schedule to calculate isWorkingDay
        Object.keys(schedule).forEach(residentName => {
          Object.keys(schedule[residentName]).forEach(date => {
            const assignment = schedule[residentName][date];
            assignment.isWorkingDay = isWorkingDay(assignment);
          });
        });
        
        // Infer PGY levels from resident names if possible
        const inferredPgyLevels = inferPGYLevels(metadata.residents);
        
        // Default to demo PGY data for testing
        const pgyLevels = { ...demoPGYData, ...inferredPgyLevels };
        
        // Create resident objects with PGY levels
        const residents = metadata.residents.reduce((acc, name) => {
          if (!name || name === "<>" || name === " ") return acc;
          
          acc[name] = {
            name,
            pgyLevel: (pgyLevels as Record<string, PGYLevel>)[name] || 2 // Default to PGY2 if not available
          };
          return acc;
        }, {} as { [name: string]: { name: string; pgyLevel: PGYLevel } });
        
        return {
          ...state,
          residents,
          schedule,
          metadata,
          currentResident: null,
          currentDate: null,
          validSwaps: [],
          invalidReason: null
        };
      } catch (error) {
        console.error("Error parsing schedule:", error);
        throw error;
      }
    }
    
    case "LOAD_SAVED_SCHEDULE": {
      return {
        ...state,
        residents: action.payload.residents,
        schedule: action.payload.schedule,
        metadata: action.payload.metadata,
        currentResident: null,
        currentDate: null,
        validSwaps: [],
        invalidReason: null
      };
    }
    
    case "SET_PGY_LEVELS":
      // Update PGY levels for residents
      return {
        ...state,
        residents: Object.keys(state.residents).reduce((acc, name) => {
          acc[name] = {
            ...state.residents[name],
            pgyLevel: (action.payload.pgyLevels as Record<string, PGYLevel>)[name] || state.residents[name].pgyLevel
          };
          return acc;
        }, {} as { [name: string]: { name: string; pgyLevel: PGYLevel } })
      };
    
    case "SET_CURRENT_RESIDENT":
      return {
        ...state,
        currentResident: action.payload.residentName,
        validSwaps: [], // Clear previous results
        invalidReason: null
      };
    
    case "SET_CURRENT_DATE":
      return {
        ...state,
        currentDate: action.payload.date,
        validSwaps: [], // Clear previous results
        invalidReason: null
      };
    
    case "SET_VALID_SWAPS":
      return {
        ...state,
        validSwaps: action.payload.validSwaps,
        invalidReason: action.payload.invalidReason
      };
    
    case "RESET":
      return initialState;
    
    default:
      return state;
  }
}

// Provider component
export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(scheduleReducer, initialState);
  
  // Load default schedule data when app starts
  useEffect(() => {
    // Skip if schedule is already loaded
    if (state.metadata.isLoaded) {
      console.log("Schedule already loaded, skipping auto-load of default data");
      return;
    }
    
    // Check local storage first
    const savedSchedules = getAllSchedules();
    if (savedSchedules.length > 0) {
      // Load the most recently saved schedule
      console.log(`Found ${savedSchedules.length} saved schedules, loading most recent...`);
      const mostRecent = savedSchedules.sort((a, b) => {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      })[0];
      
      try {
        console.log(`Loading saved schedule: ${mostRecent.name}`);
        
        const { scheduleData, metadata, pgyLevels, rawInput } = mostRecent;
        
        // Convert saved PGY levels to resident objects
        const residents = metadata.residents.reduce((acc, name) => {
          if (!name || name === "<>" || name === " ") return acc;
          
          acc[name] = {
            name,
            pgyLevel: pgyLevels[name] || (2 as PGYLevel) // Default to PGY2 if not available
          };
          return acc;
        }, {} as { [name: string]: { name: string; pgyLevel: PGYLevel } });
        
        dispatch({
          type: "LOAD_SAVED_SCHEDULE",
          payload: {
            schedule: scheduleData,
            metadata,
            residents,
            rawInput
          }
        });
      } catch (error) {
        console.error("Error loading saved schedule, falling back to default data:", error);
        loadDefaultSchedule();
      }
    } else {
      // No saved schedules, load the default data
      console.log("No saved schedules found, loading default schedule data...");
      loadDefaultSchedule();
    }
  }, []);
  
  // Function to load the default schedule data
  const loadDefaultSchedule = () => {
    console.log("Loading default schedule from JSON data...");
    try {
      // Use the defaultScheduleData which is tab-delimited for Excel parser
      parseSchedule(defaultScheduleData, true);
    } catch (error) {
      console.error("Error loading default schedule data:", error);
    }
  };
  
  const parseSchedule = (input: string, isExcelFormat: boolean = false) => {
    let parsedData;
    
    try {
      if (isExcelFormat) {
        parsedData = parseExcelData(input);
      } else {
        parsedData = parseScheduleHTML(input);
      }
      
      // Process the data and update state
      const { schedule, metadata } = parsedData;
      
      // Add the raw input and format flag to metadata for persistence
      metadata.rawInput = input;
      metadata.isExcelFormat = isExcelFormat;
      
      // Preprocess schedule to calculate isWorkingDay
      Object.keys(schedule).forEach(residentName => {
        Object.keys(schedule[residentName]).forEach(date => {
          const assignment = schedule[residentName][date];
          assignment.isWorkingDay = isWorkingDay(assignment);
        });
      });
      
      // Get basic PGY levels - either from Excel or infer from names
      const pgyLevels: { [name: string]: PGYLevel } = {};
      
      // Always infer PGY levels first
      const inferredPgyLevels = inferPGYLevels(metadata.residents);
      
      // Copy the inferred levels into our variable
      Object.keys(inferredPgyLevels).forEach(name => {
        pgyLevels[name] = inferredPgyLevels[name];
      });
      
      // If Excel data is provided, try to extract PGY levels from it
      if (isExcelFormat) {
        try {
          const excelLines = input.trim().split(/\r?\n/);
          for (let i = 2; i < excelLines.length; i++) {
            const row = excelLines[i].split(/\t/);
            if (row.length < 2) continue;
            
            const residentName = row[0].trim();
            const pgyLevelStr = row[1].trim();
            
            if (residentName && pgyLevelStr) {
              let level: PGYLevel | null = null;
              
              // Extract PGY level (e.g., "PGY-1" => 1)
              const pgyMatch = pgyLevelStr.match(/PGY-?(\d+)/i);
              
              if (pgyMatch) {
                level = parseInt(pgyMatch[1], 10) as PGYLevel;
              } else if (pgyLevelStr === "1" || pgyLevelStr === "2" || pgyLevelStr === "3") {
                level = parseInt(pgyLevelStr, 10) as PGYLevel;
              } else if (pgyLevelStr.toLowerCase().includes("pgy") && pgyLevelStr.includes("1")) {
                level = 1;
              } else if (pgyLevelStr.toLowerCase().includes("pgy") && pgyLevelStr.includes("2")) {
                level = 2;
              } else if (pgyLevelStr.toLowerCase().includes("pgy") && pgyLevelStr.includes("3")) {
                level = 3;
              }
              
              if (level) {
                pgyLevels[residentName] = level;
              }
            }
          }
        } catch (e) {
          console.error("Error extracting PGY levels from Excel data:", e);
        }
      }
      
      // Add any demo data if available
      if (Object.keys(demoPGYData).length > 0) {
        for (const name in demoPGYData) {
          if (!pgyLevels[name]) {
            pgyLevels[name] = demoPGYData[name] as PGYLevel;
          }
        }
      }
      
      console.log("Final PGY levels:", pgyLevels);
      
      // Create resident objects with PGY levels
      const residents = metadata.residents.reduce((acc, name) => {
        if (!name || name === "<>" || name === " ") return acc;
        
        acc[name] = {
          name,
          pgyLevel: (pgyLevels as Record<string, PGYLevel>)[name] || (2 as PGYLevel) // Default to PGY2 if not available
        };
        return acc;
      }, {} as { [name: string]: { name: string; pgyLevel: PGYLevel } });
      
      dispatch({ 
        type: "PARSE_SCHEDULE", 
        payload: { 
          scheduleHtml: input,
          parsedSchedule: schedule,
          parsedMetadata: metadata,
          residents
        } 
      });
    } catch (error) {
      console.error("Error parsing schedule:", error);
      throw error;
    }
  };
  
  const setPgyLevels = (pgyLevels: { [name: string]: PGYLevel }) => {
    dispatch({ type: "SET_PGY_LEVELS", payload: { pgyLevels } });
  };
  
  const setCurrentResident = (residentName: string | null) => {
    dispatch({ type: "SET_CURRENT_RESIDENT", payload: { residentName } });
  };
  
  const setCurrentDate = (date: string | null) => {
    console.log("Setting date to:", date);
    dispatch({ type: "SET_CURRENT_DATE", payload: { date } });
  };
  
  const findValidSwaps = (residentName: string, date: string) => {
    console.log(`Finding valid swaps for ${residentName} on ${date}`);
    
    const residentA = state.residents[residentName];
    const assignmentA = state.schedule[residentName]?.[date];

    // Debug output for resident A's assignment
    console.log(`Resident A: ${residentName}, PGY: ${residentA?.pgyLevel || 'unknown'}`);
    console.log(`Assignment A: ${assignmentA?.code || 'none'}, Swappable: ${assignmentA?.swappable || 'N/A'}`);
    
    // Check if we have the assignment
    if (!assignmentA) {
      console.error(`No assignment found for ${residentName} on ${date}`);
      dispatch({
        type: "SET_VALID_SWAPS",
        payload: {
          validSwaps: [],
          invalidReason: `No assignment found for ${residentName} on ${date}`
        }
      });
      return;
    }
    
    // Validate if the assignment is swappable
    if (assignmentA.swappable === SwappableStatus.No) {
      console.log(`Assignment ${assignmentA.code} is not swappable`);
      dispatch({
        type: "SET_VALID_SWAPS",
        payload: {
          validSwaps: [],
          invalidReason: `The selected assignment ${assignmentA.code} is classified as non-swappable according to the program rules.`
        }
      });
      return;
    }
    
    const validSwaps: PotentialSwap[] = [];
    
    // For each potential resident to swap with
    Object.keys(state.residents).forEach(residentBName => {
      // Skip self
      if (residentBName === residentName) return;
      
      const residentB = state.residents[residentBName];
      const assignmentB = state.schedule[residentBName]?.[date];
      
      // Skip if no assignment for that day
      if (!assignmentB) return;
      
      // Debug for specific residents mentioned
      if (residentName === "Chen Anne" && residentBName === "Flescher Andrew" && date === "2025-04-25") {
        console.log("EVALUATING SPECIFIC SWAP CASE:");
        console.log(`Chen Anne (PGY ${residentA.pgyLevel}) - ${assignmentA.code} (${assignmentA.swappable})`);
        console.log(`Andrew Flescher (PGY ${residentB.pgyLevel}) - ${assignmentB.code} (${assignmentB.swappable})`);
      }
      
      // Also check the reverse case
      if (residentName === "Flescher Andrew" && residentBName === "Chen Anne" && date === "2025-04-25") {
        console.log("EVALUATING SPECIFIC SWAP CASE (REVERSE):");
        console.log(`Andrew Flescher (PGY ${residentA.pgyLevel}) - ${assignmentA.code} (${assignmentA.swappable})`);
        console.log(`Chen Anne (PGY ${residentB.pgyLevel}) - ${assignmentB.code} (${assignmentB.swappable})`);
      }
      
      // Validate the potential swap
      const validationResult = validateSwap(
        residentA,
        residentB,
        assignmentA,
        assignmentB,
        date,
        state.schedule[residentName],
        state.schedule[residentBName]
      );
      
      // Log validation details for the specific case
      if ((residentName === "Chen Anne" && residentBName === "Flescher Andrew") || 
          (residentName === "Flescher Andrew" && residentBName === "Chen Anne")) {
        if (date === "2025-04-25") {
          console.log("VALIDATION RESULT DETAILS:", {
            isPgyCompatible: validationResult.isPgyCompatible,
            isAssignmentSwappable: validationResult.isAssignmentSwappable,
            isMarRestrictionValid: validationResult.isMarRestrictionValid,
            isBoardPrepRestrictionValid: validationResult.isBoardPrepRestrictionValid,
            isSevenDayRuleValid: validationResult.isSevenDayRuleValid,
            isValid: validationResult.isValid,
            reason: validationResult.reason || 'Valid swap'
          });
        }
      }
      
      if (validationResult.isValid) {
        validSwaps.push({
          residentA: residentName,
          residentB: residentBName,
          pgyA: residentA.pgyLevel,
          pgyB: residentB.pgyLevel,
          assignmentA,
          assignmentB,
          date,
          validationResults: validationResult
        });
      }
    });
    
    dispatch({
      type: "SET_VALID_SWAPS",
      payload: {
        validSwaps,
        invalidReason: validSwaps.length === 0 ? "No valid swaps found for the selected resident and date." : null
      }
    });
  };
  
  const validateSwap = (
    residentA: { name: string; pgyLevel: PGYLevel },
    residentB: { name: string; pgyLevel: PGYLevel },
    assignmentA: Assignment,
    assignmentB: Assignment,
    date: string,
    scheduleA: { [date: string]: Assignment },
    scheduleB: { [date: string]: Assignment }
  ): ValidationResult => {
    // Initialize validation result
    const validationResult: ValidationResult = {
      isPgyCompatible: false,
      isSevenDayRuleValid: false,
      isAssignmentSwappable: false,
      isMarRestrictionValid: false,
      isBoardPrepRestrictionValid: false,
      isAssignmentTypeCompatible: false,
      isValid: false
    };
    
    // Log for debugging
    console.log(`Validating swap between ${residentA.name} (${assignmentA.code}) and ${residentB.name} (${assignmentB.code})`);
    
    // C2: Assignment Swappability - check if assignments are explicitly marked as non-swappable
    validationResult.isAssignmentSwappable = (
      assignmentA.swappable !== SwappableStatus.No && 
      assignmentB.swappable !== SwappableStatus.No
    );
    
    if (!validationResult.isAssignmentSwappable) {
      validationResult.reason = "One or both assignments are marked as non-swappable";
      return validationResult;
    }
    
    // C3: PGY Level Restrictions
    validationResult.isPgyCompatible = isPgyCompatible(
      residentA.pgyLevel,
      residentB.pgyLevel
    );
    
    if (!validationResult.isPgyCompatible) {
      validationResult.reason = "PGY levels are not compatible";
      return validationResult;
    }
    
    // C4: MAR Shift Restriction
    validationResult.isMarRestrictionValid = isMarRestrictionValid(
      assignmentA,
      assignmentB,
      residentA.pgyLevel,
      residentB.pgyLevel
    );
    
    if (!validationResult.isMarRestrictionValid) {
      validationResult.reason = "MAR shifts can only be assigned to PGY3 residents";
      return validationResult;
    }
    
    // C5: Board Prep Restriction
    validationResult.isBoardPrepRestrictionValid = isBoardPrepRestrictionValid(
      assignmentA,
      assignmentB,
      residentA.pgyLevel,
      residentB.pgyLevel
    );
    
    if (!validationResult.isBoardPrepRestrictionValid) {
      validationResult.reason = "Board Prep can only be swapped between PGY3 residents";
      return validationResult;
    }
    
    // C7: Assignment Type Compatibility
    validationResult.isAssignmentTypeCompatible = isAssignmentTypeCompatible(
      assignmentA.type,
      assignmentB.type
    );
    
    if (!validationResult.isAssignmentTypeCompatible) {
      validationResult.reason = "Assignment types are not compatible for swapping";
      console.log(`Assignment type compatibility check failed: ${assignmentA.type} <-> ${assignmentB.type}`);
      return validationResult;
    }
    
    // C1: 7-Day Rule (check this last as it's more computationally intensive)
    validationResult.isSevenDayRuleValid = isSevenDayRuleValid(
      scheduleA,
      scheduleB,
      assignmentA,
      assignmentB,
      date
    );
    
    if (!validationResult.isSevenDayRuleValid) {
      validationResult.reason = "Swap would result in 7+ consecutive working days";
      return validationResult;
    }
    
    // All rules passed
    validationResult.isValid = true;
    console.log("Swap is valid!");
    
    return validationResult;
  };
  
  // Helper functions for validation
  
  // C3: PGY Level Compatibility
  function isPgyCompatible(pgyA: PGYLevel, pgyB: PGYLevel): boolean {
    console.log(`Checking PGY compatibility: ${pgyA} vs ${pgyB}`);
    
    // PGY-1 can only swap with other PGY-1
    if (pgyA === 1) {
      const result = pgyB === 1;
      console.log(`PGY-1 with PGY-${pgyB}: ${result ? 'Compatible' : 'Not Compatible'}`);
      return result;
    }
    
    // PGY-2 can swap with PGY-2 or PGY-3
    if (pgyA === 2) {
      const result = pgyB === 2 || pgyB === 3;
      console.log(`PGY-2 with PGY-${pgyB}: ${result ? 'Compatible' : 'Not Compatible'}`);
      return result;
    }
    
    // PGY-3 can swap with PGY-2 or PGY-3
    if (pgyA === 3) {
      const result = pgyB === 2 || pgyB === 3;
      console.log(`PGY-3 with PGY-${pgyB}: ${result ? 'Compatible' : 'Not Compatible'}`);
      return result;
    }
    
    // Should never get here with valid PGY levels
    console.error(`Invalid PGY levels: ${pgyA}, ${pgyB}`);
    return false;
  }
  
  // C4: MAR Shift Restriction
  function isMarRestrictionValid(
    assignmentA: Assignment,
    assignmentB: Assignment,
    pgyA: PGYLevel,
    pgyB: PGYLevel
  ): boolean {
    // Log for debugging
    console.log("MAR Restriction Check:", { 
      assignmentACode: assignmentA.code,
      assignmentBCode: assignmentB.code,
      pgyA, 
      pgyB 
    });
    
    const isAssignmentAMar = assignmentA.code.includes("MAR-"); // More general matching
    const isAssignmentBMar = assignmentB.code.includes("MAR-"); // More general matching
    
    console.log(`Is A MAR? ${isAssignmentAMar}, Is B MAR? ${isAssignmentBMar}`);
    
    // If B is MAR, A must be PGY3 to take it
    if (isAssignmentBMar && pgyA !== 3) {
      console.log("Failed: B is MAR but A is not PGY3");
      return false;
    }
    
    // If A is MAR, B must be PGY3 to take it
    if (isAssignmentAMar && pgyB !== 3) {
      console.log("Failed: A is MAR but B is not PGY3");
      return false;
    }
    
    console.log("MAR restriction check passed");
    return true;
  }
  
  // C5: Board Prep Restriction
  function isBoardPrepRestrictionValid(
    assignmentA: Assignment,
    assignmentB: Assignment,
    pgyA: PGYLevel,
    pgyB: PGYLevel
  ): boolean {
    const isAssignmentABoardPrep = assignmentA.code === "NSLIJ:DM:IM:Board-Prep";
    const isAssignmentBBoardPrep = assignmentB.code === "NSLIJ:DM:IM:Board-Prep";
    
    if ((isAssignmentABoardPrep || isAssignmentBBoardPrep) && (pgyA !== 3 || pgyB !== 3)) {
      return false;
    }
    
    return true;
  }
  
  // C7: Assignment Type Compatibility
  function isAssignmentTypeCompatible(
    typeA: AssignmentType,
    typeB: AssignmentType
  ): boolean {
    // Log for debugging
    console.log(`Checking assignment type compatibility: ${typeA} <-> ${typeB}`);
    
    // According to rule C7, a swap is valid only if one of these conditions holds:
    // 1. Type(A) is Elective AND Type(B) is Elective.
    if (typeA === "Elective" && typeB === "Elective") {
      console.log("Valid: Elective <-> Elective");
      return true;
    }
    
    // 2. Type(A) is Required AND Type(B) is Elective.
    if (typeA === "Required" && typeB === "Elective") {
      console.log("Valid: Required <-> Elective");
      return true;
    }
    
    // 3. Type(A) is Elective AND Type(B) is Required.
    if (typeA === "Elective" && typeB === "Required") {
      console.log("Valid: Elective <-> Required");
      return true;
    }
    
    // 4. Type(A) is Status (OFF, Board-Prep) AND Type(B) is Elective.
    if (typeA === "Status" && typeB === "Elective") {
      console.log("Valid: Status <-> Elective");
      return true;
    }
    
    // 5. Type(A) is Elective AND Type(B) is Status (OFF, Board-Prep).
    if (typeA === "Elective" && typeB === "Status") {
      console.log("Valid: Elective <-> Status");
      return true;
    }
    
    // 6. Type(A) is Status (OFF, Board-Prep) AND Type(B) is Status (OFF, Board-Prep).
    if (typeA === "Status" && typeB === "Status") {
      console.log("Valid: Status <-> Status");
      return true;
    }
    
    // All other combinations are not valid, including:
    // - Required <-> Required
    // - Required <-> Status
    console.log(`Invalid combination: ${typeA} <-> ${typeB}`);
    return false;
  }
  
  // C1: 7-Day Rule
  function isSevenDayRuleValid(
    scheduleA: { [date: string]: Assignment },
    scheduleB: { [date: string]: Assignment },
    assignmentA: Assignment,
    assignmentB: Assignment,
    date: string
  ): boolean {
    // Get date ranges to check
    const [startDate, endDate] = getConsecutiveRanges(date);
    
    // Create simulated schedules with the swap
    const simulatedScheduleA = createSimulatedSchedule(scheduleA, date, assignmentB);
    const simulatedScheduleB = createSimulatedSchedule(scheduleB, date, assignmentA);
    
    // Check if either resident would have 7+ consecutive working days after the swap
    const residentAConsecutiveDays = checkConsecutiveWorkingDays(
      simulatedScheduleA,
      startDate,
      endDate
    );
    
    const residentBConsecutiveDays = checkConsecutiveWorkingDays(
      simulatedScheduleB,
      startDate,
      endDate
    );
    
    // Swap is valid if neither resident will have 7+ consecutive working days
    return !residentAConsecutiveDays && !residentBConsecutiveDays;
  }
  
  const reset = () => {
    dispatch({ type: "RESET" });
  };
  
  // Local storage functions
  const saveCurrentSchedule = (name: string): SavedSchedule => {
    if (!state.metadata.isLoaded) {
      throw new Error("No schedule loaded to save");
    }
    
    // Extract the PGY levels from the residents object
    const pgyLevels = Object.keys(state.residents).reduce((acc, name) => {
      acc[name] = state.residents[name].pgyLevel;
      return acc;
    }, {} as { [name: string]: number });
    
    // Get the raw input that was used to generate this schedule
    const rawInput = state.metadata.rawInput || "";
    
    // Save to local storage and return the saved schedule
    return saveSchedule(name, state.schedule, state.metadata, pgyLevels, rawInput);
  };
  
  const loadSchedule = (id: string): void => {
    const savedSchedule = getScheduleById(id);
    if (!savedSchedule) {
      throw new Error(`Schedule with ID ${id} not found`);
    }
    
    // Convert PGY levels to Resident objects
    const residents = Object.keys(savedSchedule.pgyLevels).reduce((acc, name) => {
      acc[name] = {
        name,
        pgyLevel: savedSchedule.pgyLevels[name] as PGYLevel
      };
      return acc;
    }, {} as { [name: string]: { name: string; pgyLevel: PGYLevel } });
    
    // Load into state
    dispatch({
      type: "LOAD_SAVED_SCHEDULE",
      payload: {
        schedule: savedSchedule.scheduleData,
        metadata: savedSchedule.metadata,
        residents,
        rawInput: savedSchedule.rawInput
      }
    });
  };
  
  const getAllSavedSchedules = (): SavedSchedule[] => {
    return getAllSchedules();
  };
  
  const deleteScheduleById = (id: string): boolean => {
    return deleteSchedule(id);
  };
  
  const exportAllSchedules = (): void => {
    exportSchedules();
  };
  
  const importSchedulesFromJson = (jsonData: string): boolean => {
    return importSchedules(jsonData);
  };

  const value = {
    state,
    parseSchedule,
    setPgyLevels,
    setCurrentResident,
    setCurrentDate,
    findValidSwaps,
    reset,
    saveCurrentSchedule,
    loadSchedule,
    getAllSavedSchedules,
    deleteSchedule: deleteScheduleById,
    exportSchedules: exportAllSchedules,
    importSchedulesFromJson
  };
  
  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
}

// Hook for using the schedule context
export function useSchedule() {
  const context = useContext(ScheduleContext);
  if (context === undefined) {
    throw new Error("useSchedule must be used within a ScheduleProvider");
  }
  return context;
}