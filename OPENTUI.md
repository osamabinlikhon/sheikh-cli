# Sheikh CLI - OpenTUI Integration

## Overview

[OpenTUI](https://opentui.dev) is a modern TypeScript library for building terminal user interfaces. Sheikh CLI can use OpenTUI as an alternative rendering engine for enhanced UI components.

## Why OpenTUI?

- **Declarative API** - React-like component model
- **Flexbox Layout** - CSS-inspired positioning
- **Rich Components** - Built-in boxes, text, borders, layouts
- **TypeScript First** - Full type safety
- **Performance** - Efficient rendering
- **Flexibility** - Can coexist with Ink

## Installation

### Prerequisites

OpenTUI requires Bun as the runtime (recommended for Termux):

```bash
# Install Bun in Termux
curl -fsSL https://bun.sh/install | bash

# Add to PATH
echo 'export BUN_INSTALL="$HOME/.bun"' >> ~/.bashrc
echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### Install OpenTUI

```bash
# In your Sheikh CLI project
cd ~/sheikh-cli

# Install OpenTUI
bun add @opentui/core

# Install additional packages
bun add @opentui/components @opentui/hooks
```

## Basic Usage

### Hello World

```typescript
// src/opentui-example.ts
import { createCliRenderer, Text } from "@opentui/core"

const renderer = await createCliRenderer({
  exitOnCtrlC: true,
})

renderer.root.add(
  Text({
    content: "Hello from Sheikh CLI + OpenTUI!",
    fg: "#00FF00",
  }),
)

// Keep running
await new Promise(() => {})
```

### Box Layout

```typescript
import { createCliRenderer, Box, Text } from "@opentui/core"

const renderer = await createCliRenderer({
  exitOnCtrlC: true,
})

renderer.root.add(
  Box(
    { 
      borderStyle: "rounded", 
      padding: 1, 
      flexDirection: "column", 
      gap: 1,
      borderColor: "#00FFFF"
    },
    Text({ content: "Sheikh CLI", fg: "#FFFF00", bold: true }),
    Text({ content: "AI-Powered Development", fg: "#AAAAAA" }),
    Text({ content: "Press Ctrl+C to exit", fg: "#666666" }),
  ),
)
```

## Sheikh CLI + OpenTUI Integration

### Hybrid Approach

Use OpenTUI for specific components while keeping Ink for the main app:

```typescript
// src/components/OpenTUIWrapper.tsx
import React, { useEffect, useState } from 'react';
import { Box, Text } from 'ink';

interface OpenTUIPanelProps {
  content: string;
}

export const OpenTUIPanel: React.FC<OpenTUIPanelProps> = ({ content }) => {
  const [output, setOutput] = useState('');
  
  useEffect(() => {
    // Render with OpenTUI and capture output
    // This is a simplified example
    const render = async () => {
      const opentui = await import('@opentui/core');
      // ... render logic
    };
    render();
  }, [content]);
  
  return (
    <Box borderStyle="round" borderColor="cyan" padding={1}>
      <Text>{output || content}</Text>
    </Box>
  );
};
```

### Full OpenTUI Mode

Create an alternative entry point using only OpenTUI:

```typescript
// src/opentui-app.ts
import { createCliRenderer, Box, Text, Layout } from "@opentui/core"
import { useState, useEffect } from "@opentui/hooks"

const renderer = await createCliRenderer({
  exitOnCtrlC: true,
  rawMode: true,
})

// Sheikh CLI State
const [messages, setMessages] = useState([])
const [input, setInput] = useState('')
const [isProcessing, setIsProcessing] = useState(false)

// Main Layout
const App = () => {
  return Layout({
    direction: "column",
    children: [
      // Header
      Box({
        height: 3,
        borderStyle: "single",
        borderColor: "#00FFFF",
        padding: { x: 1 },
        children: Text({ 
          content: "Sheikh CLI - AI-Powered Development", 
          fg: "#00FFFF",
          bold: true 
        })
      }),
      
      // Main Content Area
      Box({
        flex: 1,
        direction: "row",
        children: [
          // Sidebar
          Box({
            width: 30,
            borderStyle: "single",
            borderColor: "#555555",
            padding: 1,
            children: [
              Text({ content: "Stats", fg: "#FFFF00", bold: true }),
              Text({ content: `Messages: ${messages.length}` }),
              Text({ content: "" }),
              Text({ content: "Shortcuts:", fg: "#FFFF00" }),
              Text({ content: "Ctrl+C - Cancel" }),
              Text({ content: "Ctrl+L - Clear" }),
              Text({ content: "Tab - Switch" }),
            ]
          }),
          
          // Chat Area
          Box({
            flex: 1,
            borderStyle: "single",
            borderColor: "#00FFFF",
            padding: 1,
            direction: "column",
            children: messages.map(msg => 
              Box({
                padding: { y: 1 },
                children: Text({ content: msg })
              })
            )
          })
        ]
      }),
      
      // Input Bar
      Box({
        height: 3,
        borderStyle: "double",
        borderColor: isProcessing ? "#FFFF00" : "#00FFFF",
        padding: { x: 1 },
        children: Text({ 
          content: isProcessing ? "Processing..." : "> " + input,
          fg: isProcessing ? "#FFFF00" : "#FFFFFF"
        })
      })
    ]
  })
}

// Start app
renderer.root.add(App())

// Input handling
renderer.onInput((key) => {
  if (key === "\r" || key === "\n") {
    // Submit
    setMessages([...messages, input])
    setInput('')
  } else if (key === "\x7F") {
    // Backspace
    setInput(input.slice(0, -1))
  } else if (key >= " " && key <= "~") {
    // Printable character
    setInput(input + key)
  }
})

// Keep alive
await new Promise(() => {})
```

## Running OpenTUI Version

```bash
# Run OpenTUI version
bun src/opentui-app.ts

# Or add to package.json scripts
```

```json
{
  "scripts": {
    "dev": "node --import tsx src/index.tsx",
    "dev:opentui": "bun src/opentui-app.ts",
    "build": "esbuild src/index.tsx --bundle --platform=node --outfile=dist/index.js --external:react --external:react-dom --external:ink --format=esm",
    "build:opentui": "bun build src/opentui-app.ts --outfile=dist/opentui-app.js"
  }
}
```

## Component Library

### Available Components

```typescript
// Layout Components
Box      // Container with flexbox
Layout   // Advanced layout management
Stack    // Vertical/horizontal stack
Grid     // Grid layout

// Display Components
Text     // Text display with styling
Span     // Inline text
Code     // Code block
Table    // Data table

// Input Components
Input    // Text input
Select   // Dropdown selection
Confirm  // Yes/No prompt

// Feedback Components
Spinner  // Loading indicator
Progress // Progress bar
Alert    // Alert messages
```

### Styling

```typescript
Text({
  content: "Styled Text",
  fg: "#FF0000",        // Foreground color
  bg: "#000000",        // Background color
  bold: true,
  italic: true,
  underline: true,
  strikethrough: false,
})

Box({
  borderStyle: "rounded",  // "single", "double", "rounded", "bold", "none"
  borderColor: "#00FFFF",
  padding: 1,              // or { x: 2, y: 1 }
  margin: { top: 1, bottom: 1 },
  flexDirection: "column", // "row" | "column"
  gap: 1,                  // Gap between children
})
```

## Advanced Features

### Animations

```typescript
import { useAnimation } from "@opentui/hooks"

const Spinner = () => {
  const frame = useAnimation({
    frames: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
    interval: 80,
  })
  
  return Text({ content: frame + " Loading..." })
}
```

### Custom Hooks

```typescript
import { useInput, useResize } from "@opentui/hooks"

const App = () => {
  const { width, height } = useResize()
  const key = useInput()
  
  // Handle terminal resize
  // Handle keyboard input
}
```

### Integration with Sheikh Services

```typescript
// Use Sheikh's existing services with OpenTUI
import { FileService } from "./services/files.js"
import { ShellService } from "./services/shell.js"

const fileService = new FileService()
const shellService = new ShellService()

// Create UI with OpenTUI
const FileBrowser = async () => {
  const files = await fileService.listDirectory('.')
  
  return Box({
    children: files.map(file => 
      Text({ content: file })
    )
  })
}
```

## Termux Considerations

### Performance on Mobile

```typescript
// Optimize for mobile
const renderer = await createCliRenderer({
  exitOnCtrlC: true,
  // Reduce rendering frequency
  fps: 30,  // Default is 60
  // Disable animations on low battery
  animations: !process.env.LOW_BATTERY,
})
```

### Touch Input

OpenTUI supports touch gestures on terminals that support it:

```typescript
renderer.onGesture((gesture) => {
  if (gesture.type === "tap") {
    // Handle tap
  } else if (gesture.type === "swipe") {
    // Handle swipe
  }
})
```

## Migration from Ink

### Gradual Migration

1. **Keep Ink for main app**
2. **Use OpenTUI for specific panels**
3. **Gradually replace components**
4. **Switch fully when ready**

### Side-by-Side

```typescript
// Sheikh CLI can support both
const useOpenTUI = process.env.SHEIKH_RENDERER === "opentui"

if (useOpenTUI) {
  // Run OpenTUI version
  await import("./opentui-app.js")
} else {
  // Run Ink version (default)
  await import("./index.js")
}
```

## Configuration

Add to `.sheikh/settings/local.md`:

```yaml
# OpenTUI Configuration
renderer: "opentui"  # "ink" | "opentui"

opentui:
  fps: 60
  animations: true
  theme: "dark"
  colors:
    primary: "#00FFFF"
    secondary: "#FF00FF"
    success: "#00FF00"
    warning: "#FFFF00"
    error: "#FF0000"
    background: "#1e1e1e"
    foreground: "#d4d4d4"
```

## Best Practices

1. **Start Simple** - Begin with basic layout components
2. **Use Flexbox** - Leverage flexbox for responsive layouts
3. **Minimize Updates** - Batch state updates
4. **Handle Resize** - Listen for terminal resize events
5. **Test on Mobile** - Always test in Termux
6. **Profile Performance** - Use built-in profiler

## Resources

- [OpenTUI Documentation](https://opentui.dev)
- [OpenTUI GitHub](https://github.com/opentui/opentui)
- [Examples](https://github.com/opentui/examples)

## Next Steps

1. Install OpenTUI: `bun add @opentui/core`
2. Try the hello world example
3. Create a simple layout
4. Integrate with Sheikh services
5. Gradually migrate components

---

**OpenTUI brings modern UI development to Sheikh CLI!** 🎨
