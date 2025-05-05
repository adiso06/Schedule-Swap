import { ScheduleData, ScheduleMetadata, Assignment } from "@/lib/types";

export interface SavedSchedule {
  id: string;
  name: string;
  scheduleData: ScheduleData;
  metadata: ScheduleMetadata;
  pgyLevels: { [name: string]: number };
  rawInput: string;
  createdAt: string;
  updatedAt: string;
}

// Local storage key
const STORAGE_KEY = 'residency-schedules';

/**
 * Save a schedule to local storage
 */
export const saveSchedule = (
  name: string, 
  scheduleData: ScheduleData, 
  metadata: ScheduleMetadata, 
  pgyLevels: { [name: string]: number },
  rawInput: string
): SavedSchedule => {
  const schedules = getAllSchedules();
  
  // Create new schedule with unique ID
  const now = new Date().toISOString();
  const newSchedule: SavedSchedule = {
    id: `schedule_${Date.now()}`,
    name,
    scheduleData,
    metadata,
    pgyLevels,
    rawInput,
    createdAt: now,
    updatedAt: now
  };
  
  // Add to existing schedules
  schedules.push(newSchedule);
  
  // Save to local storage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
  
  return newSchedule;
};

/**
 * Get all saved schedules from local storage
 */
export const getAllSchedules = (): SavedSchedule[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('Error parsing saved schedules:', error);
    return [];
  }
};

/**
 * Get a specific schedule by ID
 */
export const getScheduleById = (id: string): SavedSchedule | null => {
  const schedules = getAllSchedules();
  return schedules.find(schedule => schedule.id === id) || null;
};

/**
 * Delete a schedule by ID
 */
export const deleteSchedule = (id: string): boolean => {
  const schedules = getAllSchedules();
  const newSchedules = schedules.filter(schedule => schedule.id !== id);
  
  if (newSchedules.length === schedules.length) {
    return false; // No schedule was deleted
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newSchedules));
  return true;
};

/**
 * Update an existing schedule
 */
export const updateSchedule = (
  id: string,
  updates: Partial<Omit<SavedSchedule, 'id' | 'createdAt' | 'updatedAt'>>
): SavedSchedule | null => {
  const schedules = getAllSchedules();
  const index = schedules.findIndex(schedule => schedule.id === id);
  
  if (index === -1) {
    return null;
  }
  
  const updatedSchedule = {
    ...schedules[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  schedules[index] = updatedSchedule;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
  
  return updatedSchedule;
};

/**
 * Export all schedules as a JSON file for backup
 */
export const exportSchedules = (): void => {
  const schedules = getAllSchedules();
  const dataStr = JSON.stringify(schedules, null, 2);
  const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', `residency-schedules-${new Date().toISOString().slice(0, 10)}.json`);
  linkElement.click();
};

/**
 * Import schedules from a JSON file
 */
export const importSchedules = (jsonData: string): boolean => {
  try {
    const schedules = JSON.parse(jsonData);
    
    if (!Array.isArray(schedules)) {
      throw new Error('Invalid schedule data format. Expected an array.');
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
    return true;
  } catch (error) {
    console.error('Error importing schedules:', error);
    return false;
  }
};