import React, { useState } from "react";
import { 
  Collapsible, 
  CollapsibleTrigger, 
  CollapsibleContent 
} from "@/components/ui/collapsible";
import ScheduleImportPanel from "./ScheduleImportPanel";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function CollapsibleScheduleControls() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full border rounded-lg p-3 bg-white"
    >
      <div className="flex items-center justify-between space-x-4 px-1">
        <h2 className="text-lg font-medium">Schedule Import & Management</h2>
        <CollapsibleTrigger asChild>
          <button className="rounded-full hover:bg-gray-100 p-2">
            {isOpen ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>
        </CollapsibleTrigger>
      </div>
      
      <CollapsibleContent className="mt-4">
        <ScheduleImportPanel />
      </CollapsibleContent>
    </Collapsible>
  );
}