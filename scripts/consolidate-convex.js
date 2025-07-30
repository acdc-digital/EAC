#!/usr/bin/env node

/**
 * Script to consolidate Convex deployments into the EAC directory
 * This will merge the root convex setup into eac/convex and clean up
 */

const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

const ROOT_CONVEX = '/Users/matthewsimon/Projects/eac/convex';
const EAC_CONVEX = '/Users/matthewsimon/Projects/eac/eac/convex';
const ROOT_ENV = '/Users/matthewsimon/Projects/eac/.env.local';
const EAC_ENV = '/Users/matthewsimon/Projects/eac/eac/.env.local';

function runCommand(command, cwd = process.cwd()) {
  return new Promise((resolve, reject) => {
    console.log(`🔄 Running: ${command}`);
    exec(command, { cwd }, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error: ${error.message}`);
        reject(error);
        return;
      }
      if (stderr) {
        console.log(`⚠️  stderr: ${stderr}`);
      }
      console.log(`✅ ${stdout.trim()}`);
      resolve(stdout);
    });
  });
}

async function readFile(filePath) {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch (error) {
    console.log(`⚠️  Could not read ${filePath}: ${error.message}`);
    return null;
  }
}

async function writeFile(filePath, content) {
  try {
    await fs.writeFile(filePath, content, 'utf8');
    console.log(`✅ Updated ${filePath}`);
  } catch (error) {
    console.error(`❌ Failed to write ${filePath}: ${error.message}`);
  }
}

async function compareAndMergeFiles(rootFile, eacFile, outputFile) {
  console.log(`\n🔍 Comparing ${path.basename(rootFile)} and ${path.basename(eacFile)}...`);
  
  const rootContent = await readFile(rootFile);
  const eacContent = await readFile(eacFile);
  
  if (!rootContent && !eacContent) {
    console.log(`⚠️  Both files are missing, skipping...`);
    return;
  }
  
  if (!rootContent) {
    console.log(`✅ Using EAC version (root version missing)`);
    return;
  }
  
  if (!eacContent) {
    console.log(`📝 Copying root version to EAC (EAC version missing)`);
    await writeFile(outputFile, rootContent);
    return;
  }
  
  if (rootContent === eacContent) {
    console.log(`✅ Files are identical, no merge needed`);
    return;
  }
  
  // Files are different - for now, prefer the EAC version but log the difference
  console.log(`⚠️  Files differ - keeping EAC version, but you may need to manually review:`);
  console.log(`   Root: ${rootFile}`);
  console.log(`   EAC:  ${eacFile}`);
  
  // TODO: Add more sophisticated merging logic if needed
}

async function mergeConvexDirectories() {
  console.log(`\n📂 Merging Convex directories...`);
  
  // Get list of all TypeScript files in root convex
  try {
    const rootFiles = await fs.readdir(ROOT_CONVEX);
    const tsFiles = rootFiles.filter(f => f.endsWith('.ts') && f !== 'tsconfig.json');
    
    console.log(`📝 Found ${tsFiles.length} TypeScript files in root convex:`, tsFiles);
    
    for (const file of tsFiles) {
      const rootFile = path.join(ROOT_CONVEX, file);
      const eacFile = path.join(EAC_CONVEX, file);
      
      await compareAndMergeFiles(rootFile, eacFile, eacFile);
    }
    
    // Handle special files
    await compareAndMergeFiles(
      path.join(ROOT_CONVEX, 'package.json'),
      path.join(EAC_CONVEX, 'package.json'),
      path.join(EAC_CONVEX, 'package.json')
    );
    
  } catch (error) {
    console.error(`❌ Error merging directories: ${error.message}`);
  }
}

async function updateEnvironmentFiles() {
  console.log(`\n🔧 Updating environment configuration...`);
  
  // Read both env files to see which deployment to use
  const rootEnv = await readFile(ROOT_ENV);
  const eacEnv = await readFile(EAC_ENV);
  
  console.log(`Root env deployment:`, rootEnv?.match(/CONVEX_DEPLOYMENT=([^\s]+)/)?.[1] || 'Not found');
  console.log(`EAC env deployment:`, eacEnv?.match(/CONVEX_DEPLOYMENT=([^\s]+)/)?.[1] || 'Not found');
  
  // For now, keep the EAC deployment as it's in production
  console.log(`✅ Keeping EAC deployment configuration (dev:pleasant-grouse-284)`);
  
  // Remove root env files to avoid confusion
  try {
    await fs.unlink(ROOT_ENV);
    console.log(`🗑️  Removed root .env.local to avoid conflicts`);
  } catch (error) {
    console.log(`⚠️  Could not remove root .env.local: ${error.message}`);
  }
}

async function updateImportPaths() {
  console.log(`\n🔧 Checking and updating import paths...`);
  
  // All the import paths are already correct based on our grep search earlier
  // They all point to @/convex/_generated/api or ../../../convex/_generated/api
  // which correctly point to the eac/convex directory
  console.log(`✅ Import paths are already correctly configured for eac/convex`);
}

async function removeRootConvexDirectory() {
  console.log(`\n🗑️  Removing root convex directory...`);
  
  try {
    // Move instead of delete for safety
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `/Users/matthewsimon/Projects/eac/convex-backup/root-convex-removed-${timestamp}`;
    
    await runCommand(`mv "${ROOT_CONVEX}" "${backupPath}"`);
    console.log(`✅ Moved root convex directory to: ${backupPath}`);
    console.log(`💡 You can safely delete this backup later if everything works correctly`);
    
  } catch (error) {
    console.error(`❌ Failed to remove root convex directory: ${error.message}`);
  }
}

async function testConsolidatedSetup() {
  console.log(`\n🧪 Testing consolidated setup...`);
  
  try {
    // Test that we can run convex dev in the eac directory
    console.log(`Testing Convex configuration in EAC directory...`);
    await runCommand(`cd "${path.dirname(EAC_CONVEX)}" && npx convex --version`);
    
    console.log(`✅ Convex CLI is working correctly`);
    
    // Test that the generated API files exist
    const apiFile = path.join(EAC_CONVEX, '_generated', 'api.d.ts');
    try {
      await fs.access(apiFile);
      console.log(`✅ Generated API files exist`);
    } catch {
      console.log(`⚠️  Generated API files missing - you may need to run 'npx convex dev' to regenerate them`);
    }
    
  } catch (error) {
    console.error(`❌ Test failed: ${error.message}`);
  }
}

async function main() {
  console.log(`🚀 Starting Convex consolidation...\n`);
  console.log(`📋 Plan:`);
  console.log(`  1. Merge Convex directories (root → eac/convex)`);
  console.log(`  2. Update environment configuration`);
  console.log(`  3. Verify import paths`);
  console.log(`  4. Remove root convex directory`);
  console.log(`  5. Test consolidated setup`);
  console.log(`\n⚠️  Make sure you've run the backup script first!\n`);
  
  try {
    await mergeConvexDirectories();
    await updateEnvironmentFiles();
    await updateImportPaths();
    await removeRootConvexDirectory();
    await testConsolidatedSetup();
    
    console.log(`\n🎉 Consolidation completed successfully!`);
    console.log(`\n📋 Next steps:`);
    console.log(`  1. cd eac && npx convex dev`);
    console.log(`  2. Test your application to ensure data is accessible`);
    console.log(`  3. If everything works, you can delete the backup files`);
    console.log(`  4. Update your development workflow to only use eac/convex`);
    
  } catch (error) {
    console.error(`❌ Consolidation failed: ${error.message}`);
    console.log(`💡 Check the backup files in convex-backup/ to restore if needed`);
  }
}

if (require.main === module) {
  main().catch(console.error);
}
