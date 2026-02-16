# Computer-Using Agent (CUA) Setup for Termux

This guide covers setting up a Computer-Using Agent that can interact with a graphical desktop environment (Xfce) running in Termux.

## Overview

The CUA system enables an AI agent to:
1. Take screenshots of the desktop
2. Analyze visual elements
3. Perform actions (click, type, scroll, etc.)
4. Complete tasks autonomously

## Prerequisites

- Termux app (F-Droid version recommended)
- Android 7.0+ (API 24+)
- At least 2GB free storage
- VNC Viewer app (for viewing the desktop)

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   AI Model      │────▶│  CUA Client     │────▶│  Xfce Desktop   │
│ (GPT-4o/CUA)    │     │ (sheikh-cli)    │     │  (via VNC/X11)  │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                        │                        │
        │  Actions              │  xdotool              │
        │◀──────────────────────│◀──────────────────────│
        │                       │                        │
        │  Screenshots          │                        │
        │──────────────────────▶│──────────────────────▶│
```

## Installation Steps

### 1. Install proot-distro

```bash
pkg update && pkg install -y proot-distro
```

### 2. Install Ubuntu with Xfce

```bash
proot-distro install ubuntu
proot-distro login ubuntu
```

### 3. Inside Ubuntu, install Xfce and tools

```bash
apt update && apt upgrade -y
apt install -y xfce4 xfce4-goodies
apt install -y xdotool wmctrl x11-utils
apt install -y scrot firefox
apt install -y python3 python3-pip
```

### 4. Configure VNC Server

```bash
# Install TigerVNC
apt install -y tigervnc-standalone-server tigervnc-common

# Set password
vncpasswd

# Create startup script
cat > ~/.vnc/xstartup << 'EOF'
#!/bin/sh
export XKL_XMODMAP_DISABLE=1
unset SESSION_MANAGER
unset DBUS_SESSION_BUS_ADDRESS

# Start Xfce
exec startxfce4
EOF

chmod +x ~/.vnc/xstartup

# Start VNC server
vncserver -localhost :1
```

### 5. Connect with VNC Viewer

- Download VNC Viewer from Play Store/F-Droid
- Connect to `127.0.0.1:5901`
- Enter your VNC password

## CUA Client Configuration

### Display Settings

The default display is `:1` (port 5901). If using a different display:

```bash
export DISPLAY=:1
```

### Screenshot Tool

Choose one of the supported tools:

```bash
# Option 1: scrot (recommended)
apt install -y scrot

# Option 2: import (ImageMagick)
apt install -y imagemagick

# Option 3: xfce4-screenshooter
apt install -y xfce4-screenshooter
```

### Mouse/Keyboard Tools

```bash
# Install xdotool for mouse and keyboard control
apt install -y xdotool
```

## Usage

### JavaScript/TypeScript

```typescript
import { CUAClient } from './services/cua/client.js';

const cua = new CUAClient({
    display: ':1',
    screenshotTool: 'scrot',
    mouseTool: 'xdotool',
});

await cua.connect();

// Take a screenshot
const screenshot = await cua.takeScreenshot('base64');

// Click at coordinates
await cua.click(100, 200);

// Type text
await cua.type('Hello, World!');

// Press a key
await cua.keyPress('Return');

// Scroll
await cua.scroll('down', 3);

// Complex action
await cua.performAction({
    type: 'click',
    x: 500,
    y: 300,
});
```

### Python (Alternative)

```python
import subprocess
import base64
import time

class CUAClient:
    def __init__(self, display=":1"):
        self.display = display
    
    def _run(self, cmd, args):
        env = f"DISPLAY={self.display}"
        return subprocess.run(f"{env} {cmd} {' '.join(args)}", 
                           shell=True, capture_output=True, text=True)
    
    def click(self, x, y):
        self._run("xdotool", ["mousemove", str(x), str(y), "click", "1"])
    
    def type(self, text):
        self._run("xdotool", ["type", text])
    
    def screenshot(self):
        self._run("scrot", ["/tmp/screen.png"])
        with open("/tmp/screen.png", "rb") as f:
            return base64.b64encode(f.read()).decode()
```

## CUA Tools

The agent has access to these tools:

| Tool | Description |
|------|-------------|
| `computer_call` | Perform actions (click, type, keypress) |
| `computer_screenshot` | Capture screen |
| `computer_locate` | Find UI elements |
| `computer_hover` | Move mouse to element |
| `computer_scrollable` | Scroll the screen |

## Example Tasks

### Open Browser and Search

```javascript
// Click on Firefox icon at (50, 100)
await cua.click(50, 100);
await cua.wait(2000);

// Type search query
await cua.type("https://www.google.com");
await cua.keyPress("Return");
await cua.wait(2000);

// Click on search box (approximate coordinates)
await cua.click(400, 100);
await cua.type("search query");
await cua.keyPress("Return");
```

### Fill a Form

```javascript
// Navigate to form
await cua.type("https://example.com/form");
await cua.keyPress("Return");
await cua.wait(2000);

// Fill fields
await cua.click(300, 200);  // First name field
await cua.type("John");

await cua.click(300, 250);  // Last name field  
await cua.type("Doe");

await cua.click(300, 300);  // Submit button
await cua.keyPress("Return");
```

## Troubleshooting

### "Cannot connect to display"

```bash
# Check if VNC is running
vncserver -list

# Start if not running
vncserver -localhost :1
```

### "xdotool: Cannot find display"

```bash
export DISPLAY=:1
xdotool getdisplaygeometry
```

### Screenshot is black

```bash
# Try different screenshot tool
# Edit ~/.vnc/xstartup to add delay before Xfce starts
sleep 5
exec startxfce4
```

### Mouse clicks are inaccurate

```bash
# Get exact coordinates
xdotool getmouselocation

# Or use xdotool search to find windows
xdotool search --name "Firefox"
```

## Security Considerations

1. **Sandboxing**: Consider running in a VM or isolated container
2. **Permissions**: Limit what the agent can do
3. **Monitoring**: Log all actions for review
4. **Confirmation**: Require human approval for sensitive actions

## Performance Tips

1. Use a lower VNC quality setting for faster screenshots
2. Reduce screenshot resolution for faster processing
3. Cache element locations to avoid repeated searches
4. Use efficient action sequences (e.g., type instead of multiple clicks)

## Integration with AI Models

To use with GPT-4o or similar models:

1. Send screenshot as base64-encoded image
2. Ask model to analyze and decide action
3. Execute action and get new screenshot
4. Repeat until task complete

Example prompt to model:

```
You are a computer-using agent. You see a screenshot of a desktop.
Analyze the image and determine the next action to complete the user's task.

Available actions:
- click(x, y) - Click at coordinates
- type(text) - Type text
- keypress(key) - Press keyboard key
- scroll(direction) - Scroll screen
- wait(ms) - Wait for specified milliseconds

Respond with JSON:
{"action": "action_name", "x": 100, "y": 200, "text": "optional"}
```
