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