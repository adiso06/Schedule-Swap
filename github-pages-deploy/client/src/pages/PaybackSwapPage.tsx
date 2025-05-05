import React from 'react';
import AppHeader from '@/components/AppHeader';
import PaybackSwapFinder from '@/components/PaybackSwapFinder';

export default function PaybackSwapPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Payback Swap Finder</h1>
          <p className="text-gray-600 mb-6">
            Find future dates where a resident can pay back another resident who covered their shift.
            This is useful for scheduling reciprocal coverage when someone helps you out.
          </p>
          <PaybackSwapFinder />
        </div>
      </main>
    </div>
  );
}