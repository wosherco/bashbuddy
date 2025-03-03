---
id: macos-installation
title: Installing on macOS
description: Learn how to install BashBuddy on macOS
slug: /installation/macos
sidebar_position: 1
---

# Installing BashBuddy on macOS

This guide will walk you through installing BashBuddy on macOS systems.

## Prerequisites

Before installing BashBuddy on macOS, ensure you have:

- macOS 10.15 (Catalina) or newer
- Node.js 18 or higher
- npm or yarn package manager
- Terminal access

## Installation Options

### Using Homebrew (Recommended)

The easiest way to install BashBuddy on macOS is using Homebrew:

```bash
brew install bashbuddy
```

### Using npm

You can also install BashBuddy using npm:

```bash
npm install -g bashbuddy
```

### Using yarn

If you prefer yarn:

```bash
yarn global add bashbuddy
```

## Shell Integration

After installing BashBuddy, you'll need to integrate it with your shell:

### For Zsh (default on macOS)

Add the following to your `~/.zshrc`:

```bash
eval "$(bashbuddy init zsh)"
```

Then reload your shell configuration:

```bash
source ~/.zshrc
```

### For Bash

Add the following to your `~/.bash_profile` or `~/.bashrc`:

```bash
eval "$(bashbuddy init bash)"
```

Then reload your shell configuration:

```bash
source ~/.bash_profile
# or
source ~/.bashrc
```

## Verifying Installation

To verify that BashBuddy is installed correctly, run:

```bash
bashbuddy --version
```

You should see the current version number displayed.

## Next Steps

Now that you have BashBuddy installed on your macOS system, you can:

- [Learn basic commands](/basic-commands)
- [Configure BashBuddy](/configuration)
- [Explore advanced features](/advanced-features)
