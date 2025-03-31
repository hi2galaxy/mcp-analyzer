import * as fs from 'fs/promises';
import * as path from 'path';
import { discoverMCPServers } from './discovery-service.js';

export interface TechnologyStack {
  languages: string[];
  frameworks: string[];
  features: string[];
}

interface MCPConfig {
  mcpServers: {
    [key: string]: {
      command: string;
      args: string[];
      env?: Record<string, string>;
    };
  };
}

interface ProjectRule {
  name: string;
  description: string;
  pattern: string;
  message: string;
}

interface PackageDependencies {
  [key: string]: string;
}

export async function planProject(description: string, projectPath: string): Promise<string> {
  try {
    // Analyze the project description to identify technologies
    const techStack = analyzeTechStack(description);
    
    // Generate MCP configurations based on the tech stack
    const mcpConfig = await generateMCPConfig(techStack);
    const rules = await generateRules(techStack);
    
    // Create directory if it doesn't exist
    try {
      await fs.mkdir(projectPath, { recursive: true });
    } catch (error) {
      // Directory might already exist, which is fine
    }
    
    // Create .cursor directory
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
    
    // Generate starter project files based on tech stack
    await generateStarterFiles(projectPath, techStack);
    
    // Generate response
    const languagesStr = techStack.languages.join(', ');
    const frameworksStr = techStack.frameworks.length > 0 
      ? techStack.frameworks.join(', ') 
      : 'None detected';
    
    const mcpToolsStr = Object.keys(mcpConfig.mcpServers)
      .map(tool => `- ${tool}`)
      .join('\n');
    
    return `
# Project Planning Complete ✅

Based on your project description, I've identified:

## Technology Stack
- **Languages**: ${languagesStr}
- **Frameworks**: ${frameworksStr}
- **Key Features**: ${techStack.features.join(', ')}

## MCP Tools Configured
${mcpToolsStr}

## Files Created
- \`.cursor/mcp.json\` - MCP server configuration
- \`.cursor/rules/project_rules.json\` - Coding rules configuration
${generateStarterFilesList(techStack)}

## Next Steps
1. Review the generated configurations and starter files
2. Add any API keys needed (look for "YOUR_API_KEY_HERE")
3. Begin implementation following the project structure
4. When you need to add new features, use the enhance_project tool
`;
  } catch (error) {
    return `Error planning project: ${error instanceof Error ? error.message : String(error)}`;
  }
}

