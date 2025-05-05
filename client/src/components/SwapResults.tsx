import React, { useState } from "react";
import { useSchedule } from "@/context/ScheduleContext";
import { getAssignmentTypeBadgeColor, getAssignmentBgColor, formatDateForDisplay } from "@/lib/utils";
import { getUserFriendlyLabel } from "@/lib/assignmentLabels";
import { PotentialSwap, PaybackSwap } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ArrowLeft, Calendar, Clock, RefreshCw, Loader2 } from "lucide-react";

export default function SwapResults() {
  const [selectedSwap, setSelectedSwap] = useState<PotentialSwap | null>(null);
  const [paybackSwaps, setPaybackSwaps] = useState<PaybackSwap[]>([]);
  const [isLoadingPayback, setIsLoadingPayback] = useState(false);
  
  const { state, findPaybackSwaps } = useSchedule();
  const { validSwaps, currentResident, currentDate, invalidReason } = state;
  const { toast } = useToast();
  
  // Don't show anything if no swaps have been searched for
  if (!currentResident || !currentDate) {
    return null;
  }
  
  // Check if we have error states to show
  const showNoSwapsFound = validSwaps.length === 0 && !invalidReason;
  const showNotSwappableWarning = !!invalidReason;
  
  const handleFindPaybackOptions = (swap: PotentialSwap) => {
    setIsLoadingPayback(true);
    setSelectedSwap(swap);
    
    try {
      // Find payback swaps where the current resident can pay back the resident they're swapping with
      const results = findPaybackSwaps(
        currentResident, // Resident A (who needs to pay back)
        swap.residentB,  // Resident B (who covered the shift)
        currentDate      // Original swap date
      );
      
      setPaybackSwaps(results);
      
      if (results.length === 0) {
        toast({
          variant: "default",
          title: "No payback options found",
          description: "We couldn't find any future dates for a payback swap that meet the requirements."
        });
      } else {
        toast({
          title: "Payback options found",
          description: `Found ${results.length} potential payback dates.`
        });
      }
      
      // Scroll to payback results container
      setTimeout(() => {
        const paybackResultsContainer = document.getElementById('payback-results-container');
        if (paybackResultsContainer) {
          paybackResultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error finding payback options",
        description: "An error occurred while looking for payback options."
      });
    } finally {
      setIsLoadingPayback(false);
    }
  };
  
  const handleBackToSwaps = () => {
    setSelectedSwap(null);
    setPaybackSwaps([]);
  };
  
  // If we're in payback view, show that instead
  if (selectedSwap) {
    return (
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBackToSwaps} 
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Swaps
            </Button>
            <h2 className="text-lg font-medium text-gray-800">Payback Options</h2>
          </div>
        </div>
        
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-5">
          <div className="flex items-start">
            <RefreshCw className="h-5 w-5 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-amber-800">Payback Swap Details</h3>
              <p className="text-sm text-amber-700 mt-1">
                Looking for dates where <strong>{currentResident}</strong> can pay back <strong>{selectedSwap.residentB}</strong> by 
                covering a Required shift while on Elective. Original swap date: <strong>{formatDateForDisplay(currentDate)}</strong>
              </p>
            </div>
          </div>
        </div>
        
        {isLoadingPayback ? (
          <div className="py-16 flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 text-primary-500 animate-spin mb-4" />
            <h3 className="text-lg font-medium text-gray-500">Searching for Payback Options</h3>
            <p className="text-gray-400 text-sm mt-1">
              This may take a moment as we analyze future dates...
            </p>
          </div>
        ) : paybackSwaps.length > 0 ? (
          <div id="payback-results-container" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paybackSwaps.map((payback, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition">
                <div className="border-b border-gray-200 bg-blue-50 px-4 py-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-blue-700 mr-2" />
                      <span className="font-medium text-blue-800">
                        {format(new Date(payback.date), "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex flex-col space-y-3">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Your Elective Assignment:</div>
                      <div className={`text-sm font-medium p-2 rounded border ${getAssignmentBgColor("Elective")}`}>
                        <div>{getUserFriendlyLabel(payback.residentAElectiveAssignment.code)}</div>
                        <span className={`mt-1 inline-block text-xs px-1.5 rounded-full ${getAssignmentTypeBadgeColor("Elective")}`}>
                          Elective
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-center my-1">
                      <div className="w-10 h-px bg-gray-200"></div>
                      <div className="mx-3">
                        <RefreshCw className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="w-10 h-px bg-gray-200"></div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">{selectedSwap.residentB}'s Required Assignment:</div>
                      <div className={`text-sm font-medium p-2 rounded border ${getAssignmentBgColor("Required")}`}>
                        <div>{getUserFriendlyLabel(payback.residentBRequiredAssignment.code)}</div>
                        <span className={`mt-1 inline-block text-xs px-1.5 rounded-full ${getAssignmentTypeBadgeColor("Required")}`}>
                          Required
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button size="sm" variant="outline">
                      Select this Option
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div id="payback-results-container" className="py-16 flex flex-col items-center justify-center">
            <div className="bg-yellow-50 border border-yellow-100 rounded-full p-3 mb-4">
              <Clock className="h-6 w-6 text-yellow-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-500">No Future Payback Options Found</h3>
            <p className="text-gray-400 text-sm mt-1 max-w-md text-center">
              We couldn't find any future dates where {currentResident} can cover a Required shift for {selectedSwap.residentB} while on Elective.
            </p>
          </div>
        )}
      </div>
    );
  }
  
  // Otherwise, show the regular swap results
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
                        <div>{getUserFriendlyLabel(swap.assignmentB.code)}</div>
                        <span className={`mt-1 inline-block text-xs px-1.5 rounded-full ${getAssignmentTypeBadgeColor(swap.assignmentB.type)}`}>
                          {swap.assignmentB.type}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-center my-1">
                      <div className="w-10 h-px bg-gray-200"></div>
                      <div className="mx-3">
                        <RefreshCw className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="w-10 h-px bg-gray-200"></div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Your Assignment:</div>
                      <div className={`text-sm font-medium p-2 rounded border ${getAssignmentBgColor(swap.assignmentA.type)}`}>
                        <div>{getUserFriendlyLabel(swap.assignmentA.code)}</div>
                        <span className={`mt-1 inline-block text-xs px-1.5 rounded-full ${getAssignmentTypeBadgeColor(swap.assignmentA.type)}`}>
                          {swap.assignmentA.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-xs text-gray-500 mb-1">Validation</div>
                    <div className="flex space-x-2 mb-3">
                      <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                        PGY Compatible
                      </span>
                      <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                        7-Day Rule OK
                      </span>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleFindPaybackOptions(swap)}
                    >
                      Find Payback Options
                    </Button>
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
              <Clock className="h-6 w-6 text-yellow-500" />
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
              <Clock className="h-6 w-6 text-red-500" />
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