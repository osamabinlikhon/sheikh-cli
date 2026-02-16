# Sheikh CLI - Termux Installation Guide

## Overview

Sheikh CLI is fully optimized for Termux on Android. This guide covers installation,
configuration, and usage on Android devices.

## Prerequisites

- Android 7.0+ (API 24+)
- Termux app from F-Droid (recommended) or GitHub
- 500MB free storage
- Internet connection (for initial setup)

## Installation

### Step 1: Install Termux

Download from F-Droid (recommended):
```bash
# F-Droid is more up-to-date than Play Store
# Visit: https://f-droid.org/packages/com.termux/
```

### Step 2: Update Termux

```bash
pkg update && pkg upgrade -y
```

### Step 3: Install Required Packages

```bash
# Essential packages
pkg install -y git nodejs python vim nano

# Optional but recommended
pkg install -y termux-api termux-exec
```

### Step 4: Clone Sheikh CLI

```bash
# Navigate to home
cd ~

# Clone the repository
git clone https://github.com/yourusername/sheikh-cli.git

# Or create a new project
mkdir -p ~/projects/my-app
cd ~/projects/my-app
```

### Step 5: Install Dependencies

```bash
cd sheikh-cli
npm install
```

### Step 6: Build Sheikh CLI

```bash
npm run build
```

### Step 7: Make Sheikh CLI Available Globally

```bash
# Create a global symlink
npm link

# Or add to PATH
mkdir -p ~/.local/bin
cp dist/index.js ~/.local/bin/sheikh
chmod +x ~/.local/bin/sheikh

# Add to PATH if not already there
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

## Termux-Specific Configuration

### Enable Termux API (Optional but Recommended)

```bash
# Install Termux:API app from F-Droid
# Then install the package
pkg install termux-api

# Test API access
termux-battery-status
```

### Storage Access

```bash
# Grant storage permission
termux-setup-storage

# This creates ~/storage/ with access to:
# - ~/storage/shared (Internal storage)
# - ~/storage/downloads
# - ~/storage/dcim
# - ~/storage/pictures
# - ~/storage/music
# - ~/storage/movies
```

### Sheikh CLI Local Settings for Termux

Create `.sheikh/settings/local.md`:

```yaml
# Sheikh CLI Termux Configuration
is_termux: true

termux:
  # Use Termux paths
  home_dir: "/data/data/com.termux/files/home"
  prefix: "/data/data/com.termux/files/usr"
  
  # Storage paths
  storage_path: "/storage/emulated/0"
  
  # Android-specific settings
  max_file_size: "500MB"
  prefer_internal_storage: true
  
  # Notifications
  use_termux_api: true
  vibrate_on_complete: true
  notification_on_complete: true
  
  # Performance
  low_memory_mode: true
  battery_aware: true
  pause_on_low_battery: 20  # Pause when battery below 20%
  
  # Network
  prefer_wifi: true
  warn_on_mobile_data: true
```

## Running Sheikh CLI

### Basic Usage

```bash
# Start Sheikh CLI
sheikh

# Or from project directory
cd ~/projects/my-app
sheikh
```

### With Options

```bash
# Use specific model
sheikh --model minimax-m2.5-free

# Enable verbose mode
sheikh --verbose

# Run command directly
sheikh --run "git status"
```

## Keyboard Shortcuts in Termux

### Essential Shortcuts

| Shortcut | Action |
|----------|--------|
| `Volume Up + Q` | Show extra keys |
| `Volume Up + W` | Toggle keyboard |
| `Volume Up + E` | Escape key |
| `Ctrl + C` | Cancel |
| `Ctrl + L` | Clear screen |
| `Ctrl + D` | Exit |
| `Tab` | Switch panel |
| `↑/↓` | Command history |

### Extra Keys Row

Enable extra keys in Termux:
```bash
# Create or edit ~/.termux/termux.properties
mkdir -p ~/.termux
cat > ~/.termux/termux.properties << 'EOF'
extra-keys = [['ESC','TAB','CTRL','ALT','{','}','$','|']]
EOF

