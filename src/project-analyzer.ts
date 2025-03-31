// src/project-analyzer.ts
import * as fs from 'fs/promises';
import * as path from 'path';
import { discoverMCPServers, searchCursorRules } from './discovery-service.js';

export interface ProjectStats {
  fileTypes: Record<string, number>;
  languages: string[];
  frameworks: string[];
  dependencies: string[];
  features: string[];
}

interface MCPConfig {
  mcpServers: Record<string, {
    command: string;
    args: string[];
    env?: Record<string, string>;
  }>;
}

interface Rule {
  name: string;
  description: string;
  pattern?: string;
  scope?: string;
  enabled: boolean;
}

export async function analyzeProject(projectPath: string): Promise<string> {
  try {
    // Check if directory exists
    await fs.access(projectPath);
    
    // Analyze the project
    const stats = await scanProject(projectPath);
    
    // Generate configurations - now using dynamic discovery
    const mcpConfig = await generateMCPConfig(stats);
    const rules = await generateRules(stats);
    
    // Create .cursor directory if it doesn't exist
    const cursorDir = path.join(projectPath, '.cursor');
    try {
      await fs.mkdir(cursorDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, which is fine
    }
    
    // Write MCP configuration
    await fs.writeFile(
      path.join(cursorDir, 'mcp.json'),
      JSON.stringify(mcpConfig, null, 2)
    );
    
    // Create rules directory
    const rulesDir = path.join(cursorDir, 'rules');
    try {
      await fs.mkdir(rulesDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, which is fine
    }
    
    // Write rules configuration
    await fs.writeFile(
      path.join(rulesDir, 'project_rules.json'),
      JSON.stringify(rules, null, 2)
    );
    
    // Generate response
    const languagesStr = stats.languages.join(', ');
    const frameworksStr = stats.frameworks.length > 0 
      ? stats.frameworks.join(', ') 
      : 'None detected';
    
    const fileTypesStr = Object.entries(stats.fileTypes)
      .map(([ext, count]) => `${ext} (${count})`)
      .join(', ');
    
    const mcpToolsStr = Object.keys(mcpConfig.mcpServers)
      .map(tool => `- ${tool}`)
      .join('\n');
    
    return `
# Project Analysis Complete ✅

## Project Stats
- **Languages**: ${languagesStr}
- **Frameworks**: ${frameworksStr}
- **Features**: ${stats.features.join(', ')}
- **File types**: ${fileTypesStr}

## MCP Tools Configured
${mcpToolsStr}

## Configuration Files Created
- \`.cursor/mcp.json\` - MCP server configuration
- \`.cursor/rules/project_rules.json\` - Coding rules configuration

## Next Steps
1. Review the generated configurations
2. Add any API keys needed (look for "YOUR_API_KEY_HERE")
3. Restart Cursor to apply changes
`;
  } catch (error) {
    return `Error analyzing project: ${error instanceof Error ? error.message : String(error)}`;
  }
}

export async function scanProject(projectPath: string): Promise<ProjectStats> {
  const stats: ProjectStats = {
    fileTypes: {},
    languages: [],
    frameworks: [],
    dependencies: [],
    features: []
  };
  
  // Helper function to scan directory recursively
  async function scanDir(dirPath: string) {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        // Skip node_modules, .git, etc.
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
          await scanDir(fullPath);
        } else if (entry.isFile()) {
          // Track file extension
          const ext = path.extname(entry.name).toLowerCase();
          if (ext) {
            stats.fileTypes[ext] = (stats.fileTypes[ext] || 0) + 1;
            
            // Detect language based on extension
            if (['.js', '.jsx'].includes(ext) && !stats.languages.includes('JavaScript')) {
              stats.languages.push('JavaScript');
            } else if (['.ts', '.tsx'].includes(ext) && !stats.languages.includes('TypeScript')) {
              stats.languages.push('TypeScript');
            } else if (ext === '.py' && !stats.languages.includes('Python')) {
              stats.languages.push('Python');
            } else if (ext === '.java' && !stats.languages.includes('Java')) {
              stats.languages.push('Java');
            } else if (ext === '.go' && !stats.languages.includes('Go')) {
              stats.languages.push('Go');
            } else if (['.rb', '.rake'].includes(ext) && !stats.languages.includes('Ruby')) {
              stats.languages.push('Ruby');
            } else if (['.php'].includes(ext) && !stats.languages.includes('PHP')) {
              stats.languages.push('PHP');
            } else if (['.cs'].includes(ext) && !stats.languages.includes('C#')) {
              stats.languages.push('C#');
            } else if (['.rs'].includes(ext) && !stats.languages.includes('Rust')) {
              stats.languages.push('Rust');
            } else if (['.swift'].includes(ext) && !stats.languages.includes('Swift')) {
              stats.languages.push('Swift');
            } else if (['.kt', '.kts'].includes(ext) && !stats.languages.includes('Kotlin')) {
              stats.languages.push('Kotlin');
            } else if (['.dart'].includes(ext) && !stats.languages.includes('Dart')) {
              stats.languages.push('Dart');
            }
          }
          
          // Check for special files
          if (entry.name === 'package.json') {
            try {
              const content = await fs.readFile(fullPath, 'utf-8');
              const packageData = JSON.parse(content);
              const deps = {
                ...(packageData.dependencies || {}),
                ...(packageData.devDependencies || {})
              };
              
              // Add dependencies
              for (const dep of Object.keys(deps)) {
                if (!stats.dependencies.includes(dep)) {
                  stats.dependencies.push(dep);
                }
              }
              
              // Detect frameworks
              if (deps['react'] && !stats.frameworks.includes('React')) {
                stats.frameworks.push('React');
              }
              if (deps['vue'] && !stats.frameworks.includes('Vue')) {
                stats.frameworks.push('Vue');
              }
              if (deps['next'] && !stats.frameworks.includes('Next.js')) {
                stats.frameworks.push('Next.js');
              }
              if (deps['express'] && !stats.frameworks.includes('Express')) {
                stats.frameworks.push('Express');
              }
              if ((deps['angular'] || deps['@angular/core']) && !stats.frameworks.includes('Angular')) {
                stats.frameworks.push('Angular');
              }
              if (deps['svelte'] && !stats.frameworks.includes('Svelte')) {
                stats.frameworks.push('Svelte');
              }
              if (deps['gatsby'] && !stats.frameworks.includes('Gatsby')) {
                stats.frameworks.push('Gatsby');
              }
              if (deps['nuxt'] && !stats.frameworks.includes('Nuxt.js')) {
                stats.frameworks.push('Nuxt.js');
              }
              
              // Detect features from dependencies
              if (deps['passport'] || deps['jsonwebtoken'] || deps['auth0'] || deps['firebase-auth']) {
                stats.features.push('Authentication');
              }
              if (deps['mongoose'] || deps['sequelize'] || deps['typeorm'] || deps['prisma'] || 
                  deps['pg'] || deps['mysql'] || deps['sqlite'] || deps['mongodb']) {
                stats.features.push('Database');
              }
              if (deps['express'] || deps['fastify'] || deps['koa'] || deps['hapi'] || 
                  deps['restify'] || deps['nest'] || deps['graphql']) {
                stats.features.push('API');
              }
              if (deps['jest'] || deps['mocha'] || deps['jasmine'] || deps['cypress'] || 
                  deps['playwright'] || deps['vitest'] || deps['chai']) {
                stats.features.push('Testing');
              }
              if (deps['docker-compose'] || deps['kubernetes'] || deps['k8s']) {
                stats.features.push('Containerization');
              }
              if (deps['multer'] || deps['aws-sdk'] || deps['@aws-sdk/client-s3'] || 
                  deps['firebase-storage'] || deps['cloudinary']) {
                stats.features.push('File Storage');
              }
              if (deps['socket.io'] || deps['ws'] || deps['websocket']) {
                stats.features.push('Real-time');
              }
            } catch (error) {
              // Ignore parsing errors
            }
          } else if (entry.name === 'requirements.txt') {
            try {
              const content = await fs.readFile(fullPath, 'utf-8');
              const reqs = content.split('\n')
                .map(line => line.trim())
                .filter(Boolean)
                .map(line => {
                  // Extract package name without version
                  return line.split('==')[0].split('>=')[0].trim();
                });
              
              // Add dependencies
              for (const req of reqs) {
                if (req && !stats.dependencies.includes(req)) {
                  stats.dependencies.push(req);
                }
              }
              
              // Detect frameworks
              if (reqs.some(r => r.toLowerCase() === 'django') && !stats.frameworks.includes('Django')) {
                stats.frameworks.push('Django');
              }
              if (reqs.some(r => r.toLowerCase() === 'flask') && !stats.frameworks.includes('Flask')) {
                stats.frameworks.push('Flask');
              }
              if (reqs.some(r => r.toLowerCase() === 'fastapi') && !stats.frameworks.includes('FastAPI')) {
                stats.frameworks.push('FastAPI');
              }
              
              // Detect features
              if (reqs.some(r => ['authlib', 'flask-login', 'django-auth', 'python-jose', 'djangorestframework-simplejwt'].includes(r.toLowerCase()))) {
                stats.features.push('Authentication');
              }
              if (reqs.some(r => ['sqlalchemy', 'django-orm', 'pymongo', 'psycopg2', 'mysql-connector-python'].includes(r.toLowerCase()))) {
                stats.features.push('Database');
              }
              if (reqs.some(r => ['django-rest-framework', 'flask-restful', 'fastapi', 'graphene'].includes(r.toLowerCase()))) {
                stats.features.push('API');
              }
              if (reqs.some(r => ['pytest', 'unittest', 'nose', 'behave', 'robot'].includes(r.toLowerCase()))) {
                stats.features.push('Testing');
              }
            } catch (error) {
              // Ignore parsing errors
            }
          } else if (entry.name === 'build.gradle' || entry.name === 'pom.xml') {
            // Java project
            if (!stats.languages.includes('Java')) {
              stats.languages.push('Java');
            }
            if (entry.name === 'build.gradle' && !stats.frameworks.includes('Gradle')) {
              stats.frameworks.push('Gradle');
            }
            if (entry.name === 'pom.xml' && !stats.frameworks.includes('Maven')) {
              stats.frameworks.push('Maven');
            }
            
            // Check for Spring
            try {
              const content = await fs.readFile(fullPath, 'utf-8');
              if (content.includes('org.springframework') && !stats.frameworks.includes('Spring')) {
                stats.frameworks.push('Spring');
              }
            } catch (error) {
              // Ignore file read errors
            }
          } else if (entry.name === 'Gemfile') {
            // Ruby project
            if (!stats.languages.includes('Ruby')) {
              stats.languages.push('Ruby');
            }
            // Check content for Rails
            try {
              const content = await fs.readFile(fullPath, 'utf-8');
              if (content.includes('rails') && !stats.frameworks.includes('Rails')) {
                stats.frameworks.push('Rails');
              }
            } catch (error) {
              // Ignore file read errors
            }
          } else if (entry.name === 'Dockerfile' || entry.name === 'docker-compose.yml' || entry.name === 'docker-compose.yaml') {
            stats.features.push('Containerization');
          } else if (entry.name === '.github/workflows' || entry.name === 'Jenkinsfile' || entry.name === '.gitlab-ci.yml') {
            stats.features.push('CI/CD');
          }
        }
      }
    } catch (error) {
      // Ignore errors reading directories
      console.error(`Error scanning directory ${dirPath}: ${error}`);
    }
  }
  
  await scanDir(projectPath);
  
  // Deduplicate features
  stats.features = [...new Set(stats.features)];
  
  return stats;
}

async function generateMCPConfig(stats: ProjectStats): Promise<MCPConfig> {
  // Get technologies list from stats
  const technologies = [
    ...stats.languages,
    ...stats.frameworks,
    // Also include features as they might have specific servers
    ...stats.features.map(feature => feature.toLowerCase())
  ];
  
  // Discover relevant MCP servers
  const discoveredServers = await discoverMCPServers(technologies);
  
  const config: MCPConfig = {
    mcpServers: {}
  };
  
  // Add discovered servers to config
  for (const [serverName, serverInfo] of Object.entries(discoveredServers)) {
    config.mcpServers[serverName] = {
      command: serverInfo.installCommand,
      args: serverInfo.installArgs,
      ...(serverInfo.env ? { env: serverInfo.env } : {})
    };
  }
  
  return config;
}

async function generateRules(stats: ProjectStats): Promise<Rule[]> {
  // Get technologies list from stats
  const technologies = [
    ...stats.languages,
    ...stats.frameworks
  ];
  
  // Search for relevant Cursor rules
  const discoveredRules = await searchCursorRules(technologies);
  
  return discoveredRules;
}