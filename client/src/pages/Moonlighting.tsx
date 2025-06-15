import React, { useState, useEffect } from "react";
import { useSchedule } from "@/context/ScheduleContext";
import AppHeader from "@/components/AppHeader";
import MoonlightingForm from "@/components/MoonlightingForm";
import MoonlightingCalendar from "@/components/MoonlightingCalendar";
import { MoonlightingMonth, getDefaultMoonlightingMonths } from "@/lib/moonlightingUtils";

export default function Moonlighting() {
  const { state } = useSchedule();
  const [selectedResident, setSelectedResident] = useState<string>("");
  const [moonlightingData, setMoonlightingData] = useState<MoonlightingMonth[]>([]);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize with current and next month
  const [viewMonths, setViewMonths] = useState(() => getDefaultMoonlightingMonths());

  // Check if schedule data is loaded
  if (!state.metadata.isLoaded) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <AppHeader />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-grow">
          <div className="py-16 flex flex-col items-center justify-center">
            <i className="ri-calendar-line text-gray-300 text-5xl mb-4"></i>
            <h3 className="text-lg font-medium text-gray-500">No Schedule Data</h3>
            <p className="text-gray-400 text-sm mt-1">
              Please import schedule data first to use the moonlighting feature
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AppHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-grow">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Moonlighting Opportunities</h1>
          <p className="text-gray-600">
            Find eligible dates when you can moonlight without violating work day limits
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel: Resident Selection Form */}
          <div className="lg:col-span-4">
            <MoonlightingForm
              selectedResident={selectedResident}
              onResidentChange={setSelectedResident}
              onDataCalculated={setMoonlightingData}
              onLoadingChange={setIsLoading}
              viewMonths={viewMonths}
            />
          </div>
          
          {/* Right Panel: Calendar Display */}
          <div className="lg:col-span-8">
            <MoonlightingCalendar
              moonlightingData={moonlightingData}
              selectedResident={selectedResident}
              isLoading={isLoading}
              currentMonthIndex={currentMonthIndex}
              onMonthIndexChange={setCurrentMonthIndex}
              viewMonths={viewMonths}
              onViewMonthsChange={setViewMonths}
            />
          </div>
        </div>
      </main>
    </div>
  );
} 