import { ProjectStats } from '../types/project.js';

/**
 * Detects programming languages based on file extensions and updates the project stats.
 * @param ext - The file extension to analyze (e.g., '.js', '.ts', '.py')
 * @param stats - The project statistics object to update
 */
export function detectLanguageFromExtension(ext: string, stats: ProjectStats): void {
  const languageMap: Record<string, string> = {
    '.js': 'JavaScript',
    '.jsx': 'JavaScript',
    '.ts': 'TypeScript',
    '.tsx': 'TypeScript',
    '.py': 'Python',
    '.java': 'Java',
    '.go': 'Go',
    '.rb': 'Ruby',
    '.rake': 'Ruby',
    '.php': 'PHP',
    '.cs': 'C#',
    '.rs': 'Rust',
    '.swift': 'Swift',
    '.kt': 'Kotlin',
    '.kts': 'Kotlin',
    '.dart': 'Dart'
  };

  const language = languageMap[ext];
  if (language && !stats.languages.includes(language)) {
    stats.languages.push(language);
  }
}

/**
 * Detects frameworks based on project dependencies and updates the project stats.
 * @param deps - Object containing project dependencies and their versions
 * @param stats - The project statistics object to update
 */
export function detectFrameworksFromDependencies(deps: Record<string, string>, stats: ProjectStats): void {
  const frameworkMap: Record<string, string> = {
    'react': 'React',
    'vue': 'Vue',
    'next': 'Next.js',
    'express': 'Express',
    'angular': 'Angular',
    '@angular/core': 'Angular',
    'svelte': 'Svelte',
    'gatsby': 'Gatsby',
    'nuxt': 'Nuxt.js'
  };

  for (const [dep] of Object.entries(deps)) {
    const framework = frameworkMap[dep];
    if (framework && !stats.frameworks.includes(framework)) {
      stats.frameworks.push(framework);
    }
  }
}

/**
 * Detects project features based on dependencies and updates the project stats.
 * Features are categorized into groups like Authentication, Database, API, etc.
 * @param deps - Object containing project dependencies and their versions
 * @param stats - The project statistics object to update
 */
export function detectFeaturesFromDependencies(deps: Record<string, string>, stats: ProjectStats): void {
  const featureDependencies: Record<string, string> = {
    'passport': 'Authentication',
    'jsonwebtoken': 'Authentication',
    'auth0': 'Authentication',
    'firebase-auth': 'Authentication',
    'mongoose': 'Database',
    'sequelize': 'Database',
    'typeorm': 'Database',
    'prisma': 'Database',
    'pg': 'Database',
    'mysql': 'Database',
    'sqlite': 'Database',
    'mongodb': 'Database',
    'express': 'API',
    'fastify': 'API',
    'koa': 'API',
    'hapi': 'API',
    'restify': 'API',
    'nest': 'API',
    'graphql': 'API',
    'jest': 'Testing',
    'mocha': 'Testing',
    'jasmine': 'Testing',
    'cypress': 'Testing',
    'playwright': 'Testing',
    'vitest': 'Testing',
    'chai': 'Testing',
    'docker-compose': 'Containerization',
    'kubernetes': 'Containerization',
    'k8s': 'Containerization',
    'multer': 'File Storage',
    'aws-sdk': 'File Storage',
    '@aws-sdk/client-s3': 'File Storage',
    'firebase-storage': 'File Storage',
    'cloudinary': 'File Storage',
    'socket.io': 'Real-time',
    'ws': 'Real-time',
    'websocket': 'Real-time'
  };

  for (const [dep, feature] of Object.entries(featureDependencies)) {
    if (dep in deps && !stats.features.includes(feature)) {
      stats.features.push(feature);
    }
  }
} 