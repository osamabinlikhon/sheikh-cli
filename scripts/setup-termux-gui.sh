#!/bin/bash
# setup-termux-gui.sh - Complete GUI setup for Sheikh CLI on Termux
# Run this script to set up X11, VNC, and desktop environment

set -e

echo "╔══════════════════════════════════════════════════════════╗"
echo "║  Sheikh CLI - Termux GUI Setup                           ║"
echo "║  Setting up X11, VNC, and Desktop Environment            ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running in Termux
if [ -z "$TERMUX_VERSION" ]; then
    echo -e "${RED}Error: This script must be run in Termux${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 1: Updating packages...${NC}"
pkg update -y

echo -e "${YELLOW}Step 2: Installing X11 repository...${NC}"
pkg install x11-repo -y
pkg update -y

echo -e "${YELLOW}Step 3: Installing VNC server...${NC}"
pkg install tigervnc -y

echo -e "${YELLOW}Step 4: Installing desktop environment...${NC}"
echo "Choose desktop environment:"
echo "1) XFCE (Recommended - full featured)"
echo "2) LXQt (Lightweight)"
echo "3) MATE (Traditional)"
echo "4) Fluxbox (Minimal)"
echo "5) Openbox (Highly customizable)"
read -p "Enter choice (1-5): " de_choice

case $de_choice in
    1)
        DE="xfce4"
        DE_CMD="xfce4-session"
        pkg install xfce4 xfce4-terminal netsurf thunar -y
        ;;
    2)
        DE="lxqt"
        DE_CMD="startlxqt"
        pkg install lxqt qterminal otter-browser -y
        ;;
    3)
        DE="mate"
        DE_CMD="mate-session"
        pkg install mate-* marco mate-terminal -y
        ;;
    4)
        DE="fluxbox"
        DE_CMD="fluxbox"
        pkg install fluxbox aterm -y
        ;;
    5)
        DE="openbox"
        DE_CMD="openbox-session"
        pkg install openbox pypanel xorg-xsetroot -y
        ;;
    *)
        echo -e "${YELLOW}Invalid choice, defaulting to XFCE${NC}"
        DE="xfce4"
        DE_CMD="xfce4-session"
        pkg install xfce4 xfce4-terminal -y
        ;;
esac

echo -e "${GREEN}Installed: $DE${NC}"

echo -e "${YELLOW}Step 5: Installing Termux API...${NC}"
pkg install termux-api -y

echo -e "${YELLOW}Step 6: Installing additional tools...${NC}"
pkg install git nodejs vim nano htop -y

echo -e "${YELLOW}Step 7: Configuring VNC...${NC}"

# Create VNC config directory
mkdir -p ~/.vnc

# Create xstartup script
cat > ~/.vnc/xstartup << EOF
#!/data/data/com.termux/files/usr/bin/sh
## Sheikh CLI Desktop Environment

# Load X resources
[ -r ~/.Xresources ] && xrdb ~/.Xresources

# Set background color
xsetroot -solid '#1e1e1e'

# Start window manager/desktop environment
$DE_CMD &
EOF

chmod +x ~/.vnc/xstartup

echo -e "${YELLOW}Step 8: Creating Sheikh CLI launcher...${NC}"

# Create GUI launcher
cat > ~/sheikh-gui.sh << 'EOF'
#!/bin/bash
# Sheikh CLI GUI Launcher

export DISPLAY=${DISPLAY:-:1}
export SHEIKH_GUI=true

# Check if VNC is running
if ! pgrep -f "Xtigervnc" > /dev/null; then
    echo "Starting VNC server..."
    vncserver -localhost :1
    sleep 2
fi

# Launch Sheikh CLI in terminal
if command -v xfce4-terminal &> /dev/null; then
    xfce4-terminal --fullscreen -e "sheikh" &
elif command -v qterminal &> /dev/null; then
    qterminal -e "sheikh" &
elif command -v mate-terminal &> /dev/null; then
    mate-terminal --full-screen -e "sheikh" &
else
    echo "No supported terminal found. Starting VNC only."
    echo "Connect with VNC Viewer to 127.0.0.1:5901"
fi
EOF

chmod +x ~/sheikh-gui.sh

echo -e "${YELLOW}Step 9: Creating quick shortcuts...${NC}"

# Create shortcuts directory
mkdir -p ~/.shortcuts
mkdir -p ~/.shortcuts/tasks

# Quick launcher
cat > ~/.shortcuts/sheikh-gui.sh << 'EOF'
#!/bin/bash
~/sheikh-gui.sh
EOF
chmod +x ~/.shortcuts/sheikh-gui.sh

# Build shortcut
cat > ~/.shortcuts/sheikh-build.sh << 'EOF'
#!/bin/bash
cd ~/projects/current 2>/dev/null || cd ~
termux-notification --title "Sheikh Build" --content "Build started..."
if sheikh --run "npm run build" 2>/dev/null || npm run build; then
    termux-vibrate -d 200
    termux-notification --title "Sheikh Build" --content "Build successful!" --priority high
else
    termux-vibrate -d 500 -f
    termux-notification --title "Sheikh Build" --content "Build failed!" --priority high
fi
EOF
chmod +x ~/.shortcuts/sheikh-build.sh

echo -e "${YELLOW}Step 10: Setting up Sheikh CLI config...${NC}"

# Create directories
mkdir -p ~/.sheikh/settings
mkdir -p ~/projects

# Create local config
cat > ~/.sheikh/settings/local.md << EOF
# Sheikh CLI - Termux Configuration

is_termux: true

termux:
  home_dir: "/data/data/com.termux/files/home"
  prefix: "/data/data/com.termux/files/usr"
  storage_path: "/storage/emulated/0"
  max_file_size: "500MB"
  prefer_internal_storage: true
  use_termux_api: true
  vibrate_on_complete: true
  notification_on_complete: true
  low_memory_mode: true
  battery_aware: true
  pause_on_low_battery: 20
  gui_mode: true
  display: ":1"

performance:
  max_concurrent_tasks: 2
  max_memory: "1024MB"
  cache_size: "100MB"
EOF

echo -e "${YELLOW}Step 11: Setting up VNC password...${NC}"
echo -e "${YELLOW}Please set a VNC password (max 8 characters):${NC}"
vncpasswd

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Setup Complete!                                         ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Quick Start Commands:"
echo "  Start GUI:       ~/sheikh-gui.sh"
echo "  Start VNC only:  vncserver :1"
echo "  Stop VNC:        vncserver -kill :1"
echo ""
echo "VNC Connection:"
echo "  Address:         127.0.0.1:5901"
echo "  Password:        [what you just set]"
echo ""
echo "Install VNC Viewer app and connect to start!"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Install VNC Viewer from Play Store"
echo "2. Add widget to home screen for quick access"
echo "3. Install Termux:API, Termux:Widget for more features"
echo "4. Read TERMUX_FEATURES.md for advanced usage"
echo ""
echo -e "${GREEN}Happy coding with Sheikh CLI! 🚀${NC}"
