import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useSchedule } from "../hooks/useSchedule";
import { demoScheduleHTML } from "@/lib/data";

export default function ScheduleImportPanel() {
  const [scheduleHtml, setScheduleHtml] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { parseSchedule } = useSchedule();
  const { toast } = useToast();

  const handleParseSchedule = () => {
    if (!scheduleHtml.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please paste schedule HTML table first",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      parseSchedule(scheduleHtml);
      toast({
        title: "Success",
        description: "Schedule parsed successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Parsing Error",
        description: error instanceof Error ? error.message : "Failed to parse schedule",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadDemoData = () => {
    setScheduleHtml(demoScheduleHTML);
    toast({
      title: "Demo Data Loaded",
      description: "Demo schedule data has been loaded. Click 'Parse Schedule' to process it.",
    });
  };

  // Auto-parse demo data when loaded
  const handleLoadAndParse = () => {
    setScheduleHtml(demoScheduleHTML);
    setTimeout(() => {
      try {
        parseSchedule(demoScheduleHTML);
        toast({
          title: "Success",
          description: "Demo data loaded and parsed successfully",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Parsing Error",
          description: error instanceof Error ? error.message : "Failed to parse demo data",
        });
      }
    }, 100);
  };

  return (
    <div className="mb-6">
      <h2 className="text-lg font-medium text-gray-800 mb-3">Import Schedule</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="schedule-data" className="block text-sm font-medium text-gray-700 mb-1">
            Schedule HTML Data
          </label>
          <Textarea
            id="schedule-data"
            rows={6}
            className="w-full rounded-md border border-gray-300 text-sm"
            placeholder="Paste schedule HTML table here..."
            value={scheduleHtml}
            onChange={(e) => setScheduleHtml(e.target.value)}
          />
        </div>
        
        <div className="flex space-x-2">
          <Button
            id="parse-schedule-btn"
            variant="default"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleParseSchedule}
            disabled={isLoading || !scheduleHtml.trim()}
          >
            {isLoading ? "Processing..." : "Parse Schedule"}
          </Button>
          
          <Button
            id="load-and-parse-demo-btn"
            variant="secondary"
            className="bg-gray-200 hover:bg-gray-300 text-gray-800"
            onClick={handleLoadAndParse}
          >
            Load & Parse Demo
          </Button>
        </div>
        
        <div id="demo-data-controls" className="flex justify-end">
          <button
            id="load-demo-data-btn"
            type="button"
            className="text-blue-600 text-sm hover:text-blue-800 flex items-center"
            onClick={loadDemoData}
          >
            Load Demo Data Only
          </button>
        </div>
      </div>
    </div>
  );
}
