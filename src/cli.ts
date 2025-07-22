import { analyzeProject } from './project-analyzer.js';
import { planProject } from './project-planner.js';
import { enhanceProject } from './project-enhancer.js';

const usage = `
Usage: mcp-analyzer <command> [options]

Commands:
  analyze <projectPath>                   Analyze an existing project
  plan <projectDescription> <projectPath> Plan a new project
  enhance <projectPath> <newRequirements> Enhance an existing project
  serve                                   Run as an MCP server for Cursor

Examples:
  mcp-analyzer analyze ./my-project
  mcp-analyzer plan "React app with authentication" ./new-project
  mcp-analyzer enhance ./my-project "Add real-time features"
  mcp-analyzer serve
`;

export async function handleCli(args: string[]): Promise<void> {
  // Remove the first two arguments (node executable and script path)
  const [command, ...cmdArgs] = args.slice(2);

  if (!command) {
    console.log(usage);
    process.exit(0);
  }

  try {
    switch (command) {
      case 'analyze':
        if (!cmdArgs[0]) {
          console.error('Error: projectPath is required');
          console.log(usage);
          process.exit(1);
        }
        
        const analysisResult = await analyzeProject(cmdArgs[0]);
        console.log(analysisResult);
        break;
        
      case 'plan':
        if (!cmdArgs[0] || !cmdArgs[1]) {
          console.error('Error: projectDescription and projectPath are required');
          console.log(usage);
          process.exit(1);
        }
        
        const planResult = await planProject(cmdArgs[0], cmdArgs[1]);
        console.log(planResult);
        break;
        
      case 'enhance':
        if (!cmdArgs[0] || !cmdArgs[1]) {
          console.error('Error: projectPath and newRequirements are required');
          console.log(usage);
          process.exit(1);
        }
        
        const enhanceResult = await enhanceProject(cmdArgs[0], cmdArgs[1]);
        console.log(enhanceResult);
        break;
        
      case 'serve':
        // This case is handled in the main index.ts file
        // The CLI isn't actually processing this, but we want to show it in the help
        console.log('Starting MCP server for Cursor...');
        // No further action needed here as index.ts will handle it
        break;
        
      case '--help':
      case '-h':
        console.log(usage);
        process.exit(0);
        
      default:
        console.error(`Error: Unknown command '${command}'`);
        console.log(usage);
        process.exit(1);
    }
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}