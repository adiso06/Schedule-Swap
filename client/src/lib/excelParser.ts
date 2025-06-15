import { 
  ScheduleData, 
  ScheduleMetadata, 
  Assignment, 
  AssignmentType, 
  SwappableStatus,
  PGYLevel 
} from "@/lib/types";
import { getAssignmentInfo } from "@/lib/scheduleParser";

/**
 * Parse tab-delimited or Excel-like data format
 */
export function parseExcelData(data: string): {
  schedule: ScheduleData;
  metadata: ScheduleMetadata;
} {
  // Split the data into lines
  const lines = data.trim().split(/\r?\n/);
  if (lines.length < 2) {
    throw new Error("Invalid data format: Not enough rows");
  }

  // Extract header row (dates)
  const headerRow = lines[0].split(/\t/);
  const dateHeaderStartIndex = 2; // Assuming first two columns are Name and PGY Level
  
  // Process dates from header
  const dates: string[] = [];
  for (let i = dateHeaderStartIndex; i < headerRow.length; i++) {
    if (headerRow[i] && headerRow[i].trim()) {
      // Convert date formats like Apr-22 to 2025-04-22
      const dateStr = headerRow[i].trim();
      const date = parseExcelDateString(dateStr);
      if (date) {
        dates.push(date);
      }
    }
  }

  if (dates.length === 0) {
    throw new Error("No valid dates found in the header row");
  }

  // Process resident data rows
  const schedule: ScheduleData = {};
  const residents: string[] = [];

  for (let i = 2; i < lines.length; i++) { // Start from row 3 (index 2)
    const row = lines[i].split(/\t/);
    if (row.length < 3) continue; // Skip rows without enough data
    
    const residentName = row[0].trim();
    if (!residentName) continue;
    
    // Store resident name
    residents.push(residentName);
    
    // Create resident schedule
    schedule[residentName] = {};
    
    // Process assignments
    for (let j = 0; j < dates.length; j++) {
      const dateIndex = j + dateHeaderStartIndex;
      if (dateIndex < row.length && row[dateIndex]) {
        const assignmentCode = row[dateIndex].trim();
        if (assignmentCode && assignmentCode !== "OFF") {
          // Use the existing getAssignmentInfo function to classify assignments
          const isWeekendDay = checkIsWeekend(new Date(dates[j]));
          
          // Get assignment info but handle clinic weekends specially
          schedule[residentName][dates[j]] = getAssignmentInfo(assignmentCode, isWeekendDay);
          
          // For clinic assignments on weekends, override swappable and working status
          // but keep the original clinic code for display
          if (isWeekendDay && assignmentCode.startsWith("NSLIJ:DM:IM:Clinic-")) {
            schedule[residentName][dates[j]].swappable = SwappableStatus.No;
            schedule[residentName][dates[j]].isWorkingDay = false;
          }
        } else if (assignmentCode === "OFF") {
          // Handle OFF days explicitly
          schedule[residentName][dates[j]] = {
            code: "OFF",
            type: "Status" as AssignmentType,
            swappable: SwappableStatus.No,
            isWeekend: checkIsWeekend(new Date(dates[j])),
            isWorkingDay: false
          };
        }
      }
    }
  }

  // Extract PGY levels from the data
  const pgyLevels = extractPgyLevels(lines);

  // Create metadata
  const metadata: ScheduleMetadata = {
    startDate: new Date(dates[0]),
    endDate: new Date(dates[dates.length - 1]),
    residents,
    dates,
    isLoaded: true
  };

  return { schedule, metadata };
}

/**
 * Parse dates like "jun-25-26" (MMM-DD-YY format) to ISO format "YYYY-MM-DD"
 */
