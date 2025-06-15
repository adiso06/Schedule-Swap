# 🏗️ Assignment Mappings Refactoring Guide

## 📋 **Problem Statement**

Currently, the codebase has **two separate assignment mapping systems** that need to be kept in sync:

1. **`client/src/lib/assignmentLabels.ts`** - For UI display labels
2. **`client/src/lib/data.ts`** - For business logic classification

This creates maintenance overhead, bugs, and console spam when mappings are missing.

## 🎯 **Goal**

Create a **single source of truth** for all assignment configuration while maintaining backward compatibility.

---

## 📚 **Step-by-Step Instructions**

### **Phase 1: Create Unified Configuration System**

#### **Step 1.1: Create the unified config file**

Create `client/src/lib/assignmentConfig.ts`:

```typescript
// Types for the unified system
export interface AssignmentConfig {
  // Display properties (from assignmentLabels.ts)
  label: string;
  isPrefix?: boolean;
  extractSuffix?: "Team" | "Clinic";
  
  // Business logic properties (from data.ts)
  type: "Required" | "Elective" | "Clinic" | "Status" | "Admin" | "TBD";
  swappable: "Yes" | "No" | "Conditional";
  notes: string;
  pgyRules?: string;
}

// Single source of truth for all assignment mappings
export const UNIFIED_ASSIGNMENT_CONFIG: { [pattern: string]: AssignmentConfig } = {
  // Example entries - merge both systems here
  "OFF": {
    label: "OFF",
    type: "Status",
    swappable: "Yes",
    notes: "Regular day off"
  },
  
  "NSLIJ:DM:NEPH:El-Renal-NS": {
    label: "NS Nephro Elective",
    type: "Elective",
    swappable: "Yes",
    notes: "NS Nephro Elective"
  },
  
  // TODO: Add all other mappings by merging assignmentLabels.ts and data.ts
  // This will be done in Step 1.2
};
```

#### **Step 1.2: Merge all existing mappings**

1. Open `client/src/lib/assignmentLabels.ts`
2. Open `client/src/lib/data.ts` 
3. For each mapping in both files, create a unified entry in `UNIFIED_ASSIGNMENT_CONFIG`
4. Cross-reference to ensure no mappings are missed

**Important**: Don't delete the old files yet - keep them for reference!

#### **Step 1.3: Create adapter functions**

Add these functions to `assignmentConfig.ts`:

```typescript
// Adapter for display logic (replaces getUserFriendlyLabel)
export function getDisplayLabel(assignmentCode: string | null | undefined): string {
  // Implementation here - copy logic from getUserFriendlyLabel
  // but use UNIFIED_ASSIGNMENT_CONFIG instead of assignmentMappings
}

// Adapter for business logic (replaces getAssignmentDetails)
export function getAssignmentClassification(assignmentCode: string | null | undefined): AssignmentDetails {
  // Implementation here - copy logic from getAssignmentDetails  
  // but use UNIFIED_ASSIGNMENT_CONFIG instead of assignmentClassification
}
```

### **Phase 2: Gradual Migration** 

#### **Step 2.1: Test the unified system**

1. Import the new functions in a test file
2. Verify they return the same results as the old functions
3. Test with various assignment codes from your schedule data

#### **Step 2.2: Update imports one component at a time**

**Start with low-risk files first:**

1. **`SwapResults.tsx`**: 
   - Change `import { getUserFriendlyLabel } from "@/lib/assignmentLabels"` 
   - To `import { getDisplayLabel as getUserFriendlyLabel } from "@/lib/assignmentConfig"`

2. **`PaybackSwapFinder.tsx`**: Same import change

3. **`SwapFinderForm.tsx`**: Same import change

**Test after each file change** to ensure nothing breaks.

#### **Step 2.3: Update core logic files**

**Higher risk - test thoroughly:**

1. **`utils.ts`**: Update `getAssignmentDetails` import
2. **`scheduleParser.ts`**: Update `assignmentClassification` import  
3. **`ScheduleVisualization.tsx`**: Update both imports

### **Phase 3: Cleanup**

#### **Step 3.1: Remove old system files**

**Only after all imports are migrated:**

1. Delete `client/src/lib/assignmentLabels.ts`
2. Remove assignment classification from `client/src/lib/data.ts`
3. Update any remaining imports

#### **Step 3.2: Final testing**

1. Run the app and check all assignment displays work correctly
2. Verify console has no "missing mapping" errors
3. Test swap functionality still works
4. Test schedule parsing still works

---

## 🧪 **Testing Strategy**

### **Before each phase:**
- [ ] Take note of current console errors
- [ ] Screenshot current UI assignment displays  
- [ ] Test core swap functionality

### **After each step:**
- [ ] Run `npm run dev` 
- [ ] Check for TypeScript errors
- [ ] Check browser console for errors
- [ ] Verify assignment labels display correctly

---

## 🚨 **Rollback Plan**

If anything breaks during migration:

1. **Revert the import change** in the affected file
2. **Check git diff** to see what changed
3. **Fix the issue** in the unified config
4. **Re-attempt the migration**

---

## 📊 **Progress Tracking**

### Phase 1: Unified System
- [ ] Step 1.1: Create `assignmentConfig.ts`
- [ ] Step 1.2: Merge all mappings  
- [ ] Step 1.3: Create adapter functions
- [ ] Test unified system works

### Phase 2: Migration  
- [ ] Step 2.1: Test unified system
- [ ] Step 2.2: Migrate component imports
- [ ] Step 2.3: Migrate core logic imports
- [ ] Verify all functionality works

### Phase 3: Cleanup
- [ ] Step 3.1: Remove old files
- [ ] Step 3.2: Final testing
- [ ] Document the new system

---

## 💡 **Tips for Success**

1. **Go slowly** - migrate one file at a time
2. **Test frequently** - after every import change
3. **Keep backups** - use git commits between steps  
4. **Ask for help** if TypeScript errors are confusing
5. **Use console.log** to debug if mappings seem wrong

---

## 🔍 **Common Issues & Solutions**

**Problem**: TypeScript errors about missing properties
**Solution**: Check that your unified config has all required properties

**Problem**: Assignment labels showing as raw codes  
**Solution**: Check that the mapping exists in UNIFIED_ASSIGNMENT_CONFIG

**Problem**: Console errors about missing classifications
**Solution**: Verify business logic properties are set correctly

**Problem**: App won't compile
**Solution**: Revert the last change and check for typos

---

## ✅ **Success Criteria**

When complete, you should have:
- [ ] Single file (`assignmentConfig.ts`) containing all mappings
- [ ] No console "missing mapping" errors
- [ ] All assignment labels display correctly  
- [ ] Swap functionality works as before
- [ ] Codebase is easier to maintain (single source of truth)

---

*Last updated: [Current Date]*  
*Author: [Your Name]* 