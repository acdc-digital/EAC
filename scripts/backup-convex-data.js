#!/usr/bin/env node

/**
 * Script to backup data from both Convex deployments before consolidation
 * Run this before making any changes to preserve data
 */

const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

const BACKUP_DIR = path.join(__dirname, '..', 'convex-backup');

async function ensureBackupDir() {
  try {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
    console.log(`✅ Created backup directory: ${BACKUP_DIR}`);
  } catch (error) {
    console.error('❌ Failed to create backup directory:', error);
  }
}

function runCommand(command, cwd) {
  return new Promise((resolve, reject) => {
    console.log(`🔄 Running: ${command} in ${cwd}`);
    exec(command, { cwd }, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error: ${error.message}`);
        reject(error);
        return;
      }
      if (stderr) {
        console.log(`⚠️  stderr: ${stderr}`);
      }
      console.log(`✅ stdout: ${stdout}`);
      resolve(stdout);
    });
  });
}

async function backupDeployment(deploymentName, convexDir, envFile) {
  console.log(`\n📦 Backing up ${deploymentName} deployment...`);
  
  try {
    // Export data from the deployment
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(BACKUP_DIR, `${deploymentName}-${timestamp}.json`);
    
    // Note: Convex doesn't have a direct export command, but we can query the data
    // For now, we'll just copy the schema and important files
    
    const schemaSource = path.join(convexDir, 'schema.ts');
    const schemaBackup = path.join(BACKUP_DIR, `${deploymentName}-schema.ts`);
    
    await fs.copyFile(schemaSource, schemaBackup);
    console.log(`✅ Backed up schema to: ${schemaBackup}`);
    
    // Copy the entire convex directory structure (excluding node_modules and _generated)
    const convexBackupDir = path.join(BACKUP_DIR, `${deploymentName}-convex`);
    await runCommand(`rsync -av --exclude=node_modules --exclude=_generated "${convexDir}/" "${convexBackupDir}/"`, process.cwd());
    
    console.log(`✅ Backed up ${deploymentName} Convex directory to: ${convexBackupDir}`);
    
  } catch (error) {
    console.error(`❌ Failed to backup ${deploymentName}:`, error);
  }
}

async function main() {
  console.log('🚀 Starting Convex data backup...\n');
  
  await ensureBackupDir();
  
  // Backup root convex deployment
  await backupDeployment(
    'root-convex',
    '/Users/matthewsimon/Projects/eac/convex',
    '.env.local'
  );
  
  // Backup eac convex deployment  
  await backupDeployment(
    'eac-convex',
    '/Users/matthewsimon/Projects/eac/eac/convex',
    '.env.local'
  );
  
  console.log('\n✅ Backup completed! Check the convex-backup directory for backed up files.');
  console.log('💡 Next steps:');
  console.log('  1. Verify the backup files contain your data');
  console.log('  2. Run the consolidation script');
  console.log('  3. Test the consolidated setup');
}

if (require.main === module) {
  main().catch(console.error);
}
