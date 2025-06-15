import { 
  formatDateToYYYYMMDD, 
  isWorkingDay, 
  checkConsecutiveWorkingDays,
  createSimulatedSchedule 
} from "./utils";
import { Assignment, SwappableStatus } from "./types";
import { addDays, subDays, parseISO, format, startOfMonth, endOfMonth, getDaysInMonth } from "date-fns";

export interface MoonlightingDate {
  date: string; // YYYY-MM-DD format
  dayOfWeek: string; // "Monday", "Tuesday", etc.
  dayNumber: number; // 1-31
  isEligible: boolean;
  reason?: string; // Reason if not eligible
  currentAssignment?: Assignment;
}

export interface MoonlightingMonth {
  monthKey: string; // "2024-01"
  year: number;
  month: number; // 1-12  
  monthName: string; // "January"
  dates: MoonlightingDate[];
  eligibleCount: number;
}

export interface MoonlightingCache {
  [residentName: string]: {
    [monthKey: string]: MoonlightingMonth;
  };
}

// Cache management
const CACHE_KEY = 'moonlighting-cache';
const CACHE_VERSION_KEY = 'moonlighting-cache-version';

// Get current cache version based on schedule metadata
function getCacheVersion(scheduleMetadata: any): string {
  return `${scheduleMetadata.startDate}-${scheduleMetadata.endDate}-${scheduleMetadata.residents.length}`;
}

// Load cache from localStorage
function loadCache(): MoonlightingCache {
  try {
    const cacheData = localStorage.getItem(CACHE_KEY);
    return cacheData ? JSON.parse(cacheData) : {};
  } catch (error) {
    console.warn('Failed to load moonlighting cache:', error);
    return {};
  }
}

// Save cache to localStorage
function saveCache(cache: MoonlightingCache): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.warn('Failed to save moonlighting cache:', error);
  }
}

// Check if cache is valid for current schedule
function isCacheValid(scheduleMetadata: any): boolean {
  const currentVersion = getCacheVersion(scheduleMetadata);
  const cachedVersion = localStorage.getItem(CACHE_VERSION_KEY);
  return currentVersion === cachedVersion;
}

// Update cache version
function updateCacheVersion(scheduleMetadata: any): void {
  const version = getCacheVersion(scheduleMetadata);
  localStorage.setItem(CACHE_VERSION_KEY, version);
}

// Clear invalid cache
export function clearMoonlightingCache(): void {
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(CACHE_VERSION_KEY);
}

// Clear cache when core working day rules change
// Call this when isWorkingDay logic is updated
export function invalidateCacheOnRuleChange(): void {
  clearMoonlightingCache();
  console.log('Moonlighting cache cleared due to working day rule changes');
}

// Auto-clear cache on app load if rules have changed
// This ensures users get updated calculations
if (typeof window !== 'undefined') {
  const RULE_VERSION_KEY = 'moonlighting-rule-version';
  const CURRENT_RULE_VERSION = '4.0-date-aware-working-day-check';
  
  const cachedRuleVersion = localStorage.getItem(RULE_VERSION_KEY);
  if (cachedRuleVersion !== CURRENT_RULE_VERSION) {
    invalidateCacheOnRuleChange();
    localStorage.setItem(RULE_VERSION_KEY, CURRENT_RULE_VERSION);
  }
}

/**
 * Date-aware working day check that calculates the correct weekend status
 * This is more reliable than depending on the assignment.isWeekend flag
 */
function isWorkingDayWithDate(assignment: Assignment, dateStr: string): boolean {
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

  // Calculate the correct weekend status from the actual date
  const date = parseISO(dateStr);
  const actualIsWeekend = date.getDay() === 0 || date.getDay() === 6; // 0=Sunday, 6=Saturday

  // Clinic assignments on weekends are not working days (clinics don't operate on weekends)
  if (actualIsWeekend && assignment.code.startsWith("NSLIJ:DM:IM:Clinic-")) {
    return false;
  }

  // Weekend check for electives - only MICU and CCU work on weekends
  // All other electives have weekends off regardless of what the schedule shows
  if (actualIsWeekend && assignment.type === "Elective") {
    // MICU and CCU are the exceptions - they do work weekends
    const isMICU = assignment.code.includes("MICU");
    const isCCU = assignment.code.startsWith("CARD:CCU-") || assignment.code.includes("CCU");
    
    if (!isMICU && !isCCU) {
      return false; // All other electives are off on weekends
    }
  }

  return true;
}

/**
 * Calculate moonlighting eligibility for a specific resident on a specific date
 */
