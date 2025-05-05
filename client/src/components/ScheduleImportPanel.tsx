import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useSchedule } from "../hooks/useSchedule";
import { demoScheduleHTML } from "@/lib/data";

export default function ScheduleImportPanel() {
  const [scheduleHtml, setScheduleHtml] = useState("");
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
    }
  };

  const loadDemoData = () => {
    setScheduleHtml(demoScheduleHTML);
    toast({
      title: "Demo Data Loaded",
      description: "Demo schedule data has been loaded",
    });
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
            className="w-full rounded-md border-gray-300 text-sm"
            placeholder="Paste schedule HTML table here..."
            value={scheduleHtml}
            onChange={(e) => setScheduleHtml(e.target.value)}
          />
        </div>
        <Button
          id="parse-schedule-btn"
          className="w-full bg-primary-600 hover:bg-primary-700"
          onClick={handleParseSchedule}
        >
          Parse Schedule
        </Button>
        <div id="demo-data-controls" className="flex justify-end">
          <button
            id="load-demo-data-btn"
            className="text-primary-600 text-sm hover:text-primary-800 flex items-center"
            onClick={loadDemoData}
          >
            <i className="ri-file-list-3-line mr-1"></i> Load Demo Data
          </button>
        </div>
      </div>
    </div>
  );
}
