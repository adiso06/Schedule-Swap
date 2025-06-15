import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar, X, Info } from "lucide-react";
import { MoonlightingMonth, MoonlightingDate } from "@/lib/moonlightingUtils";
import { format, parseISO } from "date-fns";
import { getUserFriendlyLabel } from "@/lib/assignmentLabels";
import { isWorkingDay } from "@/lib/utils";

interface MoonlightingCalendarProps {
  moonlightingData: MoonlightingMonth[];
  selectedResident: string;
  isLoading: boolean;
  currentMonthIndex: number;
  onMonthIndexChange: (index: number) => void;
  viewMonths: { year: number; month: number }[];
  onViewMonthsChange: (months: { year: number; month: number }[]) => void;
}

export default function MoonlightingCalendar({
  moonlightingData,
  selectedResident,
  isLoading,
  currentMonthIndex,
  onMonthIndexChange,
  viewMonths,
  onViewMonthsChange
}: MoonlightingCalendarProps) {

  // Add state for selected date
  const [selectedDate, setSelectedDate] = React.useState<MoonlightingDate | null>(null);

  const navigateMonth = (direction: "prev" | "next") => {
    if (direction === "prev") {
      if (currentMonthIndex > 0) {
        onMonthIndexChange(currentMonthIndex - 1);
      } else {
        // Add a previous month to the beginning
        const firstMonth = viewMonths[0];
        let newMonth = firstMonth.month - 1;
        let newYear = firstMonth.year;
        if (newMonth < 1) {
          newMonth = 12;
          newYear--;
        }
        const newViewMonths = [{ year: newYear, month: newMonth }, ...viewMonths];
        onViewMonthsChange(newViewMonths);
        // currentMonthIndex stays 0 since we're adding to the beginning
      }
    } else {
      if (currentMonthIndex < moonlightingData.length - 1) {
        onMonthIndexChange(currentMonthIndex + 1);
      } else {
        // Add a next month to the end
        const lastMonth = viewMonths[viewMonths.length - 1];
        let newMonth = lastMonth.month + 1;
        let newYear = lastMonth.year;
        if (newMonth > 12) {
          newMonth = 1;
          newYear++;
        }
        const newViewMonths = [...viewMonths, { year: newYear, month: newMonth }];
        onViewMonthsChange(newViewMonths);
        onMonthIndexChange(currentMonthIndex + 1);
      }
    }
  };

  const getDayClass = (date: MoonlightingDate): string => {
    const baseClass = "w-8 h-8 flex items-center justify-center text-sm rounded-md cursor-pointer transition-colors";
    
    // Add selected state styling
    const isSelected = selectedDate?.date === date.date;
    const selectedClass = isSelected ? " ring-2 ring-blue-500 ring-offset-1" : "";
    
    if (!date.currentAssignment) {
      return `${baseClass} text-gray-300 bg-gray-50${selectedClass}`;
    }

    if (date.isEligible) {
      return `${baseClass} bg-green-100 text-green-800 hover:bg-green-200 border border-green-300${selectedClass}`;
    } else if (date.currentAssignment.code === "OFF") {
      return `${baseClass} bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border border-yellow-300${selectedClass}`;
    } else {
      return `${baseClass} bg-gray-100 text-gray-600 hover:bg-gray-200${selectedClass}`;
    }
  };

  const getTooltipText = (date: MoonlightingDate): string => {
    if (!date.currentAssignment) {
      return `📅 ${format(parseISO(date.date), 'EEEE, MMMM d, yyyy')}\n❌ No assignment data`;
    }

    const assignmentLabel = getUserFriendlyLabel(date.currentAssignment.code);
    const dateLabel = format(parseISO(date.date), 'EEEE, MMMM d, yyyy');
    
    if (date.isEligible) {
      return `📅 ${dateLabel}\n✅ ELIGIBLE for moonlighting\n📋 Current Assignment: ${assignmentLabel}\n💡 Can work an additional shift`;
    } else if (date.currentAssignment.code === "OFF") {
      return `📅 ${dateLabel}\n❌ NOT eligible for moonlighting\n📋 Current Assignment: ${assignmentLabel}\n⚠️ Reason: ${date.reason || 'Off day restrictions'}`;
    } else {
      return `📅 ${dateLabel}\n🏥 Working Day\n📋 Assignment: ${assignmentLabel}\n❌ Cannot moonlight (already working)`;
    }
  };

  const renderCalendarGrid = (monthData: MoonlightingMonth) => {
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    // Get the first day of the month to determine starting position
    const firstDate = new Date(monthData.year, monthData.month - 1, 1);
    const startDayOfWeek = firstDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Create grid with empty cells for days before month starts
    const calendarCells: (MoonlightingDate | null)[] = [];
    for (let i = 0; i < startDayOfWeek; i++) {
      calendarCells.push(null);
    }
    
    // Add all days of the month
    calendarCells.push(...monthData.dates);
    
    // Group into weeks (rows of 7)
    const weeks: (MoonlightingDate | null)[][] = [];
    for (let i = 0; i < calendarCells.length; i += 7) {
      weeks.push(calendarCells.slice(i, i + 7));
    }

    return (
      <div className="space-y-2">
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {daysOfWeek.map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="space-y-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-1">
              {week.map((date, dayIndex) => (
                <div key={dayIndex} className="flex justify-center">
                  {date ? (
                    <div
                      className={getDayClass(date)}
                      title={getTooltipText(date)}
                      onClick={() => handleDateClick(date)}
                    >
                      {date.dayNumber}
                    </div>
                  ) : (
                    <div className="w-8 h-8"></div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const handleDateClick = (date: MoonlightingDate) => {
    setSelectedDate(selectedDate?.date === date.date ? null : date);
  };

  const renderDateDetails = (date: MoonlightingDate) => {
    const assignmentLabel = date.currentAssignment ? getUserFriendlyLabel(date.currentAssignment.code) : "No assignment";
    const dateLabel = format(parseISO(date.date), 'EEEE, MMMM d, yyyy');

    return (
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Info className="h-5 w-5 text-blue-600" />
            <h4 className="text-lg font-semibold text-blue-900">Date Details</h4>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedDate(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-700">Date</p>
            <p className="text-base text-gray-900">{dateLabel}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-700">Assignment</p>
            <p className="text-base text-gray-900">{assignmentLabel}</p>
            {date.currentAssignment && (
              <p className="text-xs text-gray-500 mt-1">Code: {date.currentAssignment.code}</p>
            )}
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-700">Moonlighting Eligibility</p>
            <div className="flex items-center space-x-2 mt-1">
              {date.isEligible ? (
                <>
                  <Badge className="bg-green-100 text-green-800 border-green-300">
                    ✅ Eligible
                  </Badge>
                  <span className="text-sm text-gray-600">Can work an additional shift</span>
                </>
              ) : (
                <>
                  <Badge className="bg-red-100 text-red-800 border-red-300">
                    ❌ Not Eligible
                  </Badge>
                  {date.reason && (
                    <span className="text-sm text-gray-600">{date.reason}</span>
                  )}
                </>
              )}
            </div>
          </div>
          
          {date.currentAssignment && (
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-blue-200">
              <div>
                <p className="text-xs font-medium text-gray-700">Assignment Type</p>
                <p className="text-sm text-gray-900">{date.currentAssignment.type}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-700">Swappable</p>
                <p className="text-sm text-gray-900">{date.currentAssignment.swappable}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-700">Weekend</p>
                <p className="text-sm text-gray-900">{date.currentAssignment.isWeekend ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-700">Working Day</p>
                <p className="text-sm text-gray-900">{isWorkingDay(date.currentAssignment) ? 'Yes' : 'No'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Safe access to current month with bounds checking
  const currentMonth = moonlightingData && moonlightingData.length > 0 && currentMonthIndex >= 0 && currentMonthIndex < moonlightingData.length 
    ? moonlightingData[currentMonthIndex] 
    : null;

  // Get the current month info from viewMonths for fallback display
  const currentViewMonth = viewMonths && viewMonths.length > 0 && currentMonthIndex >= 0 && currentMonthIndex < viewMonths.length
    ? viewMonths[currentMonthIndex]
    : null;

  // Debug logging
  React.useEffect(() => {
    console.log('🗓️ Calendar received moonlightingData:', moonlightingData);
    console.log('🗓️ Current month index:', currentMonthIndex);
    console.log('🗓️ Current month data:', currentMonth);
    console.log('🗓️ ViewMonths:', viewMonths);
  }, [moonlightingData, currentMonthIndex, currentMonth, viewMonths]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Moonlighting Calendar
            </h2>
          </div>
          
          {/* Summary badges */}
          {selectedResident && currentMonth && (
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-green-600 border-green-600">
                {currentMonth.eligibleCount} eligible days
              </Badge>
              <Badge variant="outline" className="text-blue-600 border-blue-600">
                {currentMonth.monthName} {currentMonth.year}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Calendar Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-500">Calculating moonlighting opportunities...</p>
            </div>
          </div>
        ) : !selectedResident ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">Select a Resident</h3>
              <p className="text-gray-400">
                Choose a resident from the form to see their moonlighting opportunities
              </p>
            </div>
          </div>
        ) : moonlightingData.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">No Data Available</h3>
              <p className="text-gray-400">
                No moonlighting data calculated for {selectedResident}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth("prev")}
                className="flex items-center space-x-1"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous Month</span>
              </Button>
              
              <h3 className="text-lg font-semibold text-gray-800">
                {currentMonth 
                  ? `${currentMonth.monthName} ${currentMonth.year}` 
                  : currentViewMonth 
                    ? `${format(new Date(currentViewMonth.year, currentViewMonth.month - 1), 'MMMM yyyy')}` 
                    : 'Loading...'}
              </h3>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth("next")}
                className="flex items-center space-x-1"
              >
                <span>Next Month</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Calendar */}
            {currentMonth ? (
              <>
                {renderCalendarGrid(currentMonth)}
                {/* Selected Date Details */}
                {selectedDate && renderDateDetails(selectedDate)}
              </>
            ) : (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-500 text-sm">Loading month data...</p>
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Legend</h4>
              <div className="flex flex-wrap gap-4 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                  <span>Eligible for moonlighting</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
                  <span>OFF day (not eligible)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
                  <span>Working day</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-50 rounded"></div>
                  <span>No data</span>
                </div>
              </div>
            </div>

            {/* Statistics */}
            {currentMonth && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {currentMonth.eligibleCount}
                    </p>
                    <p className="text-xs text-gray-500">Eligible Days</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-600">
                      {currentMonth.dates.filter(d => 
                        d.currentAssignment?.code === "OFF" && !d.isEligible
                      ).length}
                    </p>
                    <p className="text-xs text-gray-500">OFF Days (Not Eligible)</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-600">
                      {currentMonth.dates.filter(d => 
                        d.currentAssignment && d.currentAssignment.code !== "OFF"
                      ).length}
                    </p>
                    <p className="text-xs text-gray-500">Working Days</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 