---
id: shell-integration
title: Shell Integration
description: Learn how to integrate BashBuddy with your shell
slug: /installation/shell-integration
sidebar_position: 7
---

# Shell Integration

To get the most out of BashBuddy, you'll need to integrate it with your shell. This guide explains how to set up BashBuddy with various shells.

## Why Shell Integration?

Shell integration allows BashBuddy to:

- Be invoked with a simple shortcut command (`bb`)
- Access your shell history for better suggestions
- Provide auto-completion for BashBuddy commands
- Execute commands directly in your current shell context

## Integration for Different Shells

### Bash

Add the following to your `~/.bashrc` or `~/.bash_profile`:

```bash
eval "$(bashbuddy init bash)"
```

Then reload your configuration:

```bash
source ~/.bashrc
# or
source ~/.bash_profile
```

### Zsh

Add the following to your `~/.zshrc`:

```bash
eval "$(bashbuddy init zsh)"
```

Then reload your configuration:

```bash
source ~/.zshrc
```

### Fish

Add the following to your `~/.config/fish/config.fish`:

```fish
bashbuddy init fish | source
```

Then reload your configuration:

```bash
source ~/.config/fish/config.fish
```

## Verifying Integration

After setting up shell integration, you can verify it's working by running:

```bash
bb --version
```

This should display the BashBuddy version. If you see a "command not found" error, the integration might not be set up correctly.

## Customizing the Command Alias

By default, BashBuddy uses `bb` as the command alias. If you want to use a different alias, you can specify it during initialization:

```bash
# For Bash/Zsh
eval "$(bashbuddy init bash --alias mybbuddy)"

# For Fish
bashbuddy init fish --alias mybbuddy | source
```

This would allow you to use `mybbuddy` instead of `bb` to invoke BashBuddy.

## Auto-Completion

BashBuddy provides auto-completion for its commands. This is automatically set up during shell integration.

To manually trigger auto-completion, press Tab after typing a partial command:

```bash
bb explain [TAB]
```

## Troubleshooting Shell Integration

If you encounter issues with shell integration:

1. Check that BashBuddy is installed correctly:

   ```bash
   bashbuddy --version
   ```

2. Ensure your shell configuration file is being loaded:

   ```bash
   echo $SHELL  # Verify which shell you're using
   ```

3. Try manually running the init command:

   ```bash
   bashbuddy init bash  # Replace 'bash' with your shell
   ```

4. Check for error messages in your shell startup logs

## Advanced Configuration

For advanced shell integration options, see the [Configuration](/configuration) guide.
