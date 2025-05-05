import React, { useState } from "react";
import { useSchedule } from "@/hooks/useSchedule";
import { formatDateToYYYYMMDD, getWeekDisplay } from "@/lib/utils";
import { addDays, startOfWeek, parseISO, format } from "date-fns";

export default function ScheduleVisualization() {
  const { state } = useSchedule();
  const { schedule, metadata, residents } = state;
  
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
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-800">Schedule</h2>
        <div className="flex space-x-2">
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
              {Object.keys(residents).map((residentName) => (
                <tr key={residentName} className="hover:bg-gray-50">
                  <td className="py-3 px-4 border-b border-r border-gray-200 font-medium truncate">
                    <div className="flex items-center">
                      <span>{residentName}</span>
                      <span className="ml-1 text-xs bg-primary-100 text-primary-800 px-1.5 rounded-full">
                        PGY{residents[residentName].pgyLevel}
                      </span>
                    </div>
                  </td>
                  {weekDays.map((day) => {
                    const assignment = schedule[residentName]?.[day.dateStr];
                    return (
                      <td
                        key={day.dateStr}
                        className={`py-2 px-3 border-b border-r border-gray-200 text-sm text-center ${
                          day.isWeekend ? "bg-yellow-50" : ""
                        }`}
                      >
                        {assignment?.code || ""}
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
