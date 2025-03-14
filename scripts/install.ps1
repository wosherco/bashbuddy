# BashBuddy CLI Installer for Windows (PowerShell)

# Function to check if a command exists
function Test-CommandExists {
    param ($command)
    $exists = $null -ne (Get-Command $command -ErrorAction SilentlyContinue)
    return $exists
}

# Set up colors for output
$host.UI.RawUI.ForegroundColor = "Cyan"
Write-Host "BashBuddy CLI Installer"
Write-Host "==============================="
$host.UI.RawUI.ForegroundColor = "White"

# Check if bun is installed
if (-not (Test-CommandExists "bun")) {
    $host.UI.RawUI.ForegroundColor = "Yellow"
    Write-Host "Bun is not installed. Installing now..."
    $host.UI.RawUI.ForegroundColor = "White"
    
    try {
        # Install Bun using the official installer
        Invoke-RestMethod -Uri "bun.sh/install.ps1" | Invoke-Expression
        
        # Refresh environment variables to make bun available in the current session
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
        
        # Check if bun is now available
        if (-not (Test-CommandExists "bun")) {
            $host.UI.RawUI.ForegroundColor = "Yellow"
            Write-Host "Please restart your PowerShell session to use bun."
            Write-Host "After that, run this script again."
            $host.UI.RawUI.ForegroundColor = "White"
            exit 1
        }
        
        $host.UI.RawUI.ForegroundColor = "Green"
        Write-Host "Bun has been installed successfully!"
        $host.UI.RawUI.ForegroundColor = "White"
    }
    catch {
        $host.UI.RawUI.ForegroundColor = "Red"
        Write-Host "Failed to install Bun. Error: $_"
        $host.UI.RawUI.ForegroundColor = "White"
        exit 1
    }
}
else {
    $host.UI.RawUI.ForegroundColor = "Green"
    Write-Host "Bun is already installed. Checking for updates..."
    $host.UI.RawUI.ForegroundColor = "White"
    
    try {
        bun upgrade
        
        $host.UI.RawUI.ForegroundColor = "Green"
        Write-Host "Bun has been updated to the latest version."
        $host.UI.RawUI.ForegroundColor = "White"
    }
    catch {
        $host.UI.RawUI.ForegroundColor = "Yellow"
        Write-Host "Failed to update Bun. Continuing with existing version. Error: $_"
        $host.UI.RawUI.ForegroundColor = "White"
    }
}

# Set SHELL environment variable if not already set
if (-not $env:SHELL) {
    # Determine which PowerShell is being used
    $isPowerShellCore = $PSVersionTable.PSEdition -eq "Core"
    
    if ($isPowerShellCore) {
        # PowerShell Core (pwsh)
        try {
            $shellPath = (Get-Command pwsh).Source
        } catch {
            $host.UI.RawUI.ForegroundColor = "Red"
            Write-Host "PowerShell Core (pwsh) not found in PATH. Please set SHELL environment variable manually."
            $host.UI.RawUI.ForegroundColor = "White"
        }
    } else {
        # Windows PowerShell (powershell.exe)
        if (-not $PSHOME) {
            $host.UI.RawUI.ForegroundColor = "Red"
            Write-Host "`$PSHOME is not set. Cannot determine Windows PowerShell path. Please set SHELL environment variable manually."
            $host.UI.RawUI.ForegroundColor = "White"
        }
        $shellPath = Join-Path $PSHOME "powershell.exe"
    }
    
    if (setx SHELL $shellPath) {
        # Update the current session so a restart is not required
        $env:SHELL = $shellPath
        
        # Verify that the environment variable is now available
        if ($env:SHELL) {
            $host.UI.RawUI.ForegroundColor = "Green"
            Write-Host "Successfully set SHELL environment variable to '$shellPath'"
            $host.UI.RawUI.ForegroundColor = "White"
        } else {
            $host.UI.RawUI.ForegroundColor = "Red"
            Write-Host "SHELL environment variable was not set in the current session."
            $host.UI.RawUI.ForegroundColor = "White"
        }
    } else {
        $host.UI.RawUI.ForegroundColor = "Red"
        Write-Host "Failed to set the SHELL environment variable using setx."
        Write-Host "Please set it manually to '$shellPath'."
        $host.UI.RawUI.ForegroundColor = "White"
    }
} else {
    $host.UI.RawUI.ForegroundColor = "Yellow"
    Write-Host "SHELL environment variable is already set to '$env:SHELL'"
    $host.UI.RawUI.ForegroundColor = "White"
}

# Install or update @bashbuddy/cli
$host.UI.RawUI.ForegroundColor = "Cyan"
Write-Host "Installing/updating @bashbuddy/cli..."
$host.UI.RawUI.ForegroundColor = "White"

try {
    # Run the bun install command
    bun i -g @bashbuddy/cli@latest
    
    $host.UI.RawUI.ForegroundColor = "Green"
    Write-Host "BashBuddy CLI has been successfully installed/updated!"
    Write-Host "You can now use the 'bashbuddy' command."
    $host.UI.RawUI.ForegroundColor = "White"
}
catch {
    $host.UI.RawUI.ForegroundColor = "Yellow"
    Write-Host "There was an issue installing BashBuddy CLI. Error: $_"
    $host.UI.RawUI.ForegroundColor = "White"
}

$host.UI.RawUI.ForegroundColor = "Cyan"
Write-Host "If you encounter any issues, please visit:"
$host.UI.RawUI.ForegroundColor = "Green"
Write-Host "docs.bashbuddy.run/troubleshooting"
$host.UI.RawUI.ForegroundColor = "White" 