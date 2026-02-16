# Sheikh CLI - Termux Features & Add-ons

## Overview

Sheikh CLI is optimized for Termux on Android, supporting all major Termux add-ons and features including GUI environments, automation, and hardware access.

## Termux Add-ons

### 1. Termux:API 📱

Access Android device features directly from Sheikh CLI.

#### Installation
```bash
# Install from F-Droid first, then:
pkg install termux-api
```

#### Available Features
```bash
# Device Info
termux-battery-status          # Check battery level
termux-camera-info            # Camera information
termux-clipboard-get          # Get clipboard content
termux-clipboard-set          # Set clipboard content
termux-contact-list           # List contacts
termux-dialog                 # Show dialogs
termux-download               # Download files
termux-infrared-frequencies   # IR blaster
termux-location               # GPS location
termux-notification           # Show notifications
termux-sensor                 # Access sensors
termux-share                  # Share files
termux-sms-list               # List SMS messages
termux-telephony-call         # Make phone calls
termux-telephony-cellinfo     # Cell tower info
termux-tts-speak              # Text-to-speech
termux-vibrate                # Vibrate device
termux-volume                 # Control volume
termux-wallpaper              # Change wallpaper
termux-wifi-connectioninfo    # WiFi connection info
termux-wifi-scaninfo          # WiFi scan results
```

#### Sheikh CLI Integration
Add to `.sheikh/settings/local.md`:
```yaml
termux:
  use_termux_api: true
  notifications: true
  vibrate_on_complete: true
  use_clipboard_integration: true
  auto_copy_output: false
```

### 2. Termux:Boot 🔄

Run Sheikh CLI on device boot.

#### Setup
```bash
# Install Termux:Boot from F-Droid
# Create boot directory
mkdir -p ~/.termux/boot

# Create startup script
cat > ~/.termux/boot/start-sheikh.sh << 'EOF'
#!/data/data/com.termux/files/usr/bin/sh
# Start Sheikh CLI on boot
export PATH="/data/data/com.termux/files/usr/bin:$PATH"
cd /data/data/com.termux/files/home/projects
termux-notification --title "Sheikh CLI" --content "Auto-starting..."
# Optional: Start sheikh in background
# sheikh --daemon
EOF

chmod +x ~/.termux/boot/start-sheikh.sh
```

### 3. Termux:Float 🪟

Run Sheikh CLI in a floating window over other apps.

#### Usage
```bash
# After installing Termux:Float:
# Launch floating terminal
termux-float

# Run Sheikh CLI in floating window
sheikh
```

#### Configuration
```yaml
termux:
  float_window:
    enabled: true
    width: 800
    height: 600
    opacity: 0.95
```

### 4. Termux:Styling 🎨

Customize terminal appearance.

#### Color Schemes
```bash
# Available schemes
termux-styling --list-colors

# Apply scheme
termux-styling --color "material"
```

#### Recommended for Sheikh CLI
```bash
# Dark theme optimized for coding
termux-styling --color "solarized-dark"

# Or create custom in ~/.termux/colors.properties
```

#### Font Configuration
```bash
# Install powerline font
mkdir -p ~/.termux
curl -o ~/.termux/font.ttf https://github.com/powerline/fonts/raw/master/Hack/Hack-Regular.ttf

# Or use termux-styling
termux-styling --font "hack"
```

### 5. Termux:Tasker 🔌

Integrate Sheikh CLI with Tasker automation.

#### Setup
```bash
# Install Termux:Tasker from F-Droid
# Scripts go in ~/.termux/tasker/
mkdir -p ~/.termux/tasker
```

#### Example Tasker Scripts
```bash
# ~/.termux/tasker/backup-project.sh
#!/bin/bash
cd ~/projects/my-app
sheikh --run "git add . && git commit -m 'Auto backup' && git push"
termux-notification --title "Backup Complete" --content "Project backed up"
```

### 6. Termux:Widget 📲

Add Sheikh CLI shortcuts to home screen.

#### Setup
```bash
# Install Termux:Widget from F-Droid
# Create shortcuts in ~/.shortcuts/
mkdir -p ~/.shortcuts
mkdir -p ~/.shortcuts/tasks
```

#### Quick Launch Widgets
```bash
# ~/.shortcuts/sheikh-dev.sh
#!/bin/bash
cd ~/projects/current
tmux new-session -d -s dev 'sheikh'
termux-open --chooser

# ~/.shortcuts/sheikh-build.sh
#!/bin/bash
cd ~/projects/current
sheikh --run "npm run build"
termux-vibrate -d 200
termux-notification --title "Build" --content "Build complete"
```

