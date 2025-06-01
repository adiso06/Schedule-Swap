import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { useContext } from "react";
import { ScheduleContext } from "@/context/ScheduleContext";
import { useToast } from "@/hooks/use-toast";
import { formatDateForDisplay, getAssignmentTypeBadgeColor } from "@/lib/utils";
import { getUserFriendlyLabel } from "@/lib/assignmentLabels";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

export default function SwapFinderForm() {
  // UI state
  const [isSearching, setIsSearching] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [residentInput, setResidentInput] = useState("");
  const [filteredResidents, setFilteredResidents] = useState<string[]>([]);
  const [dateInput, setDateInput] = useState("");
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  
  // Feature flags
  const [autoSearchEnabled] = useState(false); // Disabled by default - user must click button
  
  // Context
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error("SwapFinderForm must be used within a ScheduleProvider");
  }
  
  const { 
    state, 
    setCurrentResident, 
    setCurrentDate,
    findValidSwaps
  } = context;
  
  const { toast } = useToast();
  const { residents, schedule, metadata, currentResident, currentDate } = state;
  
  // Run the actual search
  const executeSearch = useCallback(() => {
    if (!currentResident || !currentDate) return;
    
    console.log(`Executing search for ${currentResident} on ${currentDate}`);
    setIsSearching(true);
    
    try {
      findValidSwaps(currentResident, currentDate);
    } catch (error) {
      console.error("Search error:", error);
      toast({
        variant: "destructive",
        title: "Search Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsSearching(false);
    }
  }, [currentResident, currentDate, findValidSwaps, toast]);
  
  // Handle form submission
  const handleFindSwaps = useCallback(() => {
    if (!currentResident || !currentDate) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select both a resident and date first",
      });
      return;
    }
    
    executeSearch();
    
    // Only show toast for manual searches (button clicks)
    toast({
      title: "Search Complete",
      description: "Found possible swap options for the selected date",
    });
  }, [currentResident, currentDate, executeSearch, toast]);
  
  // Auto-search when current resident changes (but not on initial load)
  useEffect(() => {
    if (currentResident) {
      // Update input field
      setResidentInput(currentResident);
      
      // Only auto-trigger search if this is a user-initiated change (not initial load)
      if (autoSearchEnabled && currentDate && currentResident !== "") {
        const timeoutId = setTimeout(() => {
          executeSearch();
        }, 300); // Debounce to prevent rapid firing
        
        return () => clearTimeout(timeoutId);
      }
    }
  }, [currentResident, currentDate, autoSearchEnabled, executeSearch]);
  
  // Sync dateInput with currentDate from context
  useEffect(() => {
    if (currentDate) {
      setDateInput(formatDateForDisplay(currentDate));
    }
  }, [currentDate]);
  
  // Set default date to today if available
  useEffect(() => {
    if (metadata.dates.length > 0 && !currentDate) {
      // Try to use today's date if available in schedule
      const today = new Date();
      const todayStr = format(today, "yyyy-MM-dd");
      
      if (metadata.dates.includes(todayStr)) {
        setCurrentDate(todayStr);
        setDateInput(formatDateForDisplay(todayStr));
      } else {
        // Otherwise, use first available date
        setCurrentDate(metadata.dates[0]);
        setDateInput(formatDateForDisplay(metadata.dates[0]));
      }
    }
  }, [metadata.dates, currentDate, setCurrentDate]);
  
  // Handle resident input filtering
  useEffect(() => {
    if (residentInput.trim() === "") {
      setFilteredResidents([]);
      setCurrentResident(null);
      return;
    }
    
    const lowercaseInput = residentInput.toLowerCase();
    const filtered = Object.keys(residents)
      .filter(name => name.toLowerCase().includes(lowercaseInput))
      // Sort by closer matches first
      .sort((a, b) => {
        // Exact matches first
        if (a.toLowerCase() === lowercaseInput) return -1;
        if (b.toLowerCase() === lowercaseInput) return 1;
        
        // Then matches that start with the input
        const aStartsWith = a.toLowerCase().startsWith(lowercaseInput);
        const bStartsWith = b.toLowerCase().startsWith(lowercaseInput);
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        
        // Then by alphabetical order
        return a.localeCompare(b);
      });
    
    // Auto-select if there's an exact match
    const exactMatch = filtered.find(name => name.toLowerCase() === lowercaseInput);
    if (exactMatch) {
      setCurrentResident(exactMatch);
      setResidentInput(exactMatch);
      setFilteredResidents([]);
      return;
    }
    
    // Clear current resident if input doesn't match exactly
    if (currentResident && currentResident.toLowerCase() !== lowercaseInput) {
      setCurrentResident(null);
    }
    
    setFilteredResidents(filtered);
    // Reset selected index when filtered list changes
    setSelectedIndex(-1);
  }, [residentInput, residents, setCurrentResident, currentResident]);
  
  // Handle date input changes
  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateInput(e.target.value);
    
    // Try to match with available dates
    const input = e.target.value.toLowerCase();
    for (const date of metadata.dates) {
      const formatted = formatDateForDisplay(date).toLowerCase();
      if (formatted.includes(input)) {
        setCurrentDate(date, true); // Preserve existing swaps when updating date
        return;
      }
    }
  };
  
  // Handle date selection from calendar
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    // Convert to YYYY-MM-DD format
    const dateStr = format(date, "yyyy-MM-dd");
    
    // Check if this date is in our available dates
    if (metadata.dates.includes(dateStr)) {
      setCurrentDate(dateStr, true); // Preserve existing swaps when updating date
      setDateInput(formatDateForDisplay(dateStr));
    } else {
      // Find the closest available date
      const closest = metadata.dates.reduce((prev, curr) => {
        const prevDate = new Date(prev);
        const currDate = new Date(curr);
        const targetDate = date;
        
        const prevDiff = Math.abs(prevDate.getTime() - targetDate.getTime());
        const currDiff = Math.abs(currDate.getTime() - targetDate.getTime());
        
        return prevDiff < currDiff ? prev : curr;
      }, metadata.dates[0]);
      
      setCurrentDate(closest, true); // Preserve existing swaps when updating date
      setDateInput(formatDateForDisplay(closest));
      
      toast({
        title: "Date Adjusted",
        description: "Selected the closest available date in the schedule.",
        variant: "default"
      });
    }
    
    setCalendarOpen(false);
  };
  
  // Get current assignment for selected resident and date
  const getCurrentAssignment = () => {
    if (!currentResident || !currentDate || !schedule[currentResident]) {
      return null;
    }
    
    return schedule[currentResident][currentDate] || null;
  };
  
  const currentAssignment = getCurrentAssignment();
  
  // Debug function to check what dates are available
  const logDates = () => {
    console.log("Available dates:", metadata.dates);
    console.log("Current date:", currentDate);
  };
  
  return (
    <div id="swap-finder-form" className="space-y-5 border-t border-gray-200 pt-5">
      <h2 className="text-lg font-medium text-gray-800 mb-3">Find Swaps</h2>
      
      <div id="resident-selector" className="space-y-2">
        <label htmlFor="resident-input" className="block text-sm font-medium text-gray-700">
          Select Resident
        </label>
        <div className="relative">
          <div className="relative">
            <Input
              id="resident-input"
              placeholder="Search for a resident..."
              value={residentInput}
              onChange={(e) => setResidentInput(e.target.value)}
              className="w-full border border-gray-300"
              disabled={!metadata.isLoaded}
              onKeyDown={(e) => {
                if (filteredResidents.length === 0) return;
                
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setSelectedIndex(prev => 
                    prev < filteredResidents.length - 1 ? prev + 1 : prev
                  );
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
                } else if (e.key === 'Enter' && selectedIndex >= 0) {
                  e.preventDefault();
                  const selectedName = filteredResidents[selectedIndex];
                  setCurrentResident(selectedName);
                  setResidentInput(selectedName);
                  setFilteredResidents([]);
                  setSelectedIndex(-1);
                } else if (e.key === 'Escape') {
                  e.preventDefault();
                  setFilteredResidents([]);
                  setSelectedIndex(-1);
                }
              }}
            />
            
            {filteredResidents.length > 0 && residentInput && (
              <div className="absolute z-10 w-full bg-white mt-1 rounded-md border border-gray-200 shadow-lg max-h-60 overflow-y-auto">
                {filteredResidents.map((name, index) => {
                  const isSelected = index === selectedIndex;
                  const isCurrentResident = name === currentResident;
                  
                  return (
                    <div
                      key={name}
                      className={`px-3 py-2 cursor-pointer ${
                        isSelected ? 'bg-blue-100' : 
                        isCurrentResident ? 'bg-blue-50 font-medium' : 
                        'hover:bg-gray-100'
                      }`}
                      onClick={() => {
                        setCurrentResident(name);
                        setResidentInput(name);
                        setFilteredResidents([]);
                        setSelectedIndex(-1);
                      }}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      {name} {residents[name] && <span className="text-xs text-gray-500 ml-1">(PGY{residents[name].pgyLevel})</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div id="date-selector" className="space-y-2">
        <label htmlFor="date-input" className="block text-sm font-medium text-gray-700">
          Select Date
        </label>
        <div className="relative">
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <div className="relative flex items-center">
                <Input
                  id="date-input"
                  placeholder="Select a date..."
                  value={dateInput}
                  onChange={handleDateInputChange}
                  className="pr-10 border border-gray-300"
                  disabled={!metadata.isLoaded || metadata.dates.length === 0}
                />
                <CalendarIcon className="absolute right-3 h-4 w-4 text-gray-500 cursor-pointer" onClick={() => setCalendarOpen(true)} />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={currentDate ? new Date(currentDate) : undefined}
                onSelect={handleDateSelect}
                disabled={!metadata.isLoaded || metadata.dates.length === 0}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        {metadata.isLoaded && metadata.dates.length === 0 && (
          <p className="text-sm text-red-500">No dates available. Please import a schedule first.</p>
        )}
      </div>
      
      {currentAssignment && (
        <div id="assignment-display" className="bg-gray-50 p-3 rounded-md border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-1">Current Assignment:</h3>
          <div className="flex flex-col">
            <div className="flex items-center">
              <span id="current-assignment-friendly" className="text-base font-semibold">
                {getUserFriendlyLabel(currentAssignment.code)}
              </span>
              <span
                id="assignment-type-badge"
                className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${getAssignmentTypeBadgeColor(
                  currentAssignment.type
                )}`}
              >
                {currentAssignment.type}
              </span>
            </div>
            
            {/* Show original code in smaller text */}
            <div className="text-xs text-gray-500 mt-1">
              <span>{currentAssignment.code}</span>
            </div>
          </div>
        </div>
      )}
      
      <Button
        id="find-swaps-btn"
        variant="default"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
        onClick={handleFindSwaps}
        disabled={!metadata.isLoaded || !currentResident || !currentDate || isSearching}
      >
        {isSearching ? "Searching..." : "Find Valid Swaps"}
      </Button>
      
      {/* Debug info for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 p-2 text-xs border border-gray-200 rounded-md bg-gray-50">
          <div>Current Resident: {currentResident || "none"}</div>
          <div>Current Date: {currentDate || "none"}</div>
          <button 
            onClick={logDates}
            className="mt-1 px-2 py-1 text-xs bg-gray-200 rounded"
          >
            Log Dates
          </button>
        </div>
      )}
    </div>
  );
}
