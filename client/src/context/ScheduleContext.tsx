import React, { createContext, useReducer, ReactNode, useContext, useEffect, useCallback } from "react";
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
import { clearMoonlightingCache } from "@/lib/moonlightingUtils";
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
type PaybackSwap = {
  date: string;
  residentAElectiveAssignment: Assignment;
  residentBRequiredAssignment: Assignment;
};

type ScheduleContextType = {
  state: ScheduleState;
  parseSchedule: (input: string, isExcelFormat?: boolean) => void;
  setPgyLevels: (pgyLevels: { [name: string]: PGYLevel }) => void;
  setCurrentResident: (residentName: string | null, preserveSwaps?: boolean) => void;
  setCurrentDate: (date: string | null, preserveSwaps?: boolean) => void;
  findValidSwaps: (residentName: string, date: string) => void;
  toggleSimulationMode: () => void;
  findPaybackSwaps: (residentAName: string, residentBName: string, originalSwapDate: string) => PaybackSwap[];
  setPaybackContext: (residentA: string, residentB: string) => void;
  clearPaybackContext: () => void;
  reset: () => void;
  // Filter functions
  setSelectedPgyLevels: (levels: string[]) => void;
  clearAllFilters: () => void;
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
  invalidReason: null,
  isSimulationModeActive: false,
  // Filter state
  selectedPgyLevels: [],
  // Payback context
  currentPaybackResidentA: null,
  currentPaybackResidentB: null,
  isPaybackModeActive: false
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
  | { type: "SET_CURRENT_RESIDENT"; payload: { residentName: string | null, preserveSwaps?: boolean } }
  | { type: "SET_CURRENT_DATE"; payload: { date: string | null, preserveSwaps?: boolean } }
  | { type: "SET_VALID_SWAPS"; payload: { validSwaps: PotentialSwap[], invalidReason: string | null } }
  | { type: "TOGGLE_SIMULATION_MODE" }
  | { type: "SET_PAYBACK_CONTEXT"; payload: { residentA: string, residentB: string } }
  | { type: "CLEAR_PAYBACK_CONTEXT" }
  | { type: "SET_SELECTED_PGY_LEVELS"; payload: { levels: string[] } }
  | { type: "CLEAR_ALL_FILTERS" }
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
            invalidReason: null,
            // Clear payback context when new schedule is loaded
            currentPaybackResidentA: null,
            currentPaybackResidentB: null,
            isPaybackModeActive: false
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

        // Clear moonlighting cache since we have updated isWorkingDay values
        clearMoonlightingCache();

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
          invalidReason: null,
          // Clear payback context when new schedule is loaded
          currentPaybackResidentA: null,
          currentPaybackResidentB: null,
          isPaybackModeActive: false
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
        invalidReason: null,
        // Clear payback context when loading saved schedule
        currentPaybackResidentA: null,
        currentPaybackResidentB: null,
        isPaybackModeActive: false
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
      // Clear window flags when resident changes and not preserving swaps
      if (!action.payload.preserveSwaps) {
        try {
          (window as any).nonSwappableAssignmentDetected = false;
          (window as any).nonSwappableAssignmentDetails = null;
          (window as any).isInSimulationMode = false;
          (window as any).nonSwappableAssignmentInSimulation = null;
        } catch (error) {
          // Ignore window access errors
        }
      }
      
      return {
        ...state,
        currentResident: action.payload.residentName,
        // Only clear validSwaps if not preserving them
        validSwaps: action.payload.preserveSwaps ? state.validSwaps : [],
        invalidReason: action.payload.preserveSwaps ? state.invalidReason : null
      };

    case "SET_CURRENT_DATE":
      // Clear window flags when date changes and not preserving swaps
      if (!action.payload.preserveSwaps) {
        try {
          (window as any).nonSwappableAssignmentDetected = false;
          (window as any).nonSwappableAssignmentDetails = null;
          (window as any).isInSimulationMode = false;
          (window as any).nonSwappableAssignmentInSimulation = null;
        } catch (error) {
          // Ignore window access errors
        }
      }
      
      return {
        ...state,
        currentDate: action.payload.date,
        // Only clear validSwaps if not preserving them
        validSwaps: action.payload.preserveSwaps ? state.validSwaps : [],
        invalidReason: action.payload.preserveSwaps ? state.invalidReason : null
      };

    case "SET_VALID_SWAPS":
      return {
        ...state,
        validSwaps: action.payload.validSwaps,
        invalidReason: action.payload.invalidReason
      };

    case "TOGGLE_SIMULATION_MODE":
      return {
        ...state,
        isSimulationModeActive: !state.isSimulationModeActive,
        validSwaps: [], // Clear swaps when mode changes
        invalidReason: null // Clear reason when mode changes
      };

    case "SET_PAYBACK_CONTEXT":
      return {
        ...state,
        currentPaybackResidentA: action.payload.residentA,
        currentPaybackResidentB: action.payload.residentB,
        isPaybackModeActive: true
      };

    case "CLEAR_PAYBACK_CONTEXT":
      return {
        ...state,
        currentPaybackResidentA: null,
        currentPaybackResidentB: null,
        isPaybackModeActive: false
      };

    case "SET_SELECTED_PGY_LEVELS":
      return {
        ...state,
        selectedPgyLevels: action.payload.levels
      };

    case "CLEAR_ALL_FILTERS":
      return {
        ...state,
        selectedPgyLevels: []
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

  // Helper functions for validation

  // C3: PGY Level Compatibility (optimized, no logging)
  const isPgyCompatible = useCallback((pgyA: PGYLevel, pgyB: PGYLevel): boolean => {
    // PGY1 can only swap with PGY1
    if (pgyA === 1 || pgyB === 1) {
      return pgyA === 1 && pgyB === 1;
    }

    // PGY2 and PGY3 can swap with each other and themselves
    if (pgyA === 2 || pgyA === 3) {
      return pgyB === 2 || pgyB === 3;
    }

    // For any other PGY levels, they can swap with the same level
    return pgyA === pgyB;
  }, []);

  // C7: Assignment Type Compatibility (optimized, no logging)
  const isAssignmentTypeCompatible = useCallback((typeA: string, typeB: string, isSimulationMode?: boolean): boolean => {
    // Define compatible assignment types based on medical residency rules
    const compatibilityMatrix: { [key: string]: string[] } = {
      "Required": ["Elective"], // Required can swap with Elective only
      "Elective": ["Required", "Elective"], // Elective can swap with Required and Elective
      "Status": ["Elective"], // Status (OFF, Board-Prep) can swap with Elective only
      "Clinic": [], // Clinic assignments cannot be swapped in normal mode
      "Admin": [], // Admin assignments cannot be swapped
      "TBD": [], // TBD assignments cannot be swapped
      "Vacation": [] // Vacation assignments cannot be swapped
    };

    // In simulation mode, allow clinic assignments to swap with Required and Elective
    if (isSimulationMode) {
      if (typeA === "Clinic") {
        return ["Required", "Elective"].includes(typeB);
      }
      if (typeB === "Clinic") {
        return ["Required", "Elective"].includes(typeA);
      }
    }

    const compatibleTypes = compatibilityMatrix[typeA] || [];
    return compatibleTypes.includes(typeB);
  }, []);

  // C4: MAR Shift Restriction
  const isMarRestrictionValid = useCallback((
    assignmentA: Assignment,
    assignmentB: Assignment,
    pgyA: PGYLevel,
    pgyB: PGYLevel
  ): boolean => {
    const isAssignmentAMar = assignmentA.code.includes("MAR-");
    const isAssignmentBMar = assignmentB.code.includes("MAR-");

    // If B is MAR, A must be PGY3 to take it
    if (isAssignmentBMar && pgyA !== 3) {
      return false;
    }

    // If A is MAR, B must be PGY3 to take it
    if (isAssignmentAMar && pgyB !== 3) {
      return false;
    }

    return true;
  }, []);

  // C5: Board Prep Restriction
  const isBoardPrepRestrictionValid = useCallback((
    assignmentA: Assignment,
    assignmentB: Assignment,
    pgyA: PGYLevel,
    pgyB: PGYLevel
  ): boolean => {
    const isAssignmentABoardPrep = assignmentA.code === "NSLIJ:DM:IM:Board-Prep";
    const isAssignmentBBoardPrep = assignmentB.code === "NSLIJ:DM:IM:Board-Prep";

    if ((isAssignmentABoardPrep || isAssignmentBBoardPrep) && (pgyA !== 3 || pgyB !== 3)) {
      return false;
    }

    return true;
  }, []);

  // C1: 7-Day Rule
  const isSevenDayRuleValid = useCallback((
    scheduleA: { [date: string]: Assignment },
    scheduleB: { [date: string]: Assignment },
    assignmentA: Assignment,
    assignmentB: Assignment,
    date: string
  ): boolean => {
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
  }, []);

  const validateSwap = useCallback((
    residentA: { name: string; pgyLevel: PGYLevel },
    residentB: { name: string; pgyLevel: PGYLevel },
    assignmentA: Assignment,
    assignmentB: Assignment,
    date: string,
    scheduleA: { [date: string]: Assignment },
    scheduleB: { [date: string]: Assignment },
    isSimulatedForAssignmentA: boolean = false
  ): ValidationResult => {
    // Initialize validation result
    const validationResult: ValidationResult = {
      isPgyCompatible: true, // Already pre-filtered
      isSevenDayRuleValid: false,
      isAssignmentSwappable: false,
      isMarRestrictionValid: false,
      isBoardPrepRestrictionValid: false,
      isAssignmentTypeCompatible: true, // Already pre-filtered
      isValid: false,
      isHypothetical: isSimulatedForAssignmentA
    };

    // C2: Assignment Swappability - check if assignments are explicitly marked as non-swappable
    if (isSimulatedForAssignmentA) {
      // In simulation mode, we treat assignmentA as swappable but still check assignmentB
      const assignmentBSwappable = String(assignmentB.swappable) !== String(SwappableStatus.No);
      validationResult.isAssignmentSwappable = assignmentBSwappable;
      validationResult.isHypothetical = true;
    } else {
      // Normal mode: Check if either assignment is explicitly non-swappable
      const assignmentASwappable = String(assignmentA.swappable) !== String(SwappableStatus.No);
      const assignmentBSwappable = String(assignmentB.swappable) !== String(SwappableStatus.No);
      validationResult.isAssignmentSwappable = assignmentASwappable && assignmentBSwappable;
    }

    if (!validationResult.isAssignmentSwappable) {
      validationResult.reason = "One or both assignments are marked as non-swappable";
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
    return validationResult;
  }, [isMarRestrictionValid, isBoardPrepRestrictionValid, isSevenDayRuleValid]);

  // Toggle simulation mode for hypothetical swaps
  const toggleSimulationMode = () => {
    dispatch({ type: "TOGGLE_SIMULATION_MODE" });
  };

  // Payback context functions
  const setPaybackContext = (residentA: string, residentB: string) => {
    dispatch({ type: "SET_PAYBACK_CONTEXT", payload: { residentA, residentB } });
  };

  const clearPaybackContext = () => {
    dispatch({ type: "CLEAR_PAYBACK_CONTEXT" });
  };

  // Load default schedule data when app starts
  useEffect(() => {
    // Skip if schedule is already loaded
    if (state.metadata.isLoaded) {
      return;
    }

    // Check local storage first
    const savedSchedules = getAllSchedules();
    if (savedSchedules.length > 0) {
      // Load the most recently saved schedule
      const mostRecent = savedSchedules.sort((a, b) => {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      })[0];

      try {
        const { scheduleData, metadata, pgyLevels, rawInput } = mostRecent;

        // Convert saved PGY levels to resident objects
        const residents = metadata.residents.reduce((acc, name) => {
          if (!name || name === "<>" || name === " ") return acc;

          const pgyLevelValue = pgyLevels[name] ? pgyLevels[name] as PGYLevel : (2 as PGYLevel);
          acc[name] = {
            name,
            pgyLevel: pgyLevelValue // Default to PGY2 if not available
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
      loadDefaultSchedule();
    }
  }, []);

  // Function to load the default schedule data
  const loadDefaultSchedule = () => {
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

      // Clear moonlighting cache since we have updated isWorkingDay values
      clearMoonlightingCache();

      // Get PGY levels with proper precedence: Excel > Standard JSON > Inference > Demo
      const pgyLevels: { [name: string]: PGYLevel } = {};

      // Start with demo data as fallback
      if (Object.keys(demoPGYData).length > 0) {
        for (const name in demoPGYData) {
          pgyLevels[name] = demoPGYData[name] as PGYLevel;
        }
      }

      // Then apply inferred levels (higher priority than demo)
      const inferredPgyLevels = inferPGYLevels(metadata.residents);
      Object.keys(inferredPgyLevels).forEach(name => {
        pgyLevels[name] = inferredPgyLevels[name];
      });

      // If Excel data is provided, extract PGY levels from it (highest priority)
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

      // Create resident objects with PGY levels
      const residents = metadata.residents.reduce((acc, name) => {
        if (!name || name === "<>" || name === " ") return acc;

        const pgyLevelValue = pgyLevels[name] ? pgyLevels[name] as PGYLevel : (2 as PGYLevel);
        acc[name] = {
          name,
          pgyLevel: pgyLevelValue // Default to PGY2 if not available
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

  const setCurrentResident = (residentName: string | null, preserveSwaps: boolean = false) => {
    // If setting a resident, automatically apply PGY level filters
    if (residentName && state.residents[residentName]) {
      const selectedResident = state.residents[residentName];
      const selectedPgyLevel = selectedResident.pgyLevel;
      
      // Determine which PGY levels to show based on the user's requirements:
      // PGY1 -> show only PGY1
      // PGY2 -> show PGY2 + PGY3
      // PGY3 -> show PGY2 + PGY3
      let levelsToShow: string[] = [];
      if (selectedPgyLevel === 1) {
        levelsToShow = ["1"];
      } else if (selectedPgyLevel === 2 || selectedPgyLevel === 3) {
        levelsToShow = ["2", "3"];
      }
      
      // Set the PGY filters
      dispatch({ type: "SET_SELECTED_PGY_LEVELS", payload: { levels: levelsToShow } });
    }
    
    dispatch({ type: "SET_CURRENT_RESIDENT", payload: { residentName, preserveSwaps } });
  };

  const setCurrentDate = (date: string | null, preserveSwaps: boolean = false) => {
    dispatch({ type: "SET_CURRENT_DATE", payload: { date, preserveSwaps } });
  };

  // Filter management functions
  const setSelectedPgyLevels = (levels: string[]) => {
    dispatch({ type: "SET_SELECTED_PGY_LEVELS", payload: { levels } });
  };

  const clearAllFilters = () => {
    dispatch({ type: "CLEAR_ALL_FILTERS" });
  };

  // Debounced and optimized swap finder
  const findValidSwaps = useCallback((residentName: string, date: string) => {
    // Get the initial data we need
    const residentA = state.residents[residentName];
    const assignmentA = state.schedule[residentName]?.[date];

    if (!residentA) {
      dispatch({
        type: "SET_VALID_SWAPS",
        payload: {
          validSwaps: [],
          invalidReason: `Resident ${residentName} not found`
        }
      });
      return;
    }

    // Check if we have the assignment
    if (!assignmentA) {
      dispatch({
        type: "SET_VALID_SWAPS",
        payload: {
          validSwaps: [],
          invalidReason: `No assignment found for ${residentName} on ${date}`
        }
      });
      return;
    }

    // Check if assignment is swappable (compare enum values as strings to avoid type issues)
    const isNonSwappable = String(assignmentA.swappable) === String(SwappableStatus.No);
    let isCurrentSwapSearchHypothetical = false;

    // SIMPLIFIED APPROACH:
    // In normal mode, if assignment is non-swappable, show warning and exit
    // In simulation mode, always proceed but mark as hypothetical if normally non-swappable
    if (isNonSwappable) {
      if (!state.isSimulationModeActive) {
        // Only in normal mode do we block non-swappable assignments
        // Emit an event to notify SwapResults component about non-swappable assignment
        try {
          const eventDetail = {
            code: assignmentA.code,
            type: assignmentA.type,
            swappable: "No",
            resident: residentName,
            date: date
          };

          const customEvent = document.createEvent('CustomEvent');
          customEvent.initCustomEvent('nonSwappableAssignment', true, true, eventDetail);
          window.dispatchEvent(customEvent);

          // Also set a direct flag in the DOM as a fallback mechanism
          (window as any).nonSwappableAssignmentDetected = true;
          (window as any).nonSwappableAssignmentDetails = eventDetail;
        } catch (error) {
          console.error("Failed to emit non-swappable event:", error);
        }

        dispatch({
          type: "SET_VALID_SWAPS",
          payload: {
            validSwaps: [],
            invalidReason: `The selected assignment '${assignmentA.code}' is not swappable.`
          }
        });
        return;
      } else {
        // In simulation mode, we proceed but mark as hypothetical
        isCurrentSwapSearchHypothetical = true;

        // Also set a flag on the window to track that we're in simulation mode
        (window as any).isInSimulationMode = true;
        (window as any).nonSwappableAssignmentInSimulation = assignmentA.code;

        // Notify UI that this is a non-swappable assignment but we're proceeding in simulation mode
        try {
          const eventDetail = {
            code: assignmentA.code,
            type: assignmentA.type,
            swappable: "No",
            resident: residentName,
            date: date,
            inSimulation: true
          };

          const customEvent = document.createEvent('CustomEvent');
          customEvent.initCustomEvent('nonSwappableAssignment', true, true, eventDetail);
          window.dispatchEvent(customEvent);
        } catch (error) {
          console.error("Failed to emit simulation mode non-swappable event:", error);
        }
      }
    }

    const validSwaps: PotentialSwap[] = [];

    // Pre-filter residents by PGY compatibility for performance
    const pgyCompatibleResidents = Object.keys(state.residents).filter(residentBName => {
      if (residentBName === residentName) return false;
      const residentB = state.residents[residentBName];
      return isPgyCompatible(residentA.pgyLevel, residentB.pgyLevel);
    });

    // For each PGY-compatible resident to swap with
    pgyCompatibleResidents.forEach(residentBName => {
      const residentB = state.residents[residentBName];
      const assignmentB = state.schedule[residentBName]?.[date];

      // Skip if no assignment for that day
      if (!assignmentB) return;

      // Early exit: Check assignment swappability first (fastest check)
      if (!isCurrentSwapSearchHypothetical) {
        const assignmentBSwappable = String(assignmentB.swappable) !== String(SwappableStatus.No);
        if (!assignmentBSwappable) return;
      }

      // Early exit: Check assignment type compatibility (fast check)
      if (!isAssignmentTypeCompatible(assignmentA.type, assignmentB.type, state.isSimulationModeActive)) {
        return;
      }

      // Full validation only for promising candidates
      const validationResult = validateSwap(
        residentA,
        residentB,
        assignmentA,
        assignmentB,
        date,
        state.schedule[residentName],
        state.schedule[residentBName],
        isCurrentSwapSearchHypothetical
      );

      if (validationResult.isValid) {
        validSwaps.push({
          residentA: residentName,
          residentB: residentBName,
          pgyA: residentA.pgyLevel,
          pgyB: residentB.pgyLevel,
          assignmentA,
          assignmentB,
          date,
          validationResults: validationResult,
          isHypothetical: isCurrentSwapSearchHypothetical
        });
      }
    });

    // Determine invalidReason based on results and mode
    let finalInvalidReason: string | null = null;
    if (validSwaps.length === 0) {
      if (isCurrentSwapSearchHypothetical) {
        finalInvalidReason = "No hypothetical swaps found, even when treating your assignment as swappable.";
      } else if (String(assignmentA.swappable) === "Conditional") {
        finalInvalidReason = `No valid swaps found. Your assignment '${assignmentA.code}' is conditional and may have restrictions.`;
      } else {
        finalInvalidReason = "No valid swaps found for the selected resident and date.";
      }
    }

    dispatch({
      type: "SET_VALID_SWAPS",
      payload: {
        validSwaps,
        invalidReason: finalInvalidReason
      }
    });
  }, [state.residents, state.schedule, state.isSimulationModeActive, isPgyCompatible, isAssignmentTypeCompatible, validateSwap]);

  const reset = () => {
    dispatch({ type: "RESET" });
  };

  const findPaybackSwaps = (residentAName: string, residentBName: string, originalSwapDate: string): PaybackSwap[] => {
    return [];
  };

  const saveCurrentSchedule = (name: string): SavedSchedule => {
    if (!state.metadata.isLoaded) {
      throw new Error("No schedule loaded to save");
    }
    const pgyLevels = Object.keys(state.residents).reduce((acc, name) => {
      acc[name] = state.residents[name].pgyLevel;
      return acc;
    }, {} as { [name: string]: number });
    const rawInput = state.metadata.rawInput || "";
    return saveSchedule(name, state.schedule, state.metadata, pgyLevels, rawInput);
  };

  const loadSchedule = (id: string): void => {
    const savedSchedule = getScheduleById(id);
    if (!savedSchedule) {
      throw new Error(`Schedule with ID ${id} not found`);
    }
    const residents = Object.keys(savedSchedule.pgyLevels).reduce((acc, name) => {
      acc[name] = {
        name,
        pgyLevel: savedSchedule.pgyLevels[name] as PGYLevel
      };
      return acc;
    }, {} as { [name: string]: { name: string; pgyLevel: PGYLevel } });
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
    toggleSimulationMode,
    findPaybackSwaps,
    setPaybackContext,
    clearPaybackContext,
    reset,
    setSelectedPgyLevels,
    clearAllFilters,
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

export function useSchedule() {
  const context = useContext(ScheduleContext);
  if (context === undefined) {
    throw new Error("useSchedule must be used within a ScheduleProvider");
  }
  return context;
}