## Graphical Environment (X11)

### Overview

Run GUI applications and desktop environments in Termux.

### Prerequisites

```bash
# Enable X11 repository
pkg install x11-repo

# Update packages
pkg update
```

### Option 1: VNC (Recommended)

#### Install VNC Server
```bash
pkg install tigervnc
```

#### Configure VNC
```bash
# Set up VNC (first time)
vncserver -localhost

# Enter password (max 8 chars)
# When prompted for view-only password: n

# Stop VNC
vncserver -kill :1
```

#### Configure Startup
```bash
# Edit startup script
cat > ~/.vnc/xstartup << 'EOF'
#!/data/data/com.termux/files/usr/bin/sh
## Sheikh CLI Desktop Environment

# Load X resources
[ -r ~/.Xresources ] && xrdb ~/.Xresources

# Set background
xsetroot -solid '#1e1e1e'

# Start window manager (choose one):

# Option A: Fluxbox (lightweight)
# fluxbox-generate_menu
# fluxbox &

# Option B: Openbox
# openbox-session &

# Option C: XFCE (full desktop)
xfce4-session &

# Option D: LXQt
# startlxqt &

# Start Sheikh CLI in terminal (optional)
# xfce4-terminal -e "sheikh" &
EOF

chmod +x ~/.vnc/xstartup
```

#### Start VNC
```bash
# Start server
vncserver -localhost :1

# Set display
export DISPLAY=:1

# View with VNC Viewer app
# Address: 127.0.0.1:5901
```

#### Sheikh CLI Integration
```bash
# Add to ~/.bashrc
if [ -n "$DISPLAY" ]; then
    export SHEIKH_GUI_MODE=true
fi
```

### Option 2: XServer XSDL

#### Setup
```bash
# Install XServer XSDL from Play Store

# In Termux:
export DISPLAY=localhost:0

# Test
pkg install xterm
xterm
```

### Window Managers

#### Fluxbox (Lightweight)
```bash
pkg install fluxbox

# Auto-generate menu
fluxbox-generate_menu

# Add to ~/.vnc/xstartup:
fluxbox &
```

#### Openbox
```bash
pkg install openbox pypanel xorg-xsetroot

# Config in ~/.config/openbox/autostart:
cat > ~/.config/openbox/autostart << 'EOF'
xsetroot -solid gray
pypanel &
EOF

# Add to ~/.vnc/xstartup:
openbox-session &
```

### Desktop Environments

#### XFCE (Recommended)
```bash
# Install
pkg install xfce4 xfce4-terminal netsurf

# Configure
# ~/.vnc/xstartup:
xfce4-session &

# Additional tools
pkg install thunar mousepad ristretto
```

#### LXQt
```bash
# Install
pkg install lxqt qterminal otter-browser

# Configure
# ~/.vnc/xstartup:
startlxqt &
```

#### MATE
```bash
# Install
pkg install mate-* marco mate-terminal

# Configure
# ~/.vnc/xstartup:
mate-session &
```

## Sheikh CLI GUI Mode

### Setup

```bash
# Install GUI dependencies
pkg install nodejs xterm

# Create GUI launcher
cat > ~/sheikh-gui.sh << 'EOF'
#!/bin/bash
export DISPLAY=${DISPLAY:-:1}
export SHEIKH_GUI=true

if [ -z "$DISPLAY" ]; then
    echo "Starting VNC..."
    vncserver :1
    export DISPLAY=:1
fi

# Launch in terminal
xfce4-terminal --fullscreen -e "sheikh" &
EOF

chmod +x ~/sheikh-gui.sh
```

### Configuration

Add to `.sheikh/settings/local.md`:
```yaml
termux:
  gui_mode: true
  display: ":1"
  terminal_emulator: "xfce4-terminal"
  fullscreen: true
  
  # GUI-specific settings
  gui:
    font_size: 14
    background_color: "#1e1e1e"
    foreground_color: "#d4d4d4"
    cursor_blink: true
```

## Automation Workflows

### Example 1: Auto-Backup on WiFi
```bash
# ~/.termux/tasker/backup-on-wifi.sh
#!/bin/bash

# Check if on WiFi
WIFI_SSID=$(termux-wifi-connectioninfo | grep ssid | cut -d'"' -f4)

if [ "$WIFI_SSID" = "HomeWiFi" ]; then
    cd ~/projects/important
    sheikh --run "git add . && git commit -m 'Auto backup $(date)' && git push"
    termux-notification --title "Sheikh Backup" --content "Backup completed on $WIFI_SSID"
fi
```

