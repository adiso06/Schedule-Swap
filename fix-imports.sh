#!/bin/bash

# Script to fix import paths from @/ to relative paths
echo "Fixing import paths in client/src components..."

# Find all TypeScript and TSX files in the client/src directory
find client/src -type f -name "*.ts" -o -name "*.tsx" | while read -r file; do
  # Skip if the file doesn't exist (might have been deleted during the process)
  [ ! -f "$file" ] && continue
  
  # Replace @/components with relative path
  # Get the relative directory depth
  rel_path=$(dirname "$file" | sed 's|client/src/||' | sed 's|[^/]||g' | sed 's|/|../|g')
  
  # If we're already in the root directory, don't add ../
  if [ -z "$rel_path" ]; then
    rel_path="./"
  fi
  
  # Replace imports
  sed -i '' "s|from \"@/components|from \"${rel_path}components|g" "$file"
  sed -i '' "s|from '@/components|from '${rel_path}components|g" "$file"
  
  # Replace @/lib with relative path
  sed -i '' "s|from \"@/lib|from \"${rel_path}lib|g" "$file"
  sed -i '' "s|from '@/lib|from '${rel_path}lib|g" "$file"
  
  # Replace @/hooks with relative path
  sed -i '' "s|from \"@/hooks|from \"${rel_path}hooks|g" "$file"
  sed -i '' "s|from '@/hooks|from '${rel_path}hooks|g" "$file"
  
  # Replace @/context with relative path
  sed -i '' "s|from \"@/context|from \"${rel_path}context|g" "$file"
  sed -i '' "s|from '@/context|from '${rel_path}context|g" "$file"
  
  # Replace @/pages with relative path
  sed -i '' "s|from \"@/pages|from \"${rel_path}pages|g" "$file"
  sed -i '' "s|from '@/pages|from '${rel_path}pages|g" "$file"
  
  echo "Fixed: $file"
done

echo "All import paths have been fixed!" 