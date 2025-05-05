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
  console.log("Parsing HTML schedule...");
  
  // Create a DOM parser to handle the HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const tables = doc.querySelectorAll("table");
  
  if (tables.length === 0) {
    throw new Error("No tables found in the HTML. Please ensure the HTML contains a valid table element.");
  }
  
  console.log(`Found ${tables.length} tables in the HTML`);
  
  const schedule: ScheduleData = {};
  const allDates: Date[] = [];
  const allResidents: string[] = [];
  
  // Process each table (schedule segment)
  tables.forEach((table) => {
    const rows = table.querySelectorAll("tr");
    if (rows.length <= 1) {
      console.log(`Skipping table - not enough rows (${rows.length})`);
      return; // Skip tables without enough rows
    }
    
    console.log(`Processing table with ${rows.length} rows`);
    
    // Get header row to extract dates
    const headerRow = rows[0];
    
    // Try both th and td for header cells, as some tables use td for headers
    let headerCells = headerRow.querySelectorAll("th");
    
    // If no th elements found, try td instead
    if (headerCells.length === 0) {
      console.log("No <th> elements found, using <td> for headers");
      headerCells = headerRow.querySelectorAll("td");
    }
    
    console.log(`Found ${headerCells.length} header cells`);
    
    // Map to store date strings by column index
    const datesByColumn: { [colIndex: number]: string } = {};
    const isWeekendByColumn: { [colIndex: number]: boolean } = {};
    
    // Parse date headers (skip first column which is resident names)
    for (let i = 1; i < headerCells.length; i++) {
      const headerText = headerCells[i].textContent || "";
      const headerHtml = headerCells[i].innerHTML || "";
      
      console.log(`Header cell ${i} content: "${headerText}"`);
      
      try {
        // Try to extract date parts from the text
        // Check for different formats:
        // 1. "Tue 4-22" or "Tue 4/22"
        // 2. "Tue<br>4-22" or "Tue<br>4/22"
        
        // First look for a date with month and day
        let dateMatch = headerText.match(/(\d+)[-\/](\d+)/);
        
        if (!dateMatch && headerHtml.includes("<br>")) {
          // If no match but there's a <br>, try looking after the <br> tag
          const afterBr = headerHtml.split("<br>")[1];
          if (afterBr) {
            dateMatch = afterBr.match(/(\d+)[-\/](\d+)/);
          }
        }
        
        if (dateMatch) {
          // We found a month/day format
          const month = parseInt(dateMatch[1], 10);
          const day = parseInt(dateMatch[2], 10);
          
          // Determine the year (use current year, adjust if needed)
          const currentDate = new Date();
          let year = currentDate.getFullYear();
          
          // If the month is earlier than current month and we're late in the year,
          // it's likely referring to next year
          if (month < currentDate.getMonth() + 1 && currentDate.getMonth() > 8) {
            year += 1;
          }
          
          // Create the date object
          const date = new Date(year, month - 1, day);
          console.log(`Parsed date: ${date.toISOString()}`);
          
          // Store standardized date string
          const dateStr = formatDateToYYYYMMDD(date);
          datesByColumn[i] = dateStr;
          
          // Only add unique dates
          if (!allDates.some(d => formatDateToYYYYMMDD(d) === dateStr)) {
            allDates.push(date);
          }
          
          // Check if it's a weekend (by bgcolor attribute or day of week)
          const bgColor = headerCells[i].getAttribute("bgcolor");
          isWeekendByColumn[i] = bgColor === "#ffdc64" || 
                                 date.getDay() === 0 || 
                                 date.getDay() === 6;
          
          console.log(`Column ${i}: Date ${dateStr}, Weekend: ${isWeekendByColumn[i]}`);
        } else {
          console.warn(`Could not parse date from header cell ${i}: "${headerText}"`);
        }
      } catch (e) {
        console.error(`Error parsing date from header cell ${i}:`, headerText, e);
      }
    }
    
    // Process data rows (skip header row)
    for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex];
      const cells = row.querySelectorAll("td");
      
      if (cells.length <= 1) {
        console.log(`Skipping row ${rowIndex} - not enough cells (${cells.length})`);
        continue;
      }
      
      // First cell is resident name
      const residentNameCell = cells[0].textContent || "";
      
      // Clean up resident name (remove non-breaking spaces and other special chars)
      const residentName = residentNameCell
        .replace(/\u00A0/g, ' ') // Replace nbsp with regular space
        .replace(/,/g, '') // Remove commas
        .replace(/\s+/g, ' ') // Replace multiple spaces with single
        .trim();
      
      if (!residentName) {
        console.log(`Skipping row ${rowIndex} - no resident name found`);
        continue;
      }
      
      console.log(`Processing resident: ${residentName}`);
      
      // Add to resident list if not already there
      if (!allResidents.includes(residentName)) {
        allResidents.push(residentName);
      }
      
      // Initialize resident's schedule if needed
      if (!schedule[residentName]) {
        schedule[residentName] = {};
      }
      
      // Process each assignment cell
      for (let colIndex = 1; colIndex < cells.length && colIndex < headerCells.length; colIndex++) {
        const dateStr = datesByColumn[colIndex];
        if (!dateStr) {
          continue;
        }
        
        const assignmentCode = cells[colIndex].textContent?.trim() || "";
        const isWeekend = isWeekendByColumn[colIndex] || false;
        
        // Determine assignment type and swappability
        const assignmentInfo = getAssignmentInfo(assignmentCode, isWeekend);
        
        // Add to schedule
        schedule[residentName][dateStr] = assignmentInfo;
      }
    }
  });
  
  // Check if we got any data
  if (allDates.length === 0) {
    throw new Error("Failed to parse any dates from the schedule. Please check the format of your HTML.");
  }
  
  if (allResidents.length === 0) {
    throw new Error("Failed to parse any resident names from the schedule. Please check the format of your HTML.");
  }
  
  console.log(`Successfully parsed ${allDates.length} unique dates and ${allResidents.length} residents`);
  
  // Sort dates and create metadata
  allDates.sort((a, b) => a.getTime() - b.getTime());
  
  // Remove duplicates and convert to strings
  const uniqueDateStrings = Array.from(new Set(allDates.map(d => formatDateToYYYYMMDD(d))));
  
  return {
    schedule,
    metadata: {
      startDate: allDates[0] || new Date(),
      endDate: allDates[allDates.length - 1] || new Date(),
      residents: allResidents,
      dates: uniqueDateStrings,
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
  const matchingEntry = Object.entries(assignmentClassification).find(
    ([pattern, _]) => code === pattern || code.startsWith(pattern)
  );
  
  // Default if no match
  if (!matchingEntry) {
    return {
      code,
      type: "Required" as AssignmentType,
      swappable: SwappableStatus.No,
      isWeekend,
      isWorkingDay: code !== "OFF" && !code.includes("Vacation") && !code.includes("LOA")
    };
  }
  
  const [_, rule] = matchingEntry;
  
  // Convert string to enum
  let swappableStatus: SwappableStatus;
  if (rule.swappable === "Yes") {
    swappableStatus = SwappableStatus.Yes;
  } else if (rule.swappable === "No") {
    swappableStatus = SwappableStatus.No;
  } else {
    swappableStatus = SwappableStatus.Conditional;
  }
  
  return {
    code,
    type: rule.type,
    swappable: swappableStatus,
    isWeekend,
    isWorkingDay: code !== "OFF" && !code.includes("Vacation") && !code.includes("LOA") // This will be calculated later with isWorkingDay()
  };
}

// Infer PGY levels from names if provided or use a distribution
export function inferPGYLevels(residents: string[]): { [name: string]: PGYLevel } {
  const pgyLevels: { [name: string]: PGYLevel } = {};
  
  // For this example, we're assigning specific PGY levels for Chen Anne and Flescher Andrew
  // to debug our specific swap case
  const knownLevels: { [name: string]: PGYLevel } = {
    "Chen Anne": 3,
    "Flescher Andrew": 3,
    "Goldstein Aaron": 2,
    "Eisenberg Samuel": 2,
    "Kim Esther": 1,
    "Ro Esther": 1,
    "Jnani Jack": 1,
    "Kashfi Simon": 1,
    "Wright Jervon": 3,
    "Vincent Maria": 3,
    "Bulsara Kishen": 2,
    "Dulmovits Eric": 2,
    "Gliagias Vasiliki": 3,
    "Tsai Andrew": 2,
    "Yoo Angela": 1
  };
  
  // Count to distribute residents across PGY levels
  let pgy1Count = 0;
  let pgy2Count = 0;
  let pgy3Count = 0;
  
  residents.forEach(name => {
    // Skip empty names or placeholders
    if (!name || name === "<>" || name === " ") {
      return;
    }
    
    // Check if we have a known level for this resident
    if (knownLevels[name] !== undefined) {
      pgyLevels[name] = knownLevels[name];
      return;
    }
    
    // Check for PGY indicators in the name
    if (name.includes("PGY1") || name.includes("PGY 1") || name.includes("PGY-1")) {
      pgyLevels[name] = 1;
      return;
    } else if (name.includes("PGY3") || name.includes("PGY 3") || name.includes("PGY-3")) {
      pgyLevels[name] = 3;
      return;
    } else if (name.includes("PGY2") || name.includes("PGY 2") || name.includes("PGY-2")) {
      pgyLevels[name] = 2;
      return;
    }
    
    // If we can't determine from the name, distribute evenly
    // This is just for demonstration - in a real app you'd want user input
    if (pgy1Count <= pgy2Count && pgy1Count <= pgy3Count) {
      pgyLevels[name] = 1;
      pgy1Count++;
    } else if (pgy2Count <= pgy3Count) {
      pgyLevels[name] = 2;
      pgy2Count++;
    } else {
      pgyLevels[name] = 3;
      pgy3Count++;
    }
  });
  
  console.log("Inferred PGY levels:", pgyLevels);
  return pgyLevels;
}