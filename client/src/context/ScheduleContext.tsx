import React, { createContext, useReducer, ReactNode, useContext } from "react";
import { 
  ScheduleState, 
  PotentialSwap, 
  ValidationResult,
  Assignment,
  PGYLevel
} from "@/lib/types";
import { parseScheduleHTML, inferPGYLevels } from "@/lib/scheduleParser";
import { 
  checkConsecutiveWorkingDays, 
  getConsecutiveRanges, 
  createSimulatedSchedule,
  isWorkingDay
} from "@/lib/utils";
import { demoPGYData } from "@/lib/data";

// Create context with initial type definition
type ScheduleContextType = {
  state: ScheduleState;
  parseSchedule: (scheduleHtml: string) => void;
  setPgyLevels: (pgyLevels: { [name: string]: PGYLevel }) => void;
  setCurrentResident: (residentName: string | null) => void;
  setCurrentDate: (date: string | null) => void;
  findValidSwaps: (residentName: string, date: string) => void;
  reset: () => void;
};

// Create the context with a default undefined value that will be overridden
const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

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
  | { type: "PARSE_SCHEDULE"; payload: { scheduleHtml: string } }
  | { type: "SET_PGY_LEVELS"; payload: { pgyLevels: { [name: string]: PGYLevel } } }
  | { type: "SET_CURRENT_RESIDENT"; payload: { residentName: string | null } }
  | { type: "SET_CURRENT_DATE"; payload: { date: string | null } }
  | { type: "SET_VALID_SWAPS"; payload: { validSwaps: PotentialSwap[], invalidReason: string | null } }
  | { type: "RESET" };

// Reducer function
function scheduleReducer(state: ScheduleState, action: Action): ScheduleState {
  switch (action.type) {
    case "PARSE_SCHEDULE": {
      try {
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
          acc[name] = {
            name,
            pgyLevel: pgyLevels[name] || 2 // Default to PGY2 if not available
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
    
    case "SET_PGY_LEVELS":
      // Update PGY levels for residents
      return {
        ...state,
        residents: Object.keys(state.residents).reduce((acc, name) => {
          acc[name] = {
            ...state.residents[name],
            pgyLevel: action.payload.pgyLevels[name] || state.residents[name].pgyLevel
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

// Context is already defined above, no need to redefine it

// Provider component
export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(scheduleReducer, initialState);
  
  const parseSchedule = (scheduleHtml: string) => {
    dispatch({ type: "PARSE_SCHEDULE", payload: { scheduleHtml } });
  };
  
  const setPgyLevels = (pgyLevels: { [name: string]: PGYLevel }) => {
    dispatch({ type: "SET_PGY_LEVELS", payload: { pgyLevels } });
  };
  
  const setCurrentResident = (residentName: string | null) => {
    dispatch({ type: "SET_CURRENT_RESIDENT", payload: { residentName } });
  };
  
  const setCurrentDate = (date: string | null) => {
    dispatch({ type: "SET_CURRENT_DATE", payload: { date } });
  };
  
  const findValidSwaps = (residentName: string, date: string) => {
    console.log(`Finding valid swaps for ${residentName} on ${date}`);
    
    const residentA = state.residents[residentName];
    const assignmentA = state.schedule[residentName][date];

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
    if (assignmentA.swappable === "No") {
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
      const assignmentB = state.schedule[residentBName][date];
      
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
        invalidReason: null
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
      isValid: false
    };
    
    // C2: Assignment Swappability
    validationResult.isAssignmentSwappable = 
      assignmentA.swappable !== "No" && 
      assignmentB.swappable !== "No";
    
    if (!validationResult.isAssignmentSwappable) {
      validationResult.reason = "One or both assignments are not swappable";
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
    
    // C1: 7-Day Rule
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
  
  const value = {
    state,
    parseSchedule,
    setPgyLevels,
    setCurrentResident,
    setCurrentDate,
    findValidSwaps,
    reset
  };
  
  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
}

export default ScheduleContext;
