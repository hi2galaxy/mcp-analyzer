import { MCPConfig } from '../types/project.js';

export const DEFAULT_MCP_CONFIG: MCPConfig = {
  mcpServers: {
    "project-analyzer": {
      command: "mcp-analyzer",
      args: ["analyze"],
      env: {
        NODE_ENV: "development"
      }
    },
    "project-planner": {
      command: "mcp-analyzer",
      args: ["plan"],
      env: {
        NODE_ENV: "development"
      }
    },
    "project-enhancer": {
      command: "mcp-analyzer",
      args: ["enhance"],
      env: {
        NODE_ENV: "development"
      }
    }
  }
};

export const MCP_TOOL_DESCRIPTIONS = {
  "project-analyzer": "Analyzes project structure and recommends MCP tools",
  "project-planner": "Helps plan new projects with appropriate MCP tools",
  "project-enhancer": "Enhances existing projects with additional MCP tools"
};

export const MCP_TOOL_REQUIREMENTS = {
  "project-analyzer": ["projectPath"],
  "project-planner": ["projectDescription", "projectPath"],
  "project-enhancer": ["projectPath", "newRequirements"]
}; 