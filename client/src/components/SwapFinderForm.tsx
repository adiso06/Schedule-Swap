import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useSchedule } from "@/context/ScheduleContext";
import { useToast } from "@/hooks/use-toast";
import { formatDateForDisplay, getAssignmentTypeBadgeColor } from "@/lib/utils";

export default function SwapFinderForm() {
  const [isSearching, setIsSearching] = useState(false);
  const { 
    state, 
    setCurrentResident, 
    setCurrentDate,
    findValidSwaps
  } = useSchedule();
  
  const { toast } = useToast();
  const { residents, schedule, metadata, currentResident, currentDate } = state;
  
  // Set default date to today or first available date
  useEffect(() => {
    if (!currentDate && metadata.dates.length > 0) {
      setCurrentDate(metadata.dates[0]);
    }
  }, [metadata.dates, currentDate, setCurrentDate]);
  
  const getCurrentAssignment = () => {
    if (!currentResident || !currentDate || !schedule[currentResident]) {
      return null;
    }
    
    return schedule[currentResident][currentDate] || null;
  };
  
  const currentAssignment = getCurrentAssignment();
  
  const handleFindSwaps = () => {
    if (!currentResident || !currentDate) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select both a resident and date first",
      });
      return;
    }
    
    setIsSearching(true);
    
    try {
      findValidSwaps(currentResident, currentDate);
      toast({
        title: "Search Complete",
        description: "Found possible swap options for the selected date",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Search Error",
        description: error instanceof Error ? error.message : "Failed to find swaps",
      });
    } finally {
      setIsSearching(false);
    }
  };
  
  // Debug function to check what dates are available
  const logDates = () => {
    console.log("Available dates:", metadata.dates);
    console.log("Current date:", currentDate);
  };
  
  return (
    <div id="swap-finder-form" className="space-y-5 border-t border-gray-200 pt-5">
      <h2 className="text-lg font-medium text-gray-800 mb-3">Find Swaps</h2>
      
      <div id="resident-selector" className="space-y-2">
        <label htmlFor="resident-select" className="block text-sm font-medium text-gray-700">
          Select Resident
        </label>
        <div className="relative">
          <Select
            value={currentResident || ""}
            onValueChange={(value) => setCurrentResident(value)}
            disabled={!metadata.isLoaded}
          >
            <SelectTrigger id="resident-select" className="w-full border border-gray-300">
              <SelectValue placeholder="Select a resident..." />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(residents).map((name) => (
                <SelectItem key={name} value={name}>
                  {name} (PGY{residents[name].pgyLevel})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div id="date-selector" className="space-y-2">
        <label htmlFor="swap-date" className="block text-sm font-medium text-gray-700">
          Select Date
        </label>
        <div className="relative">
          <Select
            value={currentDate || ""}
            onValueChange={(value) => {
              console.log("Setting date to:", value);
              setCurrentDate(value);
            }}
            disabled={!metadata.isLoaded || metadata.dates.length === 0}
          >
            <SelectTrigger id="swap-date" className="w-full border border-gray-300">
              <SelectValue placeholder="Select a date..." />
            </SelectTrigger>
            <SelectContent>
              {metadata.dates.length > 0 ? (
                metadata.dates.map((date) => (
                  <SelectItem key={date} value={date}>
                    {formatDateForDisplay(date)}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-dates" disabled>No dates available</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        
        {metadata.isLoaded && metadata.dates.length === 0 && (
          <p className="text-sm text-red-500">No dates available. Please import a schedule first.</p>
        )}
      </div>
      
      {currentAssignment && (
        <div id="assignment-display" className="bg-gray-50 p-3 rounded-md border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-1">Current Assignment:</h3>
          <div className="flex items-center">
            <span id="current-assignment-code" className="text-base font-semibold">
              {currentAssignment.code}
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
        <div className="text-xs text-gray-400 mt-2">
          <p>Schedule loaded: {metadata.isLoaded ? "Yes" : "No"}</p>
          <p>Dates available: {metadata.dates.length}</p>
          <p>Residents: {Object.keys(residents).length}</p>
          <button onClick={logDates} className="text-xs text-blue-400 underline">Debug Dates</button>
        </div>
      )}
    </div>
  );
}
