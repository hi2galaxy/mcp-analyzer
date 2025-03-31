export interface ProjectStats {
  fileTypes: Record<string, number>;
  languages: string[];
  frameworks: string[];
  dependencies: string[];
  features: string[];
}

export interface MCPConfig {
  mcpServers: Record<string, {
    command: string;
    args: string[];
    env?: Record<string, string>;
  }>;
}

export interface Rule {
  name: string;
  description: string;
  pattern?: string;
  scope?: string;
  enabled: boolean;
}

export interface ProjectAnalysisResult {
  stats: ProjectStats;
  mcpConfig: MCPConfig;
  rules: Rule[];
}

export interface ProjectEnhancementResult {
  addedTools: string[];
  updatedConfigs: string[];
  recommendations: string[];
}

export interface ProjectPlanningResult {
  recommendedTools: string[];
  projectStructure: string[];
  initialConfigs: string[];
} 