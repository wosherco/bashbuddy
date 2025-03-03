---
id: troubleshooting
title: Troubleshooting Installation
description: Solutions for common BashBuddy installation issues
slug: /installation/troubleshooting
sidebar_position: 8
---

# Troubleshooting BashBuddy Installation

This guide provides solutions for common issues you might encounter when installing or setting up BashBuddy.

## Common Issues and Solutions

### Command Not Found

**Issue:** After installation, running `bashbuddy` or `bb` results in a "command not found" error.

**Solutions:**

1. Check if BashBuddy is installed correctly:

   ```bash
   npm list -g | grep bashbuddy
   # or
   yarn global list | grep bashbuddy
   ```

2. Ensure the global bin directory is in your PATH:

   ```bash
   # For npm
   echo $PATH | grep $(npm config get prefix)/bin

   # For yarn
   echo $PATH | grep $(yarn global bin)
   ```

3. Add the global bin directory to your PATH if needed:

   ```bash
   # For npm
   echo 'export PATH="$(npm config get prefix)/bin:$PATH"' >> ~/.bashrc
   source ~/.bashrc

   # For yarn
   echo 'export PATH="$(yarn global bin):$PATH"' >> ~/.bashrc
   source ~/.bashrc
   ```

### Permission Errors

**Issue:** You encounter permission errors when installing BashBuddy globally.

**Solutions:**

1. Use sudo (not recommended as a permanent solution):

   ```bash
   sudo npm install -g bashbuddy
   ```

2. Fix npm permissions (recommended):
   ```bash
   mkdir -p ~/.npm-global
   npm config set prefix ~/.npm-global
   echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
   source ~/.bashrc
   npm install -g bashbuddy
   ```

### Node.js Version Issues

**Issue:** Installation fails due to Node.js version incompatibility.

**Solutions:**

1. Check your Node.js version:

   ```bash
   node --version
   ```

2. Update Node.js if needed:

   ```bash
   # Using nvm (recommended)
   nvm install 18
   nvm use 18

   # Or update directly
   npm install -g n
   n stable
   ```

### Shell Integration Not Working

**Issue:** BashBuddy is installed, but the `bb` command doesn't work.

**Solutions:**

1. Check if shell integration is set up:

   ```bash
   grep -r "bashbuddy init" ~/.bashrc ~/.zshrc ~/.config/fish/config.fish
   ```

2. Manually add shell integration:

   ```bash
   # For Bash
   echo 'eval "$(bashbuddy init bash)"' >> ~/.bashrc
   source ~/.bashrc

   # For Zsh
   echo 'eval "$(bashbuddy init zsh)"' >> ~/.zshrc
   source ~/.zshrc

   # For Fish
   echo 'bashbuddy init fish | source' >> ~/.config/fish/config.fish
   source ~/.config/fish/config.fish
   ```

### Dependency Conflicts

**Issue:** Installation fails due to dependency conflicts.

**Solutions:**

1. Try installing with the force flag:

   ```bash
   npm install -g bashbuddy --force
   # or
   yarn global add bashbuddy --force
   ```

2. Clear package manager cache:
   ```bash
   npm cache clean --force
   # or
   yarn cache clean
   ```

### WSL-Specific Issues

**Issue:** Installation in WSL fails or BashBuddy doesn't work correctly in WSL.

**Solutions:**

1. Ensure WSL is properly set up:

   ```bash
   wsl --status
   ```

2. Check Node.js installation in WSL:

   ```bash
   node --version
   which node
   ```

3. Reinstall Node.js in WSL if needed:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

## Diagnostic Commands

Use these commands to gather information for troubleshooting:

```bash
# Check BashBuddy version
bashbuddy --version

# Check Node.js and npm versions
node --version
npm --version

# Check where BashBuddy is installed
which bashbuddy
which bb

# Check BashBuddy logs (if available)
cat ~/.bashbuddy/logs/error.log
```

## Getting Help

If you're still experiencing issues:

1. Check the [GitHub Issues](https://github.com/bashbuddy/bashbuddy/issues) to see if others have encountered the same problem
2. Join our [Discord community](https://discord.gg/bashbuddy) for real-time help
3. Open a new issue on GitHub with detailed information about your problem

## Uninstalling and Reinstalling

If all else fails, you can try a clean reinstallation:

```bash
# Uninstall BashBuddy
npm uninstall -g bashbuddy
# or
yarn global remove bashbuddy

# Remove configuration files
rm -rf ~/.bashbuddy

# Reinstall
npm install -g bashbuddy
# or
yarn global add bashbuddy

# Set up shell integration again
eval "$(bashbuddy init bash)"  # or your shell of choice
```
