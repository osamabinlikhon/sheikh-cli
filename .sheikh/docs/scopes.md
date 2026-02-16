# Sheikh CLI - Scope System Documentation
# Understanding Configuration Precedence

## Overview

Sheikh CLI uses a hierarchical scope system for configuration. When the same
setting exists in multiple scopes, more specific scopes take precedence.

## Scope Hierarchy (Highest to Lowest)

```
1. Managed    (Cannot be overridden)
2. Command Line Arguments  (Session only)
3. Local      (Project + Personal)
4. Project    (Team-shared)
5. User       (Personal defaults)
```

## Scope Details

### 1. Managed Scope ⭐ HIGHEST
**Location**: `/etc/sheikh/managed-settings.json` (system-level)

**Who it affects**: All users on the machine
**Shared with team?**: Yes (deployed by IT)
**Can override?**: NO - Settings here are enforced and cannot be overridden

**Best for**:
- Security policies (organization-wide)
- Compliance requirements (SOX, HIPAA, GDPR)
- Standardized tooling versions
- Forbidden commands/operations
- Audit logging requirements

**Example**:
```json
{
  "security": {
    "forbidden_commands": ["rm -rf /"],
    "require_audit_log": true,
    "allowed_models": ["kimi-k2.5-free"]
  }
}
```

### 2. Command Line Arguments
**Usage**: `sheikh --model minimax-m2.5-free --verbose`

**Who it affects**: Current session only
**Shared with team?**: No
**Can override?**: Yes, temporary session override

**Best for**:
- One-time overrides
- Testing different configurations
- Automation scripts

### 3. Local Scope
**Location**: `.sheikh/settings/local.md` (project root)

**Who it affects**: You, in this repository only
**Shared with team?**: NO (gitignored)
**Can override?**: Yes, overrides Project and User settings

**Best for**:
- Personal project overrides
- Testing configurations before sharing
- Machine-specific settings
- Termux/Android-specific adjustments
- Debug mode toggles
- Experimental features

**Example**:
```yaml
# .sheikh/settings/local.md
verbose: true
is_termux: true
termux:
  low_memory_mode: true
  battery_aware: true
```

### 4. Project Scope
**Location**: `.sheikh/settings/project.md` (project root)

**Who it affects**: All collaborators on this repository
**Shared with team?**: YES (committed to git)
**Can override?**: Yes, overrides User settings

**Best for**:
- Team-shared settings
- Standardized tooling
- Required plugins/skills
- Shared MCP servers
- Coding standards

**Example**:
```yaml
# .sheikh/settings/project.md
model: "kimi-k2.5-free"
required_skills:
  - "code-reviewer"
  - "git-assistant"
```

### 5. User Scope
**Location**: `~/.sheikh/settings/user.md` (home directory)

**Who it affects**: You, across all projects
**Shared with team?**: NO
**Can override?**: Yes, but can be overridden by higher scopes

**Best for**:
- Personal preferences (themes, editor)
- Personal API keys (securely stored)
- Aliases you use everywhere
- Default behaviors

**Example**:
```yaml
# ~/.sheikh/settings/user.md
theme: "dark"
editor: "vim"
aliases:
  c: "clear"
  s: "git status"
```

## How Scopes Interact

### Precedence Rules

When the same setting exists in multiple scopes:

1. **Managed** always wins (cannot be overridden)
2. **Command Line** wins for current session
3. **Local** wins over Project and User
4. **Project** wins over User
5. **User** is the default fallback

### Example Scenarios

#### Scenario 1: Permission Conflict
```yaml
# User scope
permissions:
  auto_accept_write: true

# Project scope
permissions:
  auto_accept_write: false
```
**Result**: `auto_accept_write: false` (Project wins)

#### Scenario 2: Model Selection
```yaml
# User scope
model: "kimi-k2.5-free"

# Project scope
model: "minimax-m2.5-free"

# Local scope
model: "big-pickle"
```
**Result**: `model: "big-pickle"` (Local wins)

#### Scenario 3: Managed Override
```json
// Managed scope
{
  "models": {
    "allowed": ["kimi-k2.5-free"],
    "blocked": ["big-pickle"]
  }
}
```
```yaml
# Local scope
model: "big-pickle"
```
**Result**: ERROR - Managed scope blocks this model (cannot override)

#### Scenario 4: Command Line Override
```bash
sheikh --model minimax-m2.5-free
```
Even if Local/Project/Managed specify another model, command line wins for this session.

## Scope Files Summary

| Scope | Location | Shared? | Precedence | Best For |
|-------|----------|---------|------------|----------|
| Managed | `/etc/sheikh/` | Yes (IT) | HIGHEST | Security, compliance |
| Command Line | Arguments | No | High | One-time overrides |
| Local | `.sheikh/settings/local.md` | No | Medium-High | Personal project config |
| Project | `.sheikh/settings/project.md` | Yes | Medium | Team standards |
| User | `~/.sheikh/settings/user.md` | No | LOWEST | Personal defaults |

## Best Practices

### For Individuals
1. **User scope**: Set your preferred editor, theme, personal aliases
2. **Local scope**: Adjust for specific project needs or Termux settings
3. Avoid putting secrets in Project scope

### For Teams
1. **Project scope**: Define required skills, coding standards, shared MCP servers
2. Document why certain settings are required
3. Keep Project settings minimal - let users customize via Local

### For Organizations
1. **Managed scope**: Enforce security policies, compliance, approved models
2. Never put secrets in Managed scope
3. Provide documentation for required settings

### For Termux/Android Users
1. **Local scope**: Enable `is_termux: true` and related settings
2. Adjust paths for Termux filesystem (`/data/data/com.termux/files/`)
3. Enable battery-aware and low-memory modes

## Debugging Scope Issues

### Check Active Settings
```bash
sheikh /settings show
```

### Check Scope Hierarchy
```bash
sheikh /settings scopes
```

### Verbose Mode (see which scope provided each setting)
```bash
sheikh --verbose
```

## Migration Guide

### Moving from User to Project
If a setting should be shared with the team:
1. Copy from `~/.sheikh/settings/user.md`
2. Paste into `.sheikh/settings/project.md`
3. Commit the project settings
4. Remove from user settings (optional)

### Moving from Project to Local
If a setting is too specific for the team:
1. Copy from `.sheikh/settings/project.md`
2. Paste into `.sheikh/settings/local.md`
3. Remove from project settings
4. Local settings are gitignored automatically

## Security Notes

- **Managed scope**: Audited and controlled by IT
- **Command line**: Not persisted, safe for testing
- **Local scope**: Gitignored, safe for personal overrides
- **Project scope**: Review before committing - no secrets!
- **User scope**: Keep API keys in environment variables, not plain text