function isDateEligibleForMoonlighting(
  residentSchedule: { [date: string]: Assignment },
  dateStr: string,
  allScheduleDates: string[]
): { isEligible: boolean; reason?: string } {
  const assignment = residentSchedule[dateStr];
  
  console.log(`🔍 Checking eligibility for ${dateStr}:`, assignment);
  
  // Must be an OFF day (either no assignment or not a working day)
  if (!assignment) {
    console.log(`❌ ${dateStr} not eligible: No assignment data`);
    return {
      isEligible: false,
      reason: "No assignment data"
    };
  }

  // Check if this is actually a working day (handles elective weekends, clinic weekends, etc.)
  // Use date-aware working day check to avoid issues with incorrect isWeekend flags
  if (isWorkingDayWithDate(assignment, dateStr)) {
    console.log(`❌ ${dateStr} not eligible: Working day (${assignment.code})`);
    return {
      isEligible: false,
      reason: `Working day: ${assignment.code}`
    };
  }

  // Create a simulated working assignment for this date
  const workingAssignment: Assignment = {
    code: "MOONLIGHT",
    type: "Required",  
    swappable: SwappableStatus.No,
    isWeekend: assignment.isWeekend,
    isWorkingDay: true
  };

  // Create simulated schedule where this person works on their OFF day
  const simulatedSchedule = createSimulatedSchedule(residentSchedule, dateStr, workingAssignment);

  // Check if working this day would create 7+ consecutive working days
  // We need to check a range around this date (6 days before and after)
  const checkDate = parseISO(dateStr);
  const startCheck = formatDateToYYYYMMDD(subDays(checkDate, 6));
  const endCheck = formatDateToYYYYMMDD(addDays(checkDate, 6));

  // Only check dates that exist in our schedule
  const startCheckDate = parseISO(startCheck);
  const endCheckDate = parseISO(endCheck);
  
  // Find the actual range to check based on available dates
  const availableDatesInRange = allScheduleDates.filter(date => {
    const d = parseISO(date);
    return d >= startCheckDate && d <= endCheckDate;
  }).sort();

  if (availableDatesInRange.length === 0) {
    return { isEligible: true }; // No surrounding data to check against
  }

  const actualStartCheck = availableDatesInRange[0];
  const actualEndCheck = availableDatesInRange[availableDatesInRange.length - 1];

  // Check for 7+ consecutive working days in the simulated schedule
  const wouldViolateRule = checkConsecutiveWorkingDays(
    simulatedSchedule,
    actualStartCheck,
    actualEndCheck
  );

  console.log(`🔄 7-day rule check for ${dateStr}: ${wouldViolateRule ? 'VIOLATES' : 'OK'}`);

  if (wouldViolateRule) {
    console.log(`❌ ${dateStr} would violate 7-day rule`);
    return {
      isEligible: false,
      reason: "Would result in 7+ consecutive working days"
    };
  }

  console.log(`✅ ${dateStr} is ELIGIBLE for moonlighting!`);
  return { isEligible: true };
}

/**
 * Calculate moonlighting dates for a resident for a specific month
 */
export function calculateMoonlightingForMonth(
  residentName: string,
  year: number,
  month: number, // 1-12
  schedule: { [residentName: string]: { [date: string]: Assignment } },
  allScheduleDates: string[],
  useCache: boolean = true
): MoonlightingMonth {
  const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
  
  // Check cache first
  if (useCache) {
    const cache = loadCache();
    if (cache[residentName] && cache[residentName][monthKey]) {
      return cache[residentName][monthKey];
    }
  }

  const residentSchedule = schedule[residentName] || {};
  const monthStart = new Date(year, month - 1, 1); // month is 0-indexed in Date constructor
  const monthEnd = endOfMonth(monthStart);
  const daysInMonth = getDaysInMonth(monthStart);
  
  const dates: MoonlightingDate[] = [];
  let eligibleCount = 0;

  // Generate all dates in the month
  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(year, month - 1, day);
    const dateStr = formatDateToYYYYMMDD(currentDate);
    const dayOfWeek = format(currentDate, 'EEEE');
    
    const assignment = residentSchedule[dateStr];
    const eligibilityCheck = isDateEligibleForMoonlighting(
      residentSchedule, 
      dateStr, 
      allScheduleDates
    );

    if (eligibilityCheck.isEligible) {
      eligibleCount++;
    }

    dates.push({
      date: dateStr,
      dayOfWeek,
      dayNumber: day,
      isEligible: eligibilityCheck.isEligible,
      reason: eligibilityCheck.reason,
      currentAssignment: assignment
    });
  }

  const monthData: MoonlightingMonth = {
    monthKey,
    year,
    month,
    monthName: format(monthStart, 'MMMM'),
    dates,
    eligibleCount
  };

  // Cache the result
  if (useCache) {
    const cache = loadCache();
    if (!cache[residentName]) {
      cache[residentName] = {};
    }
    cache[residentName][monthKey] = monthData;
    saveCache(cache);
  }

  return monthData;
}

/**
 * Calculate moonlighting dates for multiple months
 */
export function calculateMoonlightingForMonths(
  residentName: string,
  startYear: number,
  startMonth: number,
  monthCount: number,
  schedule: { [residentName: string]: { [date: string]: Assignment } },
  scheduleMetadata: any,
  useCache: boolean = true
): MoonlightingMonth[] {
  // Validate cache
  if (useCache && !isCacheValid(scheduleMetadata)) {
    clearMoonlightingCache();
    updateCacheVersion(scheduleMetadata);
  }

  const results: MoonlightingMonth[] = [];
  let currentYear = startYear;
  let currentMonth = startMonth;

  for (let i = 0; i < monthCount; i++) {
    const monthData = calculateMoonlightingForMonth(
      residentName,
      currentYear,
      currentMonth,
      schedule,
      scheduleMetadata.dates,
      useCache
    );
    
    results.push(monthData);

    // Move to next month
    currentMonth++;
    if (currentMonth > 12) {
      currentMonth = 1;
      currentYear++;
    }
  }

  return results;
}

/**
 * Get a full year of months starting from current month as default view
 */
export function getDefaultMoonlightingMonths(): { year: number; month: number }[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // getMonth() is 0-indexed

  const months = [];
  let year = currentYear;
  let month = currentMonth;

  // Generate 12 months starting from current month
  for (let i = 0; i < 12; i++) {
    months.push({ year, month });

    // Move to next month
    month++;
    if (month > 12) {
      month = 1;
      year++;
    }
  }

  return months;
} 