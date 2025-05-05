import React from "react";
import AppHeader from "@/components/AppHeader";
import ScheduleImportPanel from "@/components/ScheduleImportPanel";
import SwapFinderForm from "@/components/SwapFinderForm";
import ScheduleVisualization from "@/components/ScheduleVisualization";
import SwapResults from "@/components/SwapResults";
import RulesModal from "@/components/RulesModal";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AppHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-grow">
        <div className="mb-4 flex justify-end">
          <RulesModal />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel: Controls */}
          <div className="lg:col-span-4 bg-white rounded-lg shadow-sm p-5 border border-gray-200">
            <ScheduleImportPanel />
            <SwapFinderForm />
          </div>
          
          {/* Middle Panel: Schedule Visualization */}
          <div className="lg:col-span-8 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <ScheduleVisualization />
          </div>
          
          {/* Bottom Panel: Swap Results */}
          <div className="lg:col-span-12 bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <SwapResults />
          </div>
        </div>
      </main>
    </div>
  );
}