# Reload settings
termux-reload-settings
```

## Working with Files

### Access Internal Storage

```bash
# Shared storage is at ~/storage/shared
cd ~/storage/shared/Documents
sheikh
```

### Create Projects in Storage

```bash
# Create a project in accessible location
mkdir -p ~/storage/shared/Projects/my-app
cd ~/storage/shared/Projects/my-app
git init
sheikh
```

### Backup Important Data

```bash
# Sheikh CLI config
cp -r ~/.sheikh ~/storage/shared/Sheikh-Backup/

# Projects
cp -r ~/projects ~/storage/shared/Sheikh-Backup/
```

## Performance Tips

### 1. Enable Low Memory Mode

Already set in local.md above. This reduces memory usage.

### 2. Use Swap (if needed)

```bash
# Check if swap is enabled
free -h

# Create swap file (optional, use with caution)
# Only if you have sufficient storage
```

### 3. Clear Cache Regularly

```bash
# Clear npm cache
npm cache clean --force

# Clear Sheikh CLI cache
sheikh /cache clear
```

### 4. Limit Concurrent Operations

In `.sheikh/settings/local.md`:
```yaml
performance:
  max_concurrent_tasks: 2
  max_memory: "512MB"
```

## Battery Optimization

### Automatic Battery Awareness

Sheikh CLI automatically:
- Pauses background tasks when battery < 20%
- Reduces polling frequency on battery
- Disables vibrations when battery < 10%

### Manual Battery Saving

```bash
# Check battery status
termux-battery-status

# Enable power save mode
sheikh --power-save
```

## Troubleshooting

### Issue: "Permission Denied"

```bash
# Fix permissions
termux-fix-shebang $(which sheikh)

# Or reinstall
npm unlink sheikh-cli
npm link
```

### Issue: "Command Not Found"

```bash
# Check PATH
echo $PATH

# Ensure ~/.local/bin is in PATH
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### Issue: "Out of Memory"

```bash
# Enable low memory mode in settings
# Reduce max file size
# Close other Termux sessions
```

### Issue: Storage Permission Denied

```bash
# Re-run setup
termux-setup-storage

# Check permission
ls -la ~/storage/
```

### Issue: Keyboard Not Working Properly

```bash
# Reset Termux properties
rm ~/.termux/termux.properties
termux-reload-settings

# Or configure extra keys as shown above
```

## Advanced: Using Proot-Distro

For full Linux environment:

```bash
# Install proot-distro
pkg install proot-distro

# Install Ubuntu
proot-distro install ubuntu

# Login to Ubuntu
proot-distro login ubuntu

# Install Sheikh CLI inside proot
apt update
apt install -y nodejs npm git
git clone https://github.com/yourusername/sheikh-cli.git
cd sheikh-cli
npm install
npm run build
npm link
```

## SSH Access (Optional)

Access Sheikh CLI from computer:

```bash
# In Termux
pkg install openssh
passwd  # Set password
sshd    # Start SSH server

# Get IP address
ifconfig

# From computer
ssh -p 8022 u0_a123@192.168.1.100
sheikh
```

## Best Practices

1. **Always use local.md for Termux settings** - Don't commit device-specific config
2. **Backup regularly** - Android can be unpredictable
3. **Use storage/shared for projects** - Survives app updates
4. **Enable battery awareness** - Save your battery
5. **Keep Termux updated** - From F-Droid, not Play Store
6. **Use extra keys** - Makes shortcuts easier on touch

## Getting Help

```bash
# Built-in help
sheikh --help

# Documentation
cat .sheikh/docs/scopes.md

# MCP configuration
cat .sheikh/mcp/config.md
```

## Uninstallation

```bash
# Remove global link
npm unlink -g sheikh-cli

# Remove directory
rm -rf ~/sheikh-cli

# Remove config
rm -rf ~/.sheikh
```

---

**Happy coding on Android! 📱**

Sheikh CLI brings the power of AI-assisted development to your pocket.
