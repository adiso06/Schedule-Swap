import React, { useState, useEffect } from "react";
import { useSchedule } from "@/context/ScheduleContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  MoonlightingMonth, 
  calculateMoonlightingForMonths, 
  clearMoonlightingCache 
} from "@/lib/moonlightingUtils";

interface MoonlightingFormProps {
  selectedResident: string;
  onResidentChange: (resident: string) => void;
  onDataCalculated: (data: MoonlightingMonth[]) => void;
  onLoadingChange: (loading: boolean) => void;
  viewMonths: { year: number; month: number }[];
}

export default function MoonlightingForm({
  selectedResident,
  onResidentChange,
  onDataCalculated,
  onLoadingChange,
  viewMonths
}: MoonlightingFormProps) {
  const { state } = useSchedule();
  const { toast } = useToast();
  const [residentInput, setResidentInput] = useState("");
  const [filteredResidents, setFilteredResidents] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  // Handle resident input filtering
  useEffect(() => {
    if (residentInput.trim() === "") {
      setFilteredResidents([]);
      onResidentChange("");
      return;
    }

    const lowercaseInput = residentInput.toLowerCase();
    const filtered = Object.keys(state.residents)
      .filter(name => name.toLowerCase().includes(lowercaseInput))
      .sort((a, b) => {
        // Exact matches first
        if (a.toLowerCase() === lowercaseInput) return -1;
        if (b.toLowerCase() === lowercaseInput) return 1;
        
        // Then matches that start with the input
        const aStartsWith = a.toLowerCase().startsWith(lowercaseInput);
        const bStartsWith = b.toLowerCase().startsWith(lowercaseInput);
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        
        return a.localeCompare(b);
      });

    // Auto-select if there's an exact match
    const exactMatch = filtered.find(name => name.toLowerCase() === lowercaseInput);
    if (exactMatch) {
      onResidentChange(exactMatch);
      setResidentInput(exactMatch);
      setFilteredResidents([]);
      return;
    }

    // Clear current resident if input doesn't match exactly
    if (selectedResident && selectedResident.toLowerCase() !== lowercaseInput) {
      onResidentChange("");
    }

    setFilteredResidents(filtered);
    setSelectedIndex(-1);
  }, [residentInput, state.residents, onResidentChange, selectedResident]);

  // Auto-calculate when resident changes
  useEffect(() => {
    if (selectedResident && viewMonths.length > 0) {
      calculateMoonlighting();
    } else {
      onDataCalculated([]);
    }
  }, [selectedResident, viewMonths]);

  const calculateMoonlighting = async () => {
    if (!selectedResident) return;

    onLoadingChange(true);
    try {
      const firstMonth = viewMonths[0];
      const monthData = calculateMoonlightingForMonths(
        selectedResident,
        firstMonth.year,
        firstMonth.month,
        viewMonths.length,
        state.schedule,
        state.metadata
      );
      
      onDataCalculated(monthData);
      
      // Debug logging
      console.log('📊 Moonlighting calculation results:', monthData);
      monthData.forEach(month => {
        console.log(`📅 ${month.monthName} ${month.year}: ${month.eligibleCount} eligible days`);
        month.dates.forEach(date => {
          if (date.isEligible) {
            console.log(`  ✅ ${date.date} (${date.dayOfWeek}) - ELIGIBLE`);
          } else if (date.currentAssignment?.code === "OFF") {
            console.log(`  ❌ ${date.date} (${date.dayOfWeek}) - OFF but not eligible: ${date.reason}`);
          }
        });
      });
      
      // Show success toast
      const totalEligible = monthData.reduce((sum, month) => sum + month.eligibleCount, 0);
      toast({
        title: "Moonlighting Calculated",
        description: `Found ${totalEligible} eligible days for ${selectedResident}`,
      });
    } catch (error) {
      console.error("Error calculating moonlighting:", error);
      toast({
        variant: "destructive",
        title: "Calculation Error",
        description: "Failed to calculate moonlighting opportunities",
      });
    } finally {
      onLoadingChange(false);
    }
  };

  const handleResidentSelect = (resident: string) => {
    setResidentInput(resident);
    onResidentChange(resident);
    setFilteredResidents([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filteredResidents.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredResidents.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleResidentSelect(filteredResidents[selectedIndex]);
        }
        break;
      case "Escape":
        setFilteredResidents([]);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleClearCache = () => {
    clearMoonlightingCache();
    toast({
      title: "Cache Cleared",
      description: "Moonlighting cache has been cleared. New calculations will be performed.",
    });
    
    // Recalculate if we have a selected resident
    if (selectedResident) {
      calculateMoonlighting();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="bg-gradient-to-r from-blue-100 to-blue-50 -m-6 mb-6 p-6 rounded-t-lg border-b border-blue-200">
        <h2 className="text-xl font-semibold text-blue-800">Find Moonlighting Days</h2>
        <p className="text-sm text-blue-700 mt-1">
          Enter a resident name to see eligible moonlighting opportunities
        </p>
      </div>

      <div className="space-y-4">
        {/* Resident Input */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Resident Name
          </label>
          <Input
            type="text"
            placeholder="Start typing a resident name..."
            value={residentInput}
            onChange={(e) => setResidentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full"
          />
          
          {/* Dropdown for filtered residents */}
          {filteredResidents.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
              {filteredResidents.map((resident, index) => (
                <div
                  key={resident}
                  className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                    index === selectedIndex ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleResidentSelect(resident)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{resident}</span>
                    <Badge variant="outline" className="text-xs">
                      PGY{state.residents[resident]?.pgyLevel || '?'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Resident Display */}
        {selectedResident && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-800">
                Selected: {selectedResident}
              </span>
              <Badge className="bg-green-100 text-green-800">
                PGY{state.residents[selectedResident]?.pgyLevel || '?'}
              </Badge>
            </div>
          </div>
        )}

        {/* Rules Information */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Moonlighting Rules</h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Must be an OFF day</li>
            <li>• Working that day cannot result in 7+ working days in a week</li>
            <li>• Weeks are Monday to Sunday</li>
            <li>• <strong>Electives have weekends off</strong> (except MICU/CCU)</li>
          </ul>
        </div>

        {/* Cache Management */}
        <div className="pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearCache}
            className="w-full text-gray-600 hover:text-gray-800"
          >
            Clear Cache & Recalculate
          </Button>
          <p className="text-xs text-gray-500 mt-1 text-center">
            Results are cached for faster loading
          </p>
        </div>
      </div>
    </div>
  );
} 