import { parse } from "date-fns";
import { 
  ScheduleData, 
  ScheduleMetadata, 
  Assignment, 
  AssignmentType, 
  SwappableStatus,
  PGYLevel 
} from "./types";
import { formatDateToYYYYMMDD } from "./utils";
import { assignmentClassification } from "./data";

// Parse HTML schedule into data structure
export function parseScheduleHTML(html: string): {
  schedule: ScheduleData;
  metadata: ScheduleMetadata;
} {
  // Create a DOM parser to handle the HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const tables = doc.querySelectorAll("table");
  
  if (tables.length === 0) {
    throw new Error("No tables found in the HTML");
  }
  
  const schedule: ScheduleData = {};
  const allDates: Date[] = [];
  const allResidents: string[] = [];
  
  // Process each table (schedule segment)
  tables.forEach((table) => {
    const rows = table.querySelectorAll("tr");
    if (rows.length <= 1) {
      return; // Skip tables without enough rows
    }
    
    // Get header row to extract dates
    const headerRow = rows[0];
    const headerCells = headerRow.querySelectorAll("th");
    
    // Map to store date strings by column index
    const datesByColumn: { [colIndex: number]: string } = {};
    const isWeekendByColumn: { [colIndex: number]: boolean } = {};
    
    // Parse date headers (skip first column which is resident names)
    for (let i = 1; i < headerCells.length; i++) {
      const headerText = headerCells[i].textContent || "";
      try {
        // Extract date from header (e.g., "Mon 5/1")
        const dateMatch = headerText.match(/\w+ (\d+\/\d+)/);
        if (dateMatch && dateMatch[1]) {
          // Parse MM/DD into a date (assume current year)
          const datePart = dateMatch[1];
          const currentYear = new Date().getFullYear();
          const date = parse(datePart, "M/d", new Date(currentYear, 0, 1));
          
          // Store standardized date string
          const dateStr = formatDateToYYYYMMDD(date);
          datesByColumn[i] = dateStr;
          allDates.push(date);
          
          // Check if it's a weekend (usually highlighted)
          const bgColor = headerCells[i].getAttribute("bgcolor");
          isWeekendByColumn[i] = bgColor === "#ffdc64" || 
                                 date.getDay() === 0 || 
                                 date.getDay() === 6;
        }
      } catch (e) {
        console.error("Error parsing date:", headerText, e);
      }
    }
    
    // Process data rows (skip header row)
    for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex];
      const cells = row.querySelectorAll("td");
      
      if (cells.length <= 1) continue;
      
      // First cell is resident name
      const residentName = cells[0].textContent?.trim() || "";
      if (!residentName) continue;
      
      // Add to resident list if not already there
      if (!allResidents.includes(residentName)) {
        allResidents.push(residentName);
      }
      
      // Initialize resident's schedule if needed
      if (!schedule[residentName]) {
        schedule[residentName] = {};
      }
      
      // Process each assignment cell
      for (let colIndex = 1; colIndex < cells.length; colIndex++) {
        const dateStr = datesByColumn[colIndex];
        if (!dateStr) continue;
        
        const assignmentCode = cells[colIndex].textContent?.trim() || "";
        const isWeekend = isWeekendByColumn[colIndex] || false;
        
        // Determine assignment type and swappability
        const assignmentInfo = getAssignmentInfo(assignmentCode, isWeekend);
        
        // Add to schedule
        schedule[residentName][dateStr] = assignmentInfo;
      }
    }
  });
  
  // Sort dates and create metadata
  allDates.sort((a, b) => a.getTime() - b.getTime());
  
  return {
    schedule,
    metadata: {
      startDate: allDates[0] || new Date(),
      endDate: allDates[allDates.length - 1] || new Date(),
      residents: allResidents,
      dates: allDates.map(d => formatDateToYYYYMMDD(d)),
      isLoaded: true
    }
  };
}

// Get assignment info based on code
function getAssignmentInfo(
  code: string,
  isWeekend: boolean
): Assignment {
  // Find matching classification
  let matchingRule = Object.entries(assignmentClassification).find(
    ([pattern, _]) => code === pattern || code.startsWith(pattern)
  );
  
  // Default if no match
  if (!matchingRule) {
    matchingRule = ["Unknown", {
      type: "Required",
      swappable: "No",
      notes: "Unclassified assignment"
    }];
  }
  
  const [pattern, rule] = matchingRule;
  
  return {
    code,
    type: rule.type,
    swappable: rule.swappable,
    isWeekend,
    isWorkingDay: true // This will be calculated later with isWorkingDay()
  };
}

// Infer PGY levels from names if provided
export function inferPGYLevels(residents: string[]): { [name: string]: PGYLevel } {
  const pgyLevels: { [name: string]: PGYLevel } = {};
  
  residents.forEach(name => {
    // Default to PGY2 if we can't infer
    let pgyLevel: PGYLevel = 2;
    
    // Check for PGY indicators in the name
    if (name.includes("PGY1") || name.includes("PGY 1")) {
      pgyLevel = 1;
    } else if (name.includes("PGY3") || name.includes("PGY 3")) {
      pgyLevel = 3;
    } else if (name.includes("PGY2") || name.includes("PGY 2")) {
      pgyLevel = 2;
    }
    
    pgyLevels[name] = pgyLevel;
  });
  
  return pgyLevels;
}
