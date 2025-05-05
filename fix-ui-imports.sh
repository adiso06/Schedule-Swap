#!/bin/bash

# Script to fix import paths in shadcn UI components
echo "Fixing import paths in UI components..."

# Go through all UI components
for file in client/src/components/ui/*.tsx; do
  # Replace imports from "../lib/utils" with "../../lib/utils"
  sed -i '' "s|from \"../lib/utils\"|from \"../../lib/utils\"|g" "$file"
  
  # Replace imports referencing other UI components
  sed -i '' "s|from \"../components/ui|from \".|g" "$file"
  
  # Fix hooks imports
  sed -i '' "s|from \"../hooks|from \"../../hooks|g" "$file"
  
  echo "Fixed: $file"
done

echo "All UI component imports have been fixed!" 