export function analyzeTechStack(description: string): TechnologyStack {
  const techStack: TechnologyStack = {
    languages: [],
    frameworks: [],
    features: []
  };
  
  // Detect languages
  if (description.match(/typescript|ts|angular|react|next\.?js|vue|node\.?js/i)) {
    techStack.languages.push('TypeScript');
  }
  if (description.match(/javascript|js|node\.?js|express|react|vue/i) && !description.match(/typescript|ts/i)) {
    techStack.languages.push('JavaScript');
  }
  if (description.match(/python|django|flask|fastapi|jupyter|numpy|pandas/i)) {
    techStack.languages.push('Python');
  }
  if (description.match(/java|spring|springboot|gradle|maven/i)) {
    techStack.languages.push('Java');
  }
  if (description.match(/go|golang/i)) {
    techStack.languages.push('Go');
  }
  if (description.match(/ruby|rails|rack|sinatra/i)) {
    techStack.languages.push('Ruby');
  }
  if (description.match(/c#|\.net|asp\.net|dotnet/i)) {
    techStack.languages.push('C#');
  }
  if (description.match(/php|laravel|symfony|wordpress/i)) {
    techStack.languages.push('PHP');
  }
  if (description.match(/swift|ios|iphone|ipad/i)) {
    techStack.languages.push('Swift');
  }
  if (description.match(/kotlin|android/i)) {
    techStack.languages.push('Kotlin');
  }
  if (description.match(/rust|cargo/i)) {
    techStack.languages.push('Rust');
  }
  
  // Detect frameworks
  if (description.match(/react/i)) {
    techStack.frameworks.push('React');
  }
  if (description.match(/next\.?js/i)) {
    techStack.frameworks.push('Next.js');
  }
  if (description.match(/vue|vue\.?js/i)) {
    techStack.frameworks.push('Vue.js');
  }
  if (description.match(/angular/i)) {
    techStack.frameworks.push('Angular');
  }
  if (description.match(/express|express\.?js/i)) {
    techStack.frameworks.push('Express');
  }
  if (description.match(/django/i)) {
    techStack.frameworks.push('Django');
  }
  if (description.match(/flask/i)) {
    techStack.frameworks.push('Flask');
  }
  if (description.match(/fastapi/i)) {
    techStack.frameworks.push('FastAPI');
  }
  if (description.match(/rails|ruby\s+on\s+rails/i)) {
    techStack.frameworks.push('Rails');
  }
  if (description.match(/spring|spring\s*boot/i)) {
    techStack.frameworks.push('Spring');
  }
  if (description.match(/laravel/i)) {
    techStack.frameworks.push('Laravel');
  }
  if (description.match(/asp\.net\s*(core)?/i)) {
    techStack.frameworks.push('ASP.NET');
  }
  if (description.match(/svelte/i)) {
    techStack.frameworks.push('Svelte');
  }
  if (description.match(/flutter/i)) {
    techStack.frameworks.push('Flutter');
  }
  if (description.match(/gatsby/i)) {
    techStack.frameworks.push('Gatsby');
  }
  if (description.match(/nuxt/i)) {
    techStack.frameworks.push('Nuxt.js');
  }
  
  // Detect features
  if (description.match(/api|rest|restful|graphql|endpoint/i)) {
    techStack.features.push('API');
  }
  if (description.match(/database|db|sql|nosql|mongo|postgres|mysql|sqlite/i)) {
    techStack.features.push('Database');
  }
  if (description.match(/auth|authentication|login|user|permission|role|jwt|oauth/i)) {
    techStack.features.push('Authentication');
  }
  if (description.match(/frontend|ui|interface|client|spa|single\s*page/i)) {
    techStack.features.push('Frontend');
  }
  if (description.match(/backend|server|api/i)) {
    techStack.features.push('Backend');
  }
  if (description.match(/mobile|ios|android|app|react\s*native/i)) {
    techStack.features.push('Mobile');
  }
  if (description.match(/test|jest|mocha|cypress|testing|unit\s*test|e2e/i)) {
    techStack.features.push('Testing');
  }
  if (description.match(/docker|container|kubernetes|k8s|containeriz/i)) {
    techStack.features.push('Containerization');
  }
  if (description.match(/ci|cd|ci\/cd|continuous\s*integration|continuous\s*deployment|github\s*actions|jenkins/i)) {
    techStack.features.push('CI/CD');
  }
  if (description.match(/file|upload|download|storage|s3|blob/i)) {
    techStack.features.push('File Storage');
  }
  if (description.match(/real\s*time|websocket|socket\.io|live\s*update/i)) {
    techStack.features.push('Real-time');
  }
  if (description.match(/analytics|metrics|monitoring|logging/i)) {
    techStack.features.push('Analytics');
  }
  
  return techStack;
}

async function generateMCPConfig(techStack: TechnologyStack): Promise<MCPConfig> {
  const technologies = [
    ...techStack.languages,
    ...techStack.frameworks,
    ...techStack.features.map(feature => feature.toLowerCase())
  ];
  
  // Discover relevant MCP servers from GitHub repository
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

async function generateRules(techStack: TechnologyStack): Promise<ProjectRule[]> {
  const rules: ProjectRule[] = [];
  
  // Add language-specific rules
  if (techStack.languages.includes('TypeScript')) {
    rules.push({
      name: 'typescript-strict',
      description: 'Enforce strict TypeScript checks',
      pattern: '**/*.ts',
      message: 'Please enable strict mode in tsconfig.json'
    });
  }
  
  // Add framework-specific rules
  if (techStack.frameworks.includes('React')) {
    rules.push({
      name: 'react-hooks',
      description: 'Enforce React hooks rules',
      pattern: '**/*.{tsx,jsx}',
      message: 'Please follow React hooks rules'
    });
  }
  
  return rules;
}

async function generateStarterFiles(projectPath: string, techStack: TechnologyStack): Promise<void> {
  // Generate package.json for TypeScript/JavaScript projects
  if (techStack.languages.includes('TypeScript') || techStack.languages.includes('JavaScript')) {
    const dependencies: PackageDependencies = {
      typescript: '^5.0.0',
      '@types/node': '^20.0.0',
      'ts-node': '^10.9.0'
    };

    // Add framework-specific dependencies
    if (techStack.frameworks.includes('React')) {
      dependencies['@types/react'] = '^18.0.0';
      dependencies['@types/react-dom'] = '^18.0.0';
    }
    if (techStack.frameworks.includes('Express')) {
      dependencies['@types/express'] = '^4.17.0';
    }

    const packageJson = {
      name: path.basename(projectPath),
      version: '1.0.0',
      description: 'Generated project',
      main: 'dist/index.js',
      scripts: {
        build: 'tsc',
        start: 'ts-node src/index.ts',
        test: 'jest'
      },
      dependencies,
      devDependencies: {
        '@types/jest': '^29.0.0',
        jest: '^29.0.0',
        'ts-jest': '^29.0.0'
      }
    };

    await fs.writeFile(
      path.join(projectPath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
  }

  // Generate different files based on detected tech stack
  if (techStack.languages.includes('TypeScript')) {
    // Create tsconfig.json
    const tsConfig = {
      compilerOptions: {
        target: "ES2020",
        module: "NodeNext",
        moduleResolution: "NodeNext",
        esModuleInterop: true,
        outDir: "./dist",
        rootDir: "./src",
        strict: true,
        resolveJsonModule: true
      },
      include: ["src/**/*"]
    };
    
    await fs.writeFile(
      path.join(projectPath, 'tsconfig.json'),
      JSON.stringify(tsConfig, null, 2)
    );
    
    // Create src directory
    try {
      await fs.mkdir(path.join(projectPath, 'src'), { recursive: true });
    } catch (error) {
      // Directory might already exist, which is fine
    }
    
    // Create index.ts
    let indexContent = "";
    
    if (techStack.frameworks.includes('Express')) {
      indexContent = `import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(\`Server running at http://localhost:\${port}\`);
});
`;
    } else {
      indexContent = `function main() {
  console.log('Hello World!');
}

main();
`;
    }
    
    await fs.writeFile(
      path.join(projectPath, 'src', 'index.ts'),
      indexContent
    );
    
  } else if (techStack.languages.includes('Python')) {
    // Create requirements.txt
    let requirementsContent = "# Project dependencies\n";
    
    if (techStack.frameworks.includes('Flask')) {
      requirementsContent += "flask>=2.0.0\n";
    } else if (techStack.frameworks.includes('Django')) {
      requirementsContent += "django>=4.0.0\n";
    } else if (techStack.frameworks.includes('FastAPI')) {
      requirementsContent += "fastapi>=0.95.0\nuvicorn>=0.21.0\n";
    }
    
    await fs.writeFile(
      path.join(projectPath, 'requirements.txt'),
      requirementsContent
    );
    
    // Create main.py
    let mainContent = "";
    
    if (techStack.frameworks.includes('Flask')) {
      mainContent = `from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/')
def hello_world():
    return jsonify({"message": "Hello, World!"})

if __name__ == '__main__':
    app.run(debug=True)
`;
    } else if (techStack.frameworks.includes('FastAPI')) {
      mainContent = `from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}
`;
    } else {
      mainContent = `def main():
    print("Hello, World!")

if __name__ == "__main__":
    main()
`;
    }
    
    await fs.writeFile(
      path.join(projectPath, 'main.py'),
      mainContent
    );
  }
}

function generateStarterFilesList(techStack: TechnologyStack): string {
  const files: string[] = [];
  
  // Add language-specific files
  if (techStack.languages.includes('TypeScript')) {
    files.push('- `tsconfig.json` - TypeScript configuration');
  }
  
  // Add framework-specific files
  if (techStack.frameworks.includes('React')) {
    files.push('- `src/App.tsx` - Main React component');
    files.push('- `src/index.tsx` - Application entry point');
  }
  
  return files.join('\n');
}