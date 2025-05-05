import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PGYLevel } from '@/lib/types';
import { useSchedule } from '@/context/ScheduleContext';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

export default function PGYLevelEditor() {
  const { state, setPgyLevels } = useSchedule();
  const [bulkPgyLevel, setBulkPgyLevel] = useState<PGYLevel>(1);
  const [editedPgyLevels, setEditedPgyLevels] = useState<Record<string, PGYLevel>>(() => {
    // Initialize with current PGY levels from context
    const initial: Record<string, PGYLevel> = {};
    Object.entries(state.residents).forEach(([name, resident]) => {
      initial[name] = resident.pgyLevel;
    });
    return initial;
  });

  // Handle individual resident PGY level change
  const handlePgyLevelChange = (residentName: string, pgyLevel: PGYLevel) => {
    setEditedPgyLevels(prev => ({
      ...prev,
      [residentName]: pgyLevel
    }));
  };

  // Apply all PGY level changes
  const handleSave = () => {
    setPgyLevels(editedPgyLevels);
  };

  // Set all residents to the same PGY level
  const handleBulkUpdate = () => {
    const bulkUpdate: Record<string, PGYLevel> = {};
    Object.keys(state.residents).forEach(name => {
      bulkUpdate[name] = bulkPgyLevel;
    });
    setEditedPgyLevels(bulkUpdate);
  };

  // No residents loaded yet
  if (Object.keys(state.residents).length === 0) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-xl">Resident PGY Levels</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="mb-4">
          <h3 className="font-medium mb-2">Bulk Update</h3>
          <div className="flex gap-4 items-center">
            <RadioGroup 
              value={bulkPgyLevel.toString()} 
              onValueChange={(value) => setBulkPgyLevel(parseInt(value) as PGYLevel)}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id="pgy1" />
                <Label htmlFor="pgy1">PGY-1</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="2" id="pgy2" />
                <Label htmlFor="pgy2">PGY-2</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3" id="pgy3" />
                <Label htmlFor="pgy3">PGY-3</Label>
              </div>
            </RadioGroup>
            <Button variant="secondary" onClick={handleBulkUpdate}>
              Apply to All
            </Button>
          </div>
        </div>
        
        <h3 className="font-medium mb-2">Individual Residents</h3>
        <div className="overflow-y-auto max-h-64 border rounded-md p-2">
          <div className="grid grid-cols-1 gap-2">
            {Object.keys(state.residents).sort().map(residentName => (
              <div key={residentName} className="flex items-center justify-between border-b pb-1">
                <span className="text-sm">{residentName}</span>
                <Select
                  value={editedPgyLevels[residentName]?.toString()}
                  onValueChange={(value) => handlePgyLevelChange(residentName, parseInt(value) as PGYLevel)}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="PGY Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">PGY-1</SelectItem>
                    <SelectItem value="2">PGY-2</SelectItem>
                    <SelectItem value="3">PGY-3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button onClick={handleSave} className="w-full">Save PGY Levels</Button>
      </CardFooter>
    </Card>
  );
}