function parseExcelDateString(dateStr: string): string | null {
  // Check if the date is in format "MMM-DD-YY" like "jun-25-26"
  const monthNames = [
    'jan', 'feb', 'mar', 'apr', 'may', 'jun', 
    'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
  ];

  // Try to match the new format: MMM-DD-YY (case insensitive)
  const newFormatMatch = dateStr.match(/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)-(\d{1,2})-(\d{2})$/i);
  if (newFormatMatch) {
    const monthStr = newFormatMatch[1].toLowerCase();
    const day = parseInt(newFormatMatch[2], 10);
    const yearShort = parseInt(newFormatMatch[3], 10);
    
    // Convert month name to number
    const month = monthNames.indexOf(monthStr) + 1;
    
    // Convert 2-digit year to 4-digit year
    // Assume years 00-29 are 2000-2029, years 30-99 are 1930-1999
    let year = yearShort < 30 ? 2000 + yearShort : 1900 + yearShort;
    
    if (month > 0) {
      // Format numbers to ensure 2 digits
      const formattedMonth = month.toString().padStart(2, '0');
      const formattedDay = day.toString().padStart(2, '0');

      // Return in YYYY-MM-DD format
      return `${year}-${formattedMonth}-${formattedDay}`;
    }
  }

  // Fallback to old formats for backward compatibility
  // Format: Apr-22 (Month abbreviation followed by day)
  const monthFirstMatch = dateStr.match(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-(\d{1,2})$/i);
  if (monthFirstMatch) {
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const month = monthNames.findIndex(m => m.toLowerCase() === monthFirstMatch[1].toLowerCase()) + 1;
    const day = parseInt(monthFirstMatch[2], 10);
    
    // Use current year as fallback for old format
    const year = new Date().getFullYear();
    
    if (month > 0) {
      const formattedMonth = month.toString().padStart(2, '0');
      const formattedDay = day.toString().padStart(2, '0');
      return `${year}-${formattedMonth}-${formattedDay}`;
    }
  }
  
  // Format: 05-Jan (Day followed by month abbreviation)
  const dayFirstMatch = dateStr.match(/^(\d{1,2})-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)$/i);
  if (dayFirstMatch) {
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const day = parseInt(dayFirstMatch[1], 10);
    const month = monthNames.findIndex(m => m.toLowerCase() === dayFirstMatch[2].toLowerCase()) + 1;
    
    // Use current year as fallback for old format
    const year = new Date().getFullYear();
    
    if (month > 0) {
      const formattedMonth = month.toString().padStart(2, '0');
      const formattedDay = day.toString().padStart(2, '0');
      return `${year}-${formattedMonth}-${formattedDay}`;
    }
  }

  // If we couldn't parse the date properly, return null
  console.warn(`Could not parse date string: ${dateStr}`);
  return null;
}

/**
 * Check if a date is a weekend
 */
function checkIsWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
}

/**
 * Extract PGY levels from the Excel data
 */
function extractPgyLevels(lines: string[]): { [name: string]: PGYLevel } {
  const pgyLevels: { [name: string]: PGYLevel } = {};

  for (let i = 2; i < lines.length; i++) { // Start from row 3 (index 2)
    const row = lines[i].split(/\t/);
    if (row.length < 2) continue;
    
    const residentName = row[0].trim();
    const pgyLevelStr = row[1].trim();
    
    if (residentName && pgyLevelStr) {
      // Extract PGY level (e.g., "PGY-1" => 1)
      let pgyLevel: PGYLevel | null = null;
      
      // Try matching different PGY level formats
      const pgyMatch = pgyLevelStr.match(/PGY-?(\d+)/i);
      if (pgyMatch) {
        pgyLevel = parseInt(pgyMatch[1], 10) as PGYLevel;
      } else if (pgyLevelStr === "1" || pgyLevelStr === "2" || pgyLevelStr === "3") {
        pgyLevel = parseInt(pgyLevelStr, 10) as PGYLevel;
      } else if (pgyLevelStr.toLowerCase().includes("pgy") && pgyLevelStr.includes("1")) {
        pgyLevel = 1;
      } else if (pgyLevelStr.toLowerCase().includes("pgy") && pgyLevelStr.includes("2")) {
        pgyLevel = 2;
      } else if (pgyLevelStr.toLowerCase().includes("pgy") && pgyLevelStr.includes("3")) {
        pgyLevel = 3;
      }
      
      if (pgyLevel) {
        pgyLevels[residentName] = pgyLevel;
      }
    }
  }
  
  console.log("Extracted PGY levels from Excel:", pgyLevels);
  return pgyLevels;
}
