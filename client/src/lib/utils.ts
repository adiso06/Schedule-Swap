import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Assignment, AssignmentType, SwappableStatus } from "./types";
import { format, addDays, subDays, isWeekend, parseISO } from "date-fns";
import { getAssignmentDetails } from "./data";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Get date in YYYY-MM-DD format
export function formatDateToYYYYMMDD(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

// Format date for display
export function formatDateForDisplay(dateString: string): string {
  const date = parseISO(dateString);
  return format(date, "MMM d, yyyy");
}

// Get week range for display (e.g., "May 1-7, 2023")
export function getWeekDisplay(startDate: Date): string {
  const endDate = addDays(startDate, 6);
  return `${format(startDate, "MMM d")}-${format(endDate, "d, yyyy")}`;
}

// Check if an assignment is a working day
// This function is critical for both swap calculations and moonlighting eligibility
export function isWorkingDay(assignment: Assignment): boolean {
  // Non-working assignments
  const nonWorkingCodes = [
    "OFF",
    "NSLIJ:DM:IM:Vacation",
    "NSLIJ:DM:IM:LOA-Medical",
    "NSLIJ:DM:IM:Board-Prep"
  ];

  if (nonWorkingCodes.includes(assignment.code)) {
    return false;
  }

  // Clinic assignments on weekends are not working days (clinics don't operate on weekends)
  if (assignment.isWeekend && assignment.code.startsWith("NSLIJ:DM:IM:Clinic-")) {
    return false;
  }

  // Weekend check for electives - only MICU and CCU work on weekends
  // All other electives have weekends off regardless of what the schedule shows
  if (assignment.isWeekend && assignment.type === "Elective") {
    // MICU and CCU are the exceptions - they do work weekends
    const isMICU = assignment.code.includes("MICU");
    const isCCU = assignment.code.startsWith("CARD:CCU-") || assignment.code.includes("CCU");
    
    if (!isMICU && !isCCU) {
      return false; // All other electives are off on weekends
    }
  }

  return true;
}

// Get badge color for assignment type
export function getAssignmentTypeBadgeColor(type: AssignmentType): string {
  switch (type) {
    case "Required":
      return "bg-purple-100 text-purple-800";
    case "Elective":
      return "bg-blue-100 text-blue-800";
    case "Status":
      return "bg-green-100 text-green-800";
    case "Admin":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

// Get background color for assignment box
export function getAssignmentBgColor(type: AssignmentType): string {
  switch (type) {
    case "Required":
      return "bg-purple-50 border-purple-100";
    case "Elective":
      return "bg-blue-50 border-blue-100";
    case "Status":
      return "bg-green-50 border-green-100";
    case "Admin":
      return "bg-orange-50 border-orange-100";
    default:
      return "bg-gray-50 border-gray-200";
  }
}

// Check if working on a date would violate the 7-day rule (Monday-to-Sunday weeks)
export function checkConsecutiveWorkingDays(
  schedule: { [date: string]: Assignment },
  startDate: string,
  endDate: string
): boolean {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  
  // Find all Monday-to-Sunday weeks that overlap with our date range
  let currentDate = start;
  
  while (currentDate <= end) {
    // Find the Monday of the current week
    const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // If Sunday, go back 6 days; otherwise go to Monday
    const mondayOfWeek = addDays(currentDate, mondayOffset);
    
    // Count working days in this Monday-to-Sunday week
    let workingDaysInWeek = 0;
    for (let i = 0; i < 7; i++) {
      const dayInWeek = addDays(mondayOfWeek, i);
      const dayInWeekStr = formatDateToYYYYMMDD(dayInWeek);
      const assignment = schedule[dayInWeekStr];
      
      if (assignment && isWorkingDay(assignment)) {
        workingDaysInWeek++;
      }
    }
    
    if (workingDaysInWeek >= 7) {
      return true; // Found a week with 7 working days
    }
    
    // Move to next week
    currentDate = addDays(mondayOfWeek, 7);
  }
  
  return false;
}

// Get consecutive ranges to check before and after a swap
export function getConsecutiveRanges(dateStr: string): [string, string] {
  const date = parseISO(dateStr);
  const startDate = formatDateToYYYYMMDD(subDays(date, 6));
  const endDate = formatDateToYYYYMMDD(addDays(date, 6));
  
  return [startDate, endDate];
}

// Create a simulated schedule from an original one with a swap
export function createSimulatedSchedule(
  originalSchedule: { [date: string]: Assignment },
  dateStr: string,
  newAssignment: Assignment
): { [date: string]: Assignment } {
  return {
    ...originalSchedule,
    [dateStr]: newAssignment
  };
}

// Categorize rotation by type for better grouping
export function categorizeRotationByType(assignmentCode: string): string {
  if (!assignmentCode || assignmentCode.trim() === "") {
    return "Off Days";
  }

  const trimmedCode = assignmentCode.trim();
  
  // Get classification details
  const details = getAssignmentDetails(trimmedCode);
  
  // Handle specific patterns first (most specific)
  
  // Off Days
  if (trimmedCode === "OFF" || trimmedCode === "0") {
    return "Off Days";
  }
  
  // Admin (LOA, Paternity, Chief)
  if (trimmedCode.includes("LOA") || 
      trimmedCode.includes("Paternity") ||
      trimmedCode.includes("Chief")) {
    return "Admin";
  }
  
  // ICU/Critical Care (MICU, CCU)
  if (trimmedCode.includes("MICU") || 
      trimmedCode.includes("CCU") ||
      trimmedCode.startsWith("CARD:CCU-")) {
    return "ICU/Critical Care";
  }
  
  // Emergency Medicine
  if (trimmedCode.includes("ER-") || 
      trimmedCode.includes("DE:ER") ||
      trimmedCode.startsWith("ER:ER-")) {
    return "Emergency Medicine";
  }
  
  // Core Rotations (Team, MAR, NF, Night Admit)
  if (trimmedCode.includes("Team-") ||
      trimmedCode.includes("MAR-") ||
      trimmedCode.includes("NF-") ||
      trimmedCode.includes("Night-Ad-")) {
    return "Core Rotations";
  }
  
  // Clinic Assignments
  if (details.type === "Clinic" || trimmedCode.includes("Clinic-")) {
    return "Clinic Assignments";
  }
  
  // Electives (El-, Cards, Pulm non-MICU, Vacation, Advocacy, Board Prep, Neuro, Palliative, ENT)
  if (details.type === "Elective" ||
      trimmedCode.includes("El-") ||
      trimmedCode.includes("EI-") ||
      trimmedCode.startsWith("CARD:El-") ||
      trimmedCode.includes("PULM:") && !trimmedCode.includes("MICU") ||
      trimmedCode.includes("Vacation") ||
      trimmedCode.includes("Advocacy") ||
      trimmedCode.includes("Board-Prep") ||
      trimmedCode.includes("DN:Neuro") ||
      trimmedCode.includes("Palliative") ||
      trimmedCode === "ENT") {
    return "Electives";
  }
  
  // Default to Electives for anything else (since most unclassified items are likely electives)
  return "Electives";
}
