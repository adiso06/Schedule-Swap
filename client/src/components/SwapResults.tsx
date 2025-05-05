import React from "react";
import { useSchedule } from "../hooks/useSchedule";
import { getAssignmentTypeBadgeColor, getAssignmentBgColor, formatDateForDisplay } from "@/lib/utils";

export default function SwapResults() {
  const { state } = useSchedule();
  const { validSwaps, currentResident, currentDate, invalidReason } = state;
  
  // Don't show anything if no swaps have been searched for
  if (!currentResident || !currentDate) {
    return null;
  }
  
  // Check if we have error states to show
  const showNoSwapsFound = validSwaps.length === 0 && !invalidReason;
  const showNotSwappableWarning = !!invalidReason;
  
  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-medium text-gray-800">Swap Results</h2>
        {validSwaps.length > 0 && (
          <div className="flex space-x-2">
            <div className="text-sm text-gray-500 flex items-center" id="total-results-counter">
              <span className="font-medium">{validSwaps.length}</span> valid swap{validSwaps.length !== 1 ? 's' : ''} found
            </div>
          </div>
        )}
      </div>
      
      <div id="swap-results-container">
        {/* Valid Swaps List */}
        {validSwaps.length > 0 && (
          <div id="valid-swaps-list" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {validSwaps.map((swap, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition">
                <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="font-medium">{swap.residentB}</span>
                      <span className="ml-1.5 text-xs bg-primary-100 text-primary-800 px-1.5 rounded-full">
                        PGY{swap.pgyB}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex flex-col space-y-3">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Current Assignment:</div>
                      <div className={`text-sm font-medium p-2 rounded border ${getAssignmentBgColor(swap.assignmentB.type)}`}>
                        {swap.assignmentB.code}
                        <span className={`ml-1 text-xs px-1.5 rounded-full ${getAssignmentTypeBadgeColor(swap.assignmentB.type)}`}>
                          {swap.assignmentB.type}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-center my-1">
                      <div className="w-10 h-px bg-gray-200"></div>
                      <div className="mx-3">
                        <i className="ri-arrow-left-right-line text-gray-400"></i>
                      </div>
                      <div className="w-10 h-px bg-gray-200"></div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Your Assignment:</div>
                      <div className={`text-sm font-medium p-2 rounded border ${getAssignmentBgColor(swap.assignmentA.type)}`}>
                        {swap.assignmentA.code}
                        <span className={`ml-1 text-xs px-1.5 rounded-full ${getAssignmentTypeBadgeColor(swap.assignmentA.type)}`}>
                          {swap.assignmentA.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-xs text-gray-500 mb-1">Validation</div>
                    <div className="flex space-x-2">
                      <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                        PGY Compatible
                      </span>
                      <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                        7-Day Rule OK
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Empty State */}
        {showNoSwapsFound && (
          <div id="no-swaps-found" className="py-16 flex flex-col items-center justify-center">
            <div className="bg-yellow-50 border border-yellow-100 rounded-full p-3 mb-4">
              <i className="ri-error-warning-line text-yellow-500 text-2xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-500">No Valid Swaps Found</h3>
            <p className="text-gray-400 text-sm mt-1 max-w-md text-center">
              No residents with compatible assignments for this date. Try selecting a different date or resident.
            </p>
          </div>
        )}
        
        {/* Not Swappable Assignment Warning */}
        {showNotSwappableWarning && (
          <div id="not-swappable-warning" className="py-16 flex flex-col items-center justify-center">
            <div className="bg-red-50 border border-red-100 rounded-full p-3 mb-4">
              <i className="ri-close-circle-line text-red-500 text-2xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-500">Assignment Not Swappable</h3>
            <p className="text-gray-400 text-sm mt-1 max-w-md text-center">
              {invalidReason}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