### Example 2: Build Notification
```bash
# ~/.shortcuts/build-with-notification.sh
#!/bin/bash

cd ~/projects/current
termux-notification --title "Sheikh Build" --content "Build started..."

if sheikh --run "npm run build"; then
    termux-vibrate -d 200
    termux-notification --title "Sheikh Build" --content "Build successful!" --priority high
else
    termux-vibrate -d 500 -f
    termux-notification --title "Sheikh Build" --content "Build failed!" --priority high
fi
```

### Example 3: Location-Based Reminders
```bash
# ~/.termux/tasker/location-reminder.sh
#!/bin/bash

# Get location
LOCATION=$(termux-location -r once | grep latitude)

# Check if at office (simplified)
if echo "$LOCATION" | grep -q "40.7128"; then  # NYC coordinates
    termux-notification --title "Work Reminder" --content "Run Sheikh CLI daily sync"
fi
```

## Performance Optimization

### Memory Management
```bash
# Check available memory
free -h

# Clear caches
sync; echo 3 > /proc/sys/vm/drop_caches  # Requires root

# In Sheikh config
termux:
  memory:
    clear_cache_on_start: true
    max_memory_mb: 1024
    warn_on_low_memory: true
```

### Storage Management
```bash
# Check storage
termux-storage-get | df -h

# Clean up
apt autoremove
apt clean
npm cache clean --force
```

## Security Considerations

### VNC Security
```bash
# Always use localhost only
vncserver -localhost :1

# Use SSH tunnel when accessing remotely
ssh -L 5901:localhost:5901 user@phone-ip

# Strong password (8 chars max)
vncpasswd
```

### API Permissions
```bash
# Review API access
termux-api-list

# Disable unused APIs (create wrapper)
```

## Troubleshooting

### VNC Black Screen
```bash
# Kill and restart
vncserver -kill :1
rm -rf ~/.vnc/*.pid ~/.vnc/*.log
vncserver :1

# Check logs
cat ~/.vnc/localhost:1.log
```

### GUI Apps Won't Start
```bash
# Check DISPLAY
export DISPLAY=:1
echo $DISPLAY

# Verify X11
pkg install x11-apps
xclock  # Should show clock
```

### Performance Issues
```bash
# Use lighter desktop
# Instead of XFCE, use Fluxbox
pkg install fluxbox

# Reduce color depth
vncserver -depth 16 :1

# Lower resolution
vncserver -geometry 1280x720 :1
```

## Complete Setup Script

```bash
#!/bin/bash
# setup-termux-gui.sh - Complete GUI setup for Sheikh CLI

echo "Setting up Sheikh CLI with GUI support..."

# Update
pkg update && pkg upgrade -y

# Install X11
pkg install x11-repo -y
pkg update

# Install VNC
pkg install tigervnc -y

# Install desktop environment
pkg install xfce4 xfce4-terminal -y

# Install Termux API
pkg install termux-api -y

# Configure VNC
cat > ~/.vnc/xstartup << 'EOF'
#!/data/data/com.termux/files/usr/bin/sh
xsetroot -solid '#1e1e1e'
xfce4-session &
EOF
chmod +x ~/.vnc/xstartup

# Create Sheikh launcher
cat > ~/sheikh-gui.sh << 'EOF'
#!/bin/bash
export DISPLAY=:1
vncserver -localhost :1 2>/dev/null || true
xfce4-terminal --fullscreen -e "cd ~/projects && sheikh"
EOF
chmod +x ~/sheikh-gui.sh

# Create widget shortcut
mkdir -p ~/.shortcuts
cat > ~/.shortcuts/sheikh-gui.sh << 'EOF'
#!/bin/bash
~/sheikh-gui.sh
EOF
chmod +x ~/.shortcuts/sheikh-gui.sh

echo "Setup complete!"
echo "Start GUI: ~/sheikh-gui.sh"
echo "Or add widget to home screen"
```

## Next Steps

1. **Install Termux Add-ons** from F-Droid
2. **Enable X11** repository
3. **Set up VNC** for GUI access
4. **Configure Sheikh CLI** for Termux
5. **Create widgets** for quick access
6. **Set up Tasker** integration

---

**Enjoy coding with Sheikh CLI on Android! 🚀**
