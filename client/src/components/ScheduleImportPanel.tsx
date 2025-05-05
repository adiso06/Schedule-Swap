import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useContext } from "react";
import { ScheduleContext } from "@/context/ScheduleContext";
import { demoScheduleHTML, defaultScheduleData, defaultScheduleJSON } from "@/lib/data";
import PGYLevelEditor from "./PGYLevelEditor";

export default function ScheduleImportPanel() {
  const [scheduleInput, setScheduleInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [inputType, setInputType] = useState<"html" | "excel">("html");
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error("ScheduleImportPanel must be used within a ScheduleProvider");
  }
  const { parseSchedule, getAllSavedSchedules, loadSchedule, deleteSchedule, state } = context;
  const { toast } = useToast();
  const hasScheduleData = state.metadata.isLoaded;

  const handleParseSchedule = () => {
    if (!scheduleInput.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please paste schedule data first",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      if (inputType === "html") {
        // Check if the input contains <table> tags
        const html = scheduleInput.includes("<table") 
          ? scheduleInput 
          : `<table border="1">${scheduleInput}</table>`;
          
        parseSchedule(html, false);
        toast({
          title: "Success",
          description: "HTML schedule parsed successfully",
        });
      } else {
        // Parse as Excel/tab-delimited format
        parseSchedule(scheduleInput, true);
        toast({
          title: "Success",
          description: "Excel schedule parsed successfully",
        });
      }
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
    setScheduleInput(demoScheduleHTML);
    setInputType("html");
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
      setScheduleInput(pastedText);
      setInputType("html");
    } else if (pastedText.includes('\t')) {
      // If it contains tabs, it might be Excel data
      setScheduleInput(pastedText);
      setInputType("excel");
    } else {
      // Just set the text anyway
      setScheduleInput(pastedText);
    }
  };

  // Auto-parse demo data when loaded
  const handleLoadAndParse = () => {
    setScheduleInput(demoScheduleHTML);
    setInputType("html");
    setTimeout(() => {
      try {
        parseSchedule(demoScheduleHTML, false);
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
      
      // Try to auto-detect file type
      if (content.includes('<table') || content.includes('<tr') || content.includes('<td')) {
        setInputType("html");
      } else if (content.includes('\t')) {
        setInputType("excel");
      } else {
        // Default to HTML
        setInputType("html");
      }
      
      setScheduleInput(content);
      toast({
        title: "File Imported",
        description: `${inputType.toUpperCase()} file loaded. Click 'Parse Schedule' to process it.`,
      });
    };
    reader.readAsText(file);
  };

  // Load default schedule or last saved schedule on component mount
  const [didInitialLoad, setDidInitialLoad] = useState(false);
  
  useEffect(() => {
    // Only run once
    if (didInitialLoad) return;
    setDidInitialLoad(true);
    
    console.log("ScheduleImportPanel mounted, checking for data to load...");
    setTimeout(() => {
      // Only load if no schedule is currently loaded
      if (!hasScheduleData) {
        console.log("No schedule data loaded, looking for saved schedules...");
        
        // Check if we have any saved schedules
        const savedSchedules = getAllSavedSchedules();
        
        if (savedSchedules.length > 0) {
          // Load the most recently saved schedule
          console.log(`Found ${savedSchedules.length} saved schedules, loading most recent...`);
          const mostRecent = savedSchedules.sort((a, b) => {
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          })[0];
          
          try {
            loadSchedule(mostRecent.id);
            toast({
              title: "Schedule Loaded",
              description: `Previously saved schedule "${mostRecent.name}" loaded automatically.`
            });
          } catch (error) {
            console.error("Error loading saved schedule:", error);
            
            // If loading saved schedule fails, try the default data
            loadDefaultData();
          }
        } else {
          // No saved schedules, load the default data
          console.log("No saved schedules found, loading default schedule data...");
          loadDefaultData();
        }
      } else {
        console.log("Schedule data already loaded, skipping auto-load");
      }
    }, 100);
  }, []);
  
  // Function to load default schedule data
  const loadDefaultData = () => {
    console.log("Loading default schedule data...");
    try {
      // Convert JSON to Excel format
      const jsonToExcel = (jsonData: any[]) => {
        // Get all date keys from the first resident
        const firstResident = jsonData[0];
        const dateKeys = Object.keys(firstResident).filter(key => 
          key !== 'Name' && key !== 'PGY Level'
        );
        
        // Create header row
        let excelContent = `Name\tPGY Level\t${dateKeys.join('\t')}\n`;
        
        // Add each resident's data
        jsonData.forEach(resident => {
          let row = `${resident.Name}\t${resident["PGY Level"]}`;
          dateKeys.forEach(date => {
            row += `\t${resident[date] || ''}`;
          });
          excelContent += row + '\n';
        });
        
        return excelContent;
      };
      
      // Use the JSON data
      const excelData = jsonToExcel(defaultScheduleJSON);
      parseSchedule(excelData, true);
      
      toast({
        title: "Default Schedule Loaded",
        description: "The default residency schedule has been loaded automatically.",
      });
    } catch (error) {
      console.error("Error loading default schedule:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load the default schedule data."
      });
    }
  };

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
            <div className="mb-2">
              <div className="flex gap-4 items-center mb-2">
                <div className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    id="html-format" 
                    name="format-type" 
                    checked={inputType === "html"} 
                    onChange={() => setInputType("html")}
                  />
                  <label htmlFor="html-format" className="text-sm">HTML Format</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    id="excel-format" 
                    name="format-type" 
                    checked={inputType === "excel"} 
                    onChange={() => setInputType("excel")}
                  />
                  <label htmlFor="excel-format" className="text-sm">Excel/Tab Format</label>
                </div>
              </div>
            </div>
            
            <Textarea
              id="schedule-data"
              rows={8}
              className="w-full rounded-md border border-gray-300 text-sm font-mono"
              placeholder={inputType === "html" 
                ? "Paste schedule HTML table here..." 
                : "Paste tab-delimited schedule data here..."}
              value={scheduleInput}
              onChange={(e) => setScheduleInput(e.target.value)}
              onPaste={handlePaste}
            />
            <p className="text-xs text-gray-500 mt-1">
              {inputType === "html" 
                ? "Paste HTML table content directly from websites or other sources" 
                : "Paste tab-delimited data directly from Excel or spreadsheets"}
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Button
              id="parse-schedule-btn"
              variant="default"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium"
              onClick={handleParseSchedule}
              disabled={isLoading || !scheduleInput.trim()}
            >
              {isLoading ? "Processing..." : `Parse ${inputType.toUpperCase()} Schedule`}
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
      
      {/* Show PGY level editor and save options once schedule is loaded */}
      {hasScheduleData && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <Button 
              variant="outline" 
              onClick={() => context.reset()}
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              Reset Schedule Data
            </Button>
            
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  const name = prompt("Enter a name for this schedule:");
                  if (name?.trim()) {
                    const saved = context.saveCurrentSchedule(name.trim());
                    toast({
                      title: "Schedule Saved",
                      description: `Schedule "${saved.name}" saved successfully.`
                    });
                  }
                }}
                className="text-green-600 border-green-600 hover:bg-green-50"
              >
                Save Current Schedule
              </Button>
              
              <Button
                variant="outline"
                onClick={() => {
                  context.exportSchedules();
                  toast({
                    title: "Schedules Exported",
                    description: "All saved schedules have been exported to a JSON file."
                  });
                }}
                className="text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                Export Schedules
              </Button>
            </div>
          </div>
          
          <PGYLevelEditor />
          
          {/* Saved Schedules Section */}
          <div className="mt-6">
            <h3 className="text-md font-medium mb-2">Saved Schedules</h3>
            <div className="border rounded-md overflow-hidden">
              {context.getAllSavedSchedules().length > 0 ? (
                <div className="divide-y">
                  {context.getAllSavedSchedules().map(schedule => (
                    <div 
                      key={schedule.id}
                      className="flex justify-between items-center p-3 hover:bg-gray-50"
                    >
                      <div>
                        <p className="font-medium">{schedule.name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(schedule.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            context.loadSchedule(schedule.id);
                            toast({
                              title: "Schedule Loaded",
                              description: `Schedule "${schedule.name}" loaded successfully.`
                            });
                          }}
                        >
                          Load
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete "${schedule.name}"?`)) {
                              context.deleteSchedule(schedule.id);
                              toast({
                                title: "Schedule Deleted",
                                description: `Schedule "${schedule.name}" has been deleted.`
                              });
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No saved schedules yet. Save your current schedule to see it here.
                </div>
              )}
            </div>
            
            {/* Import JSON */}
            <div className="mt-4">
              <input
                type="file"
                id="import-json"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const content = event.target?.result as string;
                    try {
                      const success = context.importSchedulesFromJson(content);
                      if (success) {
                        toast({
                          title: "Schedules Imported",
                          description: "Schedules have been imported successfully."
                        });
                      } else {
                        toast({
                          variant: "destructive",
                          title: "Import Failed",
                          description: "Failed to import schedules. Invalid format."
                        });
                      }
                    } catch (error) {
                      toast({
                        variant: "destructive",
                        title: "Import Error",
                        description: "An error occurred while importing schedules."
                      });
                    }
                  };
                  reader.readAsText(file);
                }}
              />
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  document.getElementById("import-json")?.click();
                }}
              >
                Import Schedules from JSON
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
