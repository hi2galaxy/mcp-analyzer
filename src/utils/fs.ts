import * as fs from 'fs/promises';
import * as path from 'path';
import { ProjectStats } from '../types/project.js';

const MAX_SCAN_DEPTH = 10;
const MAX_FILES = 10000;

interface NodeError extends Error {
  code?: string;
}

/**
 * Ensures a directory exists, creating it if necessary.
 * @param dirPath - The path of the directory to ensure
 * @throws {Error} If directory creation fails (except for EEXIST errors)
 */
export async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    const nodeError = error as NodeError;
    if (nodeError.code !== 'EEXIST') {
      throw new Error(`Failed to create directory ${dirPath}: ${nodeError.message}`);
    }
  }
}

/**
 * Writes data to a JSON file with proper formatting.
 * @param filePath - The path where the JSON file should be written
 * @param data - The data to write to the file
 * @throws {Error} If writing to the file fails
 */
export async function writeJsonFile(filePath: string, data: unknown): Promise<void> {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    throw new Error(`Failed to write file ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Reads and parses a JSON file.
 * @param filePath - The path of the JSON file to read
 * @returns The parsed JSON data
 * @throws {Error} If reading or parsing the file fails
 */
export async function readJsonFile<T>(filePath: string): Promise<T> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (error) {
    throw new Error(`Failed to read file ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Recursively scans a project directory to collect file type statistics.
 * The scan is limited by MAX_SCAN_DEPTH and MAX_FILES to prevent performance issues.
 * @param projectPath - The root path of the project to scan
 * @param stats - The project statistics object to update
 * @param currentDepth - Current recursion depth (internal use)
 * @param fileCount - Current number of files scanned (internal use)
 */
export async function scanProjectDirectory(
  projectPath: string,
  stats: ProjectStats,
  currentDepth = 0,
  fileCount = 0
): Promise<void> {
  if (currentDepth >= MAX_SCAN_DEPTH || fileCount >= MAX_FILES) {
    return;
  }

  try {
    const entries = await fs.readdir(projectPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(projectPath, entry.name);
      
      // Skip common directories
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || 
            entry.name === '.git' || 
            entry.name === 'venv' || 
            entry.name === '__pycache__' ||
            entry.name === '.next' ||
            entry.name === 'dist' ||
            entry.name === 'build') {
          continue;
        }
        await scanProjectDirectory(fullPath, stats, currentDepth + 1, fileCount);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (ext) {
          stats.fileTypes[ext] = (stats.fileTypes[ext] || 0) + 1;
        }
        fileCount++;
      }
    }
  } catch (error) {
    const nodeError = error as NodeError;
    if (nodeError.code === 'EACCES') {
      console.warn(`Permission denied accessing ${projectPath}`);
    } else {
      throw error;
    }
  }
}

/**
 * Parses a package.json file to extract dependencies.
 * @param filePath - The path to the package.json file
 * @returns Object containing all dependencies (both regular and dev)
 */
export async function parsePackageJson(filePath: string): Promise<Record<string, string>> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const packageData = JSON.parse(content);
    return {
      ...(packageData.dependencies || {}),
      ...(packageData.devDependencies || {})
    };
  } catch (error) {
    console.warn(`Failed to parse package.json at ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
    return {};
  }
} 