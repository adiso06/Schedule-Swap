import React, { useState } from 'react';
import { useSchedule } from '@/context/ScheduleContext';
import { format } from 'date-fns';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, RefreshCw, Search } from 'lucide-react';
import { PaybackSwap } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { getUserFriendlyLabel } from '@/lib/assignmentLabels';
import { formatDateForDisplay } from '@/lib/utils';

export default function PaybackSwapFinder() {
  const { state, findPaybackSwaps } = useSchedule();
  const { residents, metadata } = state;
  const { toast } = useToast();

  const [residentA, setResidentA] = useState<string>('');
  const [residentB, setResidentB] = useState<string>('');
  const [originalSwapDate, setOriginalSwapDate] = useState<string>('');
  const [paybackResults, setPaybackResults] = useState<PaybackSwap[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const residentOptions = Object.keys(residents).sort();
  const dateOptions = metadata.isLoaded ? metadata.dates : [];

  const handleSearch = () => {
    if (!residentA || !residentB || !originalSwapDate) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please select both residents and the original swap date."
      });
      return;
    }

    setIsSearching(true);

    try {
      // Find potential payback dates
      const results = findPaybackSwaps(residentA, residentB, originalSwapDate);
      setPaybackResults(results);

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
      toast({
        variant: "destructive",
        title: "Error finding payback options",
        description: "An error occurred while looking for payback options."
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleClear = () => {
    setResidentA('');
    setResidentB('');
    setOriginalSwapDate('');
    setPaybackResults([]);
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Resident A (Needs to Pay Back)</label>
          <Select value={residentA} onValueChange={setResidentA}>
            <SelectTrigger>
              <SelectValue placeholder="Select resident" />
            </SelectTrigger>
            <SelectContent>
              {residentOptions.map(resident => (
                <SelectItem key={resident} value={resident}>
                  {resident} (PGY-{residents[resident].pgyLevel})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Resident B (Covered Shift)</label>
          <Select value={residentB} onValueChange={setResidentB}>
            <SelectTrigger>
              <SelectValue placeholder="Select resident" />
            </SelectTrigger>
            <SelectContent>
              {residentOptions.map(resident => (
                <SelectItem key={resident} value={resident}>
                  {resident} (PGY-{residents[resident].pgyLevel})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Original Swap Date</label>
          <Select value={originalSwapDate} onValueChange={setOriginalSwapDate}>
            <SelectTrigger>
              <SelectValue placeholder="Select date" />
            </SelectTrigger>
            <SelectContent>
              {dateOptions.map(date => (
                <SelectItem key={date} value={date}>
                  {formatDateForDisplay(date)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end space-x-3 mb-6">
        <Button variant="outline" onClick={handleClear}>Clear</Button>
        <Button onClick={handleSearch} disabled={isSearching}>
          {isSearching ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Find Payback Options
            </>
          )}
        </Button>
      </div>

      {/* Results Area */}
      {paybackResults.length > 0 ? (
        <div>
          <h2 className="text-lg font-medium text-gray-800 mb-4">Payback Options ({paybackResults.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paybackResults.map((payback, index) => (
              <Card key={index}>
                <CardHeader className="pb-2 bg-blue-50">
                  <CardTitle className="text-base flex items-center">
                    <Calendar className="h-4 w-4 text-primary-600 mr-2" />
                    {format(new Date(payback.date), "MMMM d, yyyy")}
                  </CardTitle>
                  <CardDescription>
                    Potential payback opportunity
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">{residentA}'s Assignment (Elective):</div>
                      <div className="text-sm p-2 rounded border bg-blue-50 border-blue-100">
                        {getUserFriendlyLabel(payback.residentAElectiveAssignment.code)}
                      </div>
                    </div>
                    <div className="flex items-center justify-center py-1">
                      <div className="w-10 h-px bg-gray-200"></div>
                      <div className="mx-3">
                        <RefreshCw className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="w-10 h-px bg-gray-200"></div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">{residentB}'s Assignment (Required):</div>
                      <div className="text-sm p-2 rounded border bg-purple-50 border-purple-100">
                        {getUserFriendlyLabel(payback.residentBRequiredAssignment.code)}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="ml-auto">Select This Option</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      ) : residentA && residentB && originalSwapDate && !isSearching ? (
        <div className="py-16 flex flex-col items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
          <div className="bg-yellow-50 border border-yellow-100 rounded-full p-3 mb-4">
            <Clock className="h-6 w-6 text-yellow-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-500">No Future Payback Options Found</h3>
          <p className="text-gray-400 text-sm mt-1 max-w-md text-center">
            We couldn't find any future dates where {residentA} can cover a Required shift for {residentB} while on Elective.
          </p>
        </div>
      ) : null}
    </div>
  );
}