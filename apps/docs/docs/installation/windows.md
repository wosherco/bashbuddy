---
id: windows-installation
title: Installing on Windows (WSL)
description: Learn how to install BashBuddy on Windows using WSL
slug: /installation/windows
sidebar_position: 3
---

# Installing BashBuddy on Windows (WSL)

This guide will walk you through installing BashBuddy on Windows using the Windows Subsystem for Linux (WSL).

## Prerequisites

Before installing BashBuddy on Windows, ensure you have:

- Windows 10 version 2004+ or Windows 11
- Windows Subsystem for Linux (WSL2) installed
- A Linux distribution installed via WSL (Ubuntu recommended)
- Node.js 18 or higher installed in your WSL environment
- npm or yarn package manager installed in your WSL environment

## Setting Up WSL (If Not Already Installed)

If you don't have WSL set up yet, follow these steps:

1. Open PowerShell as Administrator and run:

```powershell
wsl --install
```

2. Restart your computer when prompted.

3. After restart, a Ubuntu terminal will open automatically. Set up your Linux username and password.

## Installing BashBuddy in WSL

Once you have WSL set up with a Linux distribution, you can install BashBuddy:

1. Open your WSL terminal (Ubuntu or your chosen distribution)

2. Install Node.js and npm if not already installed:

```bash
# For Ubuntu/Debian-based distributions
sudo apt update
sudo apt install nodejs npm
```

3. Install BashBuddy using npm:

```bash
npm install -g bashbuddy
```

Or if you prefer using yarn:

```bash
# Install yarn if not already installed
npm install -g yarn
# Install BashBuddy
yarn global add bashbuddy
```

## Shell Integration

After installing BashBuddy, you'll need to integrate it with your shell:

### For Bash

Add the following to your `~/.bashrc`:

```bash
eval "$(bashbuddy init bash)"
```

Then reload your shell configuration:

```bash
source ~/.bashrc
```

### For Zsh

Add the following to your `~/.zshrc`:

```bash
eval "$(bashbuddy init zsh)"
```

Then reload your shell configuration:

```bash
source ~/.zshrc
```

## Verifying Installation

To verify that BashBuddy is installed correctly, run:

```bash
bashbuddy --version
```

You should see the current version number displayed.

## Windows Terminal Integration (Optional)

For a better experience, we recommend using Windows Terminal with WSL:

1. Install [Windows Terminal](https://apps.microsoft.com/store/detail/windows-terminal/9N0DX20HK701) from the Microsoft Store

2. Open Windows Terminal and select your WSL distribution from the dropdown menu

3. You can now use BashBuddy directly in Windows Terminal with your WSL distribution

## Next Steps

Now that you have BashBuddy installed on your Windows system via WSL, you can:

- [Learn basic commands](/basic-commands)
- [Configure BashBuddy](/configuration)
- [Explore advanced features](/advanced-features)
