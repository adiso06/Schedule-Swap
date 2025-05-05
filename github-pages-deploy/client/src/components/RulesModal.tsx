import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function RulesModal() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <i className="ri-information-line mr-1"></i> Swap Rules
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Swap Rules & Constraints</DialogTitle>
          <DialogDescription>
            The following rules determine if a swap is valid
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 my-4 max-h-[60vh] overflow-y-auto pr-2">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">7-Day Rule</h4>
            <p className="text-gray-600 text-sm">
              Residents cannot work more than 6 consecutive days. The system checks if a swap would result in 7+ consecutive working days.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Assignment Swappability</h4>
            <p className="text-gray-600 text-sm">
              Some assignments cannot be swapped (e.g., Clinic duties, Vacation). The system checks if both assignments are eligible for swapping.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 mb-2">PGY Level Restrictions</h4>
            <ul className="text-gray-600 text-sm list-disc pl-5 space-y-1">
              <li>PGY1 can only swap with other PGY1 residents</li>
              <li>PGY2 can swap with PGY2 or PGY3 residents</li>
              <li>PGY3 can swap with PGY2 or PGY3 residents</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Special Restrictions</h4>
            <ul className="text-gray-600 text-sm list-disc pl-5 space-y-1">
              <li>MAR shifts can only be assigned to PGY3 residents</li>
              <li>Board Prep can only be swapped between PGY3 residents</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Weekend Handling</h4>
            <p className="text-gray-600 text-sm">
              Saturdays and Sundays for residents on Elective assignments (excluding CARD:CCU) do not count as working days, regardless of the assignment listed (unless it's explicitly OFF, Vacation, or Board-Prep).
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={() => setOpen(false)}>
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
