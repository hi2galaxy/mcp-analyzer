@echo off
echo Installing mcp-analyzer globally...
call npm install -g mcp-analyzer

echo Setting up Cursor MCP integration...
rem Get the location of the installed package
for /f "tokens=*" %%i in ('npm root -g') do set NPM_ROOT=%%