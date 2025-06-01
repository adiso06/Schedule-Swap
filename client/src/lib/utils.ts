import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Assignment, AssignmentType, SwappableStatus } from "./types";
import { format, addDays, subDays, isWeekend, parseISO } from "date-fns";

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

  // Weekend check for electives - only CCU potentially works on weekends
  if (
    assignment.isWeekend && 
    assignment.type === "Elective" && 
    !assignment.code.startsWith("CARD:CCU-")
  ) {
    return false;
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

// Check if consecutive days include 7+ working days
export function checkConsecutiveWorkingDays(
  schedule: { [date: string]: Assignment },
  startDate: string,
  endDate: string
): boolean {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  
  let consecutiveCount = 0;
  let currentDate = start;
  
  while (currentDate <= end) {
    const dateStr = formatDateToYYYYMMDD(currentDate);
    const assignment = schedule[dateStr];
    
    if (assignment && isWorkingDay(assignment)) {
      consecutiveCount++;
      if (consecutiveCount >= 7) {
        return true; // Found 7+ consecutive working days
      }
    } else {
      consecutiveCount = 0; // Reset counter
    }
    
    currentDate = addDays(currentDate, 1);
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
