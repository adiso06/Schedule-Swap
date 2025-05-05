import React from "react";
import AppHeader from "@/components/AppHeader";
import PaybackSwapFinder from "@/components/PaybackSwapFinder";
import RulesModal from "@/components/RulesModal";

export default function PaybackSwapPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AppHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-grow">
        <div className="mb-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Payback Swap Finder</h1>
          <RulesModal />
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <PaybackSwapFinder />
        </div>
      </main>
    </div>
  );
}