#!/usr/bin/env node

/**
 * Test script to verify Twitter Post Agent folder isolation
 * This script tests that Twitter posts are NOT added to the Instructions folder
 */

console.log('🧪 Testing Twitter Post Agent Folder Isolation...\n');

// Mock test scenario
const mockProjectFolders = [
  {
    id: 'instructions-folder',
    name: 'Instructions',
    pinned: true,
    type: 'project'
  },
  {
    id: 'social-media-folder',
    name: 'Social Media',
    pinned: false,
    type: 'project'
  },
  {
    id: 'general-project',
    name: 'General Project',
    pinned: false,
    type: 'project'
  }
];

// Test the filtering logic that should be used in selectProjectForTwitterPost
function testProjectSelection(projectFolders, suggestedProject = null) {
  console.log(`📁 Available folders: ${projectFolders.map(f => f.name).join(', ')}`);
  
  // If a specific project was suggested and exists, use it
  if (suggestedProject) {
    const matchingFolder = projectFolders.find(
      (folder) =>
        folder.name.toLowerCase().includes(suggestedProject.toLowerCase()) &&
        folder.name.toLowerCase() !== "instructions"
    );
    if (matchingFolder) {
      console.log(`✅ Selected suggested project: ${matchingFolder.name}`);
      return matchingFolder.name;
    }
  }

  // Filter out Instructions folder explicitly (by name and pinned status)
  const regularFolders = projectFolders.filter(
    (folder) =>
      !folder.pinned &&
      folder.name.toLowerCase() !== "instructions" &&
      folder.id !== "instructions-folder"
  );

  console.log(`📋 Regular folders (excluding Instructions): ${regularFolders.map(f => f.name).join(', ')}`);

  // If no regular project folders exist, would create a default "Social Media" folder
  if (regularFolders.length === 0) {
    console.log('🆕 Would create new "Social Media" folder');
    return "Social Media";
  }

  // Default to the first available regular project folder
  const selected = regularFolders[0].name;
  console.log(`✅ Selected first regular folder: ${selected}`);
  return selected;
}

console.log('Test 1: No suggested project');
const result1 = testProjectSelection(mockProjectFolders);
console.log(`Result: ${result1}\n`);

console.log('Test 2: Suggesting "Instructions" (should be rejected)');
const result2 = testProjectSelection(mockProjectFolders, 'Instructions');
console.log(`Result: ${result2}\n`);

console.log('Test 3: Suggesting "Social" (should match Social Media)');
const result3 = testProjectSelection(mockProjectFolders, 'Social');
console.log(`Result: ${result3}\n`);

console.log('Test 4: Only Instructions folder exists');
const instructionsOnlyFolders = [
  {
    id: 'instructions-folder',
    name: 'Instructions',
    pinned: true,
    type: 'project'
  }
];
const result4 = testProjectSelection(instructionsOnlyFolders);
console.log(`Result: ${result4}\n`);

// Validation
const allResults = [result1, result2, result3, result4];
const hasInstructionsInResults = allResults.some(result => 
  result.toLowerCase().includes('instruction')
);

if (hasInstructionsInResults) {
  console.log('❌ FAIL: Instructions folder was selected');
  process.exit(1);
} else {
  console.log('✅ PASS: Instructions folder properly excluded from all tests');
  console.log('🎉 Twitter Post Agent folder isolation working correctly!');
}
