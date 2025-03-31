#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { analyzeProject } from "./project-analyzer.js";
import { planProject } from "./project-planner.js";
import { enhanceProject } from "./project-enhancer.js";

// Define the tools your server will provide
const PROJECT_ANALYZER_TOOL: Tool = {
  name: "analyze_project",
  description:
    "Analyzes an existing project directory to recommend MCP tools and configurations " +
    "based on the detected languages, frameworks, and project structure.",
  inputSchema: {
    type: "object",
    properties: {
      projectPath: {
        type: "string",
        description: "Path to the project directory to analyze"
      }
    },
    required: ["projectPath"],
  },
};

const PROJECT_PLANNER_TOOL: Tool = {
  name: "plan_project",
  description:
    "Recommends MCP tools based on a description of a planned project. " +
    "Use this when starting a new project from scratch.",
  inputSchema: {
    type: "object",
    properties: {
      projectDescription: {
        type: "string",
        description: "Detailed description of the planned project"
      },
      projectPath: {
        type: "string",
        description: "Path where the project will be created"
      }
    },
    required: ["projectDescription", "projectPath"],
  },
};

const PROJECT_ENHANCEMENT_TOOL: Tool = {
  name: "enhance_project",
  description:
    "Adds MCP tools to an existing project based on new requirements. " +
    "Use this when adding new features to an ongoing project.",
  inputSchema: {
    type: "object",
    properties: {
      projectPath: {
        type: "string",
        description: "Path to the existing project"
      },
      newRequirements: {
        type: "string",
        description: "Description of the new requirements or features"
      }
    },
    required: ["projectPath", "newRequirements"],
  },
};

// Create the server
const server = new Server(
  {
    name: "cursor-project-assistant",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

// Register tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [PROJECT_ANALYZER_TOOL, PROJECT_PLANNER_TOOL, PROJECT_ENHANCEMENT_TOOL],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    if (!args) {
      throw new Error("No arguments provided");
    }

    switch (name) {
      case "analyze_project": {
        if (typeof args !== "object" || 
            args === null || 
            !("projectPath" in args) || 
            typeof args.projectPath !== "string") {
          throw new Error("Invalid arguments for analyze_project tool");
        }
        
        const { projectPath } = args;
        
        // Use our analysis function
        const result = await analyzeProject(projectPath);
        
        return {
          content: [{ type: "text", text: result }],
          isError: false,
        };
      }
      
      case "plan_project": {
        if (typeof args !== "object" || 
            args === null || 
            !("projectDescription" in args) || 
            typeof args.projectDescription !== "string" ||
            !("projectPath" in args) || 
            typeof args.projectPath !== "string") {
          throw new Error("Invalid arguments for plan_project tool");
        }
        
        const { projectDescription, projectPath } = args;
        
        // Use our planning function
        const result = await planProject(projectDescription, projectPath);
        
        return {
          content: [{ type: "text", text: result }],
          isError: false,
        };
      }
      
      case "enhance_project": {
        if (typeof args !== "object" || 
            args === null || 
            !("projectPath" in args) || 
            typeof args.projectPath !== "string" ||
            !("newRequirements" in args) || 
            typeof args.newRequirements !== "string") {
          throw new Error("Invalid arguments for enhance_project tool");
        }
        
        const { projectPath, newRequirements } = args;
        
        // Use our enhancement function
        const result = await enhanceProject(projectPath, newRequirements);
        
        return {
          content: [{ type: "text", text: result }],
          isError: false,
        };
      }

      default:
        return {
          content: [{ type: "text", text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }
  } catch (error) {
    console.error('Error handling tool call:', error);
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

// Add progress logging
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Run the server
async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Cursor Project Assistant MCP Server running on stdio");
}

runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});