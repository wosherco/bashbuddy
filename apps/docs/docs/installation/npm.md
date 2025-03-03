---
id: npm-installation
title: Installing with npm
description: Learn how to install BashBuddy using npm
slug: /installation/npm
sidebar_position: 4
---

# Installing BashBuddy with npm

This guide will walk you through installing BashBuddy using the Node Package Manager (npm).

## Prerequisites

Before installing BashBuddy with npm, ensure you have:

- Node.js 18 or higher
- npm 7 or higher
- A Unix-like terminal (macOS, Linux, or WSL on Windows)

## Checking Your npm Version

You can check your npm version by running:

```bash
npm --version
```

If you need to update npm, run:

```bash
npm install -g npm@latest
```

## Global Installation

The recommended way to install BashBuddy is globally, which makes the `bashbuddy` command available system-wide:

```bash
npm install -g bashbuddy
```

This will download and install BashBuddy and its dependencies.

## Local Installation

If you prefer to install BashBuddy locally in a project:

```bash
# Create a directory for your project if needed
mkdir my-bashbuddy-project
cd my-bashbuddy-project

# Initialize a new npm project if needed
npm init -y

# Install BashBuddy locally
npm install bashbuddy
```

When installed locally, you'll need to run BashBuddy using npx:

```bash
npx bashbuddy --version
```

## Installation Options

You can customize your installation with various options:

```bash
# Install a specific version
npm install -g bashbuddy@1.2.3

# Install the latest beta version
npm install -g bashbuddy@beta

# Install with verbose logging
npm install -g bashbuddy --verbose
```

## Verifying Installation

To verify that BashBuddy is installed correctly, run:

```bash
bashbuddy --version
```

You should see the current version number displayed.

## Troubleshooting npm Installation

If you encounter issues during installation:

1. Check that you have sufficient permissions:

   ```bash
   # On Linux/macOS, you might need sudo
   sudo npm install -g bashbuddy

   # Or fix npm permissions
   npm config set prefix ~/.npm
   echo 'export PATH="$HOME/.npm/bin:$PATH"' >> ~/.bashrc
   source ~/.bashrc
   ```

2. Clear npm cache:

   ```bash
   npm cache clean --force
   ```

3. Try installing with the force flag:
   ```bash
   npm install -g bashbuddy --force
   ```

## Next Steps

After installing BashBuddy with npm, you'll need to:

1. [Set up shell integration](/installation/shell-integration)
2. [Learn basic commands](/basic-commands)
3. [Configure BashBuddy](/configuration)
