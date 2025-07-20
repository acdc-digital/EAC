// Terminal API Route
// /Users/matthewsimon/Projects/EAC/eac/app/api/terminal/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { existsSync } from 'fs';

const execAsync = promisify(exec);

// Safe commands that are allowed to be executed
const SAFE_COMMANDS = [
  'ls', 'dir', 'pwd', 'whoami', 'date', 'echo', 'cat', 'head', 'tail',
  'grep', 'find', 'wc', 'sort', 'uniq', 'which', 'uname', 'uptime',
  'git status', 'git log', 'git branch', 'git diff', 'npm list', 'node --version',
  'npm --version', 'pnpm --version', 'yarn --version'
];

// Check if a command is safe to execute
function isSafeCommand(command: string): boolean {
  const cmd = command.trim().toLowerCase();
  
  // Check exact matches
  if (SAFE_COMMANDS.includes(cmd)) {
    return true;
  }
  
  // Check command prefixes for parameterized commands
  const safePatterns = [
    /^ls\s+/, /^dir\s+/, /^echo\s+/, /^cat\s+/, /^head\s+/, /^tail\s+/,
    /^grep\s+/, /^find\s+/, /^wc\s+/, /^sort\s+/, /^git\s+(status|log|branch|diff)/,
    /^cd\s+/, /^which\s+/
  ];
  
  return safePatterns.some(pattern => pattern.test(cmd));
}

export async function POST(request: NextRequest) {
  try {
    const { command, cwd } = await request.json();
    
    if (!command || typeof command !== 'string') {
      return NextResponse.json(
        { error: 'Command is required and must be a string' },
        { status: 400 }
      );
    }
    
    // Security check: only allow safe commands
    if (!isSafeCommand(command)) {
      return NextResponse.json({
        output: `Security: Command "${command}" is not allowed. Only safe read-only commands are permitted.`,
        cwd: cwd || process.cwd()
      });
    }
    
    // Handle special commands
    if (command.trim() === 'clear') {
      return NextResponse.json({
        output: 'CLEAR_TERMINAL',
        cwd: cwd || process.cwd()
      });
    }
    
    // Handle cd command specially
    if (command.trim().startsWith('cd ')) {
      const targetDir = command.trim().substring(3).trim();
      const currentDir = cwd || process.cwd();
      
      try {
        let newDir: string;
        if (targetDir === '~') {
          newDir = process.env.HOME || process.cwd();
        } else if (targetDir === '..') {
          newDir = path.dirname(currentDir);
        } else if (path.isAbsolute(targetDir)) {
          newDir = targetDir;
        } else {
          newDir = path.join(currentDir, targetDir);
        }
        
                 // Verify the directory exists
         if (!existsSync(newDir)) {
           return NextResponse.json({
             output: `cd: ${targetDir}: No such file or directory`,
             cwd: currentDir
           });
         }
         
         return NextResponse.json({
           output: '',
           cwd: newDir
         });
       } catch {
         return NextResponse.json({
           output: `cd: ${targetDir}: No such file or directory`,
           cwd: currentDir
         });
       }
    }
    
    // Execute the command
    const options = {
      cwd: cwd || process.cwd(),
      timeout: 5000, // 5 second timeout
      maxBuffer: 1024 * 1024 // 1MB buffer
    };
    
    const { stdout, stderr } = await execAsync(command, options);
    
    return NextResponse.json({
      output: stdout || stderr || '',
      cwd: cwd || process.cwd()
    });
    
  } catch (error) {
    console.error('Terminal command error:', error);
    
    const errorObj = error as { code?: string; killed?: boolean; message?: string };
    
    if (errorObj.code === 'ENOENT') {
      return NextResponse.json({
        output: `Command not found: ${errorObj.message}`,
        cwd: process.cwd()
      });
    }
    
    if (errorObj.killed) {
      return NextResponse.json({
        output: 'Command timed out',
        cwd: process.cwd()
      });
    }
    
    return NextResponse.json({
      output: `Error: ${errorObj.message || 'Unknown error'}`,
      cwd: process.cwd()
    });
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
} 