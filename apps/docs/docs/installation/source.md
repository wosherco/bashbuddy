---
id: source-installation
title: Installing from Source
description: Learn how to build and install BashBuddy from source code
slug: /installation/source
sidebar_position: 6
---

# Installing BashBuddy from Source

This guide will walk you through building and installing BashBuddy from source code.

## Prerequisites

Before building BashBuddy from source, ensure you have:

- Node.js 18 or higher
- npm or yarn package manager
- Git
- A Unix-like terminal (macOS, Linux, or WSL on Windows)
- Basic knowledge of command-line operations

## Cloning the Repository

First, clone the BashBuddy repository from GitHub:

```bash
git clone https://github.com/bashbuddy/bashbuddy.git
cd bashbuddy
```

## Installing Dependencies

Install the project dependencies:

```bash
# Using npm
npm install

# Or using yarn
yarn
```

## Building the Project

Build the project from source:

```bash
# Using npm
npm run build

# Or using yarn
yarn build
```

## Installing Globally

After building, you can install BashBuddy globally on your system:

```bash
# Using npm
npm link

# Or using yarn
yarn link
```

This creates a symbolic link from the global bin directory to your local build.

## Running Without Installing

If you prefer not to install globally, you can run BashBuddy directly from the source directory:

```bash
# Using npm
npm start -- --help

# Or using yarn
yarn start --help
```

## Development Mode

If you're developing or contributing to BashBuddy, you can run it in development mode:

```bash
# Using npm
npm run dev

# Or using yarn
yarn dev
```

## Verifying Installation

To verify that BashBuddy is installed correctly, run:

```bash
bashbuddy --version
```

You should see the current version number displayed.

## Updating from Source

To update your source installation:

```bash
# Navigate to your BashBuddy directory
cd path/to/bashbuddy

# Pull the latest changes
git pull

# Reinstall dependencies (if needed)
npm install
# or
yarn

# Rebuild the project
npm run build
# or
yarn build

# Relink if necessary
npm link
# or
yarn link
```

## Troubleshooting

If you encounter issues during the build process:

1. Check that you have the correct Node.js version:

   ```bash
   node --version
   ```

2. Try clearing the build cache:

   ```bash
   # Using npm
   npm run clean

   # Or using yarn
   yarn clean
   ```

3. Check for any error messages in the build logs

## Next Steps

After installing BashBuddy from source, you'll need to:

1. [Set up shell integration](/installation/shell-integration)
2. [Learn basic commands](/basic-commands)
3. [Configure BashBuddy](/configuration)
