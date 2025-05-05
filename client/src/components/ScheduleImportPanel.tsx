import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useSchedule } from "@/context/ScheduleContext";
import { demoScheduleHTML } from "@/lib/data";
import PGYLevelEditor from "./PGYLevelEditor";

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
      // Check if the input contains <table> tags
      const html = scheduleHtml.includes("<table") 
        ? scheduleHtml 
        : `<table border="1">${scheduleHtml}</table>`;
        
      parseSchedule(html);
      toast({
        title: "Success",
        description: "Schedule parsed successfully",
      });
    } catch (error) {
      console.error("Parsing error:", error);
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

  // Parse pasted text
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    // Get the pasted text
    const pastedText = e.clipboardData.getData('text');
    
    // Check if it looks like HTML
    if (pastedText.includes('<table') || pastedText.includes('<tr') || pastedText.includes('<td')) {
      setScheduleHtml(pastedText);
      
      // Optional: auto-parse immediately
      /*
      setTimeout(() => {
        try {
          parseSchedule(pastedText);
          toast({
            title: "Success",
            description: "Schedule data pasted and parsed automatically",
          });
        } catch (error) {
          // Just log the error but don't show toast yet as user might be still editing
          console.error("Auto-parse error:", error);
        }
      }, 500);
      */
    }
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

  // Import directly from file
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setScheduleHtml(content);
      toast({
        title: "File Imported",
        description: "HTML file loaded. Click 'Parse Schedule' to process it.",
      });
    };
    reader.readAsText(file);
  };

  // Get the current schedule state
  const { state } = useSchedule();
  const hasScheduleData = state.metadata.isLoaded;

  return (
    <div className="mb-6">
      <h2 className="text-lg font-medium text-gray-800 mb-3">Import Schedule</h2>
      
      {/* Show schedule import form if no schedule is loaded yet */}
      {!hasScheduleData && (
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="schedule-data" className="block text-sm font-medium text-gray-700">
                Schedule HTML Table
              </label>
              <label 
                htmlFor="file-import" 
                className="text-xs text-blue-600 cursor-pointer hover:text-blue-800"
              >
                Import from file
              </label>
              <input 
                type="file" 
                id="file-import" 
                accept=".html,.htm,.txt" 
                className="hidden" 
                onChange={handleFileImport} 
              />
            </div>
            <Textarea
              id="schedule-data"
              rows={8}
              className="w-full rounded-md border border-gray-300 text-sm font-mono"
              placeholder="Paste schedule HTML table here..."
              value={scheduleHtml}
              onChange={(e) => setScheduleHtml(e.target.value)}
              onPaste={handlePaste}
            />
            <p className="text-xs text-gray-500 mt-1">
              Paste HTML table content directly from Excel, websites, or other sources
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Button
              id="parse-schedule-btn"
              variant="default"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium"
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
              disabled={isLoading}
            >
              Load & Parse Demo
            </Button>
          </div>
          
          <div id="demo-data-controls" className="flex justify-end">
            <button
              id="load-demo-data-btn"
              type="button"
              className="text-blue-600 text-xs hover:text-blue-800 flex items-center"
              onClick={loadDemoData}
            >
              Load Demo Data Only
            </button>
          </div>
        </div>
      )}
      
      {/* Show PGY level editor once schedule is loaded */}
      {hasScheduleData && (
        <div>
          <div className="mb-4">
            <Button 
              variant="outline" 
              onClick={() => useSchedule().reset()}
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              Reset Schedule Data
            </Button>
          </div>
          
          <PGYLevelEditor />
        </div>
      )}
    </div>
  );
}
