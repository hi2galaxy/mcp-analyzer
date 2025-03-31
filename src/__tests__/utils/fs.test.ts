// utils/fs.js
import * as fs from 'fs/promises';
import path from 'path';

/**
 * Ensures a directory exists, creating it if necessary
 * @param {string} dirPath - Path to the directory
 */
export async function ensureDirectoryExists(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    // Ignore error if directory already exists
    if (error.code !== 'EEXIST') {
      throw new Error(`Failed to create directory ${dirPath}: ${error.message}`);
    }
  }
}

/**
 * Writes JSON data to a file
 * @param {string} filePath - Path to the file
 * @param {object} data - JSON data to write
 */
export async function writeJsonFile(filePath, data) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    throw new Error(`Failed to write file ${filePath}: ${error.message}`);
  }
}

/**
 * Reads and parses JSON from a file
 * @param {string} filePath - Path to the file
 * @returns {object} Parsed JSON data
 */
export async function readJsonFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to read file ${filePath}: ${error.message}`);
  }
}

/**
 * Scans a project directory and updates stats
 * @param {string} dirPath - Path to the directory
 * @param {object} stats - Project stats object to update
 * @param {number} maxDepth - Maximum recursion depth
 * @param {number} currentDepth - Current recursion depth
 */
export async function scanProjectDirectory(dirPath, stats, maxDepth = 10, currentDepth = 0) {
  try {
    // Stop if we've reached maximum depth
    if (currentDepth >= maxDepth) {
      return;
    }

    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        // Skip node_modules, .git, etc.
        if (['node_modules', '.git', 'venv', '__pycache__', '.next', 'dist', 'build'].includes(entry.name)) {
          continue;
        }
        
        // Recursively scan subdirectory
        const subdirPath = path.join(dirPath, entry.name);
        await scanProjectDirectory(subdirPath, stats, maxDepth, currentDepth + 1);
      } else {
        // Process file
        const ext = path.extname(entry.name).toLowerCase();
        if (ext) {
          // Update file type count
          stats.fileTypes[ext] = (stats.fileTypes[ext] || 0) + 1;
          
          // Detect language based on extension
          if (['.js', '.jsx'].includes(ext) && !stats.languages.includes('JavaScript')) {
            stats.languages.push('JavaScript');
          } else if (['.ts', '.tsx'].includes(ext) && !stats.languages.includes('TypeScript')) {
            stats.languages.push('TypeScript');
          } else if (ext === '.py' && !stats.languages.includes('Python')) {
            stats.languages.push('Python');
          }
        }
      }
    }
  } catch (error) {
    // Log error but don't throw to allow scanning to continue
    console.error(`Error scanning directory ${dirPath}: ${error.message}`);
  }
}

/**
 * Parses package.json and extracts dependencies
 * @param {string} filePath - Path to package.json
 * @returns {object} Combined dependencies
 */
export async function parsePackageJson(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const packageData = JSON.parse(content);
    
    // Combine dependencies and devDependencies
    return {
      ...(packageData.dependencies || {}),
      ...(packageData.devDependencies || {})
    };
  } catch (error) {
    // Return empty object on error
    console.error(`Error parsing package.json at ${filePath}: ${error.message}`);
    return {};
  }
}