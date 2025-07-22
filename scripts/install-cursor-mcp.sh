#!/bin/bash

# Install the mcp-analyzer package globally
echo "Installing mcp-analyzer globally..."
npm install -g mcp-analyzer

# Copy cursor-mcp.json to the right location for Cursor to detect
# The exact location depends on the OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    CURSOR_DIR="$HOME/Library/Application Support/Cursor/mcps/"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    CURSOR_DIR="$HOME/.config/Cursor/mcps/"
elif [[ "$OSTYPE" == "msys"* || "$OSTYPE" == "cygwin"* || "$OSTYPE" == "win32" ]]; then
    # Windows
    CURSOR_DIR="$APPDATA/Cursor/mcps/"
else
    echo "Unsupported OS: $OSTYPE"
    exit 1
fi

# Create the directory if it doesn't exist
mkdir -p "$CURSOR_DIR"

# Get the location of the installed package
MCP_DIR=$(npm root -g)/mcp-analyzer

echo "Copying cursor-mcp.json to $CURSOR_DIR..."
cp "$MCP_DIR/cursor-mcp.json" "$CURSOR_DIR/cursor-project-assistant.json"

echo "Installation complete!"
echo "Please restart Cursor or reload the window to detect the new MCP server."
echo "You can now use the cursor-project-assistant tools in Cursor."