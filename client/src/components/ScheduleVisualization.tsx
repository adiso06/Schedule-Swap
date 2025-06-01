import React, { useState, useMemo } from "react";
import { useSchedule } from "@/context/ScheduleContext";
import { formatDateToYYYYMMDD, getWeekDisplay, formatDateForDisplay } from "@/lib/utils";
import { addDays, startOfWeek, parseISO, format } from "date-fns";
import { getUserFriendlyLabel } from "@/lib/assignmentLabels";
import { assignmentClassification } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ArrowUpDown, Filter, X, ChevronDown, Search } from "lucide-react";

export default function ScheduleVisualization() {
  const { state } = useSchedule();
  const { schedule, metadata, residents, validSwaps, currentResident, currentDate, currentPaybackResidentA, currentPaybackResidentB, isPaybackModeActive } = state;
  
  // Sorting and filtering state
  const [sortBy, setSortBy] = useState<"name" | "pgy">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedPgyLevels, setSelectedPgyLevels] = useState<string[]>([]);
  const [selectedRotations, setSelectedRotations] = useState<string[]>([]);
  const [selectedRotationGroups, setSelectedRotationGroups] = useState<string[]>([]);
  const [rotationSearchTerm, setRotationSearchTerm] = useState("");
  
  // Show a week at a time starting from the first date
  const [currentStartDate, setCurrentStartDate] = useState(() => {
    if (metadata.dates.length > 0) {
      // Create a Date from the first date in the schedule
      const firstDate = parseISO(metadata.dates[0]);
      // Get the start of that week (Sunday)
      return startOfWeek(firstDate);
    }
    return startOfWeek(new Date());
  });

  // Get grouped rotations for the current week for filtering
  const { availableRotations, rotationGroups } = useMemo(() => {
    const rotations = new Set<string>();
    const rotationCodes = new Set<string>();
    
    // Generate current week days
    const weekStart = currentStartDate || startOfWeek(new Date());
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const date = addDays(weekStart, i);
      return formatDateToYYYYMMDD(date);
    });
    
    Object.values(schedule).forEach(residentSchedule => {
      weekDays.forEach(dateStr => {
        const assignment = residentSchedule[dateStr];
        if (assignment?.code) {
          const friendlyLabel = getUserFriendlyLabel(assignment.code);
          rotations.add(friendlyLabel || assignment.code);
          rotationCodes.add(assignment.code);
        }
      });
    });
    
    // Group rotations by type
    const groups: Record<string, string[]> = {
      "Core Rotations": [],
      "Electives": [],
      "Time Off": [],
      "Other": []
    };
    
    const rotationArray = Array.from(rotations);
    rotationArray.forEach(rotation => {
      // Find the original code for this rotation
      let originalCode = "";
      const codesArray = Array.from(rotationCodes);
      for (const code of codesArray) {
        if (getUserFriendlyLabel(code) === rotation || code === rotation) {
          originalCode = code;
          break;
        }
      }
      
      // Classify based on assignment classification or rotation name
      const classification = assignmentClassification[originalCode];
      if (classification?.type === "Status" || rotation.toLowerCase().includes("vacation") || rotation.toLowerCase().includes("off")) {
        groups["Time Off"].push(rotation);
      } else if (rotation.toLowerCase().includes("elective") || rotation.toLowerCase().includes("elect")) {
        groups["Electives"].push(rotation);
      } else if (originalCode.includes("IM:") || originalCode.includes("NSLIJ:DM:IM:")) {
        groups["Core Rotations"].push(rotation);
      } else {
        groups["Other"].push(rotation);
      }
    });
    
    // Sort rotations within each group
    Object.keys(groups).forEach(group => {
      groups[group].sort();
    });
    
    return {
      availableRotations: Array.from(rotations).sort(),
      rotationGroups: groups
    };
  }, [schedule, currentStartDate]);
  
  // Filter and sort residents
  const filteredAndSortedResidents = useMemo(() => {
    let residentList = Object.keys(residents);
    
    // If in payback mode, filter to only show the two residents being compared
    if (isPaybackModeActive && currentPaybackResidentA && currentPaybackResidentB) {
      residentList = [currentPaybackResidentA, currentPaybackResidentB];
    }
    // Otherwise, if a swap search has been performed, filter to relevant residents
    else if (currentResident && currentDate && validSwaps.length > 0) {
      const residentSet = new Set<string>([
        currentResident,
        ...validSwaps.map(swap => swap.residentB)
      ]);
      residentList = Array.from(residentSet);
    }
    
    // Apply PGY filter
    if (selectedPgyLevels.length > 0) {
      residentList = residentList.filter(name => 
        selectedPgyLevels.includes(residents[name]?.pgyLevel.toString())
      );
    }
    
    // Apply rotation filter (individual rotations or groups)
    if (selectedRotations.length > 0 || selectedRotationGroups.length > 0) {
      const weekStart = currentStartDate || startOfWeek(new Date());
      const weekDays = Array.from({ length: 7 }, (_, i) => {
        const date = addDays(weekStart, i);
        return formatDateToYYYYMMDD(date);
      });
      
      // Get all rotations from selected groups
      const groupRotations: string[] = [];
      selectedRotationGroups.forEach(groupName => {
        groupRotations.push(...(rotationGroups[groupName] || []));
      });
      
      const allSelectedRotations = [...selectedRotations, ...groupRotations];
      
      residentList = residentList.filter(name => {
        return weekDays.some(dateStr => {
          const assignment = schedule[name]?.[dateStr];
          if (!assignment?.code) return false;
          const friendlyLabel = getUserFriendlyLabel(assignment.code);
          return allSelectedRotations.includes(friendlyLabel || assignment.code);
        });
      });
    }
    
    // Sort residents
    residentList.sort((a, b) => {
      // Always put current resident at the top regardless of filters
      if (currentResident) {
        if (a === currentResident) return -1;
        if (b === currentResident) return 1;
      }
      
      let comparison = 0;
      
      if (sortBy === "name") {
        comparison = a.localeCompare(b);
      } else if (sortBy === "pgy") {
        const pgyA = residents[a]?.pgyLevel || 0;
        const pgyB = residents[b]?.pgyLevel || 0;
        comparison = pgyA - pgyB;
      }
      
      return sortOrder === "asc" ? comparison : -comparison;
    });
    
    return residentList;
  }, [residents, validSwaps, currentResident, currentDate, sortBy, sortOrder, selectedPgyLevels, selectedRotations, selectedRotationGroups, rotationGroups, schedule, currentStartDate]);
  
  // Navigate to prev/next week
  const navigateWeek = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setCurrentStartDate(prevDate => addDays(prevDate, -7));
    } else {
      setCurrentStartDate(prevDate => addDays(prevDate, 7));
    }
  };
  
  // Generate days for current week
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(currentStartDate, i);
    const dateStr = formatDateToYYYYMMDD(date);
    const dayName = format(date, "EEE");
    const dayNum = format(date, "M/d");
    const isWeekend = i >= 5; // Saturday and Sunday
    
    return { date, dateStr, dayName, dayNum, isWeekend };
  });
  
  // Check if we have data for the displayed week
  const hasDataForWeek = weekDays.some(day => 
    metadata.dates.includes(day.dateStr)
  );
  
  if (!metadata.isLoaded) {
    return (
      <div id="schedule-empty-state" className="py-16 flex flex-col items-center justify-center">
        <i className="ri-calendar-line text-gray-300 text-5xl mb-4"></i>
        <h3 className="text-lg font-medium text-gray-500">No Schedule Data</h3>
        <p className="text-gray-400 text-sm mt-1">Import schedule data to get started</p>
      </div>
    );
  }
  
  return (
    <>
      {/* Improved Sorting and Filtering Controls */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex flex-col gap-3">
          {/* Top Row: Sort Controls and Quick Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {/* Sort Controls */}
              <span className="text-sm font-medium text-gray-700">Sort:</span>
              <Select value={sortBy} onValueChange={(value: "name" | "pgy") => setSortBy(value)}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="pgy">PGY</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="px-2"
              >
                <ArrowUpDown className="h-4 w-4" />
                {sortOrder === "asc" ? "↑" : "↓"}
              </Button>
            </div>
            
            {/* Clear All Filters */}
            {(selectedPgyLevels.length > 0 || selectedRotations.length > 0 || selectedRotationGroups.length > 0) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedPgyLevels([]);
                  setSelectedRotations([]);
                  setSelectedRotationGroups([]);
                  setRotationSearchTerm("");
                }}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-1" />
                Clear All Filters
              </Button>
            )}
          </div>
          
          {/* Bottom Row: Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
            
            {/* PGY Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  PGY Level
                  {selectedPgyLevels.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-4 text-xs">
                      {selectedPgyLevels.length}
                    </Badge>
                  )}
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[180px] p-3">
                <div className="space-y-2">
                  <div className="font-medium text-sm">PGY Levels</div>
                  {["1", "2", "3"].map((level) => (
                    <div key={level} className="flex items-center space-x-2">
                      <Checkbox
                        id={`pgy-${level}`}
                        checked={selectedPgyLevels.includes(level)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedPgyLevels([...selectedPgyLevels, level]);
                          } else {
                            setSelectedPgyLevels(selectedPgyLevels.filter(l => l !== level));
                          }
                        }}
                      />
                      <label htmlFor={`pgy-${level}`} className="text-sm font-medium">PGY-{level}</label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            
            {/* Rotation Groups Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  Rotation Groups
                  {selectedRotationGroups.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-4 text-xs">
                      {selectedRotationGroups.length}
                    </Badge>
                  )}
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[220px] p-3">
                <div className="space-y-3">
                  <div className="font-medium text-sm">Rotation Categories</div>
                  {Object.entries(rotationGroups).map(([groupName, rotations]) => (
                    rotations.length > 0 && (
                      <div key={groupName} className="flex items-center space-x-2">
                        <Checkbox
                          id={`group-${groupName}`}
                          checked={selectedRotationGroups.includes(groupName)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedRotationGroups([...selectedRotationGroups, groupName]);
                            } else {
                              setSelectedRotationGroups(selectedRotationGroups.filter(g => g !== groupName));
                            }
                          }}
                        />
                        <label htmlFor={`group-${groupName}`} className="text-sm font-medium">
                          {groupName}
                          <span className="ml-1 text-xs text-gray-500">({rotations.length})</span>
                        </label>
                      </div>
                    )
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            
            {/* Individual Rotations Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  Specific Rotations
                  {selectedRotations.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-4 text-xs">
                      {selectedRotations.length}
                    </Badge>
                  )}
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[280px] p-3">
                <div className="space-y-3">
                  <div className="font-medium text-sm">Individual Rotations</div>
                  
                  {/* Search Box */}
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search rotations..."
                      value={rotationSearchTerm}
                      onChange={(e) => setRotationSearchTerm(e.target.value)}
                      className="pl-8 h-8"
                    />
                  </div>
                  
                  {/* Rotation List */}
                  <div className="space-y-2 max-h-[250px] overflow-y-auto">
                    {availableRotations
                      .filter(rotation => 
                        rotation.toLowerCase().includes(rotationSearchTerm.toLowerCase())
                      )
                      .map((rotation) => (
                        <div key={rotation} className="flex items-center space-x-2">
                          <Checkbox
                            id={`rotation-${rotation}`}
                            checked={selectedRotations.includes(rotation)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedRotations([...selectedRotations, rotation]);
                              } else {
                                setSelectedRotations(selectedRotations.filter(r => r !== rotation));
                              }
                            }}
                          />
                          <label htmlFor={`rotation-${rotation}`} className="text-sm truncate flex-1">
                            {rotation}
                          </label>
                        </div>
                      ))}
                    {availableRotations.filter(rotation => 
                      rotation.toLowerCase().includes(rotationSearchTerm.toLowerCase())
                    ).length === 0 && (
                      <div className="text-sm text-gray-500 text-center py-2">
                        No rotations found
                      </div>
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Active Filters Summary */}
          {(selectedPgyLevels.length > 0 || selectedRotations.length > 0 || selectedRotationGroups.length > 0 || (currentResident && currentDate && validSwaps.length > 0) || isPaybackModeActive) && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200">
              {isPaybackModeActive && currentPaybackResidentA && currentPaybackResidentB && (
                <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                  Payback Mode: Comparing {currentPaybackResidentA} ↔ {currentPaybackResidentB}
                </Badge>
              )}
              {currentResident && currentDate && validSwaps.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  Swap Results: {formatDateForDisplay(currentDate)}
                </Badge>
              )}
              {selectedPgyLevels.map(level => (
                <Badge key={level} variant="secondary" className="text-xs">
                  PGY-{level}
                  <button 
                    onClick={() => setSelectedPgyLevels(selectedPgyLevels.filter(l => l !== level))}
                    className="ml-1 hover:bg-gray-300 rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {selectedRotationGroups.map(group => (
                <Badge key={group} variant="secondary" className="text-xs">
                  {group}
                  <button 
                    onClick={() => setSelectedRotationGroups(selectedRotationGroups.filter(g => g !== group))}
                    className="ml-1 hover:bg-gray-300 rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {selectedRotations.map(rotation => (
                <Badge key={rotation} variant="secondary" className="text-xs">
                  {rotation.length > 20 ? `${rotation.substring(0, 20)}...` : rotation}
                  <button 
                    onClick={() => setSelectedRotations(selectedRotations.filter(r => r !== rotation))}
                    className="ml-1 hover:bg-gray-300 rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              <Badge variant="outline" className="text-xs text-blue-600">
                {filteredAndSortedResidents.length} of {Object.keys(residents).length} residents
              </Badge>
            </div>
          )}
        </div>
      </div>
      
      {/* Week Navigation */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <div className="text-sm text-gray-600">
          Showing {filteredAndSortedResidents.length} resident{filteredAndSortedResidents.length !== 1 ? 's' : ''}
        </div>
        
        {/* Navigation */}
        <div className="flex items-center space-x-2">
          <button
            id="prev-week-btn"
            className="text-gray-500 hover:text-gray-700 p-1"
            onClick={() => navigateWeek("prev")}
          >
            <i className="ri-arrow-left-s-line"></i>
          </button>
          <span id="week-display" className="text-sm font-medium">
            {getWeekDisplay(currentStartDate)}
          </span>
          <button
            id="next-week-btn"
            className="text-gray-500 hover:text-gray-700 p-1"
            onClick={() => navigateWeek("next")}
          >
            <i className="ri-arrow-right-s-line"></i>
          </button>
        </div>
      </div>
      
      {!hasDataForWeek ? (
        <div className="py-8 flex flex-col items-center justify-center">
          <h3 className="text-base font-medium text-gray-500">No data available for this week</h3>
          <p className="text-gray-400 text-sm mt-1">Navigate to another week or import more data</p>
        </div>
      ) : (
        <div id="schedule-container" className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-3 px-4 border-b border-r border-gray-200 font-medium text-gray-500 text-left text-sm w-[180px]">
                  Resident
                </th>
                {weekDays.map((day) => (
                  <th
                    key={day.dateStr}
                    className={`py-3 px-4 border-b border-r border-gray-200 font-medium text-gray-500 text-center text-sm ${
                      day.isWeekend ? "bg-yellow-50" : ""
                    }`}
                  >
                    <div>{day.dayName}</div>
                    <div>{day.dayNum}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedResidents.map((residentName) => (
                <tr key={residentName} className={`hover:bg-gray-50 ${residentName === currentResident ? 'bg-blue-50' : ''}`}>
                  <td className="py-3 px-4 border-b border-r border-gray-200 font-medium truncate">
                    <div className="flex items-center">
                      <span>{residentName}</span>
                      <span className="ml-1 text-xs bg-primary-100 text-primary-800 px-1.5 rounded-full">
                        PGY{residents[residentName].pgyLevel}
                      </span>
                      {currentResident && residentName === currentResident && (
                        <Badge variant="outline" className="ml-2 text-xs">You</Badge>
                      )}
                    </div>
                  </td>
                  {weekDays.map((day) => {
                    const assignment = schedule[residentName]?.[day.dateStr];
                    const friendlyLabel = assignment?.code ? getUserFriendlyLabel(assignment.code) : "";
                    
                    return (
                      <td
                        key={day.dateStr}
                        className={`py-2 px-2 border-b border-r border-gray-200 text-sm 
                          ${day.isWeekend ? "bg-yellow-50" : ""}
                          ${day.dateStr === currentDate ? "bg-primary-50 border-primary-200" : ""}
                          ${day.dateStr === currentDate && residentName === currentResident ? "ring-2 ring-inset ring-primary-300" : ""}
                        `}
                        title={`${assignment?.code || ""} - ${friendlyLabel}`}
                      >
                        {assignment?.code ? (
                          <div className="flex flex-col items-center">
                            <div className="truncate max-w-[120px] mx-auto font-medium">
                              {friendlyLabel || assignment.code}
                            </div>
                          </div>
                        ) : (
                          <div className="truncate max-w-[120px] mx-auto">
                            {assignment?.code || ""}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
