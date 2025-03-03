---
id: linux-installation
title: Installing on Linux
description: Learn how to install BashBuddy on Linux distributions
slug: /installation/linux
sidebar_position: 2
---

# Installing BashBuddy on Linux

This guide will walk you through installing BashBuddy on various Linux distributions.

## Prerequisites

Before installing BashBuddy on Linux, ensure you have:

- A modern Linux distribution (Ubuntu 20.04+, Fedora 34+, etc.)
- Node.js 18 or higher
- npm or yarn package manager
- Terminal access

## Installation Options

### Using npm (Universal Method)

The most universal way to install BashBuddy on Linux is using npm:

```bash
npm install -g bashbuddy
```

### Using yarn

If you prefer yarn:

```bash
yarn global add bashbuddy
```

### Distribution-Specific Methods

#### Ubuntu/Debian

```bash
# Add our repository
curl -fsSL https://bashbuddy.dev/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://bashbuddy.dev/debian stable main"

# Install BashBuddy
sudo apt update
sudo apt install bashbuddy
```

#### Fedora/RHEL/CentOS

```bash
# Add our repository
sudo dnf config-manager --add-repo https://bashbuddy.dev/rpm/bashbuddy.repo

# Install BashBuddy
sudo dnf install bashbuddy
```

#### Arch Linux

BashBuddy is available in the AUR:

```bash
yay -S bashbuddy
# or
paru -S bashbuddy
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

### For Fish

Add the following to your `~/.config/fish/config.fish`:

```fish
bashbuddy init fish | source
```

Then reload your shell configuration:

```bash
source ~/.config/fish/config.fish
```

## Verifying Installation

To verify that BashBuddy is installed correctly, run:

```bash
bashbuddy --version
```

You should see the current version number displayed.

## Next Steps

Now that you have BashBuddy installed on your Linux system, you can:

- [Learn basic commands](/basic-commands)
- [Configure BashBuddy](/configuration)
- [Explore advanced features](/advanced-features)
