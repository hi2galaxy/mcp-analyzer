/**
 * Configuration for project scanning and analysis
 */

export interface ScanConfig {
  maxDepth: number;
  maxFiles: number;
  ignoredDirectories: string[];
  ignoredExtensions: string[];
  languageExtensions: Record<string, string[]>;
  frameworkDependencies: Record<string, string[]>;
  featureDependencies: Record<string, string[]>;
}

export const DEFAULT_SCAN_CONFIG: ScanConfig = {
  maxDepth: 10,
  maxFiles: 10000,
  ignoredDirectories: [
    'node_modules',
    '.git',
    'venv',
    '__pycache__',
    '.next',
    'dist',
    'build',
    '.vscode',
    '.idea',
    '.DS_Store'
  ],
  ignoredExtensions: [
    '.log',
    '.lock',
    '.map',
    '.min.js',
    '.min.css'
  ],
  languageExtensions: {
    'JavaScript': ['.js', '.jsx', '.mjs', '.cjs'],
    'TypeScript': ['.ts', '.tsx'],
    'Python': ['.py', '.pyi', '.pyw', '.pyx'],
    'Java': ['.java', '.class'],
    'Go': ['.go'],
    'Ruby': ['.rb', '.rake', '.gemspec'],
    'PHP': ['.php'],
    'C#': ['.cs', '.csproj'],
    'Rust': ['.rs', '.toml'],
    'Swift': ['.swift'],
    'Kotlin': ['.kt', '.kts'],
    'Dart': ['.dart']
  },
  frameworkDependencies: {
    'React': ['react', 'react-dom'],
    'Vue': ['vue'],
    'Next.js': ['next'],
    'Express': ['express'],
    'Angular': ['@angular/core', 'angular'],
    'Svelte': ['svelte'],
    'Gatsby': ['gatsby'],
    'Nuxt.js': ['nuxt']
  },
  featureDependencies: {
    'Authentication': [
      'passport',
      'jsonwebtoken',
      'auth0',
      'firebase-auth',
      '@auth0/auth0-react'
    ],
    'Database': [
      'mongoose',
      'sequelize',
      'typeorm',
      'prisma',
      'pg',
      'mysql',
      'sqlite',
      'mongodb'
    ],
    'API': [
      'express',
      'fastify',
      'koa',
      'hapi',
      'restify',
      'nest',
      'graphql'
    ],
    'Testing': [
      'jest',
      'mocha',
      'jasmine',
      'cypress',
      'playwright',
      'vitest',
      'chai'
    ],
    'Containerization': [
      'docker-compose',
      'kubernetes',
      'k8s'
    ],
    'File Storage': [
      'multer',
      'aws-sdk',
      '@aws-sdk/client-s3',
      'firebase-storage',
      'cloudinary'
    ],
    'Real-time': [
      'socket.io',
      'ws',
      'websocket'
    ]
  }
}; 