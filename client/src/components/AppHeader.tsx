import React from "react";

export default function AppHeader() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <i className="ri-calendar-check-line text-primary-600 text-2xl mr-2"></i>
            <h1 className="text-xl font-semibold text-gray-900">Residency Schedule Swap Engine</h1>
          </div>
          <div>
            <span className="text-sm text-gray-500">v1.1</span>
          </div>
        </div>
      </div>
    </header>
  );
}
