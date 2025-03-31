import * as fs from 'fs/promises';
import * as path from 'path';
import { scanProject } from './project-analyzer.js';
import { analyzeTechStack, TechnologyStack } from './project-planner.js';
import { discoverMCPServers } from './discovery-service.js';

export async function enhanceProject(projectPath: string, newRequirements: string): Promise<string> {
  try {
    // First, analyze the existing project
    const existingStats = await scanProject(projectPath);
    
    // Then, analyze the new requirements
    const newFeatures = analyzeTechStack(newRequirements);
    
    // Check if there's an existing MCP config
    const cursorDir = path.join(projectPath, '.cursor');
    const mcpConfigPath = path.join(cursorDir, 'mcp.json');
    
    let existingConfig = { mcpServers: {} };
    try {
      const configContent = await fs.readFile(mcpConfigPath, 'utf-8');
      existingConfig = JSON.parse(configContent);
    } catch (error) {
      // Config might not exist yet, that's fine
    }
    
    // Generate new MCP configuration based on existing + new features
    const combinedTechStack = {
      languages: [...new Set([...existingStats.languages, ...newFeatures.languages])],
      frameworks: [...new Set([...existingStats.frameworks, ...newFeatures.frameworks])],
      features: [...new Set([...newFeatures.features])]
    };
    
    const newMcpConfig = await generateEnhancedMCPConfig(combinedTechStack, existingConfig);
    
    // Create .cursor directory if it doesn't exist
    try {
      await fs.mkdir(cursorDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, which is fine
    }
    
    // Write updated MCP configuration
    await fs.writeFile(
      mcpConfigPath,
      JSON.stringify(newMcpConfig, null, 2)
    );
    
    // Generate response
    const addedTools = findNewTools(existingConfig, newMcpConfig);
    const addedToolsStr = addedTools.length > 0 
      ? addedTools.map(tool => `- ${tool}`).join('\n')
      : "No new tools needed for the requirements.";
    
    return `
# Project Enhancement Complete ✅

Based on your new requirements, I've enhanced your MCP setup:

## New Features Detected
- ${newFeatures.features.join('\n- ')}

## New MCP Tools Added
${addedToolsStr}

## Configuration Files Updated
- \`.cursor/mcp.json\` - Updated MCP server configuration

## Next Steps
1. Review the updated configurations
2. Add any API keys needed for new tools (look for "YOUR_API_KEY_HERE")
3. Restart Cursor to apply changes
4. Begin implementing the new features
`;
  } catch (error) {
    return `Error enhancing project: ${error instanceof Error ? error.message : String(error)}`;
  }
}

async function generateEnhancedMCPConfig(techStack: TechnologyStack, existingConfig: any): Promise<any> {
  // Start with the existing configuration
  const newConfig = JSON.parse(JSON.stringify(existingConfig));
  
  // Make sure mcpServers exists
  if (!newConfig.mcpServers) {
    newConfig.mcpServers = {};
  }
  
  // Get technologies from tech stack
  const technologies = [
    ...techStack.languages,
    ...techStack.frameworks,
    ...techStack.features.map(feature => feature.toLowerCase())
  ];
  
  // Discover relevant MCP servers from GitHub repository
  const discoveredServers = await discoverMCPServers(technologies);
  
  // Add discovered servers that aren't already in the config
  for (const [serverName, serverInfo] of Object.entries(discoveredServers)) {
    if (!newConfig.mcpServers[serverName]) {
      newConfig.mcpServers[serverName] = {
        command: serverInfo.installCommand,
        args: serverInfo.installArgs,
        ...(serverInfo.env ? { env: serverInfo.env } : {})
      };
    }
  }
  
  return newConfig;
}

function findNewTools(oldConfig: any, newConfig: any): string[] {
  const oldTools = Object.keys(oldConfig.mcpServers || {});
  const newTools = Object.keys(newConfig.mcpServers || {});
  
  return newTools.filter(tool => !oldTools.includes(tool));
}