#!/usr/bin/env bash

# Set colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}BashBuddy CLI Installer${NC}"
echo "==============================="

# Check if bun is installed
if ! command -v bun &> /dev/null; then
    echo -e "${YELLOW}Bun is not installed. Installing now...${NC}"
    curl -fsSL https://bun.sh/install | bash
    
    # Source the .bashrc or .zshrc to make bun available in the current session
    if [[ -f "$HOME/.bashrc" ]]; then
        source "$HOME/.bashrc"
    elif [[ -f "$HOME/.zshrc" ]]; then
        source "$HOME/.zshrc"
    fi
    
    # Check if bun is now in PATH
    if ! command -v bun &> /dev/null; then
        echo -e "${YELLOW}Please restart your terminal or run 'source ~/.bashrc' (or 'source ~/.zshrc') to use bun.${NC}"
        echo -e "${YELLOW}After that, run this script again.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}Bun has been installed successfully!${NC}"
else
    echo -e "${GREEN}Bun is already installed. Checking for updates...${NC}"
    bun upgrade
    echo -e "${GREEN}Bun has been updated to the latest version.${NC}"
fi

# Install or update @bashbuddy/cli
echo -e "${BLUE}Installing/updating @bashbuddy/cli...${NC}"
bun i -g @bashbuddy/cli@latest

# Check if installation was successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}BashBuddy CLI has been successfully installed/updated!${NC}"
    echo -e "${GREEN}You can now use the 'bashbuddy' command.${NC}"
else
    echo -e "${YELLOW}There was an issue installing BashBuddy CLI.${NC}"
fi

echo -e "${BLUE}If you encounter any issues, please visit:${NC}"
echo -e "${GREEN}docs.bashbuddy.run/troubleshooting${NC}"
