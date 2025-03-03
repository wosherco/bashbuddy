---
id: yarn-installation
title: Installing with Yarn
description: Learn how to install BashBuddy using Yarn package manager
slug: /installation/yarn
sidebar_position: 5
---

# Installing BashBuddy with Yarn

This guide will walk you through installing BashBuddy using the Yarn package manager.

## Prerequisites

Before installing BashBuddy with Yarn, ensure you have:

- Node.js 18 or higher
- Yarn 1.22 or higher (classic) or Yarn 2+ (berry)
- A Unix-like terminal (macOS, Linux, or WSL on Windows)

## Checking Your Yarn Version

You can check your Yarn version by running:

```bash
yarn --version
```

If you need to install or update Yarn, run:

```bash
# Install Yarn globally using npm
npm install -g yarn

# Or update existing Yarn
yarn set version latest
```

## Global Installation

The recommended way to install BashBuddy is globally, which makes the `bashbuddy` command available system-wide:

### Using Yarn Classic (1.x)

```bash
yarn global add bashbuddy
```

### Using Yarn Berry (2.x+)

```bash
yarn dlx bashbuddy
```

## Local Installation

If you prefer to install BashBuddy locally in a project:

```bash
# Create a directory for your project if needed
mkdir my-bashbuddy-project
cd my-bashbuddy-project

# Initialize a new Yarn project if needed
yarn init -y

# Install BashBuddy locally
yarn add bashbuddy
```

When installed locally, you'll need to run BashBuddy using Yarn:

```bash
# Yarn Classic
yarn bashbuddy --version

# Yarn Berry
yarn dlx bashbuddy --version
```

## Installation Options

You can customize your installation with various options:

```bash
# Install a specific version
yarn global add bashbuddy@1.2.3

# Install the latest beta version
yarn global add bashbuddy@beta

# Install with verbose logging
yarn global add bashbuddy --verbose
```

## Verifying Installation

To verify that BashBuddy is installed correctly, run:

```bash
bashbuddy --version
```

You should see the current version number displayed.

## Troubleshooting Yarn Installation

If you encounter issues during installation:

1. Check that your global bin directory is in your PATH:

   ```bash
   # Find the global bin directory
   yarn global bin

   # Add it to your PATH if needed
   echo 'export PATH="$(yarn global bin):$PATH"' >> ~/.bashrc
   source ~/.bashrc
   ```

2. Clear Yarn cache:

   ```bash
   yarn cache clean
   ```

3. Try installing with the force flag:
   ```bash
   yarn global add bashbuddy --force
   ```

## Next Steps

After installing BashBuddy with Yarn, you'll need to:

1. [Set up shell integration](/installation/shell-integration)
2. [Learn basic commands](/basic-commands)
3. [Configure BashBuddy](/configuration)
