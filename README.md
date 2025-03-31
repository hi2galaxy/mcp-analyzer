# MCP Analyzer

A powerful tool for analyzing, planning, and enhancing projects with MCP (Model Context Protocol) tools. This tool helps developers understand their project structure, detect technologies and frameworks, and get recommendations for appropriate MCP tools.

## Features

- **Project Analysis**: Automatically detects programming languages, frameworks, and features in your project
- **Project Planning**: Helps plan new projects with appropriate MCP tools and configurations
- **Project Enhancement**: Suggests and adds MCP tools based on new requirements
- **Smart Detection**: Identifies project features like authentication, databases, APIs, and more
- **Configurable**: Customizable scanning limits and detection rules

## Installation

```bash
npm install -g mcp-analyzer
```

## Usage

### Project Analysis

Analyze an existing project to detect technologies and recommend MCP tools:

```bash
mcp-analyzer analyze /path/to/project
```

### Project Planning

Get recommendations for a new project:

```bash
mcp-analyzer plan "A full-stack web application with React frontend and Node.js backend" /path/to/new/project
```

### Project Enhancement

Add new MCP tools to an existing project:

```bash
mcp-analyzer enhance /path/to/project "Add real-time features and testing infrastructure"
```

## Configuration

The tool can be configured through the following files:

- `.cursor/mcp.json`: MCP server configuration
- `.cursor/rules/project_rules.json`: Project-specific rules
- `src/config/project-scan.ts`: Scanning and detection settings

## Development

### Prerequisites

- Node.js 18 or higher
- TypeScript 5.0 or higher
- npm or yarn

### Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/mcp-analyzer.git
cd mcp-analyzer
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

### Running Tests

```bash
npm test
```

For watch mode:
```bash
npm run test:watch
```

### Development Mode

```bash
npm run dev
```

## Project Structure

```
mcp-analyzer/
├── src/
│   ├── config/           # Configuration files
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   ├── project-analyzer.ts
│   ├── project-planner.ts
│   ├── project-enhancer.ts
│   └── index.ts
├── tests/               # Test files
├── package.json
├── tsconfig.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Model Context Protocol](https://github.com/modelcontextprotocol)
- [Cursor IDE](https://cursor.sh)