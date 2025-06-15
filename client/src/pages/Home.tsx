import React from "react";
import AppHeader from "@/components/AppHeader";
import CollapsibleScheduleControls from "@/components/CollapsibleScheduleControls";
import CollapsibleScheduleVisualization from "@/components/CollapsibleScheduleVisualization";
import SwapFinderForm from "@/components/SwapFinderForm";
import SwapResults from "@/components/SwapResults";
import RulesModal from "@/components/RulesModal";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AppHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-grow">
        <div className="mb-4 flex justify-between items-center">
          <RulesModal />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* First Row: Collapsible Schedule Controls (collapsed by default) */}
          <div className="lg:col-span-12">
            <CollapsibleScheduleControls />
          </div>
          
          {/* Second Row: Swap Finder (Primary Focus) */}
          <div className="lg:col-span-4 bg-white rounded-lg shadow-sm p-5 border border-gray-200">
            <div className="bg-gradient-to-r from-primary-100 to-primary-50 -m-5 mb-5 p-5 rounded-t-lg border-b border-primary-200">
              <h2 className="text-xl font-semibold text-primary-800">Find Available Swaps</h2>
              <p className="text-sm text-primary-700 mt-1">Select a resident and date to find compatible swaps</p>
              <p className="text-sm text-red-600 mt-2 font-medium">Please note this may not reflect the final schedule, and also has no ability to see if people are on TBA</p>
            </div>
            <SwapFinderForm />
          </div>
          
          {/* Swap Results Panel */}
          <div className="lg:col-span-8 bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <SwapResults />
          </div>
          
          {/* Bottom Panel: Collapsible Schedule Visualization */}
          <div className="lg:col-span-12">
            <CollapsibleScheduleVisualization />
          </div>
        </div>
      </main>
    </div>
  );
}
