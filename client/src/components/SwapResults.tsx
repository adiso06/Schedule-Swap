import React, { useState, useEffect } from "react";
import { useSchedule } from "@/context/ScheduleContext";
import { PotentialSwap, PaybackSwap } from "@/lib/types";
import { getUserFriendlyLabel } from "@/lib/assignmentLabels";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { ArrowLeft, Calendar, CheckCircle, Clock, RefreshCw, Loader2, AlertTriangle } from "lucide-react";

export default function SwapResults() {
  // Global state from context - ALL hooks must be declared first
  const { state, findPaybackSwaps, toggleSimulationMode, findValidSwaps } = useSchedule();
  const { validSwaps, currentResident, currentDate, invalidReason, isSimulationModeActive } = state;
  const { toast } = useToast();
  
  // Auto re-run search when simulation mode is toggled
  useEffect(() => {
    if (currentResident && currentDate) {
      // Re-run the search when simulation mode changes
      console.log(`Simulation mode changed to: ${isSimulationModeActive}, re-running search...`);
      findValidSwaps(currentResident, currentDate);
    }
  }, [isSimulationModeActive, currentResident, currentDate, findValidSwaps]);
  
  // ALL useState hooks declared before any conditional logic
  const [selectedSwap, setSelectedSwap] = useState<PotentialSwap | null>(null);
  const [paybackSwaps, setPaybackSwaps] = useState<PaybackSwap[]>([]);
  const [isLoadingPayback, setIsLoadingPayback] = useState(false);
  const [swapsWithPayback, setSwapsWithPayback] = useState<PotentialSwap[]>([]);
  const [swapsWithoutPayback, setSwapsWithoutPayback] = useState<PotentialSwap[]>([]);
  const [processingPaybackCheck, setProcessingPaybackCheck] = useState(false);
  const [isAssignmentNonSwappable, setIsAssignmentNonSwappable] = useState<boolean>(false);
  const [nonSwappableAssignmentCode, setNonSwappableAssignmentCode] = useState<string>("");

  // ALL useEffect hooks declared before any conditional logic
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const showNotSwappableWarning = (!!invalidReason || isAssignmentNonSwappable) && !isSimulationModeActive;
      console.log("DEBUG SwapResults: Display Logic", {
        validSwapsCount: validSwaps.length,
        invalidReason,
        showNoSwapsFound: validSwaps.length === 0 && !showNotSwappableWarning,
        showNotSwappableWarning,
        isSimulationModeActive,
        processingPaybackCheck
      });
    }
  }, [validSwaps.length, invalidReason, isAssignmentNonSwappable, isSimulationModeActive, processingPaybackCheck]);
  
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && validSwaps.length > 0) {
      console.log(`Found ${validSwaps.length} valid swaps for ${currentResident} on ${currentDate}`);
    }
  }, [validSwaps.length, currentResident, currentDate]);
  
  useEffect(() => {
    if (!currentResident || !currentDate) {
      setIsAssignmentNonSwappable(false);
      setNonSwappableAssignmentCode("");
      return;
    }
    
    // Check window global flag (set by context)
    if ((window as any).nonSwappableAssignmentDetected) {
      const details = (window as any).nonSwappableAssignmentDetails;
      console.log("Found non-swappable assignment via window object:", details);
      setIsAssignmentNonSwappable(true);
      setNonSwappableAssignmentCode(details?.code || "Unknown");
      return;
    }
    
    // Direct check in the schedule data
    try {
      // Access the schedule from context directly
      const assignment = state.schedule[currentResident]?.[currentDate];
      if (assignment) {
        console.log("Direct assignment check:", {
          code: assignment.code,
          swappable: assignment.swappable,
          isNonSwappable: String(assignment.swappable) === "No" 
        });
        
        // Check if this assignment is non-swappable
        if (String(assignment.swappable) === "No") {
          console.log("Found non-swappable assignment via direct check:", assignment);
          setIsAssignmentNonSwappable(true);
          setNonSwappableAssignmentCode(assignment.code);
        } else {
          setIsAssignmentNonSwappable(false);
          setNonSwappableAssignmentCode("");
        }
      }
    } catch (error) {
      console.error("Error checking assignment swappability:", error);
    }
    
    // Listen for specific event to detect non-swappable assignments
    const checkNonSwappableAssignment = (e: CustomEvent) => {
      if (e.detail && e.detail.code && e.detail.swappable === "No") {
        console.log("NonSwappable assignment detected via event:", e.detail);
        setIsAssignmentNonSwappable(true);
        setNonSwappableAssignmentCode(e.detail.code);
      }
    };
    
    // Add event listener
    window.addEventListener('nonSwappableAssignment' as any, checkNonSwappableAssignment as any);
    
    return () => {
      window.removeEventListener('nonSwappableAssignment' as any, checkNonSwappableAssignment as any);
    };
  }, [currentResident, currentDate, state.schedule]);
  
  useEffect(() => {
    // Skip if necessary data isn't available - but don't clear arrays if they already have data
    if (!currentResident || !currentDate) {
      setSwapsWithPayback([]);
      setSwapsWithoutPayback([]);
      return;
    }
    
    // Only process if we have valid swaps and haven't already processed them
    if (validSwaps.length === 0) {
      // Only clear if we don't already have categorized swaps
      if (swapsWithPayback.length === 0 && swapsWithoutPayback.length === 0) {
        setSwapsWithPayback([]);
        setSwapsWithoutPayback([]);
      }
      return;
    }
    
    const checkPaybackAvailability = async () => {
      setProcessingPaybackCheck(true);
      
      try {
        const withPayback: PotentialSwap[] = [];
        const withoutPayback: PotentialSwap[] = [];
        
        // Check each swap for payback availability
        for (const swap of validSwaps) {
          try {
            const paybackOptions = findPaybackSwaps(
              currentResident,
              swap.residentB,
              currentDate
            );
            
            if (paybackOptions.length > 0) {
              withPayback.push(swap);
            } else {
              withoutPayback.push(swap);
            }
          } catch (error) {
            console.error(`Error checking payback for ${swap.residentB}:`, error);
            // If payback check fails, still show the swap without payback
            withoutPayback.push(swap);
          }
        }
        
        console.log(`Payback categorization complete: ${withPayback.length} with payback, ${withoutPayback.length} without payback`);
        
        setSwapsWithPayback(withPayback);
        setSwapsWithoutPayback(withoutPayback);
      } catch (error) {
        console.error("Error checking payback availability:", error);
        // If the entire process fails, show all swaps without payback
        setSwapsWithPayback([]);
        setSwapsWithoutPayback([...validSwaps]);
      } finally {
        setProcessingPaybackCheck(false);
      }
    };
    
    checkPaybackAvailability();
  }, [validSwaps.length, currentResident, currentDate, findPaybackSwaps]);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const showNotSwappableWarning = (!!invalidReason || isAssignmentNonSwappable) && !isSimulationModeActive;
      const showNoSwapsFound = validSwaps.length === 0 && !showNotSwappableWarning;
      console.log("DEBUG SwapResults: Display States", {
        validSwapsCount: validSwaps.length,
        swapsWithPaybackCount: swapsWithPayback.length,
        swapsWithoutPaybackCount: swapsWithoutPayback.length,
        showNoSwapsFound,
        showNotSwappableWarning,
        processingPaybackCheck
      });
    }
  }, [validSwaps.length, swapsWithPayback.length, swapsWithoutPayback.length, invalidReason, isAssignmentNonSwappable, isSimulationModeActive, processingPaybackCheck]);

  // Early return AFTER all hooks are declared
  if (!currentResident || !currentDate) {
    return null;
  }

  // Derived state - computed after the early return
  const showNotSwappableWarning = (!!invalidReason || isAssignmentNonSwappable) && !isSimulationModeActive;
  
  // Show no swaps found only if we truly have no swaps AND no categorized swaps
  const hasAnyCategorizedSwaps = swapsWithPayback.length > 0 || swapsWithoutPayback.length > 0;
  const showNoSwapsFound = validSwaps.length === 0 && !showNotSwappableWarning && !hasAnyCategorizedSwaps;
  
  // Handler Functions
  const handleFindPaybackOptions = (swap: PotentialSwap) => {
    setIsLoadingPayback(true);
    setSelectedSwap(swap);
    
    try {
      // Find payback swaps where the current resident can pay back the resident they're swapping with
      const results = findPaybackSwaps(
        currentResident,
        swap.residentB,
        currentDate
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
    } catch (error) {
      console.error("Error finding payback swaps:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while searching for payback options."
      });
    } finally {
      setIsLoadingPayback(false);
    }
  };
  
  const handleBackToSwaps = () => {
    setSelectedSwap(null);
    setPaybackSwaps([]);
  };
  
  // Payback detail view - when a specific swap is selected
  if (selectedSwap) {
    return (
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBackToSwaps}
              className="mr-3"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Swaps
            </Button>
            <h2 className="text-lg font-medium text-gray-800">
              Payback Options for {selectedSwap.residentB}
            </h2>
          </div>
        </div>

        {isLoadingPayback ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-3 text-gray-600">Finding payback options...</span>
          </div>
        ) : paybackSwaps.length > 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              These are future dates where <strong>{currentResident}</strong> can cover a Required shift for <strong>{selectedSwap.residentB}</strong> while on Elective:
            </p>
            {paybackSwaps.map((payback: PaybackSwap, index: number) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 bg-green-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-green-600 mr-2" />
                    <span className="font-medium text-gray-800">
                      {format(parseISO(payback.date), 'EEEE, MMMM d, yyyy')}
                    </span>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <div><strong>{currentResident}:</strong> {getUserFriendlyLabel(payback.residentAElectiveAssignment.code)}</div>
                  <div><strong>{selectedSwap.residentB}:</strong> {getUserFriendlyLabel(payback.residentBRequiredAssignment.code)}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
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

  // Regular swap results view
  return (
    <>
      {/* Full-width Simulation Mode Banner - single place for simulation mode indication */}
      {isSimulationModeActive && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-300 rounded-lg flex items-start">
          <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-amber-800">Simulation Mode Active</h3>
            <p className="text-xs text-amber-700 mt-1">
              You are viewing hypothetical swaps that may not be allowed under standard program rules.
              {isAssignmentNonSwappable && (
                <span className="block mt-1">
                  <strong>Note:</strong> The assignment "{nonSwappableAssignmentCode}" is normally non-swappable, 
                  but swaps are being shown for planning purposes.
                </span>
              )}
              <span className="block mt-1 font-semibold">
                These hypothetical swaps are for planning purposes only and cannot be executed in practice.
              </span>
            </p>
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center">
          <h2 className="text-lg font-medium text-gray-800">Swap Results</h2>
        </div>
        {validSwaps.length > 0 && (
          <div className="flex space-x-2">
            <div className="text-sm text-gray-500 flex items-center" id="total-results-counter">
              <span className="font-medium">{validSwaps.length}</span> valid swap{validSwaps.length !== 1 ? 's' : ''} found
            </div>
          </div>
        )}
      </div>
      
      <div id="swap-results-container">
        {/* Processing state */}
        {processingPaybackCheck && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-center">
            <Loader2 className="h-5 w-5 text-blue-500 animate-spin mr-3" />
            <span className="text-sm text-blue-700">Processing swap options...</span>
          </div>
        )}
      
        {/* Show all swaps if categorization is still processing or failed */}
        {!processingPaybackCheck && validSwaps.length > 0 && swapsWithPayback.length === 0 && swapsWithoutPayback.length === 0 && (
          <>
            <div className="mb-6">
              <h3 className="text-base font-medium text-gray-700 mb-3">All Valid Swaps</h3>
              <div id="valid-swaps-list" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {validSwaps.map((swap, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition">
                    <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <span className="font-medium">{swap.residentB}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          PGY-{swap.pgyB}
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-3">
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">You give:</span> 
                          <span className="ml-2 font-medium">{getUserFriendlyLabel(swap.assignmentA.code)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">You get:</span> 
                          <span className="ml-2 font-medium">{getUserFriendlyLabel(swap.assignmentB.code)}</span>
                        </div>
                      </div>
                      <div className="mt-3 flex justify-between items-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleFindPaybackOptions(swap)}
                          className="text-xs"
                        >
                          <Calendar className="h-3 w-3 mr-1" />
                          Find Payback
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Categorized swaps display - only show when categorization is complete */}
        {!processingPaybackCheck && (swapsWithPayback.length > 0 || swapsWithoutPayback.length > 0) && (
          <>
            {/* Swaps with payback options */}
            {swapsWithPayback.length > 0 && (
              <div className="mb-6">
                <h3 className="text-base font-medium text-green-700 mb-3 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Swaps with Future Payback Options ({swapsWithPayback.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {swapsWithPayback.map((swap, index) => (
                    <div key={index} className="border border-green-200 rounded-lg overflow-hidden hover:shadow-md transition bg-green-50">
                      <div className="border-b border-green-200 bg-green-100 px-4 py-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <span className="font-medium">{swap.residentB}</span>
                          </div>
                          <div className="text-xs text-green-600">
                            PGY-{swap.pgyB}
                          </div>
                        </div>
                      </div>
                      <div className="px-4 py-3">
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-600">You give:</span> 
                            <span className="ml-2 font-medium">{getUserFriendlyLabel(swap.assignmentA.code)}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">You get:</span> 
                            <span className="ml-2 font-medium">{getUserFriendlyLabel(swap.assignmentB.code)}</span>
                          </div>
                        </div>
                        <div className="mt-3 flex justify-between items-center">
                          <Button
                            size="sm"
                            onClick={() => handleFindPaybackOptions(swap)}
                            className="text-xs bg-green-600 hover:bg-green-700"
                          >
                            <Calendar className="h-3 w-3 mr-1" />
                            View Payback
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Swaps without payback options */}
            {swapsWithoutPayback.length > 0 && (
              <div className="mb-6">
                <h3 className="text-base font-medium text-yellow-700 mb-3 flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Swaps without Future Payback Options ({swapsWithoutPayback.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {swapsWithoutPayback.map((swap, index) => (
                    <div key={index} className="border border-yellow-200 rounded-lg overflow-hidden hover:shadow-md transition bg-yellow-50">
                      <div className="border-b border-yellow-200 bg-yellow-100 px-4 py-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <span className="font-medium">{swap.residentB}</span>
                          </div>
                          <div className="text-xs text-yellow-600">
                            PGY-{swap.pgyB}
                          </div>
                        </div>
                      </div>
                      <div className="px-4 py-3">
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-600">You give:</span> 
                            <span className="ml-2 font-medium">{getUserFriendlyLabel(swap.assignmentA.code)}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">You get:</span> 
                            <span className="ml-2 font-medium">{getUserFriendlyLabel(swap.assignmentB.code)}</span>
                          </div>
                        </div>
                        <div className="mt-3 flex justify-between items-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleFindPaybackOptions(swap)}
                            className="text-xs border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                          >
                            <Calendar className="h-3 w-3 mr-1" />
                            Check Payback
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* No valid swaps found */}
        {showNoSwapsFound && (
          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
              <RefreshCw className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-500">No Valid Swaps Found</h3>
            <p className="text-gray-400 text-sm mt-1">
              No residents are available to swap with {currentResident} on {format(parseISO(currentDate), 'EEEE, MMMM d, yyyy')}.
            </p>
          </div>
        )}

        {/* Warning for non-swappable assignments */}
        {showNotSwappableWarning && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0 mr-3" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">Assignment Not Swappable</h3>
                <div className="mt-1 text-sm text-red-700">
                  {invalidReason && <p>{invalidReason}</p>}
                  {isAssignmentNonSwappable && (
                    <p>
                      The assignment "{nonSwappableAssignmentCode}" for {currentResident} on {format(parseISO(currentDate), 'EEEE, MMMM d, yyyy')} is marked as non-swappable.
                    </p>
                  )}
                  <div className="mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={toggleSimulationMode}
                      className="text-red-700 border-red-300 hover:bg-red-100"
                    >
                      Enable Simulation Mode
                    </Button>
                    <span className="ml-2 text-xs text-red-600">
                      (View hypothetical swaps for planning purposes)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
