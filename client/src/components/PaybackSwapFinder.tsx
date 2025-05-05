import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, Clock, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { PaybackSwap } from '@/lib/types';
import { useSchedule } from '@/context/ScheduleContext';
import { getUserFriendlyLabel } from '@/lib/assignmentLabels';

export default function PaybackSwapFinder() {
  const [residentA, setResidentA] = useState<string>('');
  const [residentB, setResidentB] = useState<string>('');
  const [originalSwapDate, setOriginalSwapDate] = useState<Date | undefined>(undefined);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [paybackResults, setPaybackResults] = useState<PaybackSwap[]>([]);
  const [formattedDate, setFormattedDate] = useState<string>('');
  
  const { state, findPaybackSwaps } = useSchedule();
  const { toast } = useToast();
  
  // When the date changes, update the formatted date string
  useEffect(() => {
    if (originalSwapDate) {
      setFormattedDate(format(originalSwapDate, 'yyyy-MM-dd'));
    } else {
      setFormattedDate('');
    }
  }, [originalSwapDate]);
  
  const handleSubmit = () => {
    if (!residentA || !residentB || !formattedDate) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please select both residents and the original swap date."
      });
      return;
    }
    
    setIsSearching(true);
    try {
      const results = findPaybackSwaps(residentA, residentB, formattedDate);
      setPaybackResults(results);
      
      if (results.length === 0) {
        toast({
          variant: "default",
          title: "No payback options found",
          description: "No suitable future dates were found for a payback swap with the provided criteria."
        });
      } else {
        toast({
          title: "Payback options found",
          description: `Found ${results.length} potential payback dates.`
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error finding payback swaps",
        description: error instanceof Error ? error.message : "An unknown error occurred"
      });
    } finally {
      setIsSearching(false);
    }
  };
  
  const clearResults = () => {
    setPaybackResults([]);
    setResidentA('');
    setResidentB('');
    setOriginalSwapDate(undefined);
    setFormattedDate('');
  };

  const residents = Object.keys(state.residents).sort();
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-1.5">
        <h2 className="text-2xl font-semibold">Payback Swap Finder</h2>
        <p className="text-sm text-muted-foreground">
          Find future dates where Resident A (who had a Required shift covered) can pay back Resident B (who covered the Required shift).
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="resident-a" className="block text-sm font-medium mb-2">
            Resident A (who needs to pay back)
          </label>
          <Select
            value={residentA}
            onValueChange={setResidentA}
          >
            <SelectTrigger id="resident-a" className="w-full">
              <SelectValue placeholder="Select resident" />
            </SelectTrigger>
            <SelectContent>
              {residents.map(resident => (
                <SelectItem key={resident} value={resident}>{resident}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label htmlFor="resident-b" className="block text-sm font-medium mb-2">
            Resident B (who covered the shift)
          </label>
          <Select
            value={residentB}
            onValueChange={setResidentB}
          >
            <SelectTrigger id="resident-b" className="w-full">
              <SelectValue placeholder="Select resident" />
            </SelectTrigger>
            <SelectContent>
              {residents.map(resident => (
                <SelectItem key={resident} value={resident}>{resident}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label htmlFor="original-date" className="block text-sm font-medium mb-2">
            Original Swap Date
          </label>
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                id="original-date"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !originalSwapDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {originalSwapDate ? format(originalSwapDate, "PPP") : <span>Select a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={originalSwapDate}
                onSelect={(date) => {
                  setOriginalSwapDate(date);
                  setIsCalendarOpen(false);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <div className="flex space-x-2 justify-end">
        <Button variant="outline" onClick={clearResults} disabled={isSearching}>
          Clear
        </Button>
        <Button onClick={handleSubmit} disabled={isSearching}>
          {isSearching ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
            'Find Payback Options'
          )}
        </Button>
      </div>
      
      {paybackResults.length > 0 && (
        <>
          <Separator className="my-6" />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Potential Payback Dates</h3>
              <div className="text-sm text-muted-foreground">
                {paybackResults.length} option{paybackResults.length !== 1 ? 's' : ''} found
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paybackResults.map((result, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md">
                      {format(new Date(result.date), "MMM d, yyyy")}
                    </CardTitle>
                    <CardDescription className="flex items-center">
                      <Clock className="mr-1 h-4 w-4" />
                      Payback opportunity
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium">{residentA} (Elective)</h4>
                      <div className="mt-1 p-2 text-sm bg-blue-50 rounded border border-blue-100">
                        {getUserFriendlyLabel(result.residentAElectiveAssignment.code)}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium">{residentB} (Required)</h4>
                      <div className="mt-1 p-2 text-sm bg-amber-50 rounded border border-amber-100">
                        {getUserFriendlyLabel(result.residentBRequiredAssignment.code)}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}