import React, { useState } from "react";
import { 
  Collapsible, 
  CollapsibleTrigger, 
  CollapsibleContent 
} from "@/components/ui/collapsible";
import ScheduleVisualization from "./ScheduleVisualization";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function CollapsibleScheduleVisualization() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full border rounded-lg bg-white overflow-hidden"
    >
      <div className="flex items-center justify-between space-x-4 px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-medium text-gray-800">Schedule Visualization</h2>
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
      
      <CollapsibleContent>
        <ScheduleVisualization />
      </CollapsibleContent>
    </Collapsible>
  );
}