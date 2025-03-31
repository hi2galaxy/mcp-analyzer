import axios from 'axios';
import * as cheerio from 'cheerio';

interface MCPServerInfo {
  name: string;
  description: string;
  repository: string;
  installCommand: string;
  installArgs: string[];
  env?: Record<string, string>;
}

interface MCPRuleInfo {
  name: string;
  description: string;
  pattern?: string;
  scope?: string;
  enabled: boolean;
}

export async function discoverMCPServers(technologies: string[]): Promise<Record<string, MCPServerInfo>> {
  try {
    // Fetch the list of MCP servers from GitHub repository
    const repoUrl = 'https://api.github.com/repos/modelcontextprotocol/servers/contents';
    const response = await axios.get(repoUrl);
    
    if (!Array.isArray(response.data)) {
      console.error('Unexpected GitHub API response format');
      return {};
    }
    
    // Filter for directories which might contain server implementations
    const serverDirs = response.data.filter(
      (item: any) => item.type === 'dir' && !item.name.startsWith('.')
    );
    
    // Process each server directory
    const servers: Record<string, MCPServerInfo> = {};
    
    // Use Promise.all for concurrent requests
    await Promise.all(
      serverDirs.map(async (dir: any) => {
        try {
          // Fetch README.md if it exists to extract description
          const readmeUrl = `https://raw.githubusercontent.com/modelcontextprotocol/servers/main/${dir.name}/README.md`;
          const readmeResponse = await axios.get(readmeUrl, { validateStatus: (status) => status < 500 });
          
          let description = `MCP server for ${dir.name}`;
          let relevanceScore = 0;
          
          // If README exists, extract description and check relevance to requested technologies
          if (readmeResponse.status === 200) {
            const readmeContent = readmeResponse.data;
            // Extract first paragraph as description
            const match = readmeContent.match(/# .+?\n\n(.+?)(\n\n|$)/s);
            if (match && match[1]) {
              description = match[1].trim();
            }
            
            // Calculate relevance score based on technology matches
            relevanceScore = technologies.reduce((score, tech) => {
              const regex = new RegExp(tech, 'i');
              return score + (regex.test(readmeContent) ? 1 : 0);
            }, 0);
          }
          
          // Only include servers with positive relevance or if we're looking at essential servers
          const isEssentialServer = ['brave-search', 'sequential-thinking'].includes(dir.name);
          if (relevanceScore > 0 || isEssentialServer || technologies.length === 0) {
            servers[dir.name] = {
              name: dir.name,
              description,
              repository: `https://github.com/modelcontextprotocol/servers/tree/main/${dir.name}`,
              installCommand: 'npx',
              installArgs: ['-y', `@modelcontextprotocol/server-${dir.name}`],
              env: dir.name === 'brave-search' ? { 'BRAVE_API_KEY': 'YOUR_API_KEY_HERE' } : undefined
            };
          }
        } catch (error) {
          console.error(`Error processing server directory ${dir.name}:`, error);
        }
      })
    );
    
    return servers;
  } catch (error) {
    console.error('Error discovering MCP servers:', error);
    // Fallback to default servers
    return {
      'brave-search': {
        name: 'brave-search',
        description: 'Enables web searches using the Brave Search API',
        repository: 'https://github.com/modelcontextprotocol/servers/tree/main/brave-search',
        installCommand: 'npx',
        installArgs: ['-y', '@modelcontextprotocol/server-brave-search'],
        env: { 'BRAVE_API_KEY': 'YOUR_API_KEY_HERE' }
      },
      'sequential-thinking': {
        name: 'sequential-thinking',
        description: 'Enables step-by-step reasoning for complex problems',
        repository: 'https://github.com/modelcontextprotocol/servers/tree/main/sequential-thinking',
        installCommand: 'npx',
        installArgs: ['-y', '@modelcontextprotocol/server-sequential-thinking']
      }
    };
  }
}

export async function searchCursorRules(technologies: string[]): Promise<MCPRuleInfo[]> {
  try {
    const rules: MCPRuleInfo[] = [];
    
    // Search Cursor Directory for each technology
    for (const tech of technologies) {
      try {
        const searchUrl = `https://cursor.directory/?q=${encodeURIComponent(tech)}`;
        const response = await axios.get(searchUrl);
        const $ = cheerio.load(response.data);
        
        // Extract rules from the search results page
        // This is a simplified approach and may need adjustment based on the actual structure
        $('.rule-item, .package-item').each((_, element) => {
          const $element = $(element);
          const name = $element.find('.rule-name, .package-name').text().trim();
          const description = $element.find('.rule-description, .package-description').text().trim();
          
          // Only add if not already in the list (avoid duplicates)
          if (name && description && !rules.some(rule => rule.name === name)) {
            rules.push({
              name,
              description,
              enabled: true,
              // Add default pattern based on technology
              pattern: getDefaultPatternForTech(tech),
              scope: getScopeForTech(tech)
            });
          }
        });
      } catch (error) {
        console.error(`Error searching rules for ${tech}:`, error);
      }
    }
    
    // If no rules found or error occurred, return default rules
    if (rules.length === 0) {
      return getDefaultRules(technologies);
    }
    
    return rules;
  } catch (error) {
    console.error('Error searching Cursor rules:', error);
    return getDefaultRules(technologies);
  }
}

function getDefaultPatternForTech(tech: string): string | undefined {
  const patterns: Record<string, string> = {
    'javascript': '(?<![;{}])\\s*$',
    'typescript': '(?<![;{}])\\s*$',
    'python': 'def\\s+([A-Z]|[a-z][a-z0-9]*[A-Z])'
  };
  
  // Normalize the tech name to lowercase for matching
  const normalizedTech = tech.toLowerCase();
  
  // Look for a match in our patterns dictionary
  for (const [key, pattern] of Object.entries(patterns)) {
    if (normalizedTech.includes(key)) {
      return pattern;
    }
  }
  
  return undefined;
}

function getScopeForTech(tech: string): string | undefined {
  const techToScope: Record<string, string> = {
    'javascript': 'js,jsx',
    'typescript': 'ts,tsx',
    'react': 'jsx,tsx',
    'python': 'py',
    'java': 'java',
    'go': 'go',
    'ruby': 'rb',
    'php': 'php',
    'c#': 'cs',
    'csharp': 'cs'
  };
  
  const normalizedTech = tech.toLowerCase();
  
  for (const [key, scope] of Object.entries(techToScope)) {
    if (normalizedTech.includes(key)) {
      return scope;
    }
  }
  
  return undefined;
}

function getDefaultRules(technologies: string[]): MCPRuleInfo[] {
  const defaultRules: MCPRuleInfo[] = [
    {
      name: "descriptive-names",
      description: "Use descriptive variable and function names",
      enabled: true
    }
  ];
  
  // Add language-specific rules
  if (technologies.some(tech => 
    tech.toLowerCase().includes('javascript') || 
    tech.toLowerCase().includes('typescript'))) {
    defaultRules.push({
      name: "js-semicolons",
      description: "Use semicolons at the end of statements",
      pattern: "(?<![;{}])\\s*$",
      scope: "js,jsx,ts,tsx",
      enabled: true
    });
    
    defaultRules.push({
      name: "const-first",
      description: "Prefer const over let when variable is not reassigned",
      enabled: true
    });
  }
  
  if (technologies.some(tech => tech.toLowerCase().includes('python'))) {
    defaultRules.push({
      name: "py-snake-case",
      description: "Use snake_case for variables and functions",
      pattern: "def\\s+([A-Z]|[a-z][a-z0-9]*[A-Z])",
      scope: "py",
      enabled: true
    });
  }
  
  return defaultRules;
}