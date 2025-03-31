/// <reference types="jest" />

import { ProjectStats } from '../../types/project.js';
import { detectLanguageFromExtension, detectFrameworksFromDependencies, detectFeaturesFromDependencies } from '../../utils/detectors.js';

describe('Language Detection', () => {
  let stats: ProjectStats;

  beforeEach(() => {
    stats = {
      fileTypes: {},
      languages: [],
      frameworks: [],
      dependencies: [],
      features: []
    };
  });

  test('detects JavaScript from .js extension', () => {
    detectLanguageFromExtension('.js', stats);
    expect(stats.languages).toContain('JavaScript');
  });

  test('detects TypeScript from .ts extension', () => {
    detectLanguageFromExtension('.ts', stats);
    expect(stats.languages).toContain('TypeScript');
  });

  test('detects Python from .py extension', () => {
    detectLanguageFromExtension('.py', stats);
    expect(stats.languages).toContain('Python');
  });

  test('does not add duplicate languages', () => {
    detectLanguageFromExtension('.js', stats);
    detectLanguageFromExtension('.js', stats);
    expect(stats.languages.filter(lang => lang === 'JavaScript')).toHaveLength(1);
  });
});

describe('Framework Detection', () => {
  let stats: ProjectStats;

  beforeEach(() => {
    stats = {
      fileTypes: {},
      languages: [],
      frameworks: [],
      dependencies: [],
      features: []
    };
  });

  test('detects React framework', () => {
    detectFrameworksFromDependencies({ 'react': '18.2.0' }, stats);
    expect(stats.frameworks).toContain('React');
  });

  test('detects Next.js framework', () => {
    detectFrameworksFromDependencies({ 'next': '14.0.0' }, stats);
    expect(stats.frameworks).toContain('Next.js');
  });

  test('detects Angular framework', () => {
    detectFrameworksFromDependencies({ '@angular/core': '17.0.0' }, stats);
    expect(stats.frameworks).toContain('Angular');
  });

  test('does not add duplicate frameworks', () => {
    detectFrameworksFromDependencies({ 'react': '18.2.0' }, stats);
    detectFrameworksFromDependencies({ 'react': '18.2.0' }, stats);
    expect(stats.frameworks.filter(fw => fw === 'React')).toHaveLength(1);
  });
});

describe('Feature Detection', () => {
  let stats: ProjectStats;

  beforeEach(() => {
    stats = {
      fileTypes: {},
      languages: [],
      frameworks: [],
      dependencies: [],
      features: []
    };
  });

  test('detects Authentication feature', () => {
    detectFeaturesFromDependencies({ 'passport': '0.6.0' }, stats);
    expect(stats.features).toContain('Authentication');
  });

  test('detects Database feature', () => {
    detectFeaturesFromDependencies({ 'mongoose': '8.0.0' }, stats);
    expect(stats.features).toContain('Database');
  });

  test('detects API feature', () => {
    detectFeaturesFromDependencies({ 'express': '4.18.0' }, stats);
    expect(stats.features).toContain('API');
  });

  test('detects Testing feature', () => {
    detectFeaturesFromDependencies({ 'jest': '29.7.0' }, stats);
    expect(stats.features).toContain('Testing');
  });

  test('does not add duplicate features', () => {
    detectFeaturesFromDependencies({ 'passport': '0.6.0' }, stats);
    detectFeaturesFromDependencies({ 'passport': '0.6.0' }, stats);
    expect(stats.features.filter(f => f === 'Authentication')).toHaveLength(1);
  });
}); 