/// <reference types="jest" />

import { jest } from '@jest/globals';
import { ProjectStats } from '../../types/project.js';

// Define types for mock functions
type MockFn = jest.Mock & {
  mockResolvedValueOnce: (value: any) => MockFn;
  mockRejectedValueOnce: (error: Error) => MockFn;
  mockImplementation: (fn: Function) => MockFn;
};

// Mock implementation approach for ESM
let mockFsImplementation = {
  mkdir: jest.fn() as MockFn,
  readdir: jest.fn() as MockFn,
  readFile: jest.fn() as MockFn,
  writeFile: jest.fn() as MockFn
};

// Create a mock module for fs/promises
jest.unstable_mockModule('fs/promises', () => mockFsImplementation);

// Import modules after mocking
const { ensureDirectoryExists, writeJsonFile, readJsonFile, scanProjectDirectory } = await import('../../utils/fs.js');

// Helper function to create mock Dirent objects
function createMockDirent(name: string, isDir: boolean): { name: string; isDirectory: () => boolean; isFile: () => boolean } {
  return {
    name,
    isDirectory: () => isDir,
    isFile: () => !isDir
  };
}

describe('File System Utilities', () => {
  // Reset mocks before each test
  beforeEach(() => {
    mockFsImplementation.mkdir.mockReset();
    mockFsImplementation.readdir.mockReset();
    mockFsImplementation.readFile.mockReset();
    mockFsImplementation.writeFile.mockReset();
  });

  describe('ensureDirectoryExists', () => {
    test('creates directory if it does not exist', async () => {
      // Mock successful directory creation
      mockFsImplementation.mkdir.mockResolvedValueOnce(undefined);
      
      await ensureDirectoryExists('/test/dir');
      
      expect(mockFsImplementation.mkdir).toHaveBeenCalledWith('/test/dir', { recursive: true });
    });

    test('ignores EEXIST error', async () => {
      // Mock directory already exists error
      const error = new Error('Directory exists');
      (error as any).code = 'EEXIST';
      mockFsImplementation.mkdir.mockRejectedValueOnce(error);
      
      await expect(ensureDirectoryExists('/test/dir')).resolves.not.toThrow();
    });

    test('throws other errors', async () => {
      // Mock other error
      const error = new Error('Permission denied');
      (error as any).code = 'EACCES';
      mockFsImplementation.mkdir.mockRejectedValueOnce(error);
      
      await expect(ensureDirectoryExists('/test/dir')).rejects.toThrow('Failed to create directory');
    });
  });

  describe('writeJsonFile', () => {
    test('writes JSON data to file', async () => {
      // Mock successful file write
      mockFsImplementation.writeFile.mockResolvedValueOnce(undefined);
      
      const data = { name: 'test', value: 123 };
      await writeJsonFile('/test/file.json', data);
      
      expect(mockFsImplementation.writeFile).toHaveBeenCalledWith(
        '/test/file.json', 
        JSON.stringify(data, null, 2)
      );
    });

    test('throws error on write failure', async () => {
      // Mock write error
      mockFsImplementation.writeFile.mockRejectedValueOnce(new Error('Write failed'));
      
      await expect(writeJsonFile('/test/file.json', {})).rejects.toThrow('Failed to write file');
    });
  });

  describe('readJsonFile', () => {
    test('reads and parses JSON from file', async () => {
      const jsonData = { name: 'test', value: 123 };
      // Mock successful file read
      mockFsImplementation.readFile.mockResolvedValueOnce(JSON.stringify(jsonData));
      
      const result = await readJsonFile('/test/file.json');
      
      expect(mockFsImplementation.readFile).toHaveBeenCalledWith('/test/file.json', 'utf-8');
      expect(result).toEqual(jsonData);
    });

    test('throws error on read failure', async () => {
      // Mock read error
      mockFsImplementation.readFile.mockRejectedValueOnce(new Error('Read failed'));
      
      await expect(readJsonFile('/test/file.json')).rejects.toThrow('Failed to read file');
    });
  });

  describe('scanProjectDirectory', () => {
    test('scans directory and updates stats', async () => {
      // Create mock entries that match the structure expected by withFileTypes
      const mockEntries = [
        createMockDirent('file1.js', false),
        createMockDirent('file2.ts', false),
        createMockDirent('src', true)
      ];
      
      // Use a counter to track recursion and prevent multiple counts
      let callCount = 0;
      mockFsImplementation.readdir.mockImplementation(async () => {
        callCount++;
        if (callCount === 1) {
          return mockEntries;
        }
        return []; // Return empty for subdirectories to avoid recursive counting
      });
      
      const stats: ProjectStats = {
        fileTypes: {},
        languages: [],
        frameworks: [],
        dependencies: [],
        features: []
      };
      
      await scanProjectDirectory('/test/project', stats);
      
      expect(stats.fileTypes).toEqual({
        '.js': 1,
        '.ts': 1
      });
    });

    test('respects maximum scan depth', async () => {
      const mockEntries = [
        createMockDirent('subdir', true)
      ];
      
      // Mock directory scan with subdirectory
      let callCount = 0;
      mockFsImplementation.readdir.mockImplementation(async () => {
        callCount++;
        if (callCount === 1) {
          return mockEntries;
        }
        return []; // Return empty for subdirectories
      });
      
      const stats: ProjectStats = {
        fileTypes: {},
        languages: [],
        frameworks: [],
        dependencies: [],
        features: []
      };
      
      await scanProjectDirectory('/test/project', stats, 1);
      
      expect(mockFsImplementation.readdir).toHaveBeenCalledTimes(2);
    });

    test('handles permission errors gracefully', async () => {
      // Mock permission error
      const error = new Error('Permission denied');
      (error as any).code = 'EACCES';
      mockFsImplementation.readdir.mockRejectedValueOnce(error);
      
      const stats: ProjectStats = {
        fileTypes: {},
        languages: [],
        frameworks: [],
        dependencies: [],
        features: []
      };
      
      await expect(scanProjectDirectory('/test/project', stats)).resolves.not.toThrow();
    });
  });